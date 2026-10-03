from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..current_user import get_current_user
from ..models import Case

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])

@router.get("/")
def get_dashboard_data(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    active_cases = db.query(Case).filter(Case.user_id == current_user_id, Case.status == 'ACTIVE').count()
    total_cases = db.query(Case).filter(Case.user_id == current_user_id).count()
    
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
                "label": "Cases Uploaded Today",
                "value": "0",
                "delta": "0",
                "trend": "up",
                "hint": "Phase 4 WIP"
            },
            {
                "id": "m-3",
                "label": "Upcoming Hearings",
                "value": "0",
                "delta": "next 14 days",
                "trend": "up",
                "hint": "0 listed this week"
            },
            {
                "id": "m-4",
                "label": "AI Reports Generated",
                "value": "0",
                "delta": "0%",
                "trend": "up",
                "hint": "this quarter"
            }
        ],
        "activityFeed": [],
        "notifications": [],
        "casesByStatus": [
            {"label": "Active", "value": active_cases},
            {"label": "Under Trial", "value": 0},
            {"label": "Reserved", "value": 0},
            {"label": "Stayed", "value": 0},
            {"label": "Appeal Filed", "value": 0},
            {"label": "Disposed", "value": total_cases - active_cases},
        ],
        "hearingsOverTime": [],
        "caseTypeMix": []
    }
