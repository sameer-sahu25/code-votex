
import numpy as np
from typing import Dict
from datetime import datetime
import re


KNOWN_RANSOMWARE_NAMES = ["vssadmin", "wbadmin", "bcdedit", "cipher", "fsutil", "takeown", "icacls", "wevtutil", "powershell"]


def build_process_features(request_dict: Dict) -> np.ndarray:
    """Build feature vector from process predict request."""
    name = request_dict.get("process_name", "").lower()
    ops = request_dict.get("ops_per_minute", 0.0)
    opened = request_dict.get("files_opened", 0)
    read = request_dict.get("files_read", 0)
    written = request_dict.get("files_written", 0)
    renamed = request_dict.get("files_renamed", 0)
    deleted = request_dict.get("files_deleted", 0)
    cpu = request_dict.get("cpu_percent", 0.0)
    mem = request_dict.get("memory_mb", 0.0)
    net = request_dict.get("network_bytes_sent", 0)
    observed_at = request_dict["observed_at"]
    if isinstance(observed_at, str):
        observed_at = datetime.fromisoformat(observed_at)
    hour = observed_at.hour

    ops_log = np.log1p(ops)
    mem_log = np.log1p(mem)
    net_log = np.log1p(net)

    total_ops = opened + read + written + renamed + deleted or 1
    rename_ratio = renamed / total_ops
    delete_ratio = deleted / total_ops
    write_ratio = written / total_ops
    read_write_ratio = (read / written) if written > 0 else 0.0
    has_network_activity = 1.0 if net > 0 else 0.0
    is_system_process = 1.0 if "svchost" in name or "system" in name else 0.0
    is_known_ransomware_name = 1.0 if any(n in name for n in KNOWN_RANSOMWARE_NAMES) else 0.0
    name_entropy = _calc_name_entropy(name)
    is_hidden_process = 1.0 if name.startswith(".") or name.startswith("$") else 0.0
    is_business_hours = 1.0 if 9 <= hour <= 17 else 0.0
    ops_cpu_ratio = ops / (cpu + 0.01)
    io_intensity = (read + written + renamed + deleted) / 1000.0

    features = np.array([
        ops,
        ops_log,
        opened,
        read,
        written,
        renamed,
        deleted,
        rename_ratio,
        delete_ratio,
        write_ratio,
        read_write_ratio,
        cpu,
        mem_log,
        net_log,
        has_network_activity,
        is_system_process,
        is_known_ransomware_name,
        name_entropy,
        is_hidden_process,
        hour,
        is_business_hours,
        ops_cpu_ratio,
        io_intensity
    ], dtype=np.float32)
    return features


def _calc_name_entropy(name: str) -> float:
    """Calculate simple entropy for process name."""
    from collections import Counter
    if not name:
        return 0.0
    count = Counter(name)
    total = len(name)
    entropy = 0.0
    for c in count.values():
        p = c / total
        entropy -= p * np.log2(p)
    return entropy


def get_top_suspicious_features(importances: list, feature_values: list) -> list:
    """Get top suspicious features."""
    top = []
    for i, (imp_dict, val) in enumerate(zip(importances, feature_values)):
        imp = imp_dict["importance"]  # because importances is a list of dicts with "feature" and "importance"
        if imp > 0.05:
            top.append({
                "feature": imp_dict["feature"],
                "value": float(val),
                "importance": float(imp)
            })
    return sorted(top, key=lambda x: x["importance"], reverse=True)[:5]

