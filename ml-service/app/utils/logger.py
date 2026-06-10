
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("ransomwatch_ml.log"),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger("ransomwatch_ml")


def log_event(event_type: str, message: str):
    logger.info(f"[{event_type}] {message}")
