# syntax=docker/dockerfile:1.9

FROM ghcr.io/astral-sh/uv:python3.12-bookworm as base
WORKDIR /app

# Leverage uv's cache layers
COPY backend/uv.lock backend/pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

COPY backend/app ./app
COPY backend/alembic.ini ./alembic.ini
COPY backend/alembic ./alembic

EXPOSE 8001

CMD ["sh", "-c", "uv run python -m app.setup migrate && if [ -n \"$ADMIN_EMAIL\" ]; then uv run python -m app.setup seed; fi; uv run python -m app.main"]


