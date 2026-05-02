from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class IngestionJobBase(BaseModel):
    status: str = "pending"
    source_type: Optional[str] = None
    error_message: Optional[str] = None

class IngestionJobCreate(IngestionJobBase):
    pass

class IngestionJobUpdate(BaseModel):
    status: Optional[str] = None
    source_type: Optional[str] = None
    error_message: Optional[str] = None

class IngestionJob(IngestionJobBase):
    id: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
