from typing import List, Dict, Any

from app.db.vector_db import get_vector_db
from app.services.embedding_service import OnlineEmbeddingService
from app.services.vector_store_service import VectorStoreService
from app.core.config import settings


class AIQueryService:
    def __init__(self):
        self.embedding = OnlineEmbeddingService(model_name=settings.embeding_model_name or "sentence-transformers/all-MiniLM-L6-v2")
        self.vector_store = VectorStoreService(
            db_client=get_vector_db(),
            collection_name=settings.vector_db_name or "knowledge_base"
        )

    def search(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        query_vector = self.embedding.generate_embedding(query)
        return self.vector_store.similarity_search(query_vector, top_k=top_k)
