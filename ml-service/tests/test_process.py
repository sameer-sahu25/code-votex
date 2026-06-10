
import os
import tempfile
import shutil
import numpy as np
import pytest
from app.models.process_classifier import ProcessClassifier
from app.models.process_lstm import ProcessLSTM
from app.training.data_generator import generate_process_training_data


def test_process_classifier_ransomware(sample_ransomware_process_features):
    classifier = ProcessClassifier()
    X_train, y_train = generate_process_training_data()
    classifier.train(X_train, y_train)
    
    behavior_class, confidence, _ = classifier.predict(sample_ransomware_process_features)
    # Should predict ransomware or suspicious
    assert behavior_class in ['ransomware', 'suspicious']


def test_process_classifier_normal(sample_process_features):
    classifier = ProcessClassifier()
    X_train, y_train = generate_process_training_data()
    classifier.train(X_train, y_train)
    
    behavior_class, confidence, _ = classifier.predict(sample_process_features)
    assert behavior_class == 'normal'


def test_process_classifier_cryptominer(sample_cryptominer_process_features):
    classifier = ProcessClassifier()
    X_train, y_train = generate_process_training_data()
    classifier.train(X_train, y_train)
    
    behavior_class, confidence, _ = classifier.predict(sample_cryptominer_process_features)
    # Should predict cryptominer or suspicious
    assert behavior_class in ['cryptominer', 'suspicious']


def test_process_feature_importance():
    classifier = ProcessClassifier()
    X_train, y_train = generate_process_training_data()
    classifier.train(X_train, y_train)
    
    importances = classifier.get_feature_importance()
    assert len(importances) == 23


def test_process_lstm_prediction():
    lstm = ProcessLSTM()
    # Create a sequence of 10 events
    sequence = [
        np.array([
            50.0 + i*0.5,  # ops_per_minute
            3.93 + i*0.01,  # ops_per_minute_log
            20,  # files_opened
            15,  # files_read
            5,  # files_written
            0,  # files_renamed
            0,  # files_deleted
            0.0,  # rename_ratio
            0.0,  # delete_ratio
            0.25,  # write_ratio
            3.0,  # read_write_ratio
            30.0,  # cpu_percent
            6.21,  # memory_mb_log
            5.3,  # network_bytes_sent_log
            1.0,  # has_network_activity
            0.0,  # is_system_process
            0.0,  # is_known_ransomware_name
            2.30,  # name_entropy
            0.0,  # is_hidden_process
            14.0,  # hour_of_day
            1.0,  # is_business_hours
            1.66,  # ops_cpu_ratio
            0.2,  # io_intensity
        ], dtype=np.float32)
        for i in range(15)
    ]
    
    behavior_class, confidence, step_predictions = lstm.predict_sequence(sequence)
    assert behavior_class in ['normal', 'suspicious', 'ransomware', 'cryptominer', 'exfiltration']
    assert len(step_predictions) == 15
