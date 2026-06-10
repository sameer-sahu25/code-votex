import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler


class EntropyDetector:
    def __init__(self):
        self.model = IsolationForest(
            n_estimators=200,
            max_samples='auto',
            contamination=0.05,
            max_features=1.0,
            bootstrap=False,
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_names = [
            "entropy_score", "entropy_normalized", "score_delta", "score_delta_abs",
            "delta_direction", "file_size_log", "is_document", "is_image", "is_database",
            "is_unknown_ext", "hour_of_day", "is_business_hours", "rolling_avg_3",
            "rolling_std_3", "rolling_max_5", "score_vs_rolling_avg", "consecutive_high_count"
        ]
    
    def train(self, X: np.ndarray) -> dict:
        X_scaled = self.scaler.fit_transform(X)
        self.model.fit(X_scaled)
        self.is_trained = True
        
        anomaly_scores = -self.model.decision_function(X_scaled)
        return {
            "n_samples": len(X),
            "mean_anomaly_score": float(np.mean(anomaly_scores)),
            "std_anomaly_score": float(np.std(anomaly_scores))
        }
    
    def predict(self, x: np.ndarray) -> tuple:
        if not self.is_trained:
            # Train on dummy data if not trained
            dummy_X = np.random.randn(100, len(self.feature_names))
            self.train(dummy_X)
        
        x_scaled = self.scaler.transform(x.reshape(1, -1))
        is_anomaly = bool(self.model.predict(x_scaled)[0] == -1)
        score = float(-self.model.decision_function(x_scaled)[0])
        confidence = min(1.0, max(0.0, score / 0.5))
        return is_anomaly, score, confidence
    
    def predict_batch(self, X: np.ndarray) -> list:
        X_scaled = self.scaler.transform(X)
        predictions = self.model.predict(X_scaled)
        scores = -self.model.decision_function(X_scaled)
        results = []
        for pred, score in zip(predictions, scores):
            is_anomaly = bool(pred == -1)
            confidence = min(1.0, max(0.0, score / 0.5))
            results.append({
                "is_anomaly": is_anomaly,
                "score": float(score),
                "confidence": confidence
            })
        return results
    
    def save(self, path: str) -> None:
        joblib.dump({
            "model": self.model,
            "scaler": self.scaler,
            "feature_names": self.feature_names,
            "is_trained": self.is_trained
        }, path)
    
    def load(self, path: str) -> None:
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.feature_names = data["feature_names"]
        self.is_trained = data["is_trained"]
    
    def get_feature_contributions(self, x: np.ndarray) -> list:
        contributions = []
        x_scaled = self.scaler.transform(x.reshape(1, -1))[0]
        for i, name in enumerate(self.feature_names):
            contributions.append({
                "feature": name,
                "value": float(x_scaled[i])
            })
        return contributions
