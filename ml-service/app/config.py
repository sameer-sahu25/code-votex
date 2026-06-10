
from pydantic_settings import BaseSettings
from typing import Optional
from pydantic import Field


class Settings(BaseSettings):
    model_config = {
        "env_file": ".env",
        "extra": "allow"
    }
    
    APP_NAME: str = Field(default="RansomShield ML Service")
    APP_VERSION: str = Field(default="1.0.0")
    DEBUG: bool = Field(default=True)
    HOST: str = Field(default="0.0.0.0")
    PORT: int = Field(default=8000)
    APP_ENV: str = Field(default="development")

    REDIS_URL: str = Field(default="redis://localhost:6379")
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)
    REDIS_PASSWORD: Optional[str] = Field(default=None)
    REDIS_DB: int = Field(default=0)

    INTERNAL_KEY: str = Field(default="dev-internal-key")
    INTERNAL_API_KEY: str = Field(default="dev-internal-key")

    BACKEND_URL: str = Field(default="http://localhost:3000")

    SAVED_MODELS_DIR: str = Field(default="./saved_models")
    RETRAIN_ON_STARTUP: bool = Field(default=False)
    ENTROPY_ANOMALY_THRESHOLD: float = Field(default=7.2)
    ENTROPY_DELTA_THRESHOLD: float = Field(default=2.5)
    PROCESS_OPS_THRESHOLD: int = Field(default=100)
    LSTM_SEQUENCE_LENGTH: int = Field(default=20)

    DATA_DIR: str = Field(default="data")

    # Model settings
    ISOLATION_FOREST_N_ESTIMATORS: int = Field(default=200)
    XGBOOST_N_ESTIMATORS: int = Field(default=500)
    XGBOOST_MAX_DEPTH: int = Field(default=6)
    AUTOENCODER_HIDDEN_DIM: int = Field(default=32)


settings = Settings()

