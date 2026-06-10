
from fastapi import APIRouter, HTTPException
import traceback
from app.schemas.entropy import (
    EntropyPredictRequest,
    EntropyPredictResponse,
    EntropyPredictBatchRequest,
    EntropyPredictBatchResponse,
    EntropyStatsResponse
)
from app.services.entropy_service import EntropyService

router = APIRouter()
service = EntropyService()


@router.post("/predict", response_model=EntropyPredictResponse)
async def predict_entropy(request: EntropyPredictRequest):
    try:
        result = service.predict(request.model_dump())
        return EntropyPredictResponse(**result)
    except Exception as e:
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/batch", response_model=EntropyPredictBatchResponse)
async def predict_entropy_batch(request: EntropyPredictBatchRequest):
    try:
        events = [e.model_dump() for e in request.events]
        result = service.predict_batch(events)
        return EntropyPredictBatchResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats/{agent_id}", response_model=EntropyStatsResponse)
async def get_entropy_stats(agent_id: str):
    try:
        result = service.get_stats(agent_id)
        return EntropyStatsResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

