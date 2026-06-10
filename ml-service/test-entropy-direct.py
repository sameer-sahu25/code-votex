
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import traceback
from app.services.entropy_service import EntropyService

service = EntropyService()
req = {
    "agent_id": "test_agent",
    "file_path": "/test/file.txt",
    "file_size": 1024,
    "file_extension": "txt",
    "entropy_score": 4.2,
    "sampled_at": "2023-10-05T14:48:00"
}

try:
    res = service.predict(req)
    print("SUCCESS!")
    print(res)
except Exception as e:
    print(f"ERROR: {e}")
    print(traceback.format_exc())
