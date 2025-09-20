import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from .routers import auth, users
from .utils.config import get_allowed_cors_origins

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

PROJECT_NAME = os.getenv("PROJECT_NAME", "TinyClient")

app = FastAPI(
    title=PROJECT_NAME,
    description=f"{PROJECT_NAME} FastAPI server with authentication",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

allowed_origins = get_allowed_cors_origins()
allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX", "").strip() or None
logger.info(f"CORS allowed origins: {allowed_origins}")
if allow_origin_regex:
    logger.info(f"CORS allow_origin_regex: {allow_origin_regex}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Request logging configuration
LOG_ONLY_API_PATHS = os.getenv("LOG_ONLY_API_PATHS", "true").strip().lower() in {"1", "true", "yes", "on"}
SKIP_OPTIONS_LOGS = os.getenv("SKIP_OPTIONS_LOGS", "true").strip().lower() in {"1", "true", "yes", "on"}

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")

    # Optionally restrict to API paths and skip OPTIONS preflight logs
    path = request.url.path or "/"
    method = request.method.upper()
    should_log = True
    if LOG_ONLY_API_PATHS and not path.startswith("/api/"):
        should_log = False
    if SKIP_OPTIONS_LOGS and method == "OPTIONS":
        should_log = False

    if should_log:
        logger.info(f"{method} {path} from {client_ip}")

    response = await call_next(request)

    process_time = time.time() - start_time
    if should_log:
        logger.info(f"{method} {path} -> {response.status_code} ({process_time:.3f}s)")

    return response

app.include_router(auth.router)
app.include_router(users.router)


@app.get("/", tags=["system"])
def read_root():
    return {"status": "ok"}


def main():
    """Convenience entrypoint: run with `python -m app.main` from the backend dir."""
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)


if __name__ == "__main__":
    main()
