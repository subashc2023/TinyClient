# TinyClient Infra (VPS + Vercel)

This folder contains production-ready snippets to run the backend on a VPS while the frontend is on Vercel.

## DNS

- `tinyclient.app` → Vercel (follow Vercel DNS instructions for apex + www)
- `www.tinyclient.app` → Vercel CNAME
- `api.tinyclient.app` → A record to your VPS IP

## Backend on VPS (Docker Compose)

Copy `.env.hosted` to the VPS, then run:

```bash
# Build + run backend only, bound to localhost:8001
sudo docker compose -f docker-compose.vps.yml --env-file .env.hosted up -d --build
```

> The backend listens on `127.0.0.1:8001` and is not exposed publicly.

## Reverse Proxy (choose one)

### Nginx + Certbot

1. Install Nginx + Certbot
   ```bash
   sudo apt update && sudo apt install -y nginx certbot python3-certbot-nginx
   ```
2. Copy `scripts/infra/nginx/api.tinyclient.app.conf` to `/etc/nginx/sites-available/api.tinyclient.app`
3. Enable site and reload
   ```bash
   sudo ln -s /etc/nginx/sites-available/api.tinyclient.app /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```
4. Obtain certificate and enable HTTPS redirect
   ```bash
   sudo certbot --nginx -d api.tinyclient.app --redirect --agree-tos -m you@tinyclient.app
   ```
5. Optional firewall hardening
   ```bash
   sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw deny 8001/tcp
   ```

### Caddy (automatic TLS)

1. Install Caddy
2. Copy `scripts/infra/caddy/Caddyfile` to `/etc/caddy/Caddyfile`
3. Restart Caddy

## Environment variables

Use `.env.hosted` values. Critical settings:

- `FRONTEND_BASE_URL=https://tinyclient.app`
- `BACKEND_BASE_URL=https://api.tinyclient.app`
- `NEXT_PUBLIC_API_BASE_URL=https://api.tinyclient.app` (in Vercel)
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none`
- CORS: `EXTRA_ALLOWED_ORIGINS=https://tinyclient.app,https://<your-vercel-project>.vercel.app`
- Optional previews: `CORS_ALLOW_ORIGIN_REGEX=^https://.*\\.vercel\\.app$`

## Smoke tests

From your laptop:

```powershell
nslookup api.tinyclient.app
Invoke-WebRequest https://api.tinyclient.app -UseBasicParsing
Invoke-WebRequest https://api.tinyclient.app/api/auth/verify -UseBasicParsing
```

From the VPS:

```bash
curl -i http://127.0.0.1:8001/
```

## Notes

- Keep FastAPI behind the reverse proxy; do not expose 8001 publicly.
- For Postgres in production, update `DATABASE_URL` accordingly and ensure the DB is not publicly exposed.
- Rotate `JWT_SECRET_KEY` and email API keys before going live.
