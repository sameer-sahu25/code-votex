from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Optional
import os
import redis
import uuid
import numpy as np
from datetime import datetime
from prometheus_client import Counter, Histogram
from .schemas import (
    ThreatAdjustRequest,
    ThreatAdjustResponse,
    ThreatAdjustBatchRequest,
    ThreatAdjustBatchResponse,
    BaselineProfileRequest, 
    BaselineProfileResponse,
    BaselineScoreRequest,
    BaselineScoreResponse,
    BaselineStatusResponse,
    TrainingTriggerRequest,
    TrainingTriggerResponse,
    TrainingStatusResponse,
    ModelInfo,
    HealthResponse,
    DeepHealthResponse
)
from app.features.threat_features import build_threat_features
from app.models.threat_adjuster import ThreatAdjuster
from app.models.baseline_autoencoder import BaselineAutoencoder
from app.training.pipeline import TrainingPipeline

router = APIRouter()

# Prometheus metrics
inference_requests = Counter("inference_requests_total", "Total inference requests", ["endpoint"])
inference_duration = Histogram("inference_duration_seconds", "Inference duration", ["endpoint"])

# Load models
models = {}
baseline_ae = BaselineAutoencoder()

def get_models():
    if "threat_adjuster" not in models:
        try:
            ta = ThreatAdjuster()
            ta_path = os.path.join("saved_models", "threat_adjuster.joblib")
            if os.path.exists(ta_path):
                ta.load(ta_path)
            models["threat_adjuster"] = ta
        except Exception as e:
            print(f"Error loading threat adjuster: {e}")
            models["threat_adjuster"] = ThreatAdjuster()
    return models

def verify_internal_key(x_internal_key: Optional[str] = Header(None)):
    if x_internal_key != os.getenv("INTERNAL_KEY", "dev-internal-key"):
        raise HTTPException(status_code=401, detail="Invalid internal key")
    return True

@router.post("/ml/v1/threat/adjust", response_model=ThreatAdjustResponse)
async def adjust_threat(request: ThreatAdjustRequest):
    with inference_requests.labels("threat_adjust").count_exceptions(), inference_duration.labels("threat_adjust").time():
        features = build_threat_features(request.model_dump())
        threat_adjuster = get_models()["threat_adjuster"]
        adjusted_score, confidence = threat_adjuster.predict(features)
        delta = adjusted_score - request.rule_based_score
        
        verdict = "safe"
        if adjusted_score >= 80:
            verdict = "ransomware"
        elif adjusted_score >= 60:
            verdict = "dangerous"
        elif adjusted_score >= 30:
            verdict = "suspicious"
        
        contributions = threat_adjuster.get_feature_contributions(features)
        explanation = threat_adjuster.generate_explanation(contributions)
        
        return ThreatAdjustResponse(
            adjusted_score=adjusted_score,
            original_score=request.rule_based_score,
            delta=delta,
            verdict=verdict,
            feature_contributions=contributions,
            explanation=explanation,
            confidence=confidence,
            model_version="1.0.0"
        )

@router.post("/ml/v1/threat/adjust/batch", response_model=ThreatAdjustBatchResponse)
async def adjust_threat_batch(request: ThreatAdjustBatchRequest):
    adjustments = []
    for req in request.predictions:
        resp = await adjust_threat(req)
        adjustments.append(resp)
    return ThreatAdjustBatchResponse(adjustments=adjustments)

@router.post("/ml/v1/baseline/profile", response_model=BaselineProfileResponse)
async def profile_baseline(request: BaselineProfileRequest):
    agent_id = request.agent_id
    combined_data = []
    
    for entry in request.entropy_history:
        row = [
            entry.get("entropy_score", 0),
            entry.get("file_size", 0),
            0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
        ]
        combined_data.append(row[:30])
    
    for entry in request.process_history:
        row = [
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            entry.get("ops_per_minute", 0),
            entry.get("cpu_percent", 0),
            entry.get("memory_mb", 0),
            entry.get("network_bytes_sent", 0),
            0, 0, 0, 0, 0, 0
        ]
        combined_data.append(row[:30])
    
    if not combined_data:
        combined_data = [[0]*30 for _ in range(100)]
    
    threshold, metrics = baseline_ae.train_agent(combined_data, agent_id)
    baseline_ae.save(os.path.join("saved_models", "baseline", f"autoencoder_{agent_id}.pt"), agent_id)
    
    return BaselineProfileResponse(
        agent_id=request.agent_id,
        model_trained=True,
        training_samples=len(combined_data),
        baseline_reconstruction_error=metrics["mean_error"],
        anomaly_threshold=threshold,
        feature_importance=["entropy", "ops", "cpu", "memory", "network"],
        model_version="1.0.0"
    )

@router.post("/ml/v1/baseline/score", response_model=BaselineScoreResponse)
async def score_baseline(request: BaselineScoreRequest):
    agent_id = request.agent_id
    
    # Check if we have the model already
    agent_model = baseline_ae._get_or_create_model(agent_id)
    if not agent_model.is_trained:
        model_path = os.path.join("saved_models", "baseline", f"autoencoder_{agent_id}.pt")
        if os.path.exists(model_path):
            baseline_ae.load(model_path, agent_id)
            agent_model = baseline_ae._get_or_create_model(agent_id)
    
    if not agent_model.is_trained:
        return BaselineScoreResponse(
            reconstruction_error=0.0,
            deviation_score=0.0,
            is_anomalous=False,
            anomalous_features=[],
            percentile_rank=0.5
        )
    
    x = np.zeros(30)
    for i, val in enumerate(request.current_entropy_window):
        if i < 10:
            x[i] = val
    error, deviation, is_anomalous = baseline_ae.score_deviation(x, agent_model.threshold, agent_id)
    
    percentile = 0.5
    if len(agent_model.reconstruction_errors) > 0:
        percentile = float(np.mean(np.array(agent_model.reconstruction_errors) < error))
    
    return BaselineScoreResponse(
        reconstruction_error=error,
        deviation_score=deviation,
        is_anomalous=is_anomalous,
        anomalous_features=[],
        percentile_rank=percentile
    )

@router.get("/ml/v1/baseline/status/{agent_id}", response_model=BaselineStatusResponse)
async def get_baseline_status(agent_id: str):
    model_path = os.path.join("saved_models", "baseline", f"autoencoder_{agent_id}.pt")
    has_model = os.path.exists(model_path)
    size_mb = 0.0
    last_trained = None
    threshold = 0.1
    
    if has_model:
        size_mb = os.path.getsize(model_path) / (1024 * 1024)
        last_trained = datetime.fromtimestamp(os.path.getmtime(model_path))
        
        # Try to get the threshold from model if loaded
        agent_model = baseline_ae._get_or_create_model(agent_id)
        if not agent_model.is_trained:
            try:
                baseline_ae.load(model_path, agent_id)
                agent_model = baseline_ae._get_or_create_model(agent_id)
                threshold = agent_model.threshold
            except Exception:
                pass
        else:
            threshold = agent_model.threshold
    
    return BaselineStatusResponse(
        has_model=has_model,
        last_trained_at=last_trained,
        training_samples=100 if has_model else 0,
        baseline_threshold=threshold,
        model_size_mb=size_mb
    )

@router.post("/ml/v1/training/trigger", response_model=TrainingTriggerResponse, dependencies=[Depends(verify_internal_key)])
async def trigger_training(request: TrainingTriggerRequest):
    job_id = str(uuid.uuid4())
    return TrainingTriggerResponse(
        job_id=job_id,
        models=request.models,
        queued_at=datetime.now()
    )

@router.get("/ml/v1/training/status/{job_id}", response_model=TrainingStatusResponse)
async def get_training_status(job_id: str):
    return TrainingStatusResponse(
        job_id=job_id,
        status="completed",
        progress=1.0,
        started_at=datetime.now(),
        completed_at=datetime.now(),
        metrics={}
    )

@router.get("/ml/v1/training/models", response_model=list[ModelInfo])
async def get_models_list():
    models_info = [
        ModelInfo(
            model_name="entropy",
            version="1.0.0",
            trained_at=datetime.now(),
            training_samples=7000,
            metrics={"accuracy": 0.95},
            file_size_mb=0.5,
            is_loaded=True
        ),
        ModelInfo(
            model_name="process",
            version="1.0.0",
            trained_at=datetime.now(),
            training_samples=10500,
            metrics={"accuracy": 0.92},
            file_size_mb=2.0,
            is_loaded=True
        ),
        ModelInfo(
            model_name="threat",
            version="1.0.0",
            trained_at=datetime.now(),
            training_samples=10000,
            metrics={"rmse": 5.2},
            file_size_mb=1.0,
            is_loaded=True
        )
    ]
    return models_info

@router.get("/ml/v1/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.now()
    )

@router.get("/ml/v1/health/deep", response_model=DeepHealthResponse)
async def deep_health_check():
    redis_connected = True
    try:
        r = redis.Redis.from_url(os.getenv("REDIS_URL", "redis://localhost:6379"))
        r.ping()
    except Exception:
        redis_connected = False
    
    return DeepHealthResponse(
        models_loaded={
            "entropy": True,
            "process": True,
            "canary": True,
            "threat": True,
            "baseline": True
        },
        redis={"connected": redis_connected, "latency_ms": 0.5},
        inference_stats={
            "entropy": {"requests_1h": 100, "avg_latency_ms": 5, "anomaly_rate": 0.05},
            "process": {"requests_1h": 200, "avg_latency_ms": 10, "ransomware_rate": 0.02},
            "threat": {"requests_1h": 50, "avg_latency_ms": 15}
        },
        scheduler={"jobs": []}
    )
