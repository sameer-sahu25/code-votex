import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
import numpy as np
from typing import Tuple, Dict, List, Any


class ProcessLSTM(nn.Module):
    def __init__(self, input_size=23, hidden_size=128, num_layers=2, dropout=0.3, bidirectional=True):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.bidirectional = bidirectional
        self.is_trained = False
        
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout,
            bidirectional=bidirectional,
            batch_first=True
        )
        
        lstm_output_size = hidden_size * 2 if bidirectional else hidden_size
        
        self.fc1 = nn.Linear(lstm_output_size, 128)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(dropout)
        self.fc2 = nn.Linear(128, 5)
        self.softmax = nn.Softmax(dim=1)
        
        self.classes = ['normal', 'suspicious', 'ransomware', 'cryptominer', 'exfiltration']
    
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        lstm_out, _ = self.lstm(x)
        last_out = lstm_out[:, -1, :]
        x = self.fc1(last_out)
        x = self.relu(x)
        x = self.dropout(x)
        x = self.fc2(x)
        x = self.softmax(x)
        return x
    
    def train_model(self, X: List[List[float]], y: List[str]) -> Dict[str, bool]:
        """Train the LSTM model."""
        self.is_trained = True
        
        # Create dummy dataset
        X_np = np.array(X, dtype=np.float32)
        y_np = np.array([self.classes.index(c) for c in y], dtype=np.int64)
        
        # Create a simple optimizer and train for a few steps
        optimizer = optim.Adam(self.parameters(), lr=0.001)
        criterion = nn.CrossEntropyLoss()
        
        self.train()
        for epoch in range(10):
            optimizer.zero_grad()
            x_tensor = torch.tensor(X_np, dtype=torch.float32)
            y_tensor = torch.tensor(y_np, dtype=torch.long)
            outputs = self(x_tensor)
            loss = criterion(outputs, y_tensor)
            loss.backward()
            optimizer.step()
        
        self.eval()
        return {
            "trained": True
        }
    
    def predict(self, x: np.ndarray) -> Tuple[str, float, Dict[str, float]]:
        self.eval()
        with torch.no_grad():
            # x should be (batch_size, seq_len, input_size)
            if len(x.shape) == 2:
                x = x.reshape(1, x.shape[0], x.shape[1])
            x_tensor = torch.tensor(x, dtype=torch.float32)
            outputs: torch.Tensor = self(x_tensor)
            class_idx: int = int(torch.argmax(outputs, dim=1).item())
            class_name = self.classes[class_idx]
            confidence = float(outputs[0, class_idx].item())
            class_probs = dict(zip(self.classes, [float(p.item()) for p in outputs[0]]))
            return class_name, confidence, class_probs

    def predict_sequence(self, events: List[List[float]]) -> Tuple[str, float, List[Dict[str, Any]]]:
        self.eval()
        with torch.no_grad():
            seq_len = 20
            num_events = len(events)
            padded = np.zeros((seq_len, 23), dtype=np.float32)
            for i, event in enumerate(events[-seq_len:]):
                if i < seq_len:
                    padded[i] = event
            
            x = torch.tensor(padded).unsqueeze(0)
            outputs: torch.Tensor = self(x)
            class_idx: int = int(torch.argmax(outputs, dim=1).item())
            class_name = self.classes[class_idx]
            confidence = float(outputs[0, class_idx].item())
            # Generate step predictions (one per input event)
            step_predictions = []
            for i in range(num_events):
                step_predictions.append({
                    "step": i,
                    "class": class_name,
                    "confidence": confidence
                })
            return class_name, confidence, step_predictions
    
    def save(self, path: str) -> None:
        torch.save(self.state_dict(), path)
    
    def load(self, path: str) -> None:
        self.load_state_dict(torch.load(path, map_location='cpu'))
        self.eval()
