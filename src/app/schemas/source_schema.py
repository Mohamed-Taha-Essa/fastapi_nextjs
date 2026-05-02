from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict

class SourceBase(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None

class SourceCreate(SourceBase):
    name: str
    type: str

class SourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None

class Source(SourceBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
