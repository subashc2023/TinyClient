# 🚀 TinyClient

> A modern, self-hostable MCP (Model Context Protocol) client with a sleek web interface

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

- **🔐 Secure Authentication** - JWT-based auth with refresh tokens and bcrypt password hashing
- **Email verification & invites** - Resend-powered signup, admin invitations, and soft-delete controls
- **🎨 Modern UI** - Next.js 15 with React 19, Tailwind v4, and ShadCN components
- **🌙 Dark Mode** - Seamless theme switching with system preference detection
- **📱 Responsive Design** - Mobile-first design with beautiful gradients and animations
- **🐳 Docker Ready** - Complete containerization with multi-stage builds
- **⚡ Fast Development** - Hot reload with Turbopack and modern tooling

## 🏗️ Architecture

### Frontend (Port 3000)
- **Next.js 15** with App Router and React 19
- **Tailwind v4** for styling with custom CSS-in-JS
- **ShadCN UI** components for consistent design
- **Automatic token refresh** for seamless auth experience

### Backend (Port 8001)
- **FastAPI** with automatic OpenAPI docs
- **SQLite** database with SQLAlchemy ORM
- **JWT authentication** with access/refresh token pattern (cookies supported)
- **CORS tightened** to frontend/backend origins; credentials allowed by default

## 🚀 Quick Start

### Option 1: Docker (recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd TinyClient

# Start the stack
docker-compose up --build
```

**Access the application:**
- 🌐 Frontend: http://localhost:3000
- 📚 API Docs: http://localhost:8001/docs

### Option 2: Local development

#### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.12+** (for backend)
- **npm** or **bun** (package manager)

#### Dev helper (Windows)

```powershell
pwsh -File scripts/dev.ps1
```

#### Backend

```bash
cd backend

# Install deps, migrate, (optionally) seed, then run
uv sync
uv run python -m app.setup migrate
uv run python -m app.setup seed   # requires ADMIN_* and USER_* in backend/.env
uv run python -m app.main
```

> Note: Prefer `python -m` for app commands locally. Docker images still use `uv` as the runtime.

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🗄️ Backend commands (cheat sheet)

```bash
cd backend
uv sync
uv run python -m app.setup migrate     # apply migrations (creates DB/tables if missing)
uv run python -m app.setup seed        # seed default users from env
uv run python -m app.setup downgrade   # rollback one revision
uv run python -m app.main              # run FastAPI
```

### Security & Auth Notes

- `JWT_SECRET_KEY` must be set (non-empty). The API refuses to start without it.
- Refresh tokens are hashed in the DB and rotated; `token_version` increments on logout/password/email/status changes to invalidate sessions.
- On login/refresh, the API sets cookies: `refresh_token` (HttpOnly) and `access_token` (non-HttpOnly). Clients may also use `Authorization: Bearer <access>`.
- `/api/auth/verify` accepts either header or cookies and returns the current user.
- Frontend Axios is `withCredentials: true` and only logs unexpected 5xx errors.

### CORS & Logging

Backend limits CORS to computed frontend/backend origins and supports credentials. You can add extra origins and tweak logging via env:

```env
# Extra comma-separated origins in addition to computed ones
EXTRA_ALLOWED_ORIGINS=

# Logging
LOG_ONLY_API_PATHS=true   # only log /api/* (default true)
SKIP_OPTIONS_LOGS=true    # skip OPTIONS preflights (default true)
```

### Default Users

After seeding, you can log in with:

- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## 🔧 Configuration

### Environment Variables

Copy `.env.example` to `.env` and adjust values as needed. This project uses unified `APP_*` and `NEXT_PUBLIC_*` variables for both services; legacy variables are no longer supported.



## 🐳 Docker commands

```bash
docker-compose up --build       # build and start
docker-compose up -d            # start in background
docker-compose logs -f          # follow logs
docker-compose down             # stop and remove
```

## 🔗 Useful links

- API docs: http://localhost:8001/docs
- Dev guide (details): see `CLAUDE.md`

## 🛠️ Scripts

Frontend:
```bash
cd frontend
npm run dev    # dev server
npm run build  # production build
npm run start  # production server
npm run lint   # eslint
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ using modern web technologies</strong>
</div>

## Email Templates

- Set `PROJECT_NAME` (and optionally `NEXT_PUBLIC_PROJECT_NAME`) in your `.env` before building so the generated markup matches your branding.
- Run `bun run emails:dev` from `frontend/` to preview the React Email components.
- Run `bun run emails:build` from `frontend/` whenever templates change; it writes HTML/text artifacts to `backend/app/email_templates/` and updates the manifest consumed by FastAPI.
- Before starting the API locally after editing a template, regenerate the artifacts:
```bash
cd frontend
bun install
bun run emails:build
```
- Docker builds run the same step automatically via the backend image, so `docker-compose up --build` produces fresh templates.
