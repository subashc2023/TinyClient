# 🚀 TinyClient

> A modern, self-hostable MCP (Model Context Protocol) client with a sleek web interface

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)](https://www.typescriptlang.org/)

## ✨ Features

- **🔐 Secure Authentication** - JWT-based auth with refresh tokens and bcrypt password hashing
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
- **JWT authentication** with access/refresh token pattern
- **CORS enabled** for development

## 🚀 Quick Start

### Option 1: Docker (Recommended)

The easiest way to get started:

```bash
# Clone the repository
git clone <your-repo-url>
cd TinyClient

# Start the entire stack
docker-compose up

# Or start services individually
docker-compose up frontend  # Frontend only
docker-compose up backend   # Backend only
```

**Access the application:**
- 🌐 Frontend: http://localhost:3000
- 📚 API Docs: http://localhost:8001/docs

### Option 2: Local Development

#### Prerequisites
- **Node.js 18+** (for frontend)
- **Python 3.12+** (for backend)
- **npm** or **bun** (package manager)

#### Backend Setup

```bash
cd backend

# Install dependencies with uv
uv sync

# Run migrations (creates DB/tables if missing)
python -m app.setup migrate

# Seed with default users from environment
python -m app.setup seed

# Start the server
python -m app.main
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

## 🗄️ Database Management

The backend includes convenient CLI commands for database operations:

```bash
cd backend

# Apply all migrations (create DB/tables if missing)
python -m app.setup migrate

# Seed database with default users from env
python -m app.setup seed

# Downgrade one revision
python -m app.setup downgrade
```

### Default Users

After seeding, you can log in with:

- **👑 Admin**: `admin@example.com` / `admin123`
- **👤 User**: `user@example.com` / `user123`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database
DATABASE_URL=sqlite:///./tinyclient.db

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Initial Users (for database seeding)
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123!
USER_USERNAME=user
USER_EMAIL=user@example.com
USER_PASSWORD=user123!
```

### Frontend Configuration

The frontend automatically connects to the backend via:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8001
```

## 📁 Project Structure

```
TinyClient/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── models.py       # Database models
│   │   ├── schemas.py      # Pydantic models
│   │   ├── security.py     # Auth utilities
│   │   ├── database.py     # DB connection
│   │   ├── dependencies.py # FastAPI dependencies
│   │   ├── setup.py        # CLI: migrate/seed/downgrade
│   │   └── routers/
│   │       └── auth.py     # Authentication routes
│   ├── alembic.ini         # Alembic configuration
│   ├── alembic/
│   │   ├── env.py          # Alembic environment
│   │   └── versions/       # Migration scripts
│   ├── pyproject.toml   # uv project configuration
│   └── uv.lock         # uv lockfile
├── frontend/               # Next.js frontend
│   ├── app/               # App router pages
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities & contexts
│   └── package.json
├── docker-compose.yml     # Multi-service orchestration
└── README.md
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild specific service
docker-compose up --build frontend
```

## 🔒 Authentication API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate with email/password |
| `/api/auth/refresh` | POST | Refresh access token |
| `/api/auth/logout` | POST | Invalidate refresh token |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/verify` | GET | Verify token validity |

## 🛠️ Development Scripts

### Backend
```bash
cd backend
python -m app.main           # Start server
python -m app.db_commands init  # Setup database
```

### Frontend
```bash
cd frontend
npm run dev        # Development server with Turbopack
npm run build      # Production build
npm run start      # Production server
npm run lint       # ESLint
```

## ⚠️ Known Issues

- **uv compatibility**: There's a compatibility issue between `uv run`, Python 3.13, and SQLAlchemy causing import errors. Use `uv sync` for dependency management but run the application with `python -m` directly instead of `uv run python -m`.

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
