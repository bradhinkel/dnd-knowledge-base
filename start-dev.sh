#!/bin/bash
# Start the Artificer's Codex dev server
# Run this from within WSL: bash start-dev.sh

export PATH="/home/bradhinkel/.nvm/versions/node/v20.20.2/bin:$PATH"

echo "Starting The Artificer's Codex on http://localhost:3001"
echo ""
cd "$(dirname "$0")/frontend"
npm run dev
