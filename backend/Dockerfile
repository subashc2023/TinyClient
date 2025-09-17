# syntax=docker/dockerfile:1.9

FROM ghcr.io/astral-sh/uv:python3.12-bookworm as base
WORKDIR /app

# Leverage uv's cache layers
COPY uv.lock pyproject.toml ./
RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen

COPY app ./app

EXPOSE 8001

CMD ["sh", "-c", "uv sync && uv run python -m app.main"]


