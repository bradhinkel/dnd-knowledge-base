# Nginx config for dnd.bradhinkel.com
# Place at: /etc/nginx/sites-available/dnd.bradhinkel.com
# Enable: sudo ln -s /etc/nginx/sites-available/dnd.bradhinkel.com /etc/nginx/sites-enabled/
# SSL:    sudo certbot --nginx -d dnd.bradhinkel.com

server {
    listen 80;
    server_name dnd.bradhinkel.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name dnd.bradhinkel.com;

    # SSL — managed by Certbot (auto-populated)
    ssl_certificate     /etc/letsencrypt/live/dnd.bradhinkel.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/dnd.bradhinkel.com/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Allow iframe embedding from WordPress site only
    add_header Content-Security-Policy "frame-ancestors 'self' https://bradhinkel.com https://www.bradhinkel.com" always;
    add_header X-Content-Type-Options nosniff always;

    # Next.js frontend
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI backend (standard requests)
    location /api/ {
        proxy_pass         http://127.0.0.1:8001/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # FastAPI streaming (SSE — generation endpoint)
    location /api/generate/ {
        proxy_pass         http://127.0.0.1:8001/generate/;
        proxy_http_version 1.1;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   Connection '';
        proxy_buffering    off;
        proxy_cache        off;
        proxy_read_timeout 300s;
    }

    # Generated images — served directly by Nginx
    location /images/ {
        alias       /var/data/dnd-images/;
        expires     30d;
        add_header  Cache-Control 'public, immutable';
    }

    # Health check
    location /health {
        proxy_pass http://127.0.0.1:8001/health;
    }
}
