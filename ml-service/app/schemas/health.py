
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, List, Optional


class ModelInfo(BaseModel):
    model_name: str
    version: str
    trained_at: datetime
    training_samples: int
    metrics: Dict
    file_size_mb: float
    is_loaded: bool


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime


class RedisHealth(BaseModel):
    connected: bool
    latency_ms: float


class InferenceStats(BaseModel):
    requests_1h: int
    avg_latency_ms: float
    anomaly_rate: Optional[float] = None
    ransomware_rate: Optional[float] = None


class SchedulerHealth(BaseModel):
    jobs: List[Dict]


class DeepHealthResponse(BaseModel):
    models_loaded: Dict[str, bool]
    redis: RedisHealth
    inference_stats: Dict[str, InferenceStats]
    scheduler: SchedulerHealth

