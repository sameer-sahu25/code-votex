
import numpy as np
from typing import Dict, List, Tuple


def compute_shap_simple(feature_values: np.ndarray, feature_importance: np.ndarray) -> List[Dict]:
    """Simple SHAP-style feature importance approximation."""
    features = [f"feature_{i}" for i in range(len(feature_importance))]
    contributions = feature_values * feature_importance
    results = []
    for feat, val, contrib in zip(features, feature_values, contributions):
        direction = "positive" if contrib > 0 else "negative"
        results.append({
            "feature": feat,
            "contribution": float(contrib),
            "direction": direction
        })
    return sorted(results, key=lambda x: abs(x["contribution"]), reverse=True)


def generate_explanation(contributions: List[Dict]) -> List[str]:
    """Generate human-readable explanations from feature contributions."""
    explanations = []
    for item in contributions[:5]:
        feature = item["feature"]
        contrib = item["contribution"]
        direction = item["direction"]
        if abs(contrib) < 0.1:
            continue
        if direction == "positive":
            explanations.append(f"{feature} increased score by {contrib:.1f} points")
        else:
            explanations.append(f"{feature} decreased score by {abs(contrib):.1f} points")
    return explanations

