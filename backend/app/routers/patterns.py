from fastapi import APIRouter, Depends
from ..current_user import get_current_user

router = APIRouter(prefix="/api/v1/patterns", tags=["Patterns"])

@router.get("/")
def get_patterns(current_user_id: str = Depends(get_current_user)):
    return {
        "judgePreferences": [],
        "successfulStrategies": [],
        "rejectedArguments": []
    }
