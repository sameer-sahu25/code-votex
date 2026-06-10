
def calculate_threat_score(entropy: float, file_rate: float, is_canary_touched: bool = False) -> int:
    score = 0
    if entropy > 7.5:
        score += 40
    elif entropy > 6.5:
        score += 25
    elif entropy > 5.5:
        score += 10

    if file_rate > 100:
        score += 35
    elif file_rate > 50:
        score += 20
    elif file_rate > 20:
        score += 10

    if is_canary_touched:
        score += 50

    return min(score, 100)
