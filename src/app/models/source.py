# db/models/source.py

from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.database import Base


class Source(Base):
    __tablename__ = "sources"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    name = Column(String)  # slack workspace, notion page, etc
    type = Column(String)  # slack / notion / file