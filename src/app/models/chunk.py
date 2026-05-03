# db/models/chunk.py

from sqlalchemy import Column, Text, Integer, ForeignKey,String
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.database import Base


class Chunk(Base):
    __tablename__ = "chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4 ,index=True)

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), index=True)

    content = Column(Text, nullable=False)
    chunk_index = Column(Integer, nullable=False)

    embedding_id = Column(String, nullable=True)  # reference to vector DB 
    
    # one to many relationship with document table
    document = relationship("Document", back_populates="chunks")
    