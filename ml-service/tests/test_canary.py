
import numpy as np
from app.models.canary_analyzer import CanaryAnalyzer
from app.training.data_generator import generate_canary_sequences


def test_canary_rule_001():
    analyzer = CanaryAnalyzer()
    events = [
        {"agent_id": "test_agent", "access_type": "read", "timestamp": 1234567890},
        {"agent_id": "test_agent", "access_type": "encrypt", "timestamp": 1234567891}
    ]
    
    result = analyzer.analyze(events)
    rules_fired = result["rules_fired"]
    assert any(r["rule_id"] == "RULE_001" for r in rules_fired)


def test_canary_rule_004():
    analyzer = CanaryAnalyzer()
    events = [
        {"agent_id": "test_agent", "access_type": "rename", "timestamp": 1234567890+i}
        for i in range(10)
    ]
    
    result = analyzer.analyze(events)
    rules_fired = result["rules_fired"]
    assert any(r["rule_id"] == "RULE_004" for r in rules_fired)


def test_canary_markov_attack_llr():
    analyzer = CanaryAnalyzer()
    normal_seqs, attack_seqs = generate_canary_sequences()
    analyzer.build_markov_chains(normal_seqs, attack_seqs)
    
    # Use an attack sequence
    result = analyzer.analyze(attack_seqs[0])
    assert result["llr"] > 0.0


def test_canary_markov_normal_llr():
    analyzer = CanaryAnalyzer()
    normal_seqs, attack_seqs = generate_canary_sequences()
    analyzer.build_markov_chains(normal_seqs, attack_seqs)
    
    # Use a normal sequence
    result = analyzer.analyze(normal_seqs[0])
    assert result["llr"] < 0.0


def test_canary_attack_stage_encryption():
    analyzer = CanaryAnalyzer()
    events = [
        {"agent_id": "test_agent", "access_type": "write", "timestamp": 1234567890},
        {"agent_id": "test_agent", "access_type": "rename", "timestamp": 1234567891},
        {"agent_id": "test_agent", "access_type": "encrypt", "timestamp": 1234567892},
        {"agent_id": "test_agent", "access_type": "delete", "timestamp": 1234567893},
    ]
    
    result = analyzer.analyze(events)
    assert result["attack_stage"] == "encryption"
