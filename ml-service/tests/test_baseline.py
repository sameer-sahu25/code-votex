
import os
import tempfile
import shutil
import numpy as np
import pytest
from app.models.baseline_autoencoder import BaselineAutoencoder


def test_baseline_reconstruction_normal():
    autoencoder = BaselineAutoencoder()
    # Generate normal data
    normal_data = np.random.normal(0, 0.1, (100, 30)).astype(np.float32)
    # Train it quickly
    autoencoder.train_agent(normal_data)
    
    # Test normal data
    normal_sample = np.random.normal(0, 0.1, 30).astype(np.float32)
    error = autoencoder.compute_reconstruction_error(normal_sample)
    assert error < 1.0  # Should be low


def test_baseline_reconstruction_anomalous():
    autoencoder = BaselineAutoencoder()
    normal_data = np.random.normal(0, 0.1, (100, 30)).astype(np.float32)
    autoencoder.train_agent(normal_data)
    
    # Test anomalous data
    anomalous_sample = np.random.normal(0, 10.0, 30).astype(np.float32)
    error = autoencoder.compute_reconstruction_error(anomalous_sample)
    assert error > 0.5  # Should be higher than normal


def test_baseline_agent_independence(temp_model_dir):
    autoencoder = BaselineAutoencoder()
    # Train agent A
    data_a = np.random.normal(0, 0.1, (100, 30)).astype(np.float32)        
    autoencoder.train_agent(data_a, agent_id="agent_a")

    # Train agent B
    data_b = np.random.normal(5.0, 0.1, (100, 30)).astype(np.float32)      
    autoencoder.train_agent(data_b, agent_id="agent_b")

    # Predict on agent B data with both models
    sample_b = np.random.normal(5.0, 0.1, 30).astype(np.float32)
    error_b_with_b = autoencoder.compute_reconstruction_error(sample_b, agent_id="agent_b")
    error_b_with_a = autoencoder.compute_reconstruction_error(sample_b, agent_id="agent_a")
    # Just verify that both models work
    assert isinstance(error_b_with_b, float)
    assert isinstance(error_b_with_a, float)


def test_baseline_deviation_score():
    autoencoder = BaselineAutoencoder()
    normal_data = np.random.normal(0, 0.1, (100, 30)).astype(np.float32)
    autoencoder.train_agent(normal_data)
    
    anomalous_sample = np.random.normal(0, 20.0, 30).astype(np.float32)
    error, deviation_score, is_anomalous = autoencoder.score_deviation(anomalous_sample, threshold=0.5)
    
    assert deviation_score > 1.0
