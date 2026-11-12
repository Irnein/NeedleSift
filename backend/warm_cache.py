"""Pre-compute triage results for every alert and save them to data/triage_cache.json.

Run this once after the final alerts.json lands, then commit the cache file.
The deployed app loads it at startup, so the demo stays instant and still
works if Gemini's free tier hits its rate limit mid-pitch.

Safe to re-run: alerts already in the cache are skipped, progress is saved
after every alert, and a busy Gemini only skips that alert (run again later
to fill the gaps).

Usage (from the repo root, with GEMINI_API_KEY set):
    python backend/warm_cache.py
"""

import asyncio
import json
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from main import ALERTS, triager  # noqa: E402
from triage import CACHE_FILE, FALLBACK_MODELS, MODEL, GeminiUnavailable, content_key  # noqa: E402


# Free-tier Flash models allow only a handful of requests per minute.
DELAY = float(os.getenv("WARM_DELAY", "15"))      # seconds between alerts
COOLDOWN = float(os.getenv("WARM_COOLDOWN", "60"))  # extra wait after a busy/limit error


def save() -> None:
    CACHE_FILE.write_text(json.dumps(triager.export_cache(), indent=2))


async def run() -> None:
    if not triager.ready:
        sys.exit("Set GEMINI_API_KEY first.")
    print(f"Models: {MODEL}" + (f" (fallbacks: {', '.join(FALLBACK_MODELS)})" if FALLBACK_MODELS else " (no fallbacks set)"))

    todo = [a for a in ALERTS if content_key(a) not in triager._cache]
    print(f"{len(ALERTS) - len(todo)} already cached, {len(todo)} to triage, "
          f"{DELAY:.0f}s apart (about {len(todo) * DELAY / 60:.0f} min)\n")

    failed = []
    for i, alert in enumerate(todo):
        if i:
            await asyncio.sleep(DELAY)  # stay under the per-minute limit
        start = time.perf_counter()
        try:
            result = await triager.triage(alert)
        except GeminiUnavailable as exc:
            print(f"  {alert.id:<8} SKIPPED ({exc}), cooling down {COOLDOWN:.0f}s")
            failed.append(alert.id)
            await asyncio.sleep(COOLDOWN)
            continue
        save()  # keep progress even if a later alert fails
        print(f"  {alert.id:<8} {result.severity:<8} {result.verdict:<15} "
              f"escalate={str(result.escalate):<5} {time.perf_counter() - start:4.1f}s")

    done = len(ALERTS) - len(failed)
    print(f"\nCached {done}/{len(ALERTS)} alerts in {CACHE_FILE.name}")
    if failed:
        print(f"Gemini was busy for: {', '.join(failed)}. Wait a few minutes and run this again;")
        print("finished alerts are skipped, so only these are retried.")


if __name__ == "__main__":
    asyncio.run(run())
