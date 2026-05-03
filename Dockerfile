# ─── Backend Dockerfile ───────────────────────────────────────────
# Base image: slim Python to keep the final image small
FROM python:3.11-slim

# Prevents Python from writing .pyc files and ensures logs flow to Docker stdout
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app/src

WORKDIR /app

# Install system dependencies needed by psycopg2, chromadb, etc.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python requirements before source code (better layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy alembic config + migrations
COPY alembic.ini .
COPY alembic/ ./alembic/

# Copy backend source code into /app/src
COPY src/ ./src/

# Copy entrypoint script
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

EXPOSE 8001

ENTRYPOINT ["/app/entrypoint.sh"]
