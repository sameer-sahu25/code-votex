
import numpy as np
import os
from app.models.baseline_autoencoder import BaselineAutoencoder
from app.storage.model_store import ModelStore


class BaselineService:
    def __init__(self):
        self.store = ModelStore()

    def profile(self, agent_id: str, time_window_hours: int, entropy_history: list, process_history: list) -> dict:
        model = BaselineAutoencoder()
        combined_data = []
        for entry in entropy_history:
            row = [
                entry.get("entropy_score", 0),
                0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0
            ]
            combined_data.append(row[:30])
        for entry in process_history:
            row = [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                entry.get("ops_per_minute", 0),
                entry.get("cpu_percent", 0),
                0, 0, 0, 0, 0, 0, 0
            ]
            combined_data.append(row[:30])
        if not combined_data:
            combined_data = [np.zeros(30) for _ in range(100)]
        threshold, metrics = model.train_agent(combined_data)
        model.save(os.path.join("saved_models", "baseline", f"autoencoder_{agent_id}.pt"))

        return {
            "agent_id": agent_id,
            "model_trained": True,
            "training_samples": len(combined_data),
            "baseline_reconstruction_error": metrics["mean_error"],
            "anomaly_threshold": threshold,
            "feature_importance": ["entropy", "ops", "cpu", "memory", "network"],
            "model_version": "1.0.0"
        }

    def score(self, agent_id: str, current_entropy_window: list, current_process_window: list) -> dict:
        model_path = os.path.join("saved_models", "baseline", f"autoencoder_{agent_id}.pt")
        if not os.path.exists(model_path):
            return {
                "reconstruction_error": 0.0,
                "deviation_score": 0.0,
                "is_anomalous": False,
                "anomalous_features": [],
                "percentile_rank": 0.5
            }
        model = BaselineAutoencoder()
        model.load(model_path)
        features = np.zeros(30)
        for i, val in enumerate(current_entropy_window):
            if i < 10:
                features[i] = val
        error, deviation, is_anomalous = model.score_deviation(features, model.threshold)

        percentile = 0.5
        if len(model.reconstruction_errors) > 0:
            percentile = float(np.mean(model.reconstruction_errors < error))

        return {
            "reconstruction_error": error,
            "deviation_score": deviation,
            "is_anomalous": is_anomalous,
            "anomalous_features": [],
            "percentile_rank": percentile
        }

    def get_status(self, agent_id: str) -> dict:
        model_path = os.path.join("saved_models", "baseline", f"autoencoder_{agent_id}.pt")
        has_model = os.path.exists(model_path)
        size_mb = 0.0
        last_trained = None
        if has_model:
            size_mb = os.path.getsize(model_path) / (1024 * 1024)
            last_trained = os.path.getmtime(model_path)
        return {
            "has_model": has_model,
            "last_trained_at": last_trained,
            "training_samples": 100 if has_model else 0,
            "baseline_threshold": 0.1,
            "model_size_mb": size_mb
        }

