# db/models/ingestion_job.py

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from db.base import Base


class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    status = Column(String, default="pending")  # pending, processing, done, failed
    source_type = Column(String)

    error_message = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


    