
import os
import tempfile
import shutil
import numpy as np
import pytest
from app.models.entropy_detector import EntropyDetector
from app.training.data_generator import generate_entropy_training_data


def test_entropy_predict_anomaly(sample_anomaly_entropy_features):
    detector = EntropyDetector()
    detector.is_trained = True
    # Let's train it quickly
    X_train, _ = generate_entropy_training_data()
    detector.train(X_train)
    
    is_anomaly, score, confidence = detector.predict(sample_anomaly_entropy_features)
    assert is_anomaly is True


def test_entropy_predict_normal(sample_entropy_features):
    detector = EntropyDetector()
    X_train, _ = generate_entropy_training_data()
    detector.train(X_train)
    
    is_anomaly, score, confidence = detector.predict(sample_entropy_features)
    assert is_anomaly is False


def test_entropy_batch_prediction():
    detector = EntropyDetector()
    X_train, _ = generate_entropy_training_data()
    detector.train(X_train)
    
    batch = []
    for _ in range(5):
        # 3 normal, 2 anomaly
        if _ < 3:
            batch.append(np.array([4.0 + np.random.rand()*0.5, 0.5 + np.random.rand()*0.1, 0.1, 0.1, 1.0,
                                  5.0, 1.0, 0.0, 0.0, 0.0, 14.0, 1.0, 4.2, 0.1, 4.2, 0.0, 0.0], dtype=np.float32))
        else:
            batch.append(np.array([7.5 + np.random.rand()*0.5, 0.9 + np.random.rand()*0.1, 3.0, 3.0, 1.0,
                                  5.0, 1.0, 0.0, 0.0, 0.0, 2.0, 0.0, 4.8, 1.2, 7.8, 3.0, 2.0], dtype=np.float32))
    batch = np.array(batch)
    
    predictions = detector.predict_batch(batch)
    assert len(predictions) == 5
    anomaly_count = sum(1 for p in predictions if p["is_anomaly"])
    assert anomaly_count >= 1  # Should detect at least some anomalies


def test_entropy_feature_length(sample_entropy_features):
    assert len(sample_entropy_features) == 17


def test_entropy_model_save_load(temp_model_dir, sample_entropy_features):
    detector1 = EntropyDetector()
    X_train, _ = generate_entropy_training_data()
    detector1.train(X_train)
    
    model_path = os.path.join(temp_model_dir, "test_entropy.joblib")
    detector1.save(model_path)
    
    detector2 = EntropyDetector()
    detector2.load(model_path)
    
    # Check predictions are the same
    p1 = detector1.predict(sample_entropy_features)
    p2 = detector2.predict(sample_entropy_features)
    assert p1 == p2
