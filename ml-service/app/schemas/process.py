
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Dict, List


class ProcessPredictRequest(BaseModel):
    agent_id: str = Field(..., description="Unique ID of the agent")
    process_name: str = Field(..., description="Name of the process")
    process_pid: int = Field(..., ge=1, description="Process ID")
    parent_pid: Optional[int] = Field(None, ge=1, description="Parent process ID")
    executable_path: Optional[str] = Field(None, description="Full path to executable")
    files_opened: int = Field(..., ge=0, description="Files opened by process")
    files_read: int = Field(..., ge=0, description="Files read by process")
    files_written: int = Field(..., ge=0, description="Files written by process")
    files_renamed: int = Field(..., ge=0, description="Files renamed by process")
    files_deleted: int = Field(..., ge=0, description="Files deleted by process")
    ops_per_minute: float = Field(..., ge=0.0, description="Operations per minute")
    cpu_percent: float = Field(..., ge=0.0, le=100.0, description="CPU usage percentage")
    memory_mb: float = Field(..., ge=0.0, description="Memory usage in MB")
    network_bytes_sent: int = Field(..., ge=0, description="Network bytes sent")
    observed_at: datetime = Field(..., description="When the process was observed")


class ProcessPredictResponse(BaseModel):
    is_ransomware: bool
    confidence: float = Field(..., ge=0.0, le=1.0)
    behavior_class: str
    rf_prediction: Dict
    lstm_prediction: Optional[Dict]
    ensemble_confidence: float
    top_suspicious_features: List[Dict]
    model_version: str


class ProcessPredictSequenceRequest(BaseModel):
    agent_id: str
    events: List[ProcessPredictRequest]


class ProcessPredictSequenceResponse(BaseModel):
    sequence_label: str
    confidence: float
    attack_progression: List[Dict]
    peak_threat_event_index: int


class ProcessFeatureImportanceResponse(BaseModel):
    feature_name: str
    importance_score: float
    rank: int


