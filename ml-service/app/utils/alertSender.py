
import requests
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
ML_API_KEY = os.getenv("ML_API_KEY", "ransomwatch_secret_key_change_in_production")


def send_alert(alert_data: dict):
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/alerts",
            json=alert_data,
            headers={"x-api-key": ML_API_KEY}
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error sending alert: {e}")
        return None
