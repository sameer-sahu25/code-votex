
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileSystemEvent
import time
from typing import Optional, Callable, List


class FileWatcherHandler(FileSystemEventHandler):
    def __init__(self, callback: Optional[Callable[[str, str], None]] = None):
        self.callback = callback

    def on_modified(self, event: FileSystemEvent):
        if not event.is_directory:
            if self.callback:
                src_path = event.src_path
                if isinstance(src_path, (bytes, bytearray, memoryview)):
                    path = bytes(src_path).decode("utf-8")
                else:
                    path = src_path
                self.callback("modified", path)

    def on_created(self, event: FileSystemEvent):
        if not event.is_directory:
            if self.callback:
                src_path = event.src_path
                if isinstance(src_path, (bytes, bytearray, memoryview)):
                    path = bytes(src_path).decode("utf-8")
                else:
                    path = src_path
                self.callback("created", path)

    def on_deleted(self, event: FileSystemEvent):
        if not event.is_directory:
            if self.callback:
                src_path = event.src_path
                if isinstance(src_path, (bytes, bytearray, memoryview)):
                    path = bytes(src_path).decode("utf-8")
                else:
                    path = src_path
                self.callback("deleted", path)

    def on_moved(self, event: FileSystemEvent):
        if not event.is_directory:
            if self.callback:
                src_path = event.src_path
                if isinstance(src_path, (bytes, bytearray, memoryview)):
                    path = bytes(src_path).decode("utf-8")
                else:
                    path = src_path
                self.callback("renamed", path)


class FileWatcher:
    def __init__(self, directories: List[str], callback: Optional[Callable[[str, str], None]] = None):
        self.directories = directories
        self.callback = callback
        self.observer = Observer()
        self.handler = FileWatcherHandler(callback)

    def start(self):
        for directory in self.directories:
            self.observer.schedule(self.handler, directory, recursive=True)
        self.observer.start()

    def stop(self):
        self.observer.stop()
        self.observer.join()


if __name__ == "__main__":
    def log_event(event_type, file_path):
        print(f"[{event_type}] {file_path}")

    watcher = FileWatcher(["./test"], log_event)
    watcher.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        watcher.stop()
