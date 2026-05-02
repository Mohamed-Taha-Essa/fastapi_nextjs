import logging
from uuid import UUID
from typing import Dict, Any

from sqlalchemy.orm import Session # type: ignore
from app.workers.celery_app import celery_app
from app.models.ingestion_job import IngestionJob
from app.services.chunking_service import ChunkingService
from app.services.embedding_service import EmbeddingService
from app.services.vector_store_service import VectorStoreService
from app.services.ingestion_service import IngestionService

logger = logging.getLogger(__name__)

# Mock database dependency for the worker session
def get_worker_db_session() -> Session:
    # Here you would instantiate your SQLALchemy SessionLocal
    # from app.db.session import SessionLocal
    # return SessionLocal()
    return None # type: ignore

@celery_app.task(bind=True, max_retries=3)
def process_ingestion_task(self, job_id: str, text_content: str, source_type: str, metadata: Dict[str, Any]):
    """
    Background Task to handle complete document ingestion pipeline.
    This respects clean architecture by delegating logic to the IngestionService,
    while controlling the task lifecycle and status updates.
    """
    logger.info(f"Task started for Job ID: {job_id}")
    db: Session = get_worker_db_session()
    
    try:
        # 1. Update job status to 'processing'
        if db:
            job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
            if job:
                job.status = "processing"
                db.commit()

        # 2. Dependency Injection for Services
        # Mock vector store client here
        vector_db_client = None

        chunking_svc = ChunkingService(chunk_size=1000, chunk_overlap=200)
        embedding_svc = EmbeddingService(model_name="text-embedding-ada-002")
        vector_store_svc = VectorStoreService(db_client=vector_db_client)

        ingestion_svc = IngestionService(
            chunking_service=chunking_svc,
            embedding_service=embedding_svc,
            vector_store_service=vector_store_svc,
            sql_db_session=db
        )

        # 3. Call the Ingestion Service to perform: chunking -> embedding -> storage
        document_id = ingestion_svc.process_document(
            text=text_content,
            source_type=source_type,
            metadata=metadata
        )

        # 4. Update job status to 'completed'
        if db:
            job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
            if job:
                job.status = "done"
                db.commit()
                
        logger.info(f"Job {job_id} completed successfully. Generated Document ID: {document_id}")
        return {"status": "success", "document_id": str(document_id)}

    except Exception as exc:
        logger.error(f"Task failed for Job ID: {job_id}. Error: {str(exc)}")
        
        # Safely update error state
        if db:
            try:
                db.rollback()
                job = db.query(IngestionJob).filter(IngestionJob.id == job_id).first()
                if job:
                    job.status = "failed"
                    job.error_message = str(exc)
                    db.commit()
            except Exception as inner_exc:
                logger.error(f"Failed to update job status to error: {inner_exc}")

        # Idempotent retry backoff (e.g., rate limits from OpenAI)
        try:
            self.retry(exc=exc, countdown=2 ** self.request.retries * 10) # 10s, 20s, 40s
        except self.MaxRetriesExceededError:
            logger.error(f"Max retries exceeded for Job ID {job_id}.")
            raise exc
    finally:
        if db:
            db.close()


@celery_app.task(bind=True)
def reindex_document_task(self, document_id: str):
    """
    Utility task: re-embeds and reindexes an existing document inside the vector store.
    """
    logger.info(f"Reindexing document: {document_id}")
    # Business logic goes here (Fetch doc -> embed -> upsert)
    return True
