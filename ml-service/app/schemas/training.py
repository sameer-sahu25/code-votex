
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Dict, Optional


class TrainingTriggerRequest(BaseModel):
    models: List[str] = Field(..., description="List of models to retrain")
    agent_id: Optional[str] = Field(None, description="Optional agent ID for agent-specific models")


class TrainingTriggerResponse(BaseModel):
    job_id: str
    models: List[str]
    queued_at: datetime


class TrainingStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    metrics: Dict

