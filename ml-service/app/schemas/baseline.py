
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional, Dict


class BaselineEntropyHistoryEntry(BaseModel):
    timestamp: datetime
    entropy_score: float
    file_extension: str


class BaselineProcessHistoryEntry(BaseModel):
    timestamp: datetime
    process_name: str
    ops_per_minute: float
    cpu_percent: float


class BaselineProfileRequest(BaseModel):
    agent_id: str
    time_window_hours: int = Field(168, description="Time window in hours (default: 7 days)")
    entropy_history: List[BaselineEntropyHistoryEntry]
    process_history: List[BaselineProcessHistoryEntry]


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
    current_entropy_window: List[float]
    current_process_window: List[Dict]


class BaselineAnomalousFeature(BaseModel):
    feature: str
    error_contribution: float


class BaselineScoreResponse(BaseModel):
    reconstruction_error: float
    deviation_score: float
    is_anomalous: bool
    anomalous_features: List[BaselineAnomalousFeature]
    percentile_rank: float


class BaselineStatusResponse(BaseModel):
    has_model: bool
    last_trained_at: Optional[datetime]
    training_samples: int
    baseline_threshold: float
    model_size_mb: float

