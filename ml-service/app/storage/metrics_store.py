
from typing import Dict, List, Optional
from datetime import datetime
import json


class MetricsStore:
    def __init__(self, redis_store):
        self.redis = redis_store

    def record_inference(self, model_type: str, latency: float, metadata: Optional[Dict] = None) -> None:
        key = f"inference:{model_type}:{datetime.now().isoformat()[:19]}"
        data = {
            "timestamp": datetime.now().isoformat(),
            "latency_ms": latency,
            "metadata": metadata or {}
        }
        self.redis.set(key, data, ttl=3600)

    def get_stats(self, model_type: str, window_seconds: int = 3600) -> Dict:
        # Simple stats placeholder
        return {
            "total_predictions": 0,
            "avg_latency_ms": 0.0,
            "anomaly_rate": 0.0
        }

