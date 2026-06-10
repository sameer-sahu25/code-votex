
from fastapi import APIRouter, HTTPException
from app.schemas.canary import (
    CanaryAnalyzeRequest,
    CanaryAnalyzeResponse,
    CanarySingleEventRequest,
    CanarySingleEventResponse
)
from app.services.canary_service import CanaryService

router = APIRouter()
service = CanaryService()


@router.post("/analyze", response_model=CanaryAnalyzeResponse)
async def analyze_canary(request: CanaryAnalyzeRequest):
    try:
        seq = [e.model_dump() for e in request.access_sequence]
        result = service.analyze(request.agent_id, request.canary_file_id, seq)
        return CanaryAnalyzeResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/single-event", response_model=CanarySingleEventResponse)
async def single_event_canary(request: CanarySingleEventRequest):
    try:
        event = request.access_event.model_dump()
        result = service.single_event(request.agent_id, request.canary_file_id, event)
        return CanarySingleEventResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

