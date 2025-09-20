TinyClient Backend

Configuration for split-domain deployments (frontend on Vercel, backend on VPS).

Key environment variables:

- `BACKEND_BASE_URL`: Absolute URL of the API, e.g. `https://api.tinyclient.app` or `http://104.225.217.226:8001`.
- `FRONTEND_BASE_URL`: Absolute URL of the app, e.g. `https://tinyclient.app` or your Vercel preview URL.
- `APP_DOMAIN`, `APP_PROTOCOL`, `FRONTEND_PORT`, `BACKEND_PORT`: Fallback parts used when the above absolute URLs are not provided.
- `EXTRA_ALLOWED_ORIGINS`: Comma-separated additional origins allowed by CORS (e.g., Vercel preview URLs).
- `COOKIE_SECURE`: `true` when serving HTTPS; set to `true` for production.
- `COOKIE_SAMESITE`: One of `lax|strict|none`. For cross-site cookies from API to app on different domains, use `none` (requires `COOKIE_SECURE=true`).
- `COOKIE_DOMAIN`: Cookie domain scope (optional). Usually leave unset if API and app are on different apex/domains. If you serve API on a subdomain like `api.tinyclient.app` and frontend on `tinyclient.app` and you want shared cookies, set `COOKIE_DOMAIN=.tinyclient.app` and `COOKIE_SAMESITE=none`.

CORS

`app/main.py` enables CORS via `get_allowed_cors_origins()` which includes:

- Origin derived from `FRONTEND_BASE_URL`
- Origin derived from `BACKEND_BASE_URL` (for direct API access)
- Localhost defaults and any `EXTRA_ALLOWED_ORIGINS`

Cookies

Auth uses HttpOnly cookies (`access_token`, `refresh_token`). For cross-site usage (frontend on `tinyclient.app`, API on `api.tinyclient.app`), configure:

- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none`
- `COOKIE_DOMAIN=.tinyclient.app` (optional; only if you need cookies to be sent to both subdomains)

Email links

Verification and password reset links use `FRONTEND_BASE_URL` when set; otherwise they fall back to the APP_* parts. Ensure `FRONTEND_BASE_URL` points at the public app URL.
