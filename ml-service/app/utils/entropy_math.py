
import math
from collections import Counter


def shannon_entropy(data: bytes) -> float:
    """Calculate Shannon entropy of a bytes object."""
    if not data:
        return 0.0
    byte_counts = Counter(data)
    total_bytes = len(data)
    entropy = 0.0
    for count in byte_counts.values():
        probability = count / total_bytes
        entropy -= probability * math.log2(probability)
    return entropy


def chi_square_test(data: bytes) -> tuple[float, float]:
    """Perform chi-square test for randomness."""
    if not data:
        return 0.0, 0.0
    byte_counts = Counter(data)
    total_bytes = len(data)
    expected = total_bytes / 256.0
    chi_square = 0.0
    for i in range(256):
        observed = byte_counts.get(i, 0)
        chi_square += (observed - expected) ** 2 / expected
    # Approximate p-value for chi-square with 255 degrees of freedom
    # High chi-square value = high randomness
    return chi_square, 1.0 - (chi_square / 1000.0)

