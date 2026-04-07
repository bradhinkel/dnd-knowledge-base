# DnD Knowledge Base — RAG Evaluation Framework

This directory contains the evaluation harness for optimizing the DnD RAG system.
Run each phase sequentially, record the winner, update the placeholder configs for subsequent phases,
then move to the next phase.

---

## Directory Layout

```
eval/
├── configs/            # One YAML per experimental variant (18 total)
│   ├── baseline.yaml
│   ├── phase1_filter_off.yaml
│   ├── phase1_filter_on.yaml
│   ├── phase2_chunk256.yaml
│   ├── phase2_chunk512.yaml
│   ├── phase2_chunk1024.yaml
│   ├── phase3_ada002.yaml
│   ├── phase3_3small.yaml
│   ├── phase3_bge.yaml
│   ├── phase4_vector.yaml
│   ├── phase4_bm25.yaml
│   ├── phase4_hybrid.yaml
│   ├── phase5_top3.yaml
│   ├── phase5_top5.yaml
│   ├── phase5_top10.yaml
│   ├── phase6_no_rerank.yaml
│   └── phase6_rerank.yaml
├── data/
│   └── eval_dataset.json   # 85 Q&A pairs across 5 categories × 6 question types
├── src/
│   ├── ingest.py    # Config-driven ingestion into per-config ChromaDB collections
│   ├── retrieve.py  # Vector / BM25 / hybrid retrieval + cross-encoder reranking
│   ├── evaluate.py  # Full evaluation harness (retrieval metrics + LLM generation + scoring)
│   └── compare.py   # Side-by-side table, CSV export, and matplotlib bar charts
└── results/         # JSON results per run; charts/ subdirectory for plots
```

---

## Setup

```bash
# From the project root
source venv/bin/activate
pip install -r eval/requirements.txt
```

Required environment variables:
```bash
export OPENAI_API_KEY=sk-...
export ANTHROPIC_API_KEY=sk-ant-...
```

---

## Running the Evaluation

### Step 0 — Baseline

```bash
# Ingest corpus with baseline config (Flowise prototype settings)
python eval/src/ingest.py --config eval/configs/baseline.yaml

# Run full evaluation (retrieval + generation + scoring)
python eval/src/evaluate.py --config eval/configs/baseline.yaml

# Retrieval-only (faster, no LLM cost)
python eval/src/evaluate.py --config eval/configs/baseline.yaml --retrieval-only
```

Results are saved to `eval/results/baseline.json`.

---

## Phase 1 — Metadata Filtering

**What we're testing:** Does scoping retrieval to the correct category (weapon, npc, etc.) improve precision?

**Hold constant:** chunk=1000/200, ada-002 embedding, vector search, top-5

```bash
python eval/src/ingest.py --config eval/configs/phase1_filter_off.yaml
python eval/src/ingest.py --config eval/configs/phase1_filter_on.yaml

python eval/src/evaluate.py --config eval/configs/phase1_filter_off.yaml
python eval/src/evaluate.py --config eval/configs/phase1_filter_on.yaml

python eval/src/compare.py --configs phase1_filter_off phase1_filter_on
```

**Decision:** Pick whichever config has higher Precision@k and MRR.
Update Phase 2 configs: set `metadata_filter: true/false` to match the winner.

---

## Phase 2 — Chunk Size

**What we're testing:** Does smaller/larger chunking improve retrieval relevance?

**Hold constant:** ada-002, vector, top-5, best filter from Phase 1

```bash
python eval/src/ingest.py --config eval/configs/phase2_chunk256.yaml
python eval/src/ingest.py --config eval/configs/phase2_chunk512.yaml
python eval/src/ingest.py --config eval/configs/phase2_chunk1024.yaml

python eval/src/evaluate.py --config eval/configs/phase2_chunk256.yaml
python eval/src/evaluate.py --config eval/configs/phase2_chunk512.yaml
python eval/src/evaluate.py --config eval/configs/phase2_chunk1024.yaml

python eval/src/compare.py --configs phase2_chunk256 phase2_chunk512 phase2_chunk1024
```

**Decision:** Pick the chunk size with the best Recall@k and NDCG@k.
Update Phase 3 configs: set `chunking.size` and `chunking.overlap` to the winning values.

---

## Phase 3 — Embedding Model

**What we're testing:** Does a different embedding model produce better semantic matches?

**Hold constant:** best chunk from Phase 2, vector, top-5, best filter from Phase 1

Note: `phase3_bge.yaml` uses a local HuggingFace model (no API cost, slower first run).

```bash
python eval/src/ingest.py --config eval/configs/phase3_ada002.yaml
python eval/src/ingest.py --config eval/configs/phase3_3small.yaml
python eval/src/ingest.py --config eval/configs/phase3_bge.yaml

python eval/src/evaluate.py --config eval/configs/phase3_ada002.yaml
python eval/src/evaluate.py --config eval/configs/phase3_3small.yaml
python eval/src/evaluate.py --config eval/configs/phase3_bge.yaml

python eval/src/compare.py --configs phase3_ada002 phase3_3small phase3_bge
```

**Decision:** Pick the embedding with the best Recall@k and Faithfulness.
Update Phase 4 configs: set `embedding.model` to the winning model.

---

## Phase 4 — Search Method

**What we're testing:** Does keyword (BM25) or hybrid search outperform pure vector?

**Hold constant:** best embedding from Phase 3, best chunk from Phase 2, top-5, best filter

```bash
python eval/src/ingest.py --config eval/configs/phase4_vector.yaml
python eval/src/ingest.py --config eval/configs/phase4_bm25.yaml
python eval/src/ingest.py --config eval/configs/phase4_hybrid.yaml

python eval/src/evaluate.py --config eval/configs/phase4_vector.yaml
python eval/src/evaluate.py --config eval/configs/phase4_bm25.yaml
python eval/src/evaluate.py --config eval/configs/phase4_hybrid.yaml

python eval/src/compare.py --configs phase4_vector phase4_bm25 phase4_hybrid
```

**Decision:** Pick search method with best overall retrieval metrics.
Update Phase 5 configs: set `retrieval.method` to the winner.

---

## Phase 5 — Top-k

**What we're testing:** How many retrieved chunks optimize the precision/recall tradeoff?

**Hold constant:** best search from Phase 4, best embedding, best chunk, best filter

```bash
python eval/src/ingest.py --config eval/configs/phase5_top3.yaml
python eval/src/ingest.py --config eval/configs/phase5_top5.yaml
python eval/src/ingest.py --config eval/configs/phase5_top10.yaml

python eval/src/evaluate.py --config eval/configs/phase5_top3.yaml
python eval/src/evaluate.py --config eval/configs/phase5_top5.yaml
python eval/src/evaluate.py --config eval/configs/phase5_top10.yaml

python eval/src/compare.py --configs phase5_top3 phase5_top5 phase5_top10
```

**Decision:** Pick top-k that balances Precision@k vs. Recall@k and keeps latency reasonable.
Update Phase 6 configs: set `retrieval.top_k` to the winner.

---

## Phase 6 — Reranking

**What we're testing:** Does cross-encoder reranking improve the relevance of the final context window?

**Hold constant:** best top-k from Phase 5, best search, best embedding, best chunk, best filter

```bash
python eval/src/ingest.py --config eval/configs/phase6_no_rerank.yaml
python eval/src/ingest.py --config eval/configs/phase6_rerank.yaml

python eval/src/evaluate.py --config eval/configs/phase6_no_rerank.yaml
python eval/src/evaluate.py --config eval/configs/phase6_rerank.yaml

python eval/src/compare.py --configs phase6_no_rerank phase6_rerank
```

**Decision:** If reranking improves Faithfulness and Precision@k at acceptable latency cost, adopt it.

---

## Full Comparison (All Phases)

After all phases are complete, generate a comprehensive comparison:

```bash
python eval/src/compare.py
```

This produces:
- Printed table to console
- `eval/results/charts/comparison.csv`
- Bar charts per phase per metric in `eval/results/charts/`

---

## Metrics Reference

| Metric | Description | Higher is better |
|--------|-------------|------------------|
| Precision@k | Fraction of retrieved chunks that are relevant | Yes |
| Recall@k | Fraction of relevant items retrieved | Yes |
| MRR | Mean Reciprocal Rank of first relevant chunk | Yes |
| NDCG@k | Normalized Discounted Cumulative Gain | Yes |
| Faithfulness | Generated answer is grounded in context | Yes |
| Answer Relevancy | Answer addresses the question | Yes |
| Context Relevancy | Retrieved context contains needed information | Yes |
| E2E Latency | Wall-clock time from query to answer | Lower is better |

---

## Updating Phase Configs

Phase configs contain `# placeholder` comments on lines that need updating based on prior phase results.
Before running each phase, open the YAML files for that phase and replace the placeholder values with
the winning config values from the previous phase.

Example: After Phase 2 determines chunk 512 is best, edit Phase 3 configs:
```yaml
# Before
chunking:
  size: 512    # placeholder — update with best chunk size from Phase 2

# After (winning chunk size confirmed)
chunking:
  size: 512
  overlap: 100
```

---

## Cost Estimate

- Baseline + Phase 1 (2 configs): ~$0.50–$1.00 with ada-002 + claude-opus-4-6 judge
- Full run (all 17 non-baseline configs × 85 questions): ~$5–$10
- Use `--retrieval-only` to skip generation and cut cost by ~80% for quick iteration
- Use `--limit 20` to run a subset during development
