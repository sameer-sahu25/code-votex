
from fastapi import APIRouter, HTTPException
from app.schemas.health import HealthResponse, DeepHealthResponse, ModelInfo
from datetime import datetime
import os

router = APIRouter()


@router.get("", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now()
    )


@router.get("/deep", response_model=DeepHealthResponse)
async def deep_health_check():
    redis_connected = True
    try:
        from app.storage.redis_store import RedisStore
        redis = RedisStore()
        redis.set("health_check", "ok", ttl=5)
    except Exception as e:
        print(f"Redis health check failed: {e}")
        redis_connected = False

    from app.services.model_registry import ModelRegistry
    registry = ModelRegistry()
    model_status = registry.get_status()
    models_loaded = {
        "entropy": model_status.get("entropy", {}).get("is_loaded", False),
        "process_rf": model_status.get("process_rf", {}).get("is_loaded", False),
        "process_lstm": model_status.get("process_lstm", {}).get("is_loaded", False),
        "canary": model_status.get("canary", {}).get("is_loaded", False),
        "threat": model_status.get("threat", {}).get("is_loaded", False),
        "baseline": True
    }

    from app.jobs.scheduler import scheduler
    jobs_list = []
    for job in scheduler.get_jobs():
        jobs_list.append({
            "name": job.name,
            "next_run": job.next_run_time
        })

    return DeepHealthResponse(
        models_loaded=models_loaded,
        redis={"connected": redis_connected, "latency_ms": 0.5},
        inference_stats={
            "entropy": {"requests_1h": 0, "avg_latency_ms": 0.0, "anomaly_rate": 0.0},
            "process": {"requests_1h": 0, "avg_latency_ms": 0.0, "ransomware_rate": 0.0},
            "threat": {"requests_1h": 0, "avg_latency_ms": 0.0}
        },
        scheduler={"jobs": jobs_list}
    )


@router.get("/models", response_model=list[ModelInfo])
async def get_models():
    from app.services.model_registry import ModelRegistry
    registry = ModelRegistry()
    model_status = registry.get_status()
    model_info_list = []
    for name, info in model_status.items():
        if name == "entropy":
            display_name = "entropy"
        elif name == "process_rf" or name == "process_lstm":
            display_name = "process"
        else:
            display_name = name
        model_info_list.append(ModelInfo(
            model_name=display_name,
            version="1.0.0",
            trained_at=info.get("last_trained", datetime.now()),
            training_samples=10000,
            metrics={},
            file_size_mb=info.get("file_size_mb", 0.0),
            is_loaded=info.get("is_loaded", False)
        ))
    return model_info_list

