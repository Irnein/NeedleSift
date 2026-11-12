"""NeedleSift accuracy test: how often does Gemini agree with our analyst answer key?

Sends every alert in data/alerts.json to the live /api/triage endpoint, compares
each result with data/answer_key.json, and writes tests/results.md.

Needs only Python 3 (no extra packages). From the repo root:
    python tests/accuracy_test.py
    python tests/accuracy_test.py --url http://localhost:8080   # test a local backend

IMPORTANT: run this on a freshly deployed backend, BEFORE warm_cache.py.
The backend caches results, so a second run only measures the cache:
the accuracy would repeat and the timings would be fake.
"""

import argparse
import json
import time
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_URL = "https://needlesift-297927793190.asia-southeast1.run.app"
LEVELS = ["low", "medium", "high", "critical"]


def post_json(url: str, payload: dict, timeout: int = 90) -> dict:
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read())


def triage(base: str, alert: dict) -> tuple:
    """Returns (result or None, seconds, error message or None). Retries a 503 once."""
    for attempt in (1, 2):
        start = time.perf_counter()
        try:
            result = post_json(f"{base}/api/triage", alert)
            return result, time.perf_counter() - start, None
        except urllib.error.HTTPError as exc:
            if exc.code == 503 and attempt == 1:
                print("    Gemini busy (503), retrying in 10s...")
                time.sleep(10)
                continue
            return None, time.perf_counter() - start, f"HTTP {exc.code}"
        except Exception as exc:
            return None, time.perf_counter() - start, str(exc)
    return None, 0.0, "failed"


def pct(n: int, d: int) -> str:
    return f"{100 * n / d:.0f}%" if d else "n/a"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--url", default=DEFAULT_URL, help="backend base URL")
    ap.add_argument("--delay", type=float, default=2.0, help="seconds between calls (rate limit)")
    args = ap.parse_args()
    base = args.url.rstrip("/")

    alerts = json.loads((ROOT / "data" / "alerts.json").read_text())
    key = {k["alert_id"]: k for k in json.loads((ROOT / "data" / "answer_key.json").read_text())}

    print(f"Testing {len(alerts)} alerts against {base}\n")
    rows, times, failed = [], [], []
    for i, alert in enumerate(alerts):
        if i:
            time.sleep(args.delay)
        result, secs, err = triage(base, alert)
        if err:
            print(f"  {alert['id']}  ERROR {err}")
            failed.append((alert["id"], err))
            continue
        times.append(secs)
        exp = key[alert["id"]]
        gap = abs(LEVELS.index(result["severity"]) - LEVELS.index(exp["severity"]))
        row = {
            "id": alert["id"],
            "event": alert["event_type"],
            "exp": exp,
            "got": result,
            "verdict_ok": result["verdict"] == exp["verdict"],
            "escalate_ok": result["escalate"] == exp["escalate"],
            "sev_exact": gap == 0,
            "sev_close": gap <= 1,
            "secs": secs,
        }
        rows.append(row)
        flag = "OK  " if row["verdict_ok"] and row["escalate_ok"] and row["sev_exact"] else "DIFF"
        print(f"  {alert['id']}  {flag}  {result['severity']:<8} {result['verdict']:<15} "
              f"escalate={str(result['escalate']):<5}  {secs:5.1f}s")

    n = len(rows)
    tally = lambda field: sum(r[field] for r in rows)
    avg = sum(times) / len(times) if times else 0.0
    summary = [
        ("Verdict (real threat vs false alarm)", tally("verdict_ok")),
        ("Escalate decision", tally("escalate_ok")),
        ("Severity, exact match", tally("sev_exact")),
        ("Severity, within one level", tally("sev_close")),
    ]

    print("\nRESULTS")
    for label, ok in summary:
        print(f"  {label:<40} {ok}/{n}  {pct(ok, n)}")
    print(f"  {'Average seconds per alert':<40} {avg:.1f}s")
    if failed:
        print(f"  Failed calls: {len(failed)}")

    # ---------- results.md ----------
    lines = [
        "# NeedleSift accuracy test results",
        "",
        f"Run: {datetime.now().strftime('%Y-%m-%d %H:%M')} against `{base}`  ",
        f"Dataset: {len(alerts)} synthetic alerts modelled on real ATT&CK techniques; "
        "answer key written by the team and reviewed by a NOC intern.",
        "",
        "| Measure | Correct | Accuracy |",
        "| --- | --- | --- |",
    ]
    lines += [f"| {label} | {ok}/{n} | {pct(ok, n)} |" for label, ok in summary]
    lines += [
        f"| Average time per alert | | {avg:.1f} s |",
        "",
        "## Where Gemini disagreed with the answer key",
        "",
    ]
    diffs = [r for r in rows if not (r["verdict_ok"] and r["escalate_ok"] and r["sev_exact"])]
    if diffs:
        lines += [
            "| Alert | Event | Expected (severity / verdict / escalate) | Gemini | Gemini's reasoning |",
            "| --- | --- | --- | --- | --- |",
        ]
        for r in diffs:
            e, g = r["exp"], r["got"]
            lines.append(
                f"| {r['id']} | {r['event']} | {e['severity']} / {e['verdict']} / {e['escalate']} "
                f"| {g['severity']} / {g['verdict']} / {g['escalate']} | {g['summary'].replace('|', '/')} |"
            )
    else:
        lines.append("None: Gemini matched the answer key on every alert.")
    if failed:
        lines += ["", "## Failed calls", ""] + [f"- {i}: {e}" for i, e in failed]

    out = ROOT / "tests" / "results.md"
    out.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"\nSaved {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
