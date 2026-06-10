
import numpy as np
from app.services.model_registry import ModelRegistry
from app.features.entropy_features import build_entropy_features, extract_reasoning
from app.storage.redis_store import RedisStore


class EntropyService:
    def __init__(self):
        self.registry = ModelRegistry()
        self.redis = RedisStore()

    def predict(self, request_dict: dict) -> dict:
        features = build_entropy_features(request_dict)
        model = self.registry.get_model("entropy")
        is_anomaly, score, confidence = model.predict(features)
        reasoning = extract_reasoning(request_dict, is_anomaly)
        
        # Convert numpy floats to native Python floats for Pydantic
        feature_values = {
            name: float(val) 
            for name, val in zip(model.feature_names, features)
        }
        
        # Cache in Redis (ignore errors)
        try:
            cache_key = f"entropy:{request_dict['agent_id']}:{request_dict['file_path']}"
            self.redis.set(cache_key, {"is_anomaly": is_anomaly, "confidence": confidence}, ttl=60)
        except Exception:
            pass
        
        return {
            "is_anomaly": is_anomaly,
            "anomaly_score": -1.0 if is_anomaly else 1.0,
            "confidence": confidence,
            "reasoning": reasoning,
            "feature_values": feature_values,
            "model_version": "1.0.0"
        }

    def predict_batch(self, events: list) -> dict:
        predictions = []
        for event in events:
            predictions.append(self.predict(event))
        anomalies = sum(1 for p in predictions if p["is_anomaly"])
        return {
            "predictions": predictions,
            "processed": len(events),
            "anomalies": anomalies
        }

    def get_stats(self, agent_id: str) -> dict:
        return {
            "total_predictions_1h": 0,
            "anomaly_rate_1h": 0.0,
            "avg_entropy_score": 0.0,
            "max_entropy_score": 0.0,
            "entropy_trend": [],
            "model_confidence_avg": 0.0
        }

