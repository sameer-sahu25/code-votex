
import psutil
from typing import List, Dict, Any


def get_running_processes() -> List[Dict[str, Any]]:
    processes = []
    for proc in psutil.process_iter(["pid", "name", "exe", "cpu_percent", "memory_percent"]):
        try:
            processes.append({
                "pid": proc.info["pid"],
                "name": proc.info["name"],
                "exe": proc.info["exe"],
                "cpu_percent": proc.info["cpu_percent"],
                "memory_percent": proc.info["memory_percent"],
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            continue
    return processes
