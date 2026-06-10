
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class CanaryAccessEvent(BaseModel):
    process_name: str
    process_pid: int
    access_type: str
    timestamp: datetime
    file_extension_changed: bool
    file_size_change_bytes: int


class CanaryAnalyzeRequest(BaseModel):
    agent_id: str
    canary_file_id: str
    access_sequence: List[CanaryAccessEvent]


class CanaryAnalyzeResponse(BaseModel):
    attack_probability: float
    attack_stage: str
    llr_score: float
    matched_signatures: List[str]
    sequence_summary: str
    confidence: float
    model_version: str


class CanarySingleEventRequest(BaseModel):
    agent_id: str
    canary_file_id: str
    access_event: CanaryAccessEvent


class CanarySingleEventResponse(BaseModel):
    is_attack: bool
    severity: str
    rule_matched: Optional[str]

