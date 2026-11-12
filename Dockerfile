# NeedleSift: one container serving the API (backend/) and the dashboard (frontend/).
# Built from the repo root so it can include backend/, frontend/ and data/.
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY backend/requirements.txt backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ backend/
COPY data/ data/
COPY frontend/ frontend/

# Run as a non-root user.
RUN useradd --create-home appuser
USER appuser

# Cloud Run sets $PORT (8080 by default).
CMD ["sh", "-c", "uvicorn main:app --app-dir backend --host 0.0.0.0 --port ${PORT:-8080}"]
