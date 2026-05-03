from typing import Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class DocumentBase(BaseModel):
    title: Optional[str] = Field(default=None, description="The title of the document")
    source_type: str = Field(description="Source of the document (e.g., file, slack, notion)")
    
class DocumentCreate(DocumentBase):
    # Depending on how metadata is stored, we can accept a Dict and serialize to str, 
    # or just take a str/json string. We use str here to match the Text DB column strictly,
    # though Dict[str, Any] might be nicer for API usage.
    doc_metadata: Optional[str] = Field(default=None, description="Additional document metadata as a JSON string")
    content_hash: str = Field(description="Hash of the document content for deduplication (internal)")

class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(default=None, description="The title of the document")
    doc_metadata: Optional[str] = Field(default=None, description="Additional document metadata as a JSON string")

class DocumentResponse(DocumentBase):
    id: UUID
    version: int
    doc_metadata: Optional[str] = None
    created_at: datetime
    # Note: content_hash is excluded from the Response logic to not expose internal details

    model_config = ConfigDict(from_attributes=True)
