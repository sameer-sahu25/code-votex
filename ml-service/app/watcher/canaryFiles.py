
import os
import random
import string
from typing import Optional


def generate_canary_content() -> str:
    words = [
        "confidential", "secret", "password", "finance", "report",
        "project", "client", "invoice", "contract", "plan"
    ]
    content = []
    for _ in range(50):
        line = " ".join(random.choice(words) for _ in range(random.randint(5, 15)))
        content.append(line)
    return "\n".join(content)


def create_canary_file(directory: str, filename: Optional[str] = None) -> str:
    if not filename:
        ext = random.choice([".docx", ".xlsx", ".pdf", ".txt", ".pptx"])
        filename = f"canary_{''.join(random.choices(string.ascii_lowercase + string.digits, k=8))}{ext}"
    file_path = os.path.join(directory, filename)
    try:
        os.makedirs(directory, exist_ok=True)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(generate_canary_content())
        return file_path
    except Exception as e:
        print(f"Error creating canary file: {e}")
        return ""
