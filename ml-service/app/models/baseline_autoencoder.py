import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
import joblib
from sklearn.preprocessing import StandardScaler
from typing import Dict, Union


class AgentAutoencoder(nn.Module):
    """Autoencoder for a single agent."""
    def __init__(self, input_size=30):
        super().__init__()
        
        # Encoder
        self.encoder = nn.Sequential(
            nn.Linear(input_size, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 16),
            nn.ReLU()
        )
        
        # Decoder
        self.decoder = nn.Sequential(
            nn.Linear(16, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(32, 64),
            nn.BatchNorm1d(64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, input_size),
            nn.Sigmoid()
        )
        
        self.scaler = StandardScaler()
        self.threshold = 0.1
        self.is_trained = False
        self.reconstruction_errors: Union[list, np.ndarray] = []
    
    def forward(self, x):
        latent = self.encoder(x)
        recon = self.decoder(latent)
        return recon


class BaselineAutoencoder:
    """Manages autoencoders per agent."""
    def __init__(self, input_size=30):
        self.input_size = input_size
        self.agent_models: Dict[str, AgentAutoencoder] = {}
        self.current_agent_id = "default"
    
    def _get_or_create_model(self, agent_id: str = "default") -> AgentAutoencoder:
        if agent_id not in self.agent_models:
            self.agent_models[agent_id] = AgentAutoencoder(self.input_size)
        return self.agent_models[agent_id]
    
    def compute_reconstruction_error(self, x, agent_id: str = "default"):
        model = self._get_or_create_model(agent_id)
        model.eval()
        with torch.no_grad():
            x_tensor = torch.tensor(x, dtype=torch.float32).unsqueeze(0)
            recon = model(x_tensor)
            error = float(torch.mean((x_tensor - recon) ** 2).item())
        return error
    
    def encode(self, x, agent_id: str = "default"):
        model = self._get_or_create_model(agent_id)
        model.eval()
        with torch.no_grad():
            x_tensor = torch.tensor(x, dtype=torch.float32).unsqueeze(0)
            latent = model.encoder(x_tensor)
        return latent.squeeze().numpy()
    
    def train_agent(self, agent_data, agent_id: str = "default"):
        model = self._get_or_create_model(agent_id)
        self.current_agent_id = agent_id
        X = np.array(agent_data)
        X_scaled = model.scaler.fit_transform(X)
        X_tensor = torch.tensor(X_scaled, dtype=torch.float32)
        
        optimizer = optim.Adam(model.parameters(), lr=0.001)
        criterion = nn.MSELoss()
        
        model.train()
        epochs = 100
        patience = 15
        best_loss = float('inf')
        no_improve = 0
        
        for epoch in range(epochs):
            optimizer.zero_grad()
            recon = model(X_tensor)
            loss = criterion(recon, X_tensor)
            loss.backward()
            optimizer.step()
            
            if loss.item() < best_loss:
                best_loss = loss.item()
                no_improve = 0
            else:
                no_improve += 1
            
            if no_improve >= patience:
                break
        
        model.eval()
        with torch.no_grad():
            recon = model(X_tensor)
            errors = torch.mean((X_tensor - recon) ** 2, dim=1).numpy()
            model.reconstruction_errors = errors.tolist()  # Convert to list
            model.threshold = float(np.mean(errors) + 3 * np.std(errors))
        
        model.is_trained = True
        return model.threshold, {
            "n_samples": len(X),
            "mean_error": float(np.mean(errors)),
            "std_error": float(np.std(errors))
        }
    
    def score_deviation(self, x, threshold=None, agent_id: str = "default"):
        model = self._get_or_create_model(agent_id)
        x_scaled = model.scaler.transform(x.reshape(1, -1))
        error = self.compute_reconstruction_error(x_scaled[0], agent_id)
        if threshold is None:
            threshold = model.threshold
        deviation_score = error / max(threshold, 1e-6)
        is_anomalous = error > threshold
        return error, deviation_score, is_anomalous
    
    def save(self, path, agent_id: str = "default"):
        model = self._get_or_create_model(agent_id)
        torch.save({
            "model_state": model.state_dict(),
            "scaler": model.scaler,
            "threshold": model.threshold,
            "is_trained": model.is_trained,
            "reconstruction_errors": model.reconstruction_errors,
            "input_size": self.input_size
        }, path)
    
    def load(self, path, agent_id: str = "default"):
        data = torch.load(path, map_location='cpu')
        self.input_size = data.get("input_size", 30)
        model = self._get_or_create_model(agent_id)
        model.load_state_dict(data["model_state"])
        model.scaler = data["scaler"]
        model.threshold = data["threshold"]
        model.is_trained = data["is_trained"]
        model.reconstruction_errors = data["reconstruction_errors"]
        model.eval()
