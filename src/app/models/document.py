# db/models/document.py

from sqlalchemy import Column, String, DateTime, Integer, Text 
from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid

from app.db.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String, nullable=True)
    source_type = Column(String, nullable=False)  # file, slack, notion

    content_hash = Column(String, nullable=False)  # for deduplication
    version = Column(Integer, default=1)

    doc_metadata = Column(Text, nullable=True)  # JSON string

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # one to many relationship with chunk table
    chunks = relationship("Chunk", back_populates="document", cascade="all, delete")