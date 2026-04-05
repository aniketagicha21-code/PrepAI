# Build from repository root with context "." (Render default).
# Render: Dockerfile Path = Dockerfile, Docker Build Context = .
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy backend app into image root (/app). Source paths are relative to build context only.
COPY backend/ /app/

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
