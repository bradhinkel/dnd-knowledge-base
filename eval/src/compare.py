"""
eval/src/compare.py — Side-by-side comparison of eval results across configs.

Reads all JSON result files in eval/results/ and produces:
  1. A printed comparison table (console)
  2. A CSV summary
  3. Matplotlib bar charts (retrieval + generation metrics)

Usage:
    # Compare all results in eval/results/
    python eval/src/compare.py

    # Compare specific configs
    python eval/src/compare.py --configs baseline phase1_filter_off phase1_filter_on

    # Save charts to a specific directory
    python eval/src/compare.py --output-dir eval/results/charts
"""

import argparse
import json
import os
import sys
import glob

RESULTS_DIR = os.path.join(os.path.dirname(__file__), "..", "results")

# Phase groupings for chart organization
PHASE_GROUPS = {
    "Phase 0 (Baseline)": ["baseline"],
    "Phase 1 (Filter)": ["phase1_filter_off", "phase1_filter_on"],
    "Phase 2 (Chunk)": ["phase2_chunk256", "phase2_chunk512", "phase2_chunk1024"],
    "Phase 3 (Embedding)": ["phase3_ada002", "phase3_3small", "phase3_bge"],
    "Phase 4 (Search)": ["phase4_vector", "phase4_bm25", "phase4_hybrid"],
    "Phase 5 (Top-k)": ["phase5_top3", "phase5_top5", "phase5_top10"],
    "Phase 6 (Rerank)": ["phase6_no_rerank", "phase6_rerank"],
}


def load_results(results_dir: str, config_names: list = None) -> dict:
    """Load all result JSON files. Returns {config_name: summary_dict}."""
    data = {}
    pattern = os.path.join(results_dir, "*.json")
    for path in sorted(glob.glob(pattern)):
        name = os.path.splitext(os.path.basename(path))[0]
        if config_names and name not in config_names:
            continue
        with open(path) as f:
            obj = json.load(f)
        data[name] = obj.get("summary", {})
    return data


def print_table(data: dict):
    """Print a formatted comparison table to stdout."""
    if not data:
        print("No results found.")
        return

    headers = [
        "Config", "P@k", "R@k", "MRR", "NDCG@k",
        "Faith", "AnsRel", "CtxRel", "E2E(ms)"
    ]
    rows = []
    for name, s in data.items():
        r = s.get("retrieval", {})
        g = s.get("generation", {})
        t = s.get("timing", {})
        row = [
            name,
            _fmt(r.get("avg_precision_at_k")),
            _fmt(r.get("avg_recall_at_k")),
            _fmt(r.get("avg_mrr")),
            _fmt(r.get("avg_ndcg_at_k")),
            _fmt(g.get("avg_faithfulness")),
            _fmt(g.get("avg_answer_relevancy")),
            _fmt(g.get("avg_context_relevancy")),
            _fmt(t.get("avg_e2e_ms"), decimals=0),
        ]
        rows.append(row)

    col_widths = [max(len(headers[i]), max(len(r[i]) for r in rows)) for i in range(len(headers))]
    fmt = "  ".join(f"{{:<{w}}}" for w in col_widths)
    separator = "  ".join("-" * w for w in col_widths)

    print("\n" + fmt.format(*headers))
    print(separator)
    for row in rows:
        print(fmt.format(*row))
    print()


def _fmt(val, decimals=4) -> str:
    if val is None:
        return "—"
    if decimals == 0:
        return str(int(round(val)))
    return f"{val:.{decimals}f}"


def save_csv(data: dict, output_dir: str):
    import csv
    os.makedirs(output_dir, exist_ok=True)
    path = os.path.join(output_dir, "comparison.csv")
    fieldnames = [
        "config", "avg_precision_at_k", "avg_recall_at_k", "avg_mrr", "avg_ndcg_at_k",
        "avg_faithfulness", "avg_answer_relevancy", "avg_context_relevancy",
        "avg_embed_ms", "avg_retrieve_ms", "avg_generation_ms", "avg_e2e_ms",
        "total_input_tokens", "total_output_tokens",
    ]
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for name, s in data.items():
            r = s.get("retrieval", {})
            g = s.get("generation", {})
            t = s.get("timing", {})
            tok = s.get("tokens", {})
            writer.writerow({
                "config": name,
                "avg_precision_at_k": r.get("avg_precision_at_k"),
                "avg_recall_at_k": r.get("avg_recall_at_k"),
                "avg_mrr": r.get("avg_mrr"),
                "avg_ndcg_at_k": r.get("avg_ndcg_at_k"),
                "avg_faithfulness": g.get("avg_faithfulness"),
                "avg_answer_relevancy": g.get("avg_answer_relevancy"),
                "avg_context_relevancy": g.get("avg_context_relevancy"),
                "avg_embed_ms": t.get("avg_embed_ms"),
                "avg_retrieve_ms": t.get("avg_retrieve_ms"),
                "avg_generation_ms": t.get("avg_generation_ms"),
                "avg_e2e_ms": t.get("avg_e2e_ms"),
                "total_input_tokens": tok.get("total_input"),
                "total_output_tokens": tok.get("total_output"),
            })
    print(f"[compare] CSV saved to {path}")


def plot_metric_group(data: dict, group_name: str, config_names: list, metric_key: str,
                      metric_subkey: str, title: str, output_path: str):
    """Plot a bar chart for one metric across configs in a phase group."""
    import matplotlib.pyplot as plt

    names = [n for n in config_names if n in data]
    values = [data[n].get(metric_key, {}).get(metric_subkey) for n in names]

    # Skip if no data
    if not any(v is not None for v in values):
        return

    values_clean = [v if v is not None else 0.0 for v in values]
    fig, ax = plt.subplots(figsize=(max(6, len(names) * 1.5), 4))
    bars = ax.bar(names, values_clean, color="#4C72B0", edgecolor="white")
    ax.set_title(f"{group_name} — {title}")
    ax.set_ylabel(metric_subkey.replace("avg_", "").replace("_", " ").title())
    ax.set_ylim(0, 1.05)
    ax.axhline(y=0, color="black", linewidth=0.5)
    for bar, val in zip(bars, values_clean):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.02,
                f"{val:.3f}", ha="center", va="bottom", fontsize=9)
    plt.xticks(rotation=20, ha="right")
    plt.tight_layout()
    plt.savefig(output_path, dpi=120)
    plt.close()
    print(f"[compare] Chart saved to {output_path}")


def save_charts(data: dict, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    metrics_to_plot = [
        ("retrieval", "avg_precision_at_k", "Precision@k"),
        ("retrieval", "avg_recall_at_k", "Recall@k"),
        ("retrieval", "avg_mrr", "MRR"),
        ("generation", "avg_faithfulness", "Faithfulness"),
        ("generation", "avg_answer_relevancy", "Answer Relevancy"),
    ]
    for group_name, config_names in PHASE_GROUPS.items():
        for metric_key, metric_subkey, label in metrics_to_plot:
            safe_group = group_name.replace(" ", "_").replace("(", "").replace(")", "")
            safe_metric = metric_subkey.replace("avg_", "")
            out_path = os.path.join(output_dir, f"{safe_group}_{safe_metric}.png")
            plot_metric_group(data, group_name, config_names, metric_key, metric_subkey, label, out_path)


def main():
    parser = argparse.ArgumentParser(description="Compare evaluation results")
    parser.add_argument(
        "--configs", nargs="*", default=None,
        help="Config names to compare (default: all results in eval/results/)"
    )
    parser.add_argument(
        "--output-dir", default=os.path.join(RESULTS_DIR, "charts"),
        help="Directory to save charts and CSV"
    )
    parser.add_argument("--no-charts", action="store_true", help="Skip chart generation")
    args = parser.parse_args()

    data = load_results(RESULTS_DIR, args.configs)
    if not data:
        print(f"No result files found in {RESULTS_DIR}")
        sys.exit(1)

    print_table(data)
    save_csv(data, args.output_dir)

    if not args.no_charts:
        try:
            import matplotlib
            matplotlib.use("Agg")
            save_charts(data, args.output_dir)
        except ImportError:
            print("[compare] matplotlib not installed — skipping charts. Run: pip install matplotlib")


if __name__ == "__main__":
    main()
