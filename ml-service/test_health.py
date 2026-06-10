
import requests

response = requests.get("http://localhost:8000/ml/v1/health")
print(f"Status code: {response.status_code}")
print(f"Response: {response.json()}")
