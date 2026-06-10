
from fastapi import APIRouter, HTTPException
from app.schemas.process import (
    ProcessPredictRequest,
    ProcessPredictResponse,
    ProcessPredictSequenceRequest,
    ProcessPredictSequenceResponse,
    ProcessFeatureImportanceResponse
)
from app.services.process_service import ProcessService

router = APIRouter()
service = ProcessService()


@router.post("/predict", response_model=ProcessPredictResponse)
async def predict_process(request: ProcessPredictRequest):
    try:
        result = service.predict(request.model_dump())
        return ProcessPredictResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/predict/sequence", response_model=ProcessPredictSequenceResponse)
async def predict_process_sequence(request: ProcessPredictSequenceRequest):
    try:
        events = [e.model_dump() for e in request.events]
        result = service.predict_sequence(request.agent_id, events)
        return ProcessPredictSequenceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feature-importance", response_model=list[ProcessFeatureImportanceResponse])
async def get_process_feature_importance():
    try:
        result = service.get_feature_importance()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

