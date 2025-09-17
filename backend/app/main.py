from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(
    title="TinyClient",
    description="TinyClient FastAPI server",
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


@app.get("/", tags=["system"])
def read_root():
    return {"status": "ok"}


def main():
    """Convenience entrypoint: run with `python -m app.main` from the backend dir."""
    import uvicorn

    # Running with an app object avoids import path issues when called as a script
    uvicorn.run(app, host="0.0.0.0", port=8001)


if __name__ == "__main__":
    main()
