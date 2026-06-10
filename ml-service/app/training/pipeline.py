
import os
import time
import json
import numpy as np
import pandas as pd
import joblib
from datetime import datetime
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder

from app.training.data_generator import (
    generate_normal_entropy_data,
    generate_ransomware_entropy_data,
    generate_normal_process_data,
    generate_ransomware_process_data,
    generate_cryptominer_data,
    generate_exfiltration_data,
    generate_canary_sequences,
    generate_threat_score_training_data
)
from app.models.entropy_detector import EntropyDetector
from app.models.process_classifier import ProcessClassifier
from app.models.canary_analyzer import CanaryAnalyzer
from app.models.threat_adjuster import ThreatAdjuster
from app.features.entropy_features import build_entropy_features
from app.features.process_features import build_process_features
from app.features.threat_features import build_threat_features


class TrainingPipeline:
    def __init__(self, saved_models_dir='saved_models'):
        self.saved_models_dir = saved_models_dir
        os.makedirs(saved_models_dir, exist_ok=True)
        self.training_metrics = {}

    async def run_all(self):
        """Run the entire training pipeline."""
        start_time = time.time()
        print("Starting training pipeline...")

        try:
            # 1. Train entropy detector
            print("Training entropy detector...")
            await self.train_entropy_detector()

            # 2. Train process classifier
            print("Training process classifier...")
            await self.train_process_classifier()

            # 3. Build canary analyzer
            print("Building canary analyzer...")
            await self.build_canary_analyzer()

            # 4. Train threat adjuster
            print("Training threat adjuster...")
            await self.train_threat_adjuster()

            self.training_metrics['duration_seconds'] = time.time() - start_time
            self.training_metrics['status'] = 'success'

            print(f"Training pipeline completed in {time.time() - start_time:.2f} seconds")
            return self.training_metrics

        except Exception as e:
            self.training_metrics['status'] = 'failed'
            self.training_metrics['error'] = str(e)
            print(f"Training pipeline failed: {str(e)}")
            raise

    async def train_entropy_detector(self):
        """Train the entropy detector."""
        # Generate data
        normal_data = generate_normal_entropy_data()
        ransomware_data = generate_ransomware_entropy_data()
        combined = pd.concat([normal_data, ransomware_data], ignore_index=True)

        # Build features
        X = []
        for _, row in combined.iterrows():
            features = build_entropy_features({
                'entropy_score': row['entropy_score'],
                'previous_score': row['previous_score'],
                'file_size': row['file_size'],
                'file_extension': row['file_extension'],
                'sampled_at': row['sampled_at'],
                'agent_id': 'training'
            })
            X.append(features)
        X = np.array(X)

        # Train model
        model = EntropyDetector()
        metrics = model.train(X)
        self.training_metrics['entropy'] = metrics

        # Save
        model_dir = os.path.join(self.saved_models_dir, 'entropy')
        os.makedirs(model_dir, exist_ok=True)
        model.save(os.path.join(model_dir, 'isolation_forest.joblib'))

        return metrics

    async def train_process_classifier(self):
        """Train the process classifier."""
        # Generate data
        normal_data = generate_normal_process_data()
        ransomware_data = generate_ransomware_process_data()
        cryptominer_data = generate_cryptominer_data()
        exfiltration_data = generate_exfiltration_data()
        combined = pd.concat([normal_data, ransomware_data, cryptominer_data, exfiltration_data], ignore_index=True)

        # Build features
        X = []
        y = []
        for _, row in combined.iterrows():
            features = build_process_features({
                'ops_per_minute': row['ops_per_minute'],
                'files_opened': row['files_opened'],
                'files_read': row['files_read'],
                'files_written': row['files_written'],
                'files_renamed': row['files_renamed'],
                'files_deleted': row['files_deleted'],
                'cpu_percent': row['cpu_percent'],
                'memory_mb': row['memory_mb'],
                'network_bytes_sent': row['network_bytes_sent'],
                'observed_at': row['observed_at'],
                'process_name': 'unknown'
            })
            X.append(features)
            y.append(row['label'])
        X = np.array(X)
        y = np.array(y)

        # Train model
        model = ProcessClassifier()
        metrics = model.train(X, y)
        self.training_metrics['process'] = metrics

        # Save
        model_dir = os.path.join(self.saved_models_dir, 'process')
        os.makedirs(model_dir, exist_ok=True)
        model.save(os.path.join(model_dir, 'random_forest.joblib'))

        return metrics

    async def build_canary_analyzer(self):
        """Build and save the canary analyzer."""
        normal_sequences, attack_sequences = generate_canary_sequences()

        model = CanaryAnalyzer()
        model.train(normal_sequences, attack_sequences)

        model_dir = os.path.join(self.saved_models_dir, 'canary')
        os.makedirs(model_dir, exist_ok=True)
        model.save(model_dir)

        self.training_metrics['canary'] = {
            'normal_sequences': len(normal_sequences),
            'attack_sequences': len(attack_sequences)
        }

    async def train_threat_adjuster(self):
        """Train the threat score adjuster."""
        data = generate_threat_score_training_data()

        X = []
        y = []
        for _, row in data.iterrows():
            features = build_threat_features(row.to_dict())
            X.append(features)
            y.append(row['score'])
        X = np.array(X)
        y = np.array(y)

        model = ThreatAdjuster()
        metrics = model.train(X, y)
        self.training_metrics['threat'] = metrics

        model_dir = os.path.join(self.saved_models_dir, 'threat')
        os.makedirs(model_dir, exist_ok=True)
        model.save(os.path.join(model_dir, 'threat_adjuster.joblib'))

        return metrics
