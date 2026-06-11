import os
import requests
import random
import threading
from typing import List, Optional
from app.watcher.fileWatcher import FileWatcher
from app.analyzer.entropyCalculator import calculate_file_entropy
from app.analyzer.processMonitor import get_running_processes
from app.analyzer.threatEngine import calculate_threat_score

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:5000")
ML_API_KEY = os.getenv("ML_API_KEY", "ransomwatch_secret_key_change_in_production")

class WatcherManager:
    def __init__(self):
        self.watcher: Optional[FileWatcher] = None
        self.session_id: Optional[str] = None

    def start_monitoring(self, directories: List[str], session_id: str):
        self.stop_monitoring()
        self.session_id = session_id

        # Make sure directories exist
        valid_dirs = []
        for d in directories:
            if not os.path.exists(d):
                try:
                    os.makedirs(d, exist_ok=True)
                    valid_dirs.append(d)
                except Exception as e:
                    print(f"Failed to create directory {d}: {e}")
            else:
                valid_dirs.append(d)

        if not valid_dirs:
            print("No valid directories to watch.")
            return

        def event_callback(event_type: str, file_path: str):
            # Run the callback in a separate thread so it doesn't block the file watcher observer
            t = threading.Thread(target=self.handle_file_event, args=(event_type, file_path))
            t.daemon = True
            t.start()

        self.watcher = FileWatcher(valid_dirs, event_callback)
        self.watcher.start()
        print(f"Started file watcher for session {session_id} on {valid_dirs}")

    def stop_monitoring(self):
        if self.watcher:
            try:
                self.watcher.stop()
                print("Stopped file watcher.")
            except Exception as e:
                print(f"Error stopping file watcher: {e}")
            self.watcher = None
        self.session_id = None

    def handle_file_event(self, event_type: str, file_path: str):
        if not self.session_id:
            return

        try:
            # 1. Entropy calculation
            entropy = calculate_file_entropy(file_path)
            
            # Get size of file
            file_size = 0
            if os.path.exists(file_path):
                file_size = os.path.getsize(file_path)

            # 2. Process selection
            processes = get_running_processes()
            if processes:
                # Randomly pick a process to simulate access
                chosen_proc = random.choice(processes)
                process_name = chosen_proc["name"]
                process_pid = chosen_proc["pid"]
            else:
                process_name = "unknown.exe"
                process_pid = random.randint(1000, 9999)

            # If entropy is high, simulate a suspicious process
            if entropy > 6.5 and random.random() > 0.3:
                process_name = "ransom_sim.exe"
                process_pid = 6666

            filename = os.path.basename(file_path)
            _, extension = os.path.splitext(filename)
            extension = extension.replace(".", "")

            # 3. Post File Event to Backend
            event_data = {
                "sessionId": self.session_id,
                "filePath": file_path,
                "fileName": filename,
                "fileExtension": extension,
                "eventType": event_type,
                "processName": process_name,
                "processPid": process_pid,
                "entropyBefore": round(max(0.1, entropy - random.uniform(1.0, 3.0)), 2),
                "entropyAfter": round(entropy, 2),
                "fileSize": file_size
            }

            headers = {"x-api-key": ML_API_KEY}
            requests.post(f"{BACKEND_URL}/api/v1/files/events", json=event_data, headers=headers)

            # 4. Check for Canary touch
            is_canary = False
            canary_names = ["important_passwords.txt", "bank_details.docx", "private_keys.txt"]
            if filename in canary_names:
                is_canary = True
                canary_data = {
                    "sessionId": self.session_id,
                    "filePath": file_path,
                    "processName": process_name,
                    "processPid": process_pid
                }
                requests.post(f"{BACKEND_URL}/api/v1/canary-session/alert", json=canary_data, headers=headers)

            # 5. Threat score calculation
            threat_score = calculate_threat_score(entropy, file_rate=random.randint(5, 120), is_canary_touched=is_canary)

            # Update process list with threat score
            proc_data = {
                "sessionId": self.session_id,
                "processName": process_name,
                "pid": process_pid,
                "filesPerMin": random.randint(5, 50) if threat_score < 50 else random.randint(100, 500),
                "renameRate": random.randint(0, 5) if threat_score < 50 else random.randint(10, 80),
                "totalFilesAccessed": random.randint(1, 100),
                "threatScore": threat_score,
                "status": "critical" if threat_score >= 80 else ("suspicious" if threat_score >= 50 else "safe"),
                "cpuUsage": round(random.uniform(0.1, 50.0), 1),
                "memoryUsage": round(random.uniform(10.0, 500.0), 1)
            }
            requests.post(f"{BACKEND_URL}/api/v1/processes", json=proc_data, headers=headers)

            # 6. Post Alert if threat score is high
            if threat_score >= 60 or is_canary:
                alert_type = "critical" if threat_score >= 80 or is_canary else "warning"
                alert_message = f"High risk threat detected in process: {process_name} accessing {filename}"
                if is_canary:
                    alert_message = f"Canary file touched: {filename} by process: {process_name}"

                alert_data = {
                    "sessionId": self.session_id,
                    "type": alert_type,
                    "message": alert_message,
                    "processName": process_name,
                    "processPid": process_pid,
                    "filePath": file_path,
                    "entropyScore": round(entropy, 2),
                    "threatScore": threat_score,
                    "networkAction": "isolated" if (threat_score >= 80 and alert_type == "critical") else "none",
                    "isCanaryAlert": is_canary
                }
                requests.post(f"{BACKEND_URL}/api/v1/alerts", json=alert_data, headers=headers)

        except Exception as e:
            print(f"Error handling file event: {e}")

watcher_manager = WatcherManager()
