# NeedleSift backend: run and deploy

## 1. One-time setup

1. **Gemini API key:** Google AI Studio → Get API key → create it on a **new project with no billing linked** (keeps you on the free tier). Note which Flash model AI Studio lists.
2. **Cloud project for hosting:** your billed project. Set a budget alert first: Billing → Budgets & alerts → RM20, alerts at 50/90/100%.
3. **Install the gcloud CLI**, then:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com artifactregistry.googleapis.com
   ```

## 2. Run locally

From the repo root:

```bash
python -m venv .venv
# macOS/Linux: source .venv/bin/activate     Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# macOS/Linux
export GEMINI_API_KEY=your-key
# Windows PowerShell
$env:GEMINI_API_KEY="your-key"

uvicorn main:app --reload --app-dir backend --port 8080
```

Open:
- http://localhost:8080/api/health → `gemini_configured` should be `true`
- http://localhost:8080/api/docs → try `POST /api/simulate` (click "Try it out")

## 3. Deploy to Cloud Run

Create `env.yaml` in the repo root (it's gitignored, so the key never reaches GitHub):

```yaml
GEMINI_API_KEY: "your-key"
GEMINI_MODEL: "gemini-2.5-flash"
```

Then from the repo root:

```bash
gcloud run deploy triageiq \
  --source . \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --env-vars-file env.yaml \
  --max-instances 2 \
  --memory 512Mi
```

Windows PowerShell: put it on one line, or replace each `\` with a backtick `` ` ``.

The command prints the **Service URL** (`https://triageiq-xxxx.a.run.app`). That's the demo URL for the submission form. Post it in the group chat.

To redeploy after changes, run the same command again.

### The frontend ships in the same container

The `Dockerfile` has a Node build stage that runs `npm run build` in `frontend/` and copies the static export (`out/`) into the image; FastAPI serves it at `/` (landing) and `/dashboard/`. The deploy command above is unchanged, and no Node runtime or second service is needed. The frontend calls `/api/*` on its own origin, so no CORS setup is required.

Frontend development (hot reload, against a local or deployed backend): see `frontend/README.md`.

## 4. Before the demo (after Member 3's final alerts.json lands)

```bash
python backend/warm_cache.py
```

This triages every alert once and saves `data/triage_cache.json`. Commit it and redeploy: the demo is then instant and survives a Gemini rate limit.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `/api/health` shows `gemini_configured: false` | Key not set: check `env.yaml` / your shell variable |
| 503 "AI triage is temporarily unavailable" | Check Cloud Run logs: wrong model name, invalid key, or free-tier limit hit (wait a minute) |
| Model not found | Change `GEMINI_MODEL` to the exact Flash name in AI Studio, redeploy |
| Deploy asks to create an Artifact Registry repo | Answer `Y` |
