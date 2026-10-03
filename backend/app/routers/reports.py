from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..current_user import get_current_user
from ..models import CaseReport
from ..services.report_generator import generate_case_report_sync, process_report_async

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/{case_id}")
def get_case_report(case_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    report = db.query(CaseReport).filter(CaseReport.case_id == case_id, CaseReport.user_id == current_user_id).first()
    if not report:
        return None
    return {
        "id": report.id,
        "case_id": report.case_id,
        "status": report.status,
        "report_json": report.report_json,
        "generated_at": report.generated_at
    }

@router.post("/{case_id}/generate")
def generate_report(case_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    report = generate_case_report_sync(db, case_id, current_user_id)
    background_tasks.add_task(process_report_async, case_id, report.id)
    return {"status": report.status, "id": report.id}
