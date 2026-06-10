
import numpy as np
from app.training.data_generator import generate_entropy_training_data
from app.models.entropy_detector import EntropyDetector

print("Generating data...")
X, y = generate_entropy_training_data()
print(f"Generated {X.shape[0]} samples, {X.shape[1]} features")
print(f"Sample X: {X[0]}")

print("\nTraining model...")
detector = EntropyDetector()
metrics = detector.train(X)
print(f"Metrics: {metrics}")

print("\nTesting predict...")
sample = X[0]
is_anomaly, score, confidence = detector.predict(sample)
print(f"Sample: {sample}")
print(f"Result: is_anomaly={is_anomaly}, score={score}, confidence={confidence}")
