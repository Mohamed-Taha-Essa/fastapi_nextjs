import os
import uuid
from fastapi import APIRouter, File, UploadFile, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.workers.tasks import process_ingestion_task
from app.models.ingestion_job import IngestionJob
# from app.db.session import get_db
from sqlalchemy.orm import Session # type: ignore

router = APIRouter(prefix="/api/ingestion", tags=["Ingestion"])

from app.schemas.ingestion_schema import SourceRequest, JobResponse, JobStatusResponse

@router.post("/files", response_model=JobResponse)
async def ingest_file(file: UploadFile = File(...)):
    """
    Upload a file, create an ingestion job, and delegate processing to Celery.
    Returns the job ID instantly.
    """
    job_id = uuid.uuid4()
    # 1. Store/Extract initial text
    # In reality you might save to S3 or a temp dir and pass the path,
    # but for text files we can extract in memory:
    # 1. Save File to Disk (dist)
    UPLOAD_DIR = "uploads"
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    file_path = ""
    if file.filename:
        file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            import shutil
            shutil.copyfileobj(file.file, buffer)

    # 2. Database interaction
    # Here is where you save the job, and you can also save the file_path into the metadata or a new DB column!
    # db: Session = next(get_db())
    # new_job = IngestionJob(id=job_id, status="pending", source_type="file")
    # db.add(new_job)
    # db.commit()

    # 3. Fire Celery task
    # Instead of extracting text now, we pass the file_path so the background worker extracts text!
    process_ingestion_task.delay(
        job_id=str(job_id),
        text_content="",  # Worker will parse this from the file!
        source_type="file",
        metadata={"filename": file.filename, "file_path": file_path}
    )

    return JobResponse(
        job_id=job_id,
        status="pending",
        message="Background ingestion task has been triggered."
    )

@router.post("/source", response_model=JobResponse)
async def ingest_source(payload: SourceRequest):
    """
    Webhook or payload ingestion for simulated external systems (Slack/Notion).
    """
    job_id = uuid.uuid4()

    # db: Session = next(get_db())
    # new_job = IngestionJob(id=job_id, status="pending", source_type=payload.source_type)
    # db.add(new_job)
    # db.commit()

    process_ingestion_task.delay(
        job_id=str(job_id),
        text_content=payload.text_content,
        source_type=payload.source_type,
        metadata=payload.metadata
    )

    return JobResponse(
        job_id=job_id,
        status="pending",
        message=f"{payload.source_type} data queued for processing."
    )

@router.get("/status/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: uuid.UUID): # , db: Session = Depends(get_db)):
    """
    Allows clients to poll the completion status of their background job.
    """
    # job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
    # if not job:
    #     raise HTTPException(status_code=404, detail="Job not found")

    # Mock response for snippet
    return JobStatusResponse(
        job_id=job_id,
        status="done",  # Could be from job.status
        error_message=None,
        created_at="2024-01-01T00:00:00Z" # job.created_at.isoformat()
    )
