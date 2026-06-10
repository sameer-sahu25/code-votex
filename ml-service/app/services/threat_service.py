
from app.services.model_registry import ModelRegistry
from app.features.threat_features import build_threat_features


class ThreatService:
    def __init__(self):
        self.registry = ModelRegistry()

    def adjust(self, request_dict: dict) -> dict:
        features = build_threat_features(request_dict)
        model = self.registry.get_model("threat")
        adjusted_score, confidence = model.predict(features)
        delta = adjusted_score - request_dict["rule_based_score"]

        verdict = "safe"
        if adjusted_score >= 80:
            verdict = "ransomware"
        elif adjusted_score >= 60:
            verdict = "dangerous"
        elif adjusted_score >= 30:
            verdict = "suspicious"

        contributions = model.get_feature_contributions(features)
        explanation = model.generate_explanation(contributions)

        return {
            "adjusted_score": adjusted_score,
            "original_score": request_dict["rule_based_score"],
            "delta": delta,
            "verdict": verdict,
            "feature_contributions": contributions,
            "explanation": explanation,
            "confidence": confidence,
            "model_version": "1.0.0"
        }

    def adjust_batch(self, predictions: list) -> dict:
        adjusted = [self.adjust(p) for p in predictions]
        return {"adjustments": adjusted}

