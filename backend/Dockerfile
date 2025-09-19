# syntax=docker/dockerfile:1.9

FROM oven/bun:1 as email_builder
WORKDIR /workspace

COPY frontend/package.json frontend/bun.lock ./frontend/
RUN --mount=type=cache,target=/root/.bun \
    cd frontend && bun install --frozen-lockfile

COPY frontend/emails ./frontend/emails
COPY frontend/public ./frontend/public
COPY frontend/tsconfig.json ./frontend/tsconfig.json
RUN cd frontend && bun run emails:build

FROM ghcr.io/astral-sh/uv:python3.12-bookworm as base
WORKDIR /app

COPY backend/uv.lock backend/pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

COPY backend/app ./app
COPY --from=email_builder /workspace/backend/app/email_templates ./app/email_templates
COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic

EXPOSE 8001

CMD ["sh", "-c", "uv run python -m app.setup migrate && if [ -n \"$ADMIN_EMAIL\" ]; then uv run python -m app.setup seed; fi; uv run python -m app.main"]
