
from pydantic import BaseModel, Field
from typing import List, Dict


class ThreatAdjustRequest(BaseModel):
    agent_id: str
    rule_based_score: int = Field(..., ge=0, le=100)
    canary_alert_count: int = Field(..., ge=0)
    entropy_anomaly_count: int = Field(..., ge=0)
    max_entropy_score: float = Field(..., ge=0.0, le=8.0)
    avg_entropy_score: float = Field(..., ge=0.0, le=8.0)
    suspicious_process_count: int = Field(..., ge=0)
    max_ops_per_minute: float = Field(..., ge=0.0)
    files_renamed_total: int = Field(..., ge=0)
    files_deleted_total: int = Field(..., ge=0)
    network_bytes_sent_total: int = Field(..., ge=0)
    hour_of_day: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    agent_baseline_deviation: float = Field(..., ge=0.0)
    historical_avg_score_7d: float = Field(..., ge=0.0, le=100.0)
    time_since_last_alert_minutes: float = Field(..., ge=0.0)


class FeatureContribution(BaseModel):
    feature: str
    contribution: float
    direction: str


class ThreatAdjustResponse(BaseModel):
    adjusted_score: int = Field(..., ge=0, le=100)
    original_score: int
    delta: int
    verdict: str
    feature_contributions: List[FeatureContribution]
    explanation: List[str]
    confidence: float = Field(..., ge=0.0, le=1.0)
    model_version: str


class ThreatAdjustBatchRequest(BaseModel):
    predictions: List[ThreatAdjustRequest]


class ThreatAdjustBatchResponse(BaseModel):
    adjustments: List[ThreatAdjustResponse]

