
import os
from app.training.data_generator import (
    generate_entropy_training_data,
    generate_process_training_data,
    generate_canary_sequences,
    generate_threat_training_data
)
from app.models.entropy_detector import EntropyDetector
from app.models.process_classifier import ProcessClassifier
from app.models.process_lstm import ProcessLSTM
from app.models.canary_analyzer import CanaryAnalyzer
from app.models.threat_adjuster import ThreatAdjuster


def main():
    print("Training entropy detector...")
    X_entropy, y_entropy = generate_entropy_training_data()
    entropy_detector = EntropyDetector()
    entropy_detector.train(X_entropy)
    entropy_detector.save(os.path.join("saved_models", "entropy", "isolation_forest.joblib"))
    print("Entropy detector trained and saved!")

    print("\nTraining process classifier...")
    X_process, y_process = generate_process_training_data()
    process_classifier = ProcessClassifier()
    process_classifier.train(X_process, y_process)
    process_classifier.save(os.path.join("saved_models", "process", "random_forest.joblib"))
    print("Process classifier trained and saved!")

    print("\nTraining process LSTM...")
    process_lstm = ProcessLSTM()
    X_lstm = []
    for _ in range(1000):
        seq = []
        for __ in range(20):
            vec = [0.0] * 23
            vec[0] = 50 + 20 * __import__("numpy").random.randn()
            vec[10] = 30 + 10 * __import__("numpy").random.randn()
            seq.append(vec)
        X_lstm.append(seq)
    y_lstm = ["normal"] * 1000
    process_lstm.train_model(X_lstm, y_lstm)
    process_lstm.save(os.path.join("saved_models", "process", "lstm_model.pt"))
    print("Process LSTM trained and saved!")

    print("\nTraining canary analyzer...")
    normal_seqs, attack_seqs = generate_canary_sequences()
    canary_analyzer = CanaryAnalyzer()
    canary_analyzer.train(normal_seqs, attack_seqs)
    canary_analyzer.save(os.path.join("saved_models", "canary"))
    print("Canary analyzer trained and saved!")

    print("\nTraining threat adjuster...")
    X_threat, y_threat = generate_threat_training_data()
    threat_adjuster = ThreatAdjuster()
    threat_adjuster.train(X_threat, y_threat)
    threat_adjuster.save(os.path.join("saved_models", "threat", "threat_adjuster.joblib"))
    print("Threat adjuster trained and saved!")

    print("\nAll models trained successfully!")


if __name__ == "__main__":
    main()
