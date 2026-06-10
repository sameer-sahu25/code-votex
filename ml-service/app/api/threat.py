
from fastapi import APIRouter, HTTPException
from app.schemas.threat import (
    ThreatAdjustRequest,
    ThreatAdjustResponse,
    ThreatAdjustBatchRequest,
    ThreatAdjustBatchResponse
)
from app.services.threat_service import ThreatService

router = APIRouter()
service = ThreatService()


@router.post("/adjust", response_model=ThreatAdjustResponse)
async def adjust_threat(request: ThreatAdjustRequest):
    try:
        result = service.adjust(request.model_dump())
        return ThreatAdjustResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/adjust/batch", response_model=ThreatAdjustBatchResponse)
async def adjust_threat_batch(request: ThreatAdjustBatchRequest):
    try:
        predictions = [p.model_dump() for p in request.predictions]
        result = service.adjust_batch(predictions)
        return ThreatAdjustBatchResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

