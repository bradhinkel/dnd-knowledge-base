#!/bin/bash
# deploy/setup.sh — Initial DigitalOcean droplet setup script
# Run as root on a fresh Ubuntu 22.04 droplet:
#   bash deploy/setup.sh
set -euo pipefail

APP_DIR="/opt/dnd-knowledge-base"
DATA_DIR="/var/data"
DB_NAME="dnd_generator"
DB_USER="dnd_app"

echo "=== [1/8] System update ==="
apt update && apt upgrade -y

echo "=== [2/8] Install system packages ==="
apt install -y \
    nginx certbot python3-certbot-nginx \
    python3 python3-venv python3-pip \
    postgresql postgresql-contrib \
    git curl ufw

echo "=== [3/8] Install Node.js 20 ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "=== [4/8] Configure firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== [5/8] Create directories ==="
mkdir -p "$DATA_DIR/dnd-images"
mkdir -p "$APP_DIR"
chown -R www-data:www-data "$DATA_DIR"

echo "=== [6/8] Set up PostgreSQL ==="
systemctl start postgresql
systemctl enable postgresql

# Create DB user and database (skip if they already exist)
sudo -u postgres psql -tc "SELECT 1 FROM pg_user WHERE usename = '$DB_USER'" | grep -q 1 || \
    sudo -u postgres createuser "$DB_USER" --pwprompt

sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
    sudo -u postgres createdb "$DB_NAME" --owner="$DB_USER"

# Enable gen_random_uuid() extension
sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"

echo "=== [7/8] Configure Nginx ==="
# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Install app config
cp "$APP_DIR/deploy/nginx/dnd.bradhinkel.com" /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/dnd.bradhinkel.com /etc/nginx/sites-enabled/

nginx -t && systemctl reload nginx

echo "=== [8/8] Install SSL certificate ==="
echo "Run the following after DNS has propagated:"
echo "  sudo certbot --nginx -d dnd.bradhinkel.com"
echo ""
echo "=== Setup complete ==="
echo "Next steps:"
echo "  1. Copy .env to $APP_DIR/.env"
echo "  2. Run: bash deploy/deploy.sh"
