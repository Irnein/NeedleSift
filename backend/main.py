"""NeedleSift backend: FastAPI app serving the API and the dashboard.

Run locally (from the repo root):
    export GEMINI_API_KEY=...        # Windows PowerShell: $env:GEMINI_API_KEY="..."
    uvicorn main:app --reload --app-dir backend --port 8080
Then open http://localhost:8080
"""

import json
import logging
import os
import random
import uuid
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from models import SEVERITY_RANK, Alert, DigestRequest, DigestResult, TriagedAlert, TriageResult
from triage import DATA_DIR, MODEL, GeminiUnavailable, Triager


logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s: %(message)s")
log = logging.getLogger("triageiq")

ROOT = Path(__file__).resolve().parent.parent
FRONTEND_DIR = Path(os.getenv("FRONTEND_DIR", ROOT / "frontend"))
MYT = timezone(timedelta(hours=8))

app = FastAPI(title="NeedleSift", version="0.1.0", docs_url="/api/docs", redoc_url=None)
triager = Triager()

app.add_middleware(
       CORSMiddleware,
       allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
       allow_methods=["GET", "POST"],
       allow_headers=["Content-Type"],
   )


def load_alerts() -> List[Alert]:
    """Member 3's data/alerts.json if present, otherwise the bundled samples."""
    for name in ("alerts.json", "alerts.sample.json"):
        path = DATA_DIR / name
        if path.exists():
            alerts = [Alert.model_validate(a) for a in json.loads(path.read_text())]
            log.info("Loaded %d alerts from %s", len(alerts), path.name)
            return alerts
    log.warning("No alert file found in %s", DATA_DIR)
    return []


ALERTS = load_alerts()


def unavailable(exc: GeminiUnavailable) -> HTTPException:
    log.error("Triage unavailable: %s", exc)
    # Generic message: never echo key or provider details to the browser.
    return HTTPException(status_code=503, detail="AI triage is temporarily unavailable. Try again in a moment.")


@app.get("/api/health")
def health():
    return {"status": "ok", "model": MODEL, "gemini_configured": triager.ready, "alerts_loaded": len(ALERTS)}


@app.get("/api/alerts", response_model=List[Alert])
def get_alerts():
    return ALERTS


@app.post("/api/triage", response_model=TriageResult)
async def triage_alert(alert: Alert):
    try:
        return await triager.triage(alert)
    except GeminiUnavailable as exc:
        raise unavailable(exc)


@app.post("/api/simulate", response_model=TriagedAlert)
async def simulate():
    """Pick a random alert, give it a fresh id and the current time, triage it."""
    if not ALERTS:
        raise HTTPException(status_code=404, detail="No alerts loaded")
    base = random.choice(ALERTS)
    alert = base.model_copy(update={
        "id": f"SIM-{uuid.uuid4().hex[:6].upper()}",
        "timestamp": datetime.now(MYT).isoformat(timespec="seconds"),
    })
    try:
        result = await triager.triage(alert)
    except GeminiUnavailable as exc:
        raise unavailable(exc)
    return TriagedAlert(alert=alert, triage=result)


@app.post("/api/digest", response_model=DigestResult)
async def digest(req: DigestRequest):
    results = sorted(req.results, key=lambda r: SEVERITY_RANK[r.severity])
    try:
        return await triager.digest(results)
    except GeminiUnavailable as exc:
        raise unavailable(exc)


# ---------- dashboard ----------
# Mounted last so /api/* routes win. Until Member 2's frontend lands,
# a placeholder page is served so the Cloud Run URL works from day one.
if (FRONTEND_DIR / "index.html").exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")
else:
    @app.get("/", response_class=HTMLResponse)
    def placeholder():
        return """<!doctype html><html><head><meta charset="utf-8"><title>NeedleSift</title>
<style>body{font-family:system-ui;max-width:640px;margin:80px auto;padding:0 20px;color:#1f2937}
code{background:#f3f4f6;padding:2px 6px;border-radius:4px}</style></head><body>
<h1>NeedleSift</h1><p>The backend is live. The dashboard is on its way.</p>
<p>Health: <a href="/api/health"><code>/api/health</code></a> &middot;
API docs: <a href="/api/docs"><code>/api/docs</code></a></p></body></html>"""
