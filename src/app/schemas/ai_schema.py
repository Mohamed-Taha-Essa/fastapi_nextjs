from pydantic import BaseModel
from typing import List, Dict, Any


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class QueryResult(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    distance: float | None


class QueryResponse(BaseModel):
    query: str
    results: List[QueryResult]
