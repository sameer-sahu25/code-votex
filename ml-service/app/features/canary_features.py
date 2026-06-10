
from typing import Dict, List


def build_canary_features(access_sequence: List[Dict]) -> Dict:
    """Build features from canary access sequence."""
    if not access_sequence:
        return {}

    types = [event["access_type"] for event in access_sequence]
    type_counts = {}
    for t in types:
        type_counts[t] = type_counts.get(t, 0) + 1

    total_events = len(types)
    rename_count = type_counts.get("rename", 0)
    encrypt_count = type_counts.get("encrypt", 0)
    delete_count = type_counts.get("delete", 0)

    features = {
        "total_events": total_events,
        "rename_ratio": rename_count / total_events if total_events > 0 else 0.0,
        "encrypt_ratio": encrypt_count / total_events if total_events > 0 else 0.0,
        "delete_ratio": delete_count / total_events if total_events > 0 else 0.0
    }
    return features


def summarize_sequence(access_sequence: List[Dict]) -> str:
    """Create a human-readable summary of the access sequence."""
    types = [event["access_type"] for event in access_sequence]
    type_str = " → ".join(types)
    if len(type_str) > 100:
        type_str = type_str[:97] + "..."
    return type_str

