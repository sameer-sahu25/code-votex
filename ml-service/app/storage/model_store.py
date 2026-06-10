
import os
from typing import Any, Optional
import joblib
import torch


class ModelStore:
    def __init__(self, base_dir: str = "saved_models"):
        self.base_dir = base_dir
        os.makedirs(base_dir, exist_ok=True)

    def get_path(self, model_type: str, filename: str = "model.joblib") -> str:
        model_dir = os.path.join(self.base_dir, model_type)
        os.makedirs(model_dir, exist_ok=True)
        return os.path.join(model_dir, filename)

    def save_joblib(self, obj: Any, model_type: str, filename: str = "model.joblib") -> None:
        path = self.get_path(model_type, filename)
        joblib.dump(obj, path)

    def load_joblib(self, model_type: str, filename: str = "model.joblib") -> Optional[Any]:
        path = self.get_path(model_type, filename)
        if not os.path.exists(path):
            return None
        return joblib.load(path)

    def save_torch(self, obj: Any, model_type: str, filename: str = "model.pt") -> None:
        path = self.get_path(model_type, filename)
        torch.save(obj, path)

    def load_torch(self, model_type: str, filename: str = "model.pt", map_location: str = "cpu") -> Optional[Any]:
        path = self.get_path(model_type, filename)
        if not os.path.exists(path):
            return None
        return torch.load(path, map_location=map_location)

