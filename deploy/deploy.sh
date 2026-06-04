#!/bin/bash
# deploy/deploy.sh — Deploy / update the application on the droplet
# Run from /opt/dnd-knowledge-base after cloning the repo:
#   cd /opt/dnd-knowledge-base && bash deploy/deploy.sh
set -euo pipefail

APP_DIR="/opt/dnd-knowledge-base"
VENV="$APP_DIR/venv"

echo "=== [1/5] Pull latest code ==="
cd "$APP_DIR"
git pull origin main

echo "=== [2/5] Install Python dependencies ==="
if [ ! -d "$VENV" ]; then
    python3 -m venv "$VENV"
fi
source "$VENV/bin/activate"
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "=== [3/5] Build Next.js frontend ==="
cd "$APP_DIR/frontend"
npm ci
npm run build

# Copy static assets for standalone mode
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public 2>/dev/null || true

echo "=== [4/5] Install & enable systemd services ==="
cp "$APP_DIR/deploy/systemd/dnd-backend.service"  /etc/systemd/system/
cp "$APP_DIR/deploy/systemd/dnd-frontend.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable dnd-backend dnd-frontend
systemctl restart dnd-backend dnd-frontend

echo "=== [5/5] Reload Nginx ==="
nginx -t && systemctl reload nginx

echo ""
echo "=== Deploy complete ==="
systemctl status dnd-backend dnd-frontend --no-pager
