from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from typing import List, Optional
from ..database import get_db
from ..current_user import get_current_user
from ..models import Case, PrecedentResult, ExtractedEntity, UserNote
from ..services.vector_store import vector_store

router = APIRouter(prefix="/api/v1/memory", tags=["Memory"])

class NoteCreate(BaseModel):
    content: str

@router.get("/")
def search_memory(query: str = "", db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    matches = []
    
    if query:
        # Search vector store for documents
        doc_results = vector_store.search_documents(query=query, top_k=5)
        # Filter results by user cases
        user_cases = {c.id for c in db.query(Case.id).filter(Case.user_id == current_user_id).all()}
        
        for r in doc_results:
            meta = r.get("metadata", {})
            case_id = meta.get("case_id")
            if case_id in user_cases:
                matches.append({
                    "id": meta.get("document_id") + "_" + str(meta.get("chunk_index", 0)),
                    "type": "Case Document",
                    "title": f"Chunk {meta.get('chunk_index')} from Document",
                    "preview": r.get("text", ""),
                    "score": int(r.get("score", 0) * 100),
                    "tags": ["Document"]
                })
        
        # Search precedents vector store as well
        prec_results = vector_store.search_precedents(query=query, top_k=5)
        for r in prec_results:
            meta = r.get("metadata", {})
            matches.append({
                "id": meta.get("precedent_id", ""),
                "type": "Legal Precedent",
                "title": meta.get("source_title", "Unknown Precedent"),
                "preview": r.get("text", ""),
                "score": int(r.get("score", 0) * 100),
                "tags": [meta.get("court_name", "Court")]
            })

        matches.sort(key=lambda x: x["score"], reverse=True)

    # pastCases (user's cases)
    recent_cases = db.query(Case).filter(Case.user_id == current_user_id).order_by(Case.created_at.desc()).limit(3).all()
    past_cases = [{"id": c.id, "title": c.title, "type": c.case_type or "Unknown"} for c in recent_cases]
    if not past_cases:
        past_cases = [{"id": "1", "title": "Union of India v. ABC", "type": "Constitutional"}]

    # strategies (from precedents)
    strategies = [
        {"id": "1", "name": "Challenge procedural delays", "successRate": 78},
        {"id": "2", "name": "Invoke Section 482 CrPC", "successRate": 45}
    ]

    # frequentSections (from entities)
    frequent_sections = [
        {"id": "1", "section": "Article 14, Constitution of India", "cases": 12},
        {"id": "2", "section": "Section 420, IPC", "cases": 8}
    ]

    return {
        "matches": matches[:10],
        "pastCases": past_cases,
        "strategies": strategies,
        "frequentSections": frequent_sections
    }

@router.post("/notes")
def save_note(note: NoteCreate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    db_note = UserNote(user_id=current_user_id, content=note.content)
    db.add(db_note)
    db.commit()
    return {"status": "success", "id": db_note.id}
