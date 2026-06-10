
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health():
    response = client.get("/ml/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_entropy_predict():
    response = client.post("/ml/v1/entropy/predict", json={
        "agent_id": "test_agent",
        "file_path": "/test/file.txt",
        "file_size": 1024,
        "file_extension": "txt",
        "entropy_score": 4.2,
        "sampled_at": "2023-10-05T14:48:00"
    })
    print("test_entropy_predict status code:", response.status_code)
    if response.status_code != 200:
        print("test_entropy_predict response:", response.json())
    assert response.status_code == 200
    data = response.json()
    assert "is_anomaly" in data
    assert "anomaly_score" in data
    assert "confidence" in data


def test_process_predict():
    response = client.post("/ml/v1/process/predict", json={
        "agent_id": "test_agent",
        "process_pid": 1234,
        "process_name": "chrome.exe",
        "ops_per_minute": 50,
        "files_opened": 20,
        "files_read": 15,
        "files_written": 5,
        "files_renamed": 0,
        "files_deleted": 0,
        "cpu_percent": 30.0,
        "memory_mb": 500,
        "network_bytes_sent": 1024,
        "observed_at": "2023-10-05T14:48:00"
    })
    print("test_process_predict status code:", response.status_code)
    if response.status_code != 200:
        print("test_process_predict response:", response.json())
    assert response.status_code == 200
    data = response.json()
    assert "behavior_class" in data
    assert "confidence" in data


def test_threat_adjust():
    response = client.post("/ml/v1/threat/adjust", json={
        "agent_id": "test_agent",
        "rule_based_score": 50,
        "canary_alert_count": 0,
        "entropy_anomaly_count": 0,
        "max_entropy_score": 0,
        "avg_entropy_score": 0,
        "suspicious_process_count": 0,
        "max_ops_per_minute": 0,
        "files_renamed_total": 0,
        "files_deleted_total": 0,
        "network_bytes_sent_total": 0,
        "hour_of_day": 10,
        "day_of_week": 1,
        "agent_baseline_deviation": 0,
        "historical_avg_score_7d": 10,
        "time_since_last_alert_minutes": 1000
    })
    print("test_threat_adjust status code:", response.status_code)
    if response.status_code != 200:
        print("test_threat_adjust response:", response.json())
    assert response.status_code == 200
    data = response.json()
    assert "adjusted_score" in data
    assert 0 <= data["adjusted_score"] <= 100


def test_invalid_request():
    response = client.post("/ml/v1/entropy/predict", json={
        "invalid_field": "data"
    })
    assert response.status_code == 422
    assert "detail" in response.json()
