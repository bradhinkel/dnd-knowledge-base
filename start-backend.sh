#!/bin/bash
# Run from Ubuntu terminal: bash start-backend.sh
cd "$(dirname "$0")"
source .venv/bin/activate
echo "Backend:  http://localhost:8001"
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload --reload-dir backend --reload-dir src
