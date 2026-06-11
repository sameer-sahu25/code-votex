
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

from pydantic import BaseModel
from typing import List
from fastapi import Header, HTTPException
from app.watcher.watcher_manager import watcher_manager

class StartMonitoringRequest(BaseModel):
    directories: List[str]
    sessionId: str

@app.post("/start")
async def start_monitoring(request: StartMonitoringRequest, x_api_key: str = Header(None)):
    expected_key = os.getenv("ML_API_KEY", "ransomwatch_secret_key_change_in_production")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    watcher_manager.start_monitoring(request.directories, request.sessionId)
    return {"status": "started", "sessionId": request.sessionId}

@app.post("/stop")
async def stop_monitoring(x_api_key: str = Header(None)):
    expected_key = os.getenv("ML_API_KEY", "ransomwatch_secret_key_change_in_production")
    if x_api_key != expected_key:
        raise HTTPException(status_code=401, detail="Unauthorized")
    watcher_manager.stop_monitoring()
    return {"status": "stopped"}

Instrumentator().instrument(app).expose(app)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
