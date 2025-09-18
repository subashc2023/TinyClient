# syntax=docker/dockerfile:1.9

FROM ghcr.io/astral-sh/uv:python3.12-bookworm as base
WORKDIR /app

# Leverage uv's cache layers
COPY backend/uv.lock backend/pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

COPY backend/app ./app
COPY .env .env

EXPOSE 8001

CMD ["sh", "-c", "uv run python -m app.db_commands init && uv run python -m app.db_commands seed && uv run python -m app.main"]


