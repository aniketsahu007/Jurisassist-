"""
Search Router — Phase 5
Provides the semantic search API over case documents and legal precedents.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List

from ..current_user import get_current_user
from ..services.vector_store import vector_store

router = APIRouter(prefix="/api/v1/search", tags=["Search"])


class SearchResult(BaseModel):
    text: str
    score: float
    metadata: dict


class SearchResponse(BaseModel):
    query: str
    results: List[SearchResult]
    total: int


@router.get("/documents", response_model=SearchResponse)
def search_documents(
    q: str = Query(..., min_length=3, description="The natural language search query"),
    case_id: Optional[str] = Query(None, description="Optionally filter to a specific case"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return"),
    current_user_id: str = Depends(get_current_user),
):
    """
    Semantic search over all uploaded documents (or a specific case's documents).
    Returns the most relevant chunks of text matching your query.
    """
    try:
        raw_results = vector_store.search_documents(
            query=q,
            case_id=case_id,
            top_k=top_k,
        )
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Vector search unavailable. Ensure chromadb is installed and documents are processed: {str(e)}"
        )

    return SearchResponse(
        query=q,
        results=[SearchResult(**r) for r in raw_results],
        total=len(raw_results),
    )


@router.get("/precedents", response_model=SearchResponse)
def search_precedents(
    q: str = Query(..., min_length=3, description="The natural language search query"),
    top_k: int = Query(5, ge=1, le=20, description="Number of results to return"),
    current_user_id: str = Depends(get_current_user),
):
    """
    Semantic search over the legal precedents database.
    Returns the most relevant judgments matching your query — the foundation of Phase 6 RAG.
    """
    try:
        raw_results = vector_store.search_precedents(query=q, top_k=top_k)
    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail=f"Precedent search unavailable: {str(e)}"
        )

    return SearchResponse(
        query=q,
        results=[SearchResult(**r) for r in raw_results],
        total=len(raw_results),
    )


@router.get("/stats")
def get_vector_db_stats():
    """Diagnostic endpoint — returns the count of indexed items in each collection. No auth required."""
    try:
        return vector_store.get_collection_stats()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))
