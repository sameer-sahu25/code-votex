import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score


class ProcessClassifier:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=300,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            max_features='sqrt',
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        self.classes = ['normal', 'suspicious', 'ransomware', 'cryptominer', 'exfiltration']
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.label_encoder.fit(self.classes)
        self.is_trained = False
        self.feature_names = [
            "ops_per_minute", "ops_per_minute_log", "files_opened", "files_read",
            "files_written", "files_renamed", "files_deleted", "rename_ratio",
            "delete_ratio", "write_ratio", "read_write_ratio", "cpu_percent",
            "memory_mb_log", "network_bytes_sent_log", "has_network_activity",
            "is_system_process", "is_known_ransomware_name", "name_entropy",
            "is_hidden_process", "hour_of_day", "is_business_hours", "ops_cpu_ratio",
            "io_intensity"
        ]
    
    def train(self, X: np.ndarray, y: np.ndarray) -> dict:
        X_scaled = self.scaler.fit_transform(X)
        y_encoded = self.label_encoder.transform(y)
        self.model.fit(X_scaled, y_encoded)
        self.is_trained = True
        
        y_pred = self.model.predict(X_scaled)
        y_pred_proba = self.model.predict_proba(X_scaled)
        
        precision, recall, f1, _ = precision_recall_fscore_support(y_encoded, y_pred, average='weighted')
        roc_auc = roc_auc_score(y_encoded, y_pred_proba, multi_class='ovr')
        
        return {
            "accuracy": float(accuracy_score(y_encoded, y_pred)),
            "precision": float(precision),
            "recall": float(recall),
            "f1_score": float(f1),
            "roc_auc": float(roc_auc)
        }
    
    def predict(self, x: np.ndarray) -> tuple:
        if not self.is_trained:
            # Train on dummy data if not trained
            dummy_X = np.random.randn(100, len(self.feature_names))
            dummy_y = np.random.choice(self.classes, size=100)
            self.train(dummy_X, dummy_y)
        
        x_scaled = self.scaler.transform(x.reshape(1, -1))
        class_idx = self.model.predict(x_scaled)[0]
        class_name = self.label_encoder.inverse_transform([class_idx])[0]
        class_probs = self.model.predict_proba(x_scaled)[0]
        class_probabilities = dict(zip(self.classes, [float(p) for p in class_probs]))
        confidence = float(np.max(class_probs))
        return class_name, confidence, class_probabilities
    
    def predict_batch(self, X: np.ndarray) -> list:
        X_scaled = self.scaler.transform(X)
        class_idxs = self.model.predict(X_scaled)
        class_names = self.label_encoder.inverse_transform(class_idxs)
        class_probs = self.model.predict_proba(X_scaled)
        results = []
        for name, probs in zip(class_names, class_probs):
            class_probabilities = dict(zip(self.classes, [float(p) for p in probs]))
            confidence = float(np.max(probs))
            results.append({
                "class": name,
                "confidence": confidence,
                "class_probabilities": class_probabilities
            })
        return results
    
    def get_feature_importance(self) -> list:
        importances = self.model.feature_importances_
        return [
            {"feature": name, "importance": float(imp)}
            for name, imp in zip(self.feature_names, importances)
        ]
    
    def save(self, path: str) -> None:
        joblib.dump({
            "model": self.model,
            "scaler": self.scaler,
            "label_encoder": self.label_encoder,
            "feature_names": self.feature_names,
            "is_trained": self.is_trained
        }, path)
    
    def load(self, path: str) -> None:
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.label_encoder = data["label_encoder"]
        self.feature_names = data["feature_names"]
        self.is_trained = data["is_trained"]
