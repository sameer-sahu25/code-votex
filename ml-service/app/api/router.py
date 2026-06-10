
from fastapi import APIRouter
from app.api import entropy, process, canary, threat, baseline, training, health

api_router = APIRouter()

api_router.include_router(entropy.router, prefix="/ml/v1/entropy", tags=["entropy"])
api_router.include_router(process.router, prefix="/ml/v1/process", tags=["process"])
api_router.include_router(canary.router, prefix="/ml/v1/canary", tags=["canary"])
api_router.include_router(threat.router, prefix="/ml/v1/threat", tags=["threat"])
api_router.include_router(baseline.router, prefix="/ml/v1/baseline", tags=["baseline"])
api_router.include_router(training.router, prefix="/ml/v1/training", tags=["training"])
api_router.include_router(health.router, prefix="/ml/v1/health", tags=["health"])

