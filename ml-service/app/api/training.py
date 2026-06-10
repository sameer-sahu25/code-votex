
from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
import os
import uuid
from datetime import datetime
from app.schemas.training import (
    TrainingTriggerRequest,
    TrainingTriggerResponse,
    TrainingStatusResponse
)
from app.training.pipeline import TrainingPipeline

router = APIRouter()

job_statuses = {}


def verify_internal_key(x_internal_key: Optional[str] = Header(None)):
    if x_internal_key != os.getenv("INTERNAL_KEY", "dev-internal-key"):
        raise HTTPException(status_code=401, detail="Invalid internal key")
    return True


@router.post("/trigger", response_model=TrainingTriggerResponse, dependencies=[Depends(verify_internal_key)])
async def trigger_training(request: TrainingTriggerRequest):
    try:
        job_id = str(uuid.uuid4())
        job_statuses[job_id] = {
            "status": "queued",
            "progress": 0.0,
            "started_at": None,
            "completed_at": None,
            "metrics": {}
        }
        # Run training in background
        import asyncio
        asyncio.create_task(run_training(job_id, request.models))
        return TrainingTriggerResponse(
            job_id=job_id,
            models=request.models,
            queued_at=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def run_training(job_id: str, models: list[str]):
    job_statuses[job_id]["status"] = "running"
    job_statuses[job_id]["started_at"] = datetime.now()
    try:
        pipeline = TrainingPipeline()
        if "all" in models:
            metrics = await pipeline.run_all()
        else:
            metrics = {}
            if "entropy" in models:
                await pipeline.train_entropy_detector()
            if "process" in models:
                await pipeline.train_process_classifier()
            if "canary" in models:
                await pipeline.build_canary_analyzer()
            if "threat" in models:
                await pipeline.train_threat_adjuster()
        job_statuses[job_id]["status"] = "completed"
        job_statuses[job_id]["progress"] = 1.0
        job_statuses[job_id]["metrics"] = metrics
    except Exception as e:
        job_statuses[job_id]["status"] = "failed"
        job_statuses[job_id]["error"] = str(e)
    job_statuses[job_id]["completed_at"] = datetime.now()


@router.get("/status/{job_id}", response_model=TrainingStatusResponse)
async def get_training_status(job_id: str):
    try:
        if job_id not in job_statuses:
            return TrainingStatusResponse(
                job_id=job_id,
                status="not_found",
                progress=0.0,
                started_at=None,
                completed_at=None,
                metrics={}
            )
        status = job_statuses[job_id]
        return TrainingStatusResponse(
            job_id=job_id,
            status=status["status"],
            progress=status["progress"],
            started_at=status["started_at"],
            completed_at=status["completed_at"],
            metrics=status.get("metrics", {})
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

