from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import sys
import os

from ..database import get_db
from ..current_user import get_current_user
from ..models import Case
from ..schemas import (
    PrecedentSearchRequest,
    PrecedentSearchResponse,
    PrecedentSearchResultItem,
    PrecedentSummaryRequest,
    PrecedentSummaryResponse,
)
from ..services.precedent_engine import fetch_and_rerank
from ..services.llm_chain import generate_summary
from ..services.pii_stripper import pii_stripper

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
from backend.ik_client import IndianKanoonClient

router = APIRouter(prefix="/api/v1/precedents", tags=["Precedents"])

@router.post("/search", response_model=PrecedentSearchResponse)
async def search_precedents(
    req: PrecedentSearchRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    if req.case_id:
        case = db.query(Case).filter(
            Case.id == req.case_id,
            Case.user_id == current_user_id,
            Case.deleted_at.is_(None)
        ).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found or access denied.")
            
    results = await fetch_and_rerank(req.query, req.top_k)
    return PrecedentSearchResponse(
        query=req.query,
        results=[PrecedentSearchResultItem(**r) for r in results]
    )

@router.post("/generate-summary", response_model=PrecedentSummaryResponse)
async def generate_precedent_summary(
    req: PrecedentSummaryRequest,
    current_user_id: str = Depends(get_current_user),
):
    # 1. Fetch docfragment from IK on the server side
    try:
        data = IndianKanoonClient.search(f"id:{req.docid} {req.query}", doctypes="")
        docs = data.get("docs", [])
        if not docs:
            # Fallback
            doc_data = IndianKanoonClient.get_doc(req.docid)
            fragment = doc_data.get("headline", doc_data.get("title", "")) 
        else:
            fragment = docs[0].get("headline", "")
    except Exception as e:
        fragment = "No excerpt available."
        
    # 2. Strip PII
    safe_query = pii_stripper.strip_pii(req.query)
    
    # 3. Call LLM Chain
    result = await generate_summary(req.docid, safe_query, fragment)
    
    return PrecedentSummaryResponse(
        ai_summary=result["ai_summary"],
        provider=result["provider"]
    )
