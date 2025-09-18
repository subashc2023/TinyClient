# syntax=docker/dockerfile:1.9

FROM oven/bun:1-alpine as base
WORKDIR /app

COPY bun.lock package.json ./
RUN --mount=type=cache,target=/root/.bun \
    bun install

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "bun install && bun run dev -- --hostname 0.0.0.0"]


