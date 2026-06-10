
import numpy as np
from typing import Dict
from datetime import datetime
import redis
import json
import os


def build_entropy_features(request_dict: Dict) -> np.ndarray:
    """Build feature vector from entropy predict request."""
    score = request_dict["entropy_score"]
    prev_score = request_dict.get("previous_score", score)
    if prev_score is None:
        prev_score = score
    file_size = request_dict["file_size"]
    ext = request_dict.get("file_extension", "unknown").lower()
    sampled_at = request_dict["sampled_at"]
    agent_id = request_dict.get("agent_id", "unknown")
    if isinstance(sampled_at, str):
        sampled_at = datetime.fromisoformat(sampled_at)
    hour = sampled_at.hour

    score_normalized = score / 8.0
    score_delta = score - prev_score
    score_delta_abs = abs(score_delta)
    delta_direction = 1.0 if score_delta > 0 else (-1.0 if score_delta < 0 else 0.0)

    file_size_log = np.log1p(file_size) if file_size > 0 else 0.0

    doc_exts = ["pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"]
    image_exts = ["jpg", "jpeg", "png", "gif", "bmp", "tiff"]
    db_exts = ["db", "sqlite", "sql", "mdf", "accdb"]
    is_document = 1.0 if ext in doc_exts else 0.0
    is_image = 1.0 if ext in image_exts else 0.0
    is_database = 1.0 if ext in db_exts else 0.0
    is_unknown_ext = 0.0 if any(
        ext in l for l in [doc_exts, image_exts, db_exts, ["zip", "rar", "exe", "dll", "sys", "js", "html"]]
    ) else 1.0

    is_business_hours = 1.0 if 9 <= hour <= 17 else 0.0

    # Rolling features (without relying on Redis)
    current_scores = [score]
    rolling_avg_3 = np.mean(current_scores[-3:]) if len(current_scores) >= 3 else score
    rolling_std_3 = np.std(current_scores[-3:]) if len(current_scores) >= 3 else 0.1
    rolling_max_5 = np.max(current_scores[-5:]) if len(current_scores) >= 5 else score
    score_vs_rolling_avg = score - rolling_avg_3

    rolling_avg_3 = np.mean(current_scores[-3:]) if len(current_scores) >= 3 else score
    rolling_std_3 = np.std(current_scores[-3:]) if len(current_scores) >= 3 else 0.1
    rolling_max_5 = np.max(current_scores[-5:]) if len(current_scores) >= 5 else score
    score_vs_rolling_avg = score - rolling_avg_3

    consecutive_high_count = 0
    for s in reversed(current_scores):
        if s > 7.0:
            consecutive_high_count += 1
        else:
            break
    if not current_scores:
        consecutive_high_count = 1 if score > 7.0 else 0

    features = np.array([
        score,
        score_normalized,
        score_delta,
        score_delta_abs,
        delta_direction,
        file_size_log,
        is_document,
        is_image,
        is_database,
        is_unknown_ext,
        hour,
        is_business_hours,
        rolling_avg_3,
        rolling_std_3,
        rolling_max_5,
        score_vs_rolling_avg,
        consecutive_high_count
    ], dtype=np.float32)
    return features


def extract_reasoning(request_dict: Dict, is_anomaly: bool) -> list:
    """Extract reasoning for prediction."""
    reasoning = []
    score = request_dict["entropy_score"]
    prev_score = request_dict.get("previous_score", score)
    if prev_score is None:
        prev_score = score
    delta = score - prev_score

    if score > 7.2:
        reasoning.append(f"High entropy score ({score:.2f} > 7.2)")
    if abs(delta) > 2.5:
        reasoning.append(f"Large entropy delta ({delta:.2f})")
    if is_anomaly:
        reasoning.append("Anomaly detected by Isolation Forest")
    return reasoning
