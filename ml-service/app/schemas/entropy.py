
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, List


class EntropyPredictRequest(BaseModel):
    agent_id: str = Field(..., description="Unique ID of the agent")
    file_path: str = Field(..., description="Full path to the file")
    entropy_score: float = Field(..., ge=0.0, le=8.0, description="Shannon entropy score (0-8)")
    file_size: int = Field(..., ge=0, description="File size in bytes")
    file_extension: str = Field(..., description="File extension (without leading dot)")
    previous_score: Optional[float] = Field(None, ge=0.0, le=8.0, description="Previous entropy score for this file")
    sampled_at: datetime = Field(..., description="When the entropy was measured")


class EntropyPredictResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float = Field(..., ge=-1.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)
    reasoning: List[str]
    feature_values: Dict[str, float]
    model_version: str


class EntropyPredictBatchRequest(BaseModel):
    events: List[EntropyPredictRequest] = Field(..., description="List of up to 200 events")


class EntropyPredictBatchResponse(BaseModel):
    predictions: List[EntropyPredictResponse]
    processed: int
    anomalies: int


class EntropyStatsResponse(BaseModel):
    total_predictions_1h: int
    anomaly_rate_1h: float
    avg_entropy_score: float
    max_entropy_score: float
    entropy_trend: List[Dict[str, str | float]]
    model_confidence_avg: float

