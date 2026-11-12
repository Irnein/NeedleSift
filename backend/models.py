"""Data contract for NeedleSift.

These models are the single source of truth for the JSON formats agreed in
the team brief. The dashboard (frontend/) and the accuracy test (tests/)
are built against exactly these shapes, so change them only after telling
the team.
"""

from typing import List, Literal

from pydantic import BaseModel, Field

Severity = Literal["low", "medium", "high", "critical"]
Verdict = Literal["true_positive", "false_positive"]

# Severity order, used to sort the queue (critical first).
SEVERITY_RANK = {"critical": 0, "high": 1, "medium": 2, "low": 3}


class Alert(BaseModel):
    """One security alert (input). Matches data/alerts.json."""

    id: str = Field(..., max_length=64, examples=["ALT-001"])
    timestamp: str = Field(..., max_length=64, examples=["2026-11-11T02:14:33+08:00"])
    source: str = Field(..., max_length=100, examples=["Microsoft Defender"])
    host: str = Field(..., max_length=100, examples=["LAB-PC-07"])
    user: str = Field(..., max_length=100, examples=["student042"])
    src_ip: str = Field("", max_length=64, examples=["10.0.5.23"])
    event_type: str = Field(..., max_length=100, examples=["suspicious_powershell"])
    description: str = Field(..., max_length=2000)
    raw_log: str = Field("", max_length=4000)


class TriageVerdict(BaseModel):
    """What Gemini must return. alert_id is added by the backend, not the model."""

    summary: str = Field(..., description="One or two plain-English sentences on what happened, readable by a non-security person.")
    severity: Severity
    verdict: Verdict
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence in the verdict, 0.0 to 1.0.")
    mitre_technique: str = Field(..., description="Most relevant MITRE ATT&CK technique as 'T#### Name', or 'None' for benign activity.")
    recommended_actions: List[str] = Field(..., description="Two to four concrete next steps for a NOC analyst, most important first.")
    escalate: bool = Field(..., description="True if a human analyst should act on this now.")


class TriageResult(TriageVerdict):
    """Triage result (output). What /api/triage returns."""

    alert_id: str


class TriagedAlert(BaseModel):
    """An alert together with its triage, used by /api/simulate."""

    alert: Alert
    triage: TriageResult


class DigestRequest(BaseModel):
    results: List[TriageResult] = Field(..., min_length=1, max_length=200)


class DigestText(BaseModel):
    """What Gemini returns for the daily digest."""

    headline: str = Field(..., description="One sentence: the single most important thing the NOC lead should know today.")
    overview: str = Field(..., description="Two or three sentences summarising the batch in plain English.")
    priorities: List[str] = Field(..., description="Up to five concrete actions, most urgent first, naming the hosts involved.")
    noise_note: str = Field(..., description="One sentence on the false positives and what could reduce them.")


class DigestResult(DigestText):
    total: int
    by_severity: dict
    escalations: int
    false_positives: int
