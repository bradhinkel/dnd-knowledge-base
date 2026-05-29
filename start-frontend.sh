#!/bin/bash
# Run from Ubuntu terminal: bash start-frontend.sh
export PATH="/home/bradhinkel/.nvm/versions/node/v20.20.2/bin:$PATH"
cd "$(dirname "$0")/frontend"
echo "Frontend: http://localhost:3001"
npm run dev
