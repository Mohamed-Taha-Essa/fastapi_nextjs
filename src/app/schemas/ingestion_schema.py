from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, ConfigDict, Field

class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    DONE = "done"
    FAILED = "failed"

class IngestionJobBase(BaseModel):
    source_type: str = Field(description="Source of the ingestion (e.g., file, slack, notion)")

class IngestionJobCreate(IngestionJobBase):
    status: JobStatus = Field(default=JobStatus.PENDING)

class IngestionJobUpdate(BaseModel):
    status: Optional[JobStatus] = Field(default=None)
    error_message: Optional[str] = Field(default=None)

class IngestionJobResponse(IngestionJobBase):
    id: UUID
    status: JobStatus
    error_message: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SourceRequest(BaseModel):
    source_type: str
    text_content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)

class JobResponse(BaseModel):
    job_id: UUID
    status: str
    message: str

class JobStatusResponse(BaseModel):
    job_id: UUID
    status: str
    error_message: Optional[str] = None
    created_at: str
