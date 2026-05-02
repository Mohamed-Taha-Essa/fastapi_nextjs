import hashlib
import uuid
from typing import List, Dict, Any, Optional

from .chunking_service import ChunkingService
from .embedding_service import EmbeddingService
from .vector_store_service import VectorStoreService

class IngestionService:
    """
    Main orchestrator for the document ingestion pipeline.
    Coordinates document extraction, chunking, embedding, and storage.
    """
    def __init__(
        self,
        chunking_service: ChunkingService,
        embedding_service: EmbeddingService,
        vector_store_service: VectorStoreService,
        sql_db_session: Any
    ):
        """
        Constructs the IngestionService with necessary dependencies.
        """
        self.chunking_service = chunking_service
        self.embedding_service = embedding_service
        self.vector_store_service = vector_store_service
        self.db = sql_db_session

    def process_document(self, text: str, source_type: str, metadata: Dict[str, Any]) -> uuid.UUID:
        """
        Main ingestion pipeline execution.
        Returns the ID of the inserted or existing document.
        """
        # 1. Deduplication Check
        content_hash = self._generate_content_hash(text)
        existing_doc_id = self._check_existing_document(content_hash)
        if existing_doc_id:
            return existing_doc_id

        # 2. Split Text
        chunks_text = self.chunking_service.split_text(text)

        # 3. Embed Chunks
        embeddings = self.embedding_service.generate_batch_embeddings(chunks_text)

        # 4. Prepare Vector DB Payloads
        payloads = [
            {"chunk_index": i, "content": chunk, "source": source_type}
            for i, chunk in enumerate(chunks_text)
        ]

        # 5. Store in Vector DB
        vector_ids = self.vector_store_service.insert_vectors(vectors=embeddings, payloads=payloads)

        # 6. Store Database Metadata
        document_id = self._save_to_sql_db(
            text=text,
            content_hash=content_hash,
            source_type=source_type,
            metadata=metadata,
            chunks=chunks_text,
            vector_ids=vector_ids
        )

        return document_id

    def _generate_content_hash(self, text: str) -> str:
        """Generates a SHA-256 hash of the content to use for deduplication."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    def _check_existing_document(self, content_hash: str) -> Optional[uuid.UUID]:
        """
        Checks against the SQL database if a document with identical content already exists.
        """
        # E.g., doc = self.db.query(Document).filter(Document.content_hash == content_hash).first()
        # return doc.id if doc else None
        return None

    def _save_to_sql_db(
        self, 
        text: str, 
        content_hash: str, 
        source_type: str, 
        metadata: Dict[str, Any], 
        chunks: List[str], 
        vector_ids: List[str]
    ) -> uuid.UUID:
        """
        Saves document details and chunk mappings to the relational database.
        """
        # Implementation to insert the document and the corresponding chunk records.
        new_doc_id = uuid.uuid4()
        return new_doc_id
