
from app.services.model_registry import ModelRegistry
from app.features.canary_features import summarize_sequence


class CanaryService:
    def __init__(self):
        self.registry = ModelRegistry()

    def analyze(self, agent_id: str, canary_file_id: str, access_sequence: list) -> dict:
        model = self.registry.get_model("canary")
        attack_prob, llr, matched, stage = model.analyze_sequence(access_sequence)
        summary = summarize_sequence(access_sequence)

        return {
            "attack_probability": attack_prob,
            "attack_stage": stage,
            "llr_score": llr,
            "matched_signatures": matched,
            "sequence_summary": summary,
            "confidence": attack_prob if attack_prob > 0.5 else (1 - attack_prob),
            "model_version": "1.0.0"
        }

    def single_event(self, agent_id: str, canary_file_id: str, access_event: dict) -> dict:
        model = self.registry.get_model("canary")
        is_attack, severity, rule_matched = model.fast_check_single(access_event)
        return {
            "is_attack": is_attack,
            "severity": severity,
            "rule_matched": rule_matched
        }

