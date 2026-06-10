
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from prometheus_fastapi_instrumentator import Instrumentator
import os
from contextlib import asynccontextmanager

from app.api import api_router
from app.services.model_registry import ModelRegistry

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    registry = ModelRegistry()
    await registry.load_all_models()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="RansomShield ML Service",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

Instrumentator().instrument(app).expose(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
