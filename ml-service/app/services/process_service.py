
import numpy as np
from app.services.model_registry import ModelRegistry
from app.features.process_features import build_process_features, get_top_suspicious_features
from app.storage.redis_store import RedisStore


class ProcessService:
    def __init__(self):
        self.registry = ModelRegistry()
        self.redis = RedisStore()
        self.sequence_length = 10

    def predict(self, request_dict: dict) -> dict:
        features = build_process_features(request_dict)
        rf_model = self.registry.get_model("process_rf")
        lstm_model = self.registry.get_model("process_lstm")

        class_name, confidence, class_probs = rf_model.predict(features)
        rf_pred = {
            "class": class_name,
            "confidence": confidence,
            "probabilities": class_probs
        }

        lstm_pred = None
        ensemble_confidence = confidence
        agent_id = request_dict["agent_id"]
        seq_key = f"process_seq:{agent_id}"

        # Manage sequence
        current_seq = self.redis.get(seq_key) or []
        current_seq.append(features.tolist())
        if len(current_seq) > self.sequence_length:
            current_seq = current_seq[-self.sequence_length:]
        self.redis.set(seq_key, current_seq, ttl=300)

        if len(current_seq) == self.sequence_length:
            seq_np = np.array(current_seq, dtype=np.float32).reshape(1, self.sequence_length, -1)
            lstm_class, lstm_conf, lstm_probs = lstm_model.predict(seq_np)
            lstm_pred = {
                "class": lstm_class,
                "confidence": lstm_conf,
                "probabilities": lstm_probs
            }
            # Weighted ensemble
            if lstm_pred:
                ensemble_confidence = confidence * 0.6 + lstm_conf * 0.4

        top_features = get_top_suspicious_features(
            rf_model.get_feature_importance(),
            features
        )

        return {
            "is_ransomware": class_name == "ransomware",
            "confidence": ensemble_confidence,
            "behavior_class": class_name,
            "rf_prediction": rf_pred,
            "lstm_prediction": lstm_pred,
            "ensemble_confidence": ensemble_confidence,
            "top_suspicious_features": top_features,
            "model_version": "1.0.0"
        }

    def predict_sequence(self, agent_id: str, events: list) -> dict:
        lstm_model = self.registry.get_model("process_lstm")
        features_list = [build_process_features(e) for e in events]

        if len(features_list) < self.sequence_length:
            padding = [np.zeros_like(features_list[0]) for _ in range(self.sequence_length - len(features_list))]
            features_list = padding + features_list
        else:
            features_list = features_list[-self.sequence_length:]

        seq_np = np.array(features_list, dtype=np.float32).reshape(1, self.sequence_length, -1)
        lstm_class, lstm_conf, lstm_probs = lstm_model.predict(seq_np)

        return {
            "sequence_label": lstm_class,
            "confidence": lstm_conf,
            "attack_progression": [],
            "peak_threat_event_index": len(events) - 1
        }

    def get_feature_importance(self) -> list:
        rf_model = self.registry.get_model("process_rf")
        imp = rf_model.get_feature_importance()
        return [
            {"feature": i["feature"], "importance_score": i["importance"], "rank": idx}
            for idx, i in enumerate(sorted(imp, key=lambda x: x["importance"], reverse=True))
        ]

