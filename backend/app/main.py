import os
import logging

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import time

from .routers import auth, users

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"🚀 {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(f"✅ {request.method} {request.url.path} -> {response.status_code} ({process_time:.3f}s)")

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
