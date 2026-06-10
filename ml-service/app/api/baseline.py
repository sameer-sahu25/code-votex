from fastapi import APIRouter, HTTPException
from app.schemas.baseline import (
    BaselineProfileRequest,
    BaselineProfileResponse,
    BaselineScoreRequest,
    BaselineScoreResponse,
    BaselineStatusResponse
)
from app.services.baseline_service import BaselineService

router = APIRouter()
service = BaselineService()


@router.post("/profile", response_model=BaselineProfileResponse)
async def profile_baseline(request: BaselineProfileRequest):
    try:
        entropy_history = [e.model_dump() for e in request.entropy_history]
        process_history = [e.model_dump() for e in request.process_history]
        result = service.profile(
            request.agent_id,
            request.time_window_hours,
            entropy_history,
            process_history
        )
        return BaselineProfileResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/score", response_model=BaselineScoreResponse)
async def score_baseline(request: BaselineScoreRequest):
    try:
        result = service.score(
            request.agent_id,
            request.current_entropy_window,
            request.current_process_window
        )
        return BaselineScoreResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/status/{agent_id}", response_model=BaselineStatusResponse)
async def get_baseline_status(agent_id: str):
    try:
        result = service.get_status(agent_id)
        return BaselineStatusResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

