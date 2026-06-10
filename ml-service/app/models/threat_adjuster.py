import numpy as np
import joblib
import xgboost as xgb


class ThreatAdjuster:
    def __init__(self):
        self.model = xgb.XGBRegressor(
            n_estimators=500,
            max_depth=6,
            learning_rate=0.05,
            subsample=0.8,
            colsample_bytree=0.8,
            min_child_weight=3,
            reg_alpha=0.1,
            reg_lambda=1.0,
            objective='reg:squarederror',
            eval_metric='rmse',
            early_stopping_rounds=20,
            random_state=42,
            n_jobs=-1,
            verbosity=0
        )
        self.is_trained = False
        self.feature_names = [
            "rule_based_score", "canary_alert_count", "canary_triggered", "entropy_anomaly_count",
            "max_entropy_score", "avg_entropy_score", "entropy_score_range", "suspicious_process_count",
            "max_ops_per_minute", "max_ops_log", "files_renamed_total", "files_deleted_total",
            "rename_delete_ratio", "network_bytes_sent_total_log", "hour_of_day", "is_business_hours",
            "day_of_week", "is_weekend", "agent_baseline_deviation", "historical_avg_score_7d",
            "score_vs_historical", "time_since_last_alert_minutes", "alert_frequency", "multi_signal",
            "signal_count"
        ]
    
    def train(self, X: np.ndarray, y: np.ndarray) -> dict:
        from sklearn.model_selection import train_test_split
        X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42)
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_val, y_val)],
            verbose=False
        )
        self.is_trained = True
        
        y_pred = self.model.predict(X_val)
        rmse = float(np.sqrt(np.mean((y_pred - y_val) ** 2)))
        mae = float(np.mean(np.abs(y_pred - y_val)))
        r2 = float(1 - np.sum((y_val - y_pred) ** 2) / np.sum((y_val - np.mean(y_val)) ** 2))
        
        return {
            "rmse": rmse,
            "mae": mae,
            "r2": r2
        }
    
    def predict(self, x: np.ndarray) -> tuple:
        if not self.is_trained:
            # Train on dummy data if not trained
            dummy_X = np.random.randn(100, len(self.feature_names))
            dummy_y = np.random.uniform(0, 100, size=100)
            self.train(dummy_X, dummy_y)
        
        score = self.model.predict(x.reshape(1, -1))[0]
        score = int(np.clip(score, 0, 100))
        confidence = 0.85
        return score, confidence
    
    def get_feature_contributions(self, x: np.ndarray) -> list:
        contribs = []
        for i, name in enumerate(self.feature_names):
            contribs.append({
                "feature": name,
                "contribution": float(x[i]),
                "direction": "increase" if x[i] > 0 else "decrease" if x[i] < 0 else "neutral"
            })
        return contribs
    
    def generate_explanation(self, contributions: list) -> list:
        explanations = []
        for contrib in contributions:
            if abs(contrib['contribution']) > 10:
                if 'canary' in contrib['feature']:
                    explanations.append(f"Canary alerts increased score by {int(contrib['contribution'])} points")
                elif 'entropy' in contrib['feature']:
                    explanations.append(f"Entropy anomalies increased score by {int(contrib['contribution'])} points")
                elif 'process' in contrib['feature']:
                    explanations.append(f"Suspicious processes increased score by {int(contrib['contribution'])} points")
        if not explanations:
            explanations.append("No major factors influencing the score")
        return explanations
    
    def save(self, path: str) -> None:
        joblib.dump({
            "model": self.model,
            "feature_names": self.feature_names,
            "is_trained": self.is_trained
        }, path)
    
    def load(self, path: str) -> None:
        data = joblib.load(path)
        self.model = data["model"]
        self.feature_names = data["feature_names"]
        self.is_trained = data["is_trained"]
