#!/bin/bash
# Runs all ingestions and evaluations sequentially.
# Baseline collection is already ingested; its eval runs first.
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

source "$PROJECT_DIR/venv/bin/activate"
export $(cat "$PROJECT_DIR/.env" | grep -v '#' | xargs)

log() { echo "[$(date '+%H:%M:%S')] $*"; }

CONFIGS=(
  phase1_filter_off
  phase1_filter_on
  phase2_chunk256
  phase2_chunk512
  phase2_chunk1024
  phase3_ada002
  phase3_3small
  phase3_bge
  phase4_vector
  phase4_bm25
  phase4_hybrid
  phase5_top3
  phase5_top5
  phase5_top10
  phase6_no_rerank
  phase6_rerank
)

# --- Ingestions ---
log "=== INGESTION PASS ==="
for cfg in "${CONFIGS[@]}"; do
  log "Ingesting: $cfg"
  python "$PROJECT_DIR/eval/src/ingest.py" \
    --config "$PROJECT_DIR/eval/configs/${cfg}.yaml" 2>&1
done

# --- Evaluations (baseline first, then all others) ---
log "=== EVALUATION PASS ==="
log "Evaluating: baseline"
python "$PROJECT_DIR/eval/src/evaluate.py" \
  --config "$PROJECT_DIR/eval/configs/baseline.yaml" 2>&1

for cfg in "${CONFIGS[@]}"; do
  log "Evaluating: $cfg"
  python "$PROJECT_DIR/eval/src/evaluate.py" \
    --config "$PROJECT_DIR/eval/configs/${cfg}.yaml" 2>&1
done

# --- Compare ---
log "=== COMPARISON ==="
python "$PROJECT_DIR/eval/src/compare.py" 2>&1

log "=== ALL DONE ==="
