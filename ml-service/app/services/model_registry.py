
import os
from datetime import datetime
from typing import Optional, Dict, Any
import numpy as np

from app.models.entropy_detector import EntropyDetector
from app.models.process_classifier import ProcessClassifier
from app.models.process_lstm import ProcessLSTM
from app.models.canary_analyzer import CanaryAnalyzer
from app.models.threat_adjuster import ThreatAdjuster
from app.models.baseline_autoencoder import BaselineAutoencoder
from app.storage.model_store import ModelStore


class ModelRegistry:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self._initialized = True
        self.models: Dict[str, Any] = {}
        self.model_store = ModelStore()
        self.baseline_models: Dict[str, BaselineAutoencoder] = {}
        self.is_ready = False
        self.model_timestamps: Dict[str, datetime] = {}
        # Initialize all model instances immediately
        self.models['entropy'] = EntropyDetector()
        self.models['process_rf'] = ProcessClassifier()
        self.models['process_lstm'] = ProcessLSTM()
        self.models['canary'] = CanaryAnalyzer()
        self.models['threat'] = ThreatAdjuster()

    async def load_all_models(self):
        """Load all models from storage."""
        print("Loading models...")

        # Load entropy detector
        try:
            self.models['entropy'] = EntropyDetector()
            model_path = os.path.join(self.model_store.base_dir, 'entropy', 'isolation_forest.joblib')
            if os.path.exists(model_path):
                self.models['entropy'].load(model_path)
                self.model_timestamps['entropy'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        except Exception as e:
            print(f"Failed to load entropy detector: {e}")
            self.models['entropy'] = EntropyDetector()

        # Load process classifier
        try:
            self.models['process_rf'] = ProcessClassifier()
            model_path = os.path.join(self.model_store.base_dir, 'process', 'random_forest.joblib')
            if os.path.exists(model_path):
                self.models['process_rf'].load(model_path)
                self.model_timestamps['process_rf'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        except Exception as e:
            print(f"Failed to load process classifier: {e}")
            self.models['process_rf'] = ProcessClassifier()

        # Load process LSTM
        try:
            self.models['process_lstm'] = ProcessLSTM()
            model_path = os.path.join(self.model_store.base_dir, 'process', 'lstm_model.pt')
            if os.path.exists(model_path):
                self.models['process_lstm'].load(model_path)
                self.model_timestamps['process_lstm'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        except Exception as e:
            print(f"Failed to load process LSTM: {e}")
            self.models['process_lstm'] = ProcessLSTM()

        # Load canary analyzer
        try:
            self.models['canary'] = CanaryAnalyzer()
            model_dir = os.path.join(self.model_store.base_dir, 'canary')
            if os.path.exists(model_dir):
                self.models['canary'].load(model_dir)
                self.model_timestamps['canary'] = datetime.now()
        except Exception as e:
            print(f"Failed to load canary analyzer: {e}")
            self.models['canary'] = CanaryAnalyzer()

        # Load threat adjuster
        try:
            self.models['threat'] = ThreatAdjuster()
            model_path = os.path.join(self.model_store.base_dir, 'threat', 'threat_adjuster.joblib')
            if os.path.exists(model_path):
                self.models['threat'].load(model_path)
                self.model_timestamps['threat'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        except Exception as e:
            print(f"Failed to load threat adjuster: {e}")
            self.models['threat'] = ThreatAdjuster()

        self.is_ready = True
        print("All models loaded successfully")

    def get(self, name: str):
        """Get a model by name."""
        if name not in self.models:
            raise ValueError(f"Model '{name}' not found")
        return self.models[name]

    def get_model(self, name: str):
        """Alias for get()"""
        return self.get(name)

    def get_baseline(self, agent_id: str):
        """Get a baseline model for a specific agent."""
        if agent_id in self.baseline_models:
            return self.baseline_models[agent_id]

        # Try to load from disk
        model_path = os.path.join(self.model_store.base_dir, 'baseline', f'autoencoder_{agent_id}.pt')
        if os.path.exists(model_path):
            model = BaselineAutoencoder()
            model.load(model_path)
            self.baseline_models[agent_id] = model
            return model

        return None

    def register_baseline(self, agent_id: str, model: BaselineAutoencoder):
        """Register a baseline model for an agent."""
        self.baseline_models[agent_id] = model
        model.save(os.path.join(self.model_store.base_dir, 'baseline', f'autoencoder_{agent_id}.pt'))

    def reload(self, name: str):
        """Reload a model from disk."""
        if name == 'entropy':
            self.models['entropy'] = EntropyDetector()
            model_path = os.path.join(self.model_store.base_dir, 'entropy', 'isolation_forest.joblib')
            if os.path.exists(model_path):
                self.models['entropy'].load(model_path)
                self.model_timestamps['entropy'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        elif name == 'process_rf':
            self.models['process_rf'] = ProcessClassifier()
            model_path = os.path.join(self.model_store.base_dir, 'process', 'random_forest.joblib')
            if os.path.exists(model_path):
                self.models['process_rf'].load(model_path)
                self.model_timestamps['process_rf'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        elif name == 'process_lstm':
            self.models['process_lstm'] = ProcessLSTM()
            model_path = os.path.join(self.model_store.base_dir, 'process', 'lstm_model.pt')
            if os.path.exists(model_path):
                self.models['process_lstm'].load(model_path)
                self.model_timestamps['process_lstm'] = datetime.fromtimestamp(os.path.getmtime(model_path))
        elif name == 'canary':
            self.models['canary'] = CanaryAnalyzer()
            model_dir = os.path.join(self.model_store.base_dir, 'canary')
            if os.path.exists(model_dir):
                self.models['canary'].load(model_dir)
                self.model_timestamps['canary'] = datetime.now()
        elif name == 'threat':
            self.models['threat'] = ThreatAdjuster()
            model_path = os.path.join(self.model_store.base_dir, 'threat', 'threat_adjuster.joblib')
            if os.path.exists(model_path):
                self.models['threat'].load(model_path)
                self.model_timestamps['threat'] = datetime.fromtimestamp(os.path.getmtime(model_path))

    def get_status(self):
        """Get the status of all models."""
        status = {}
        for name, model in self.models.items():
            is_trained = hasattr(model, 'is_trained') and model.is_trained
            timestamp = self.model_timestamps.get(name)
            size = 0
            if name == 'entropy':
                path = os.path.join(self.model_store.base_dir, 'entropy', 'isolation_forest.joblib')
            elif name == 'process_rf':
                path = os.path.join(self.model_store.base_dir, 'process', 'random_forest.joblib')
            elif name == 'process_lstm':
                path = os.path.join(self.model_store.base_dir, 'process', 'lstm_model.pt')
            elif name == 'canary':
                path = os.path.join(self.model_store.base_dir, 'canary')
            else:  # threat
                path = os.path.join(self.model_store.base_dir, 'threat', 'threat_adjuster.joblib')
            if os.path.exists(path):
                if os.path.isdir(path):
                    total = 0
                    for dirpath, _, filenames in os.walk(path):
                        for filename in filenames:
                            filepath = os.path.join(dirpath, filename)
                            total += os.path.getsize(filepath)
                    size = total / (1024 * 1024)
                else:
                    size = os.path.getsize(path) / (1024 * 1024)
            status[name] = {
                'is_loaded': name in self.models,
                'is_trained': is_trained,
                'last_trained': timestamp,
                'file_size_mb': size
            }
        return status

    def get_versions(self):
        """Get model versions and timestamps."""
        return {
            name: {
                'version': '1.0.0',
                'trained_at': self.model_timestamps.get(name)
            }
            for name in self.models.keys()
        }
