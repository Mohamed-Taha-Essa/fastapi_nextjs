#!/bin/bash
# entrypoint.sh — runs before the FastAPI server starts

set -e  # Exit immediately on any error

echo "⏳ Waiting for Postgres to be ready..."
# Loop until psycopg2 / pg_isready finds the DB
until python -c "
import sys
import psycopg2
import os
try:
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    conn.close()
    print('✅ Postgres is ready!')
except Exception as e:
    print(f'  Not ready: {e}', file=sys.stderr)
    sys.exit(1)
"; do
  sleep 2
done

echo "🚀 Running Alembic migrations..."
cd /app
alembic upgrade head

echo "🌐 Starting FastAPI server..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 8001 \
    --workers 2
