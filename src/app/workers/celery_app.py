import os
from celery import Celery

# Use Redis URL from environment or local defaults
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")

celery_app = Celery(
    "ingestion_worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=["app.workers.tasks"]  # Module containing the task definitions
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    # Production settings to prevent memory bloat/hanging workers
    worker_max_tasks_per_child=100,
    worker_prefetch_multiplier=1,
    task_time_limit=3600, # Max 1 hour per task
    task_soft_time_limit=3300 # Give 5 minutes to gracefully shutdown
)
