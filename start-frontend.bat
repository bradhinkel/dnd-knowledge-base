@echo off
title Artificer's Codex - Frontend
echo Starting frontend on http://localhost:3001 ...
echo.
wsl -d Ubuntu bash -c "export PATH=/home/bradhinkel/.nvm/versions/node/v20.20.2/bin:\$PATH && cd /home/bradhinkel/DnD_Generator/dnd-knowledge-base/frontend && npm run dev"
pause
