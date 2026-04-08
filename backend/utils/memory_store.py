import pandas as pd
import threading
from typing import Dict, Optional

class MemoryStore:
    """
    A thread-safe in-memory store for user datasets.
    Fulfills Privacy Compliance by ensuring data is never persisted to disk.
    """
    _instance = None
    _lock = threading.Lock()
    _storage: Dict[str, pd.DataFrame] = {}

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MemoryStore, cls).__new__(cls)
            return cls._instance

    def save_data(self, session_id: str, df: pd.DataFrame):
        """Saves or updates a dataframe for a specific session."""
        with self._lock:
            self._storage[session_id] = df

    def get_data(self, session_id: str) -> Optional[pd.DataFrame]:
        """Retrieves the dataframe for a specific session."""
        with self._lock:
            return self._storage.get(session_id)

    def clear_data(self, session_id: str):
        """Explicitly deletes data for a session (on logout)."""
        with self._lock:
            if session_id in self._storage:
                del self._storage[session_id]

# Global singleton
store = MemoryStore()
