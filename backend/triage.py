"""Gemini calls for triage and the daily digest.

Design notes:
- Structured output: Gemini is given the Pydantic schema, so it always returns
  valid JSON in the agreed format (no regex parsing of free text).
- Cache: results are cached by alert *content* (not id/timestamp), so the demo
  stays fast and survives a free-tier rate limit. Pre-computed results in
  data/triage_cache.json are loaded at startup as a fallback.
- Concurrency is capped and 429/5xx errors are retried with backoff.
"""

import asyncio
import hashlib
import json
import logging
import os
from collections import Counter
from pathlib import Path
from typing import Dict, List, Optional

from google import genai
from google.genai import errors, types

from models import (
    Alert,
    DigestResult,
    DigestText,
    TriageResult,
    TriageVerdict,
)
from prompts import DIGEST_SYSTEM, DIGEST_USER, TRIAGE_SYSTEM, TRIAGE_USER

log = logging.getLogger("triageiq")

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
# Comma-separated backup models, tried in order when the main one is
# overloaded (503) or rate-limited (429). Example: "gemini-flash-latest,gemini-3.6-flash-lite"
FALLBACK_MODELS = [m.strip() for m in os.getenv("GEMINI_FALLBACK_MODELS", "").split(",") if m.strip()]
MAX_CONCURRENT = int(os.getenv("GEMINI_MAX_CONCURRENT", "3"))
MAX_RETRIES = 2  # per model
# Give up on a single Gemini call after this many seconds, so a slow or
# overloaded model can't hang the request (the next fallback is tried instead).
TIMEOUT_S = float(os.getenv("GEMINI_TIMEOUT", "30"))

DATA_DIR = Path(os.getenv("DATA_DIR", Path(__file__).resolve().parent.parent / "data"))
CACHE_FILE = DATA_DIR / "triage_cache.json"

# Fields that identify the *event*, not this particular copy of it.
_CONTENT_FIELDS = ("source", "host", "user", "src_ip", "event_type", "description", "raw_log")


class GeminiUnavailable(Exception):
    """Raised when Gemini can't be reached (no key, quota, outage)."""


def content_key(alert: Alert) -> str:
    payload = json.dumps({f: getattr(alert, f) for f in _CONTENT_FIELDS}, sort_keys=True)
    return hashlib.sha256(payload.encode()).hexdigest()[:16]


class Triager:
    def __init__(self) -> None:
        api_key = os.getenv("GEMINI_API_KEY")
        self.client: Optional[genai.Client] = (
            genai.Client(api_key=api_key, http_options=types.HttpOptions(timeout=int(TIMEOUT_S * 1000)))
            if api_key else None
        )
        self._sem = asyncio.Semaphore(MAX_CONCURRENT)
        self._cache: Dict[str, TriageVerdict] = {}
        self._load_cache_file()

    @property
    def ready(self) -> bool:
        return self.client is not None

    # ---------- cache ----------
    def _load_cache_file(self) -> None:
        if not CACHE_FILE.exists():
            return
        try:
            raw = json.loads(CACHE_FILE.read_text())
            for key, value in raw.items():
                self._cache[key] = TriageVerdict.model_validate(value)
            log.info("Loaded %d cached triage results", len(self._cache))
        except Exception as exc:  # a bad cache file must never stop the app
            log.warning("Ignoring unreadable cache file: %s", exc)

    def export_cache(self) -> dict:
        return {k: v.model_dump() for k, v in self._cache.items()}

    # ---------- Gemini ----------
    async def _generate(self, system: str, prompt: str, schema):
        if not self.client:
            raise GeminiUnavailable("GEMINI_API_KEY is not set")
        config = types.GenerateContentConfig(
            system_instruction=system,
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.2,
        )
        last_error = "no model tried"
        for model in [MODEL, *FALLBACK_MODELS]:
            delay = 2.0
            for attempt in range(1, MAX_RETRIES + 1):
                try:
                    async with self._sem:
                        resp = await asyncio.wait_for(
                            self.client.aio.models.generate_content(
                                model=model, contents=prompt, config=config
                            ),
                            timeout=TIMEOUT_S + 5,  # backstop if the SDK timeout doesn't fire
                        )
                    if model != MODEL:
                        log.info("Served by fallback model %s", model)
                    if resp.parsed is not None:
                        return resp.parsed
                    return schema.model_validate_json(resp.text)
                except errors.APIError as exc:
                    last_error = f"Gemini API error {exc.code} on {model}"
                    detail = (exc.message or "")[:160]
                    log.warning("%s (attempt %d/%d) %s", last_error, attempt, MAX_RETRIES, detail)
                    busy = exc.code in (429, 500, 502, 503, 504)
                    if exc.code == 404:
                        break  # model name not available: try the next model
                    if not busy:
                        raise GeminiUnavailable(last_error) from exc  # bad key etc.: stop
                except asyncio.TimeoutError:
                    last_error = f"timed out after {TIMEOUT_S:.0f}s on {model}"
                    log.warning("Gemini %s (attempt %d/%d)", last_error, attempt, MAX_RETRIES)
                    break  # this model is too slow right now: try the next one
                except Exception as exc:  # malformed output, network blip, SDK timeout
                    last_error = f"{model}: {exc}"
                    log.warning("Gemini call failed (attempt %d/%d): %s", attempt, MAX_RETRIES, last_error)
                if attempt < MAX_RETRIES:
                    await asyncio.sleep(delay)
                    delay *= 2
        raise GeminiUnavailable(last_error)

    async def triage(self, alert: Alert) -> TriageResult:
        key = content_key(alert)
        verdict = self._cache.get(key)
        if verdict is None:
            prompt = TRIAGE_USER.format(alert_json=alert.model_dump_json(indent=2))
            verdict = await self._generate(TRIAGE_SYSTEM, prompt, TriageVerdict)
            self._cache[key] = verdict
        return TriageResult(alert_id=alert.id, **verdict.model_dump())

    async def digest(self, results: List[TriageResult]) -> DigestResult:
        by_sev = Counter(r.severity for r in results)
        stats = {
            "total": len(results),
            "by_severity": {s: by_sev.get(s, 0) for s in ("critical", "high", "medium", "low")},
            "escalations": sum(r.escalate for r in results),
            "false_positives": sum(r.verdict == "false_positive" for r in results),
        }
        prompt = DIGEST_USER.format(
            counts=json.dumps(stats),
            results_json=json.dumps([r.model_dump() for r in results], indent=2),
        )
        text: DigestText = await self._generate(DIGEST_SYSTEM, prompt, DigestText)
        return DigestResult(**text.model_dump(), **stats)
