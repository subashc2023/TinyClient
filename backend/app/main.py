import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import auth, users

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
