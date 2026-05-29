@echo off
title Artificer's Codex - Backend
echo Starting backend on http://localhost:8001 ...
echo.
echo NOTE: Edit .env with your API keys before generating content.
echo.
wsl -d Ubuntu bash -c "cd /home/bradhinkel/DnD_Generator/dnd-knowledge-base && source .venv/bin/activate && uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload"
pause
