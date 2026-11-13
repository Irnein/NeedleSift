# NeedleSift: one container serving the API (backend/) and the dashboard (frontend/).
# Built from the repo root so it can include backend/, frontend/ and data/.

# ---- Stage 1: build the Next.js frontend into plain static files ----
# The frontend is a static export (HTML/CSS/JS in out/), so no Node runtime
# is needed in the final image; FastAPI serves the files as it always has.
FROM node:22-slim AS web

WORKDIR /web

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
# NEXT_PUBLIC_API_BASE_URL is deliberately unset: the app then calls /api/*
# on its own origin, which is this same container.
RUN npm run build

# ---- Stage 2: the API, plus the built frontend ----
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ backend/
COPY data/ data/
# backend/main.py serves FRONTEND_DIR (default: /app/frontend) when it
# contains index.html, so the export drops straight into place.
COPY --from=web /web/out/ frontend/

# Run as a non-root user.
RUN useradd --create-home appuser
USER appuser

# Cloud Run sets $PORT (8080 by default).
CMD ["sh", "-c", "uvicorn main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8080}"]
