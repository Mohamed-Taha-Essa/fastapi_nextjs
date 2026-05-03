from fastapi import APIRouter
from functools import lru_cache

from app.schemas.ai_schema import QueryRequest, QueryResponse, QueryResult
from app.services.ai_query_service import AIQueryService

router = APIRouter(prefix="/ai", tags=["AI Query"])


@lru_cache()
def _get_ai_service() -> AIQueryService:
    return AIQueryService()


@router.post("/query", response_model=QueryResponse)
async def query_documents(payload: QueryRequest) -> QueryResponse:
    ai_service = _get_ai_service()
    results = ai_service.search(payload.query, top_k=payload.top_k)

    return QueryResponse(
        query=payload.query,
        results=[
            QueryResult(
                id=r["id"],
                content=r["content"],
                metadata=r["metadata"],
                distance=r["distance"],
            )
            for r in results
        ],
    )
