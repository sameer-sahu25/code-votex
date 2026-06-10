
import math
from collections import Counter


def calculate_entropy(data: bytes) -> float:
    if not data:
        return 0.0
    entropy = 0.0
    length = len(data)
    counter = Counter(data)
    for count in counter.values():
        probability = count / length
        entropy -= probability * math.log2(probability)
    return entropy


def calculate_file_entropy(file_path: str) -> float:
    try:
        with open(file_path, "rb") as f:
            data = f.read(8192)
            return calculate_entropy(data)
    except Exception:
        return 0.0
