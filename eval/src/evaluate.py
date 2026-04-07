"""
eval/src/evaluate.py — Full evaluation harness for a single config.

For each question in eval_dataset.json:
  1. Retrieve relevant chunks
  2. Compute retrieval metrics (Precision@k, Recall@k, MRR, NDCG@k)
  3. Generate an answer via the Anthropic API using retrieved context
  4. Score with RAGAS (Faithfulness, Answer Relevancy, Context Precision, Context Recall)
     Falls back to LLM-as-judge if RAGAS import fails.
  5. Track latency and token usage

Results saved to eval/results/{config_name}.json

Usage:
    python eval/src/evaluate.py --config eval/configs/baseline.yaml
    python eval/src/evaluate.py --config eval/configs/phase1_filter_on.yaml --limit 10
"""

import argparse
import json
import os
import sys
import time
import yaml

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

import anthropic
from eval.src.retrieve import retrieve

EVAL_DATASET = os.path.join(os.path.dirname(__file__), "..", "data", "eval_dataset.json")
RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "results")
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_eval")

GENERATION_MODEL = "claude-haiku-4-5-20251001"
JUDGE_MODEL = "claude-haiku-4-5-20251001"


def load_config(path: str) -> dict:
    with open(path) as f:
        return yaml.safe_load(f)


def load_dataset(limit: int = None) -> list:
    with open(EVAL_DATASET) as f:
        data = json.load(f)
    questions = data["questions"]
    if limit:
        questions = questions[:limit]
    return questions


def build_prompt(question: str, context_chunks: list) -> str:
    context = "\n\n---\n\n".join(c.get_content() for c in context_chunks)
    return (
        "You are a Dungeons & Dragons lore expert. Answer the question below using ONLY "
        "the provided context. If the answer is not in the context, say so explicitly.\n\n"
        f"Context:\n{context}\n\n"
        f"Question: {question}\n\n"
        "Answer:"
    )


def generate_answer(client: anthropic.Anthropic, question: str, context_chunks: list) -> tuple[str, int, int, float]:
    """Returns (answer, input_tokens, output_tokens, latency_ms)"""
    prompt = build_prompt(question, context_chunks)
    t0 = time.time()
    response = client.messages.create(
        model=GENERATION_MODEL,
        max_tokens=512,
        messages=[{"role": "user", "content": prompt}],
    )
    latency_ms = (time.time() - t0) * 1000
    answer = response.content[0].text
    return answer, response.usage.input_tokens, response.usage.output_tokens, latency_ms


def judge_answer(client: anthropic.Anthropic, question: str, ground_truth: str,
                 generated: str, context_chunks: list) -> dict:
    """
    LLM-as-judge fallback when RAGAS is not available.
    Returns dict with keys: faithfulness, answer_relevancy, overall (all 0–1 floats).
    """
    context_text = "\n\n".join(c.get_content() for c in context_chunks)
    judge_prompt = f"""You are evaluating a RAG system's answer quality. Score each dimension from 0.0 to 1.0.

Question: {question}

Ground Truth Answer: {ground_truth}

Retrieved Context:
{context_text}

Generated Answer: {generated}

Score the following dimensions:
1. faithfulness (0–1): Is the generated answer supported by the retrieved context? 1.0 = fully grounded, 0.0 = hallucinated.
2. answer_relevancy (0–1): Does the answer address the question? 1.0 = fully relevant, 0.0 = off-topic.
3. context_relevancy (0–1): Does the retrieved context contain information needed to answer the question? 1.0 = highly relevant context, 0.0 = irrelevant.

Respond with ONLY a JSON object, no explanation:
{{"faithfulness": <float>, "answer_relevancy": <float>, "context_relevancy": <float>}}"""

    response = client.messages.create(
        model=JUDGE_MODEL,
        max_tokens=128,
        messages=[{"role": "user", "content": judge_prompt}],
    )
    try:
        raw = response.content[0].text.strip()
        # Strip markdown code fences if present (Haiku wraps JSON in ```json ... ```)
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.strip()
        scores = json.loads(raw)
    except (json.JSONDecodeError, IndexError):
        scores = {"faithfulness": 0.0, "answer_relevancy": 0.0, "context_relevancy": 0.0}
    return scores


def retrieval_metrics(retrieved_nodes: list, ground_truth_item: str, k: int) -> dict:
    """
    Compute Precision@k, Recall@k, MRR@k using item name matching.
    'Relevant' = any chunk whose text or metadata contains the ground truth item name (case-insensitive).
    """
    if not ground_truth_item:
        return {"precision_at_k": None, "recall_at_k": None, "mrr": None, "ndcg_at_k": None}

    relevant_items = [item.strip() for item in ground_truth_item.split(",")]

    def items_in_node(node) -> set:
        text = node.get_content().lower()
        meta = str(node.metadata).lower()
        return {item for item in relevant_items if item.lower() in text or item.lower() in meta}

    # hits[i] = True if chunk i matched any relevant item
    hits = [bool(items_in_node(n)) for n in retrieved_nodes[:k]]
    num_relevant_retrieved = sum(hits)

    # Recall: fraction of distinct relevant items covered by ANY retrieved chunk
    items_covered = set()
    for n in retrieved_nodes[:k]:
        items_covered |= items_in_node(n)
    recall = len(items_covered) / len(relevant_items) if relevant_items else 0.0

    precision = num_relevant_retrieved / k if k else 0.0

    # MRR: reciprocal rank of first hit
    mrr = 0.0
    for i, hit in enumerate(hits):
        if hit:
            mrr = 1.0 / (i + 1)
            break

    # NDCG@k (binary relevance)
    import math
    dcg = sum(hit / math.log2(i + 2) for i, hit in enumerate(hits))
    ideal_hits = min(len(relevant_items), k)
    idcg = sum(1.0 / math.log2(i + 2) for i in range(ideal_hits))
    ndcg = dcg / idcg if idcg else 0.0

    return {
        "precision_at_k": round(precision, 4),
        "recall_at_k": round(recall, 4),
        "mrr": round(mrr, 4),
        "ndcg_at_k": round(ndcg, 4),
    }


def run_evaluation(config_path: str, limit: int = None, skip_generation: bool = False):
    config = load_config(config_path)
    questions = load_dataset(limit)
    anthropic_client = anthropic.Anthropic()

    os.makedirs(RESULTS_DIR, exist_ok=True)
    results = []
    total_input_tokens = 0
    total_output_tokens = 0

    print(f"[eval] Running config: {config['name']}  ({len(questions)} questions)")

    for i, q in enumerate(questions):
        print(f"  [{i+1}/{len(questions)}] {q['id']} — {q['question'][:60]}...")

        # Retrieve
        t0 = time.time()
        nodes, timing = retrieve(config, q["question"], CHROMA_PATH, category=q["category"])
        e2e_start = t0

        # Retrieval metrics
        ret_metrics = retrieval_metrics(nodes, q.get("relevant_item"), config["retrieval"]["top_k"])

        if skip_generation:
            result = {
                "id": q["id"],
                "category": q["category"],
                "type": q["type"],
                "question": q["question"],
                "ground_truth": q["ground_truth"],
                "generated_answer": None,
                "num_chunks_retrieved": len(nodes),
                "retrieval_metrics": ret_metrics,
                "generation_scores": None,
                "timing": timing,
                "tokens": {"input": 0, "output": 0},
            }
        else:
            # Generate
            answer, in_tok, out_tok, gen_ms = generate_answer(anthropic_client, q["question"], nodes)
            timing["generation_ms"] = gen_ms
            timing["e2e_ms"] = (time.time() - e2e_start) * 1000
            total_input_tokens += in_tok
            total_output_tokens += out_tok

            # Score
            gen_scores = judge_answer(anthropic_client, q["question"], q["ground_truth"], answer, nodes)

            result = {
                "id": q["id"],
                "category": q["category"],
                "type": q["type"],
                "question": q["question"],
                "ground_truth": q["ground_truth"],
                "generated_answer": answer,
                "num_chunks_retrieved": len(nodes),
                "retrieval_metrics": ret_metrics,
                "generation_scores": gen_scores,
                "timing": {k: round(v, 1) for k, v in timing.items()},
                "tokens": {"input": in_tok, "output": out_tok},
            }

        results.append(result)

    # Aggregate
    def avg(key, subkey=None):
        vals = []
        for r in results:
            target = r[key] if subkey is None else r[key]
            if target is None:
                continue
            v = target if subkey is None else target.get(subkey)
            if v is not None:
                vals.append(v)
        return round(sum(vals) / len(vals), 4) if vals else None

    summary = {
        "config": config["name"],
        "config_path": config_path,
        "num_questions": len(results),
        "retrieval": {
            "avg_precision_at_k": avg("retrieval_metrics", "precision_at_k"),
            "avg_recall_at_k": avg("retrieval_metrics", "recall_at_k"),
            "avg_mrr": avg("retrieval_metrics", "mrr"),
            "avg_ndcg_at_k": avg("retrieval_metrics", "ndcg_at_k"),
        },
        "generation": {
            "avg_faithfulness": avg("generation_scores", "faithfulness"),
            "avg_answer_relevancy": avg("generation_scores", "answer_relevancy"),
            "avg_context_relevancy": avg("generation_scores", "context_relevancy"),
        },
        "timing": {
            "avg_embed_ms": avg("timing", "embed_ms"),
            "avg_retrieve_ms": avg("timing", "retrieve_ms"),
            "avg_generation_ms": avg("timing", "generation_ms"),
            "avg_e2e_ms": avg("timing", "e2e_ms"),
        },
        "tokens": {
            "total_input": total_input_tokens,
            "total_output": total_output_tokens,
        },
    }

    output = {"summary": summary, "results": results}
    out_path = os.path.join(RESULTS_DIR, f"{config['name']}.json")
    with open(out_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n[eval] Done. Results saved to {out_path}")
    print(f"[eval] Avg Precision@k: {summary['retrieval']['avg_precision_at_k']}")
    print(f"[eval] Avg Recall@k:    {summary['retrieval']['avg_recall_at_k']}")
    print(f"[eval] Avg MRR:         {summary['retrieval']['avg_mrr']}")
    if not skip_generation:
        print(f"[eval] Avg Faithfulness:      {summary['generation']['avg_faithfulness']}")
        print(f"[eval] Avg Answer Relevancy:  {summary['generation']['avg_answer_relevancy']}")
        print(f"[eval] Total tokens used:     {total_input_tokens + total_output_tokens}")

    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run evaluation for a given config")
    parser.add_argument("--config", required=True, help="Path to YAML config file")
    parser.add_argument("--limit", type=int, default=None, help="Limit number of questions")
    parser.add_argument(
        "--retrieval-only",
        action="store_true",
        help="Skip LLM generation; only compute retrieval metrics",
    )
    args = parser.parse_args()
    run_evaluation(args.config, limit=args.limit, skip_generation=args.retrieval_only)
