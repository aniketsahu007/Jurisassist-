from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..current_user import get_current_user
from ..models import Case, CaseStatus, CasePriority, TimelineEvent, EventType, Document
from ..schemas import (
    CaseCreateRequest,
    CaseDetailResponse,
    PaginatedCaseResponse,
)

router = APIRouter(prefix="/api/v1/cases", tags=["Cases"])


def _next_hearing_date(case: Case, db: Session) -> Optional[datetime]:
    """Derive next hearing date from the timeline rather than storing it."""
    now = datetime.utcnow()
    event = (
        db.query(TimelineEvent)
        .filter(
            TimelineEvent.case_id == case.id,
            TimelineEvent.event_type == EventType.HEARING,
            TimelineEvent.event_date > now,
        )
        .order_by(TimelineEvent.event_date.asc())
        .first()
    )
    return event.event_date if event else None


def _documents_count(case_id: str, db: Session) -> int:
    """Count non-deleted documents for a case."""
    return (
        db.query(func.count(Document.id))
        .filter(Document.case_id == case_id, Document.deleted_at.is_(None))
        .scalar()
        or 0
    )


def _serialize_case(case: Case, db: Session) -> CaseDetailResponse:
    return CaseDetailResponse(
        id=case.id,
        title=case.title,
        case_number=case.case_number,
        client_name=case.client_name,
        court_name=case.court_name,
        judge_name=case.judge_name,
        fir_number=case.fir_number,
        case_type=case.case_type,
        status=case.status,
        priority=case.priority,
        summary=case.summary,
        lead_counsel=case.lead_counsel,
        statutes=case.statutes or [],
        filed_on=case.filed_on,
        documents_count=_documents_count(case.id, db),
        next_hearing_date=_next_hearing_date(case, db),
        updated_at=case.updated_at,
    )


@router.get("", response_model=PaginatedCaseResponse)
def list_cases(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[CaseStatus] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """List all cases for the current development user with pagination and filters."""
    query = db.query(Case).filter(
        Case.user_id == current_user_id,
        Case.deleted_at.is_(None),  # Exclude soft-deleted cases
    )

    if status:
        query = query.filter(Case.status == status)

    if search:
        query = query.filter(
            Case.title.ilike(f"%{search}%")
            | Case.client_name.ilike(f"%{search}%")
            | Case.fir_number.ilike(f"%{search}%")
            | Case.case_number.ilike(f"%{search}%")
        )

    total = query.count()
    cases = query.order_by(Case.updated_at.desc()).offset((page - 1) * limit).limit(limit).all()

    return PaginatedCaseResponse(
        items=[_serialize_case(c, db) for c in cases],
        total=total,
        page=page,
        limit=limit,
    )


@router.post("", response_model=CaseDetailResponse, status_code=201)
def create_case(
    payload: CaseCreateRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Create a new case for the current development user."""
    new_case = Case(
        user_id=current_user_id,
        title=payload.title,
        case_number=payload.case_number,
        client_name=payload.client_name,
        court_name=payload.court_name,
        judge_name=payload.judge_name,
        fir_number=payload.fir_number,
        case_type=payload.case_type,
        priority=payload.priority or CasePriority.MEDIUM,
        summary=payload.summary,
        lead_counsel=payload.lead_counsel,
        statutes=payload.statutes or [],
        filed_on=payload.filed_on,
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return _serialize_case(new_case, db)


@router.get("/{case_id}", response_model=CaseDetailResponse)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Get a specific case by ID. Enforces current-user ownership."""
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == current_user_id,
        Case.deleted_at.is_(None),
    ).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    return _serialize_case(case, db)


@router.delete("/{case_id}", status_code=204)
def delete_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Soft-delete a case. Sets deleted_at timestamp; data is preserved for audit compliance."""
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == current_user_id,
        Case.deleted_at.is_(None),
    ).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    case.deleted_at = datetime.utcnow()
    db.commit()
    return  # 204 No Content


@router.get("/{case_id}/timeline")
def get_case_timeline(
    case_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    """Get the chronologically sorted timeline for a specific case."""
    case = db.query(Case).filter(
        Case.id == case_id,
        Case.user_id == current_user_id,
        Case.deleted_at.is_(None),
    ).first()

    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    events = db.query(TimelineEvent).filter(
        TimelineEvent.case_id == case_id
    ).order_by(TimelineEvent.event_date.asc()).all()

    formatted_events = []
    for ev in events:
        stage_mapping = {
            EventType.INCIDENT: "Incident",
            EventType.ARREST: "Arrest",
            EventType.FILING: "FIR Registered",
            EventType.HEARING: "Hearing",
            EventType.ORDER: "Hearing",
            EventType.JUDGMENT: "Judgment"
        }
        
        now = datetime.utcnow()
        if ev.event_date.date() < now.date():
            status = "completed"
        elif ev.event_date.date() == now.date():
            status = "current"
        else:
            status = "upcoming"

        # Smart dynamic headline generation based on description context
        desc_lower = ev.description.lower()
        dynamic_title = ev.event_type.name.replace("_", " ").title()
        
        if "extortion" in desc_lower: dynamic_title = "Extortion Allegations"
        elif "police service" in desc_lower: dynamic_title = "Police Service Record"
        elif "written complaint" in desc_lower: dynamic_title = "Written Complaint Filed"
        elif "fir" in desc_lower: dynamic_title = "FIR Registration"
        elif "arrest" in desc_lower: dynamic_title = "Arrest Executed"
        elif "bail" in desc_lower: dynamic_title = "Bail Proceedings"
        elif "charge sheet" in desc_lower: dynamic_title = "Charge Sheet Filed"
        elif "judgment" in desc_lower: dynamic_title = "Final Judgment"
        else:
            words = ev.description.split()
            if len(words) > 4 and ev.event_type.name == "INCIDENT":
                first_few = " ".join(words[:4]).strip(".,;:!'\"")
                dynamic_title = first_few.title() + "..."

        formatted_events.append({
            "id": ev.id,
            "date": ev.event_date.isoformat(),
            "stage": stage_mapping.get(ev.event_type, "Incident"),
            "status": status,
            "title": dynamic_title,
            "description": ev.description,
            "details": {
                "location": "Not specified",
                "officer": "Unknown",
                "notes": ev.description,
                "documents": []
            }
        })

    return {"events": formatted_events}

@router.get("/{case_id}/precedents")
def get_case_precedents(
    case_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user_id, Case.deleted_at.is_(None)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    precedents = db.query(PrecedentResult).filter(PrecedentResult.case_id == case_id).all()
    
    # Needs to match PaginatedPrecedentResponse or return list
    return {"items": precedents, "total": len(precedents), "page": 1, "limit": max(1, len(precedents))}

from ..schemas import SavePrecedentRequest
from ..models import PrecedentResult
from sqlalchemy.exc import IntegrityError

@router.post("/{case_id}/precedents")
def save_case_precedent(
    case_id: str,
    payload: SavePrecedentRequest,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user_id, Case.deleted_at.is_(None)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    new_prec = PrecedentResult(
        case_id=case_id,
        precedent_id=payload.precedent_id,
        source_judgment_url=payload.source_judgment_url,
        source_title=payload.source_title,
        court_name=payload.court_name,
        ai_summary=payload.ai_summary,
        relevance_score=payload.relevance_score,
        citation_status=payload.citation_status,
        query_context=payload.query_context
    )
    
    try:
        db.add(new_prec)
        db.commit()
        db.refresh(new_prec)
    except IntegrityError:
        db.rollback()
        # Idempotent - if it already exists, just return the existing one
        new_prec = db.query(PrecedentResult).filter(
            PrecedentResult.case_id == case_id, 
            PrecedentResult.precedent_id == payload.precedent_id
        ).first()
        
    return new_prec

@router.delete("/{case_id}/precedents/{prec_id}", status_code=204)
def delete_case_precedent(
    case_id: str,
    prec_id: str,
    db: Session = Depends(get_db),
    current_user_id: str = Depends(get_current_user),
):
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == current_user_id, Case.deleted_at.is_(None)).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Cascade delete is handled by DB if case is deleted, but here we delete a specific precedent
    prec = db.query(PrecedentResult).filter(PrecedentResult.case_id == case_id, PrecedentResult.id == prec_id).first()
    if not prec:
        # Check if it was passed the IK precedent_id instead of the UUID
        prec = db.query(PrecedentResult).filter(PrecedentResult.case_id == case_id, PrecedentResult.precedent_id == prec_id).first()
        if not prec:
            raise HTTPException(status_code=404, detail="Precedent not found")
            
    db.delete(prec)
    db.commit()
    return
