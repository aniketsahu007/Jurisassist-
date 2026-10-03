from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, date, timezone
from ..database import get_db
from ..current_user import get_current_user
from ..models import Case, Document, Conversation, CaseStatus

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    # 1. Total and active cases
    total_cases = db.query(Case).filter(Case.user_id == current_user_id).count()
    active_cases = db.query(Case).filter(Case.user_id == current_user_id, Case.status == CaseStatus.ACTIVE).count()
    
    # 2. Documents today
    today = date.today()
    docs_today = db.query(Document).join(Case).filter(
        Case.user_id == current_user_id,
        func.date(Document.created_at) == today
    ).count()

    # 3. Cases by Status
    status_counts = db.query(Case.status, func.count(Case.id)).filter(Case.user_id == current_user_id).group_by(Case.status).all()
    cases_by_status = [{"label": s.value.replace("_", " ").title(), "value": c} for s, c in status_counts]

    # Fill in defaults if empty
    if not cases_by_status:
        cases_by_status = [
            {"label": "Active", "value": 0},
            {"label": "Disposed", "value": 0}
        ]

    # 4. Case Type Mix
    type_counts = db.query(Case.case_type, func.count(Case.id)).filter(Case.user_id == current_user_id, Case.case_type != None).group_by(Case.case_type).all()
    case_type_mix = [{"name": t or "Unknown", "value": c} for t, c in type_counts]
    if not case_type_mix:
        case_type_mix = [{"name": "No data", "value": 1}]

    # 5. Activity Feed
    # Get latest 3 cases
    recent_cases = db.query(Case).filter(Case.user_id == current_user_id).order_by(Case.created_at.desc()).limit(3).all()
    # Get latest 3 docs
    recent_docs = db.query(Document).join(Case).filter(Case.user_id == current_user_id).order_by(Document.created_at.desc()).limit(3).all()
    # Get latest 3 conversations
    recent_convos = db.query(Conversation).filter(Conversation.user_id == current_user_id).order_by(Conversation.updated_at.desc()).limit(3).all()

    feed = []
    for c in recent_cases:
        feed.append({
            "id": f"c-{c.id}",
            "type": "New Case",
            "title": f"Created '{c.title}'",
            "timestamp": c.created_at.isoformat() if c.created_at else datetime.now(timezone.utc).isoformat()
        })
    for d in recent_docs:
        feed.append({
            "id": f"d-{d.id}",
            "type": "Document Upload",
            "title": f"Uploaded '{d.filename}'",
            "timestamp": d.created_at.isoformat() if d.created_at else datetime.now(timezone.utc).isoformat()
        })
    for cv in recent_convos:
        feed.append({
            "id": f"cv-{cv.id}",
            "type": "AI Analysis",
            "title": f"Chat on '{cv.title}'",
            "timestamp": cv.updated_at.isoformat() if cv.updated_at else datetime.now(timezone.utc).isoformat()
        })
        
    feed.sort(key=lambda x: x["timestamp"], reverse=True)
    activity_feed = feed[:5]

    return {
        "metrics": [
            {
                "id": "m-1",
                "label": "Active Cases",
                "value": str(active_cases),
                "delta": "Live",
                "trend": "up",
                "hint": f"out of {total_cases} total"
            },
            {
                "id": "m-2",
                "label": "Documents Uploaded Today",
                "value": str(docs_today),
                "delta": "0",
                "trend": "up",
                "hint": "across all cases"
            },
            {
                "id": "m-3",
                "label": "Upcoming Hearings",
                "value": "0",
                "delta": "next 14 days",
                "trend": "up",
                "hint": "Phase 8.1 WIP"
            },
            {
                "id": "m-4",
                "label": "AI Reports Generated",
                "value": "0",
                "delta": "0%",
                "trend": "up",
                "hint": "Phase 8.2 WIP"
            }
        ],
        "activityFeed": activity_feed,
        "notifications": [],
        "casesByStatus": cases_by_status,
        "hearingsOverTime": [],
        "caseTypeMix": case_type_mix
    }
