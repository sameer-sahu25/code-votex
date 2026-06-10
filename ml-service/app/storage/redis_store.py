
import redis
import json
import os
from typing import Optional, Any, List, Dict
from datetime import timedelta


class RedisStore:
    def __init__(self, redis_url: Optional[str] = None, password: Optional[str] = None, db: int = 0):
        self.client = None
        try:
            if redis_url is None:
                redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.client = redis.Redis.from_url(redis_url, password=password, db=db)
            self.client.ping()
        except Exception as e:
            print(f"Redis connection failed, operating without Redis: {e}")
            self.client = None

    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> bool:
        if self.client is None:
            return False
        try:
            serialized = json.dumps(value)
            if ttl:
                self.client.setex(key, timedelta(seconds=ttl), serialized)
            else:
                self.client.set(key, serialized)
            return True
        except Exception as e:
            print(f"Redis set error: {e}")
            return False

    def get(self, key: str) -> Optional[Any]:
        if self.client is None:
            return None
        try:
            value = self.client.get(key)
            if value is None:
                return None
            # Decode bytes to string if needed
            if isinstance(value, bytes):
                value = value.decode("utf-8")
            # Type ignore to handle Redis client response type issues
            return json.loads(value)  # type: ignore
        except Exception as e:
            print(f"Redis get error: {e}")
            return None

    def delete(self, key: str) -> bool:
        if self.client is None:
            return False
        try:
            self.client.delete(key)
            return True
        except Exception as e:
            print(f"Redis delete error: {e}")
            return False

    def exists(self, key: str) -> bool:
        if self.client is None:
            return False
        try:
            return bool(self.client.exists(key))
        except Exception as e:
            print(f"Redis exists error: {e}")
            return False

    # Entropy keys
    def set_entropy_rolling(self, agent_id: str, scores: List[float]) -> None:
        key = f"entropy:rolling:{agent_id}"
        self.set(key, scores, ttl=3600)

    def get_entropy_rolling(self, agent_id: str) -> Optional[List[float]]:
        key = f"entropy:rolling:{agent_id}"
        return self.get(key)

    def set_entropy_prediction(self, agent_id: str, file_path: str, prediction: Dict) -> None:
        key = f"entropy:prediction:{agent_id}:{file_path}"
        self.set(key, prediction, ttl=60)

    # Process keys
    def set_process_sequence(self, agent_id: str, sequence: List[List[float]]) -> None:
        key = f"process:sequence:{agent_id}"
        self.set(key, sequence, ttl=1800)

    def get_process_sequence(self, agent_id: str) -> Optional[List[List[float]]]:
        key = f"process:sequence:{agent_id}"
        return self.get(key)

    def set_process_prediction(self, agent_id: str, pid: int, prediction: Dict) -> None:
        key = f"process:prediction:{agent_id}:{pid}"
        self.set(key, prediction, ttl=300)

    # Threat feature cache
    def set_threat_feature_cache(self, agent_id: str, features: Dict) -> None:
        key = f"threat:feature_cache:{agent_id}"
        self.set(key, features, ttl=600)

    def get_threat_feature_cache(self, agent_id: str) -> Optional[Dict]:
        key = f"threat:feature_cache:{agent_id}"
        return self.get(key)

    # Baseline threshold
    def set_baseline_threshold(self, agent_id: str, threshold: float) -> None:
        key = f"baseline:threshold:{agent_id}"
        self.set(key, threshold, ttl=86400)

    def get_baseline_threshold(self, agent_id: str) -> Optional[float]:
        key = f"baseline:threshold:{agent_id}"
        return self.get(key)

    # Stats
    def increment_inference_count(self, model: str, hour: str) -> None:
        if self.client is None:
            return
        try:
            key = f"stats:inference:{model}:{hour}"
            self.client.incr(key)
            self.client.expire(key, timedelta(seconds=172800))
        except Exception as e:
            print(f"Redis increment_inference_count error: {e}")

    def increment_anomaly_count(self, model: str, hour: str) -> None:
        if self.client is None:
            return
        try:
            key = f"stats:anomaly:{model}:{hour}"
            self.client.incr(key)
            self.client.expire(key, timedelta(seconds=172800))
        except Exception as e:
            print(f"Redis increment_anomaly_count error: {e}")
