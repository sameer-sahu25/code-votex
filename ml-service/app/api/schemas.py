from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


class ThreatAdjustRequest(BaseModel):
    agent_id: str
    rule_based_score: int
    canary_alert_count: int
    entropy_anomaly_count: int
    max_entropy_score: float
    avg_entropy_score: float
    suspicious_process_count: int
    max_ops_per_minute: float
    files_renamed_total: int
    files_deleted_total: int
    network_bytes_sent_total: int
    hour_of_day: int
    day_of_week: int
    agent_baseline_deviation: float
    historical_avg_score_7d: float
    time_since_last_alert_minutes: float


class ThreatAdjustResponse(BaseModel):
    adjusted_score: int
    original_score: int
    delta: int
    verdict: str
    feature_contributions: List[Dict[str, Any]]
    explanation: List[str]
    confidence: float
    model_version: str


class ThreatAdjustBatchRequest(BaseModel):
    predictions: List[ThreatAdjustRequest]


class ThreatAdjustBatchResponse(BaseModel):
    adjustments: List[ThreatAdjustResponse]


class BaselineProfileRequest(BaseModel):
    agent_id: str
    time_window_hours: int = 168
    entropy_history: List[Dict[str, Any]] = []
    process_history: List[Dict[str, Any]] = []


class BaselineProfileResponse(BaseModel):
    agent_id: str
    model_trained: bool
    training_samples: int
    baseline_reconstruction_error: float
    anomaly_threshold: float
    feature_importance: List[str]
    model_version: str


class BaselineScoreRequest(BaseModel):
    agent_id: str
    current_entropy_window: List[float] = []
    current_process_window: List[Dict[str, Any]] = []


class BaselineScoreResponse(BaseModel):
    reconstruction_error: float
    deviation_score: float
    is_anomalous: bool
    anomalous_features: List[Dict[str, Any]]
    percentile_rank: float


class BaselineStatusResponse(BaseModel):
    has_model: bool
    last_trained_at: Optional[datetime] = None
    training_samples: int
    baseline_threshold: float
    model_size_mb: float


class TrainingTriggerRequest(BaseModel):
    models: List[str]


class TrainingTriggerResponse(BaseModel):
    job_id: str
    models: List[str]
    queued_at: datetime


class TrainingStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    metrics: Dict[str, Any] = {}


class ModelInfo(BaseModel):
    model_name: str
    version: str
    trained_at: datetime
    training_samples: int
    metrics: Dict[str, Any]
    file_size_mb: float
    is_loaded: bool


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: datetime


class DeepHealthResponse(BaseModel):
    models_loaded: Dict[str, bool]
    redis: Dict[str, Any]
    inference_stats: Dict[str, Dict[str, Any]]
    scheduler: Dict[str, Any]
