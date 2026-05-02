from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class ChunkBase(BaseModel):
    content: str = Field(description="The text content of the chunk")
    chunk_index: int = Field(ge=0, description="The sequential index of the chunk")

class ChunkCreate(ChunkBase):
    document_id: UUID
    embedding_id: Optional[str] = Field(default=None, description="Reference to the vector DB embedding")

class ChunkUpdate(BaseModel):
    content: Optional[str] = Field(default=None, description="The updated text content of the chunk")

class ChunkResponse(ChunkBase):
    id: UUID
    document_id: UUID
    # embedding_id is excluded from Response logic to prevent exposing internal vector DB details

    model_config = ConfigDict(from_attributes=True)
