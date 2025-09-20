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

## Linting

```bash
bun run lint
```
