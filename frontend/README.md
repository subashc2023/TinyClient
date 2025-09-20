# TinyClient Frontend

## Getting Started

```bash
bun install
bun run dev
```

## Email Templates

```bash
bun run emails:dev    # live preview in the browser
bun run emails:build  # export HTML/text to backend/app/email_templates
```

> Commit the contents of `backend/app/email_templates/` whenever the templates change.

## Configuration

- Cookie-only auth: the frontend relies on `withCredentials` and server-set HttpOnly cookies. No tokens are stored in localStorage.
- API base URL is built from `NEXT_PUBLIC_APP_DOMAIN`, `NEXT_PUBLIC_APP_PROTOCOL`, and `NEXT_PUBLIC_BACKEND_PORT`. You may also set `NEXT_PUBLIC_API_BASE_URL` as an explicit override.

### Deploying with separate domains (Vercel + VPS)

When deploying the frontend on Vercel and the backend on a VPS, set these Vercel Environment Variables (Project Settings → Environment Variables):

- `NEXT_PUBLIC_API_BASE_URL`: Absolute URL to your API, e.g. `https://api.tinyclient.app` or `http://104.225.217.226:8001`
- `NEXT_PUBLIC_APP_DOMAIN`: Optional; used only when building URLs from parts. Example: `tinyclient.app`.
- `NEXT_PUBLIC_APP_PROTOCOL`: Optional; `https` in production.
- `NEXT_PUBLIC_FRONTEND_PORT`: Usually leave unset in production.

Backend must allow CORS for the Vercel domain(s); see backend README.

## Linting

```bash
bun run lint
```
