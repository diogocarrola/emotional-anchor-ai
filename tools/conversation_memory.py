"""Simple conversation memory / memory bank utility for Emotional Anchor AI.

This module provides a minimal in-memory session store with optional
JSON persistence to `data/emotional_patterns.json`. It's lightweight and
intended for local testing and prototyping; for production you'd replace
with a robust storage backend.
"""
import json
import threading
from datetime import datetime
from pathlib import Path

_DATA_FILE = Path(__file__).resolve().parents[1] / "data" / "emotional_patterns.json"


class ConversationMemory:
    def __init__(self):
        self._lock = threading.Lock()
        self._sessions = {}
        self._load_from_file()

    def add_entry(self, session_id: str, user_message: str, emotional_state: str, timestamp: str = None):
        """Add a conversation entry to a session's memory."""
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()

        entry = {
            "timestamp": timestamp,
            "user_message": user_message,
            "emotional_state": emotional_state,
        }

        with self._lock:
            self._sessions.setdefault(session_id, []).append(entry)
            # keep last 200 entries per session
            if len(self._sessions[session_id]) > 200:
                self._sessions[session_id] = self._sessions[session_id][-200:]

    def get_recent(self, session_id: str, n: int = 50):
        """Return the most recent `n` conversation entries for `session_id`."""
        with self._lock:
            return list(self._sessions.get(session_id, [])[-n:])

    def get_all_sessions(self):
        with self._lock:
            return dict(self._sessions)

    def _load_from_file(self):
        try:
            if _DATA_FILE.exists():
                with _DATA_FILE.open("r", encoding="utf-8") as f:
                    data = json.load(f)
                    patterns = data.get("patterns") if isinstance(data, dict) else data
                    # Expecting a list of session entries; this is flexible
                    if isinstance(patterns, list) and patterns:
                        # If file contains direct session mapping, keep it.
                        # We try to be permissive and load a mapping when available.
                        if isinstance(patterns[0], dict) and "session_id" in patterns[0]:
                            for item in patterns:
                                sid = item.get("session_id")
                                entries = item.get("entries", [])
                                if sid and isinstance(entries, list):
                                    self._sessions[sid] = entries
        except Exception:
            # Fail quietly for now; leave sessions empty
            pass

    def save_to_file(self):
        """Persist sessions to the JSON file (overwrites file)."""
        try:
            with self._lock:
                out = {"patterns": []}
                for sid, entries in self._sessions.items():
                    out["patterns"].append({"session_id": sid, "entries": entries})
                _DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
                with _DATA_FILE.open("w", encoding="utf-8") as f:
                    json.dump(out, f, indent=2)
        except Exception:
            pass


# Provide a module-level default memory store for ease of use
default_memory = ConversationMemory()
