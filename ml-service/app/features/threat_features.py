
import numpy as np
from typing import Dict
from datetime import datetime


def build_threat_features(request: Dict) -> np.ndarray:
    rule_based_score = request.get("rule_based_score", 0)
    canary_alert_count = request.get("canary_alert_count", 0)
    entropy_anomaly_count = request.get("entropy_anomaly_count", 0)
    max_entropy_score = request.get("max_entropy_score", 0)
    avg_entropy_score = request.get("avg_entropy_score", 0)
    suspicious_process_count = request.get("suspicious_process_count", 0)
    max_ops_per_minute = request.get("max_ops_per_minute", 0)
    files_renamed_total = request.get("files_renamed_total", 0)
    files_deleted_total = request.get("files_deleted_total", 0)
    network_bytes_sent_total = request.get("network_bytes_sent_total", 0)
    hour_of_day = request.get("hour_of_day", 0)
    day_of_week = request.get("day_of_week", 0)
    agent_baseline_deviation = request.get("agent_baseline_deviation", 0)
    historical_avg_score_7d = request.get("historical_avg_score_7d", 0)
    time_since_last_alert_minutes = request.get("time_since_last_alert_minutes", 0)

    canary_triggered = 1.0 if canary_alert_count > 0 else 0.0
    entropy_score_range = max_entropy_score - avg_entropy_score
    max_ops_log = np.log1p(max_ops_per_minute)
    rename_delete_ratio = files_renamed_total / max(files_deleted_total, 1)
    network_bytes_sent_total_log = np.log1p(network_bytes_sent_total)
    is_weekend = 1.0 if day_of_week in [5, 6] else 0.0
    is_business_hours = 1.0 if 9 <= hour_of_day <= 17 else 0.0
    score_vs_historical = rule_based_score - historical_avg_score_7d
    alert_frequency = 1.0 / max(time_since_last_alert_minutes, 1)
    multi_signal = 1.0 if (canary_alert_count > 0 and entropy_anomaly_count > 0 and suspicious_process_count > 0) else 0.0
    signal_count = sum([
        1 if canary_alert_count > 0 else 0,
        1 if entropy_anomaly_count > 0 else 0,
        1 if suspicious_process_count > 0 else 0
    ])

    features = np.array([
        rule_based_score,
        canary_alert_count,
        canary_triggered,
        entropy_anomaly_count,
        max_entropy_score,
        avg_entropy_score,
        entropy_score_range,
        suspicious_process_count,
        max_ops_per_minute,
        max_ops_log,
        files_renamed_total,
        files_deleted_total,
        rename_delete_ratio,
        network_bytes_sent_total_log,
        hour_of_day,
        is_business_hours,
        day_of_week,
        is_weekend,
        agent_baseline_deviation,
        historical_avg_score_7d,
        score_vs_historical,
        time_since_last_alert_minutes,
        alert_frequency,
        multi_signal,
        signal_count
    ], dtype=np.float32)
    return features
