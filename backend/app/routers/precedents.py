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
    search_query = req.query
    if req.case_id:
        case = db.query(Case).filter(
            Case.id == req.case_id,
            Case.user_id == current_user_id,
            Case.deleted_at.is_(None)
        ).first()
        if not case:
            raise HTTPException(status_code=404, detail="Case not found or access denied.")
            
        if len(req.query) < 20 or req.query.lower().strip() in ["similar", "precedent", "precedents"]:
            if case.summary:
                from ..services.llm_chain import generate_chat_response
                prompt = f"""
                You are a legal search expert. The user is searching IndianKanoon for precedents similar to their case.
                User's raw query: "{req.query}"
                Case Summary: {case.summary}
                
                Based on the case summary, generate a dense, optimized keyword search query (10-20 words) containing the primary legal issues, statutes, and factual keywords.
                Return ONLY the search query string without any quotes, preamble, or markdown.
                """
                try:
                    expanded = await generate_chat_response(prompt)
                    if expanded and len(expanded) > 5:
                        search_query = expanded.strip('"\'')
                except Exception as e:
                    pass

    results = await fetch_and_rerank(search_query, req.top_k)
    return PrecedentSearchResponse(
        query=search_query,
        results=[PrecedentSearchResultItem(**r) for r in results]
    )

@router.post("/generate-summary", response_model=PrecedentSummaryResponse)
async def generate_precedent_summary(
    req: PrecedentSummaryRequest,
    current_user_id: str = Depends(get_current_user),
):
    # 1. Use provided fragment or fetch from IK
    if req.fragment:
        fragment = req.fragment
    else:
        try:
            data = IndianKanoonClient.search(f"{req.query}", doctypes="")
            docs = data.get("docs", [])
            # Try to find the specific docid in search results
            target_doc = next((d for d in docs if str(d.get("tid")) == str(req.docid)), None)
            if target_doc:
                fragment = target_doc.get("headline", "")
            else:
                fragment = "No excerpt available."
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
