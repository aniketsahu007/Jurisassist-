from fastapi import APIRouter, Depends
from ..current_user import get_current_user

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/")
def get_reports(current_user_id: str = Depends(get_current_user)):
    return []

@router.get("/{case_id}")
def get_case_report(case_id: str, current_user_id: str = Depends(get_current_user)):
    return None
