"""Pre-compute triage results for every alert and save them to data/triage_cache.json.

Run this once after the final alerts.json lands, then commit the cache file.
The deployed app loads it at startup, so the demo stays instant and still
works if Gemini's free tier hits its rate limit mid-pitch.

Usage (from the repo root, with GEMINI_API_KEY set):
    python backend/warm_cache.py
"""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import ALERTS, triager  # noqa: E402
from triage import CACHE_FILE  # noqa: E402


async def run() -> None:
    if not triager.ready:
        sys.exit("Set GEMINI_API_KEY first.")
    print(f"Triaging {len(ALERTS)} alerts...")
    for alert in ALERTS:
        result = await triager.triage(alert)
        print(f"  {alert.id:<8} {result.severity:<8} {result.verdict:<15} escalate={result.escalate}")
    CACHE_FILE.write_text(json.dumps(triager.export_cache(), indent=2))
    print(f"Saved {CACHE_FILE}")


if __name__ == "__main__":
    asyncio.run(run())
