from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import datetime

from ..database import get_db
from ..auth import get_current_user
from ..models import Case, CaseStatus, TimelineEvent, EventType
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


def _serialize_case(case: Case, db: Session) -> CaseDetailResponse:
    return CaseDetailResponse(
        id=case.id,
        title=case.title,
        client_name=case.client_name,
        court_name=case.court_name,
        judge_name=case.judge_name,
        fir_number=case.fir_number,
        status=case.status,
        next_hearing_date=_next_hearing_date(case, db),
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
    """List all cases for the currently authenticated lawyer with pagination and filters."""
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
        )

    total = query.count()
    cases = query.offset((page - 1) * limit).limit(limit).all()

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
    """Create a new case for the authenticated lawyer."""
    new_case = Case(
        user_id=current_user_id,
        title=payload.title,
        client_name=payload.client_name,
        court_name=payload.court_name,
        judge_name=payload.judge_name,
        fir_number=payload.fir_number,
        case_type=payload.case_type,
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
    """Get a specific case by ID. Enforces strict user ownership."""
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
