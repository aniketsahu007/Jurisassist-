from fastapi import APIRouter, Depends
from typing import List, Optional
from pydantic import BaseModel
from ..current_user import get_current_user

router = APIRouter(prefix="/api/v1/memory", tags=["Memory"])

@router.get("/")
def search_memory(query: str = "", current_user_id: str = Depends(get_current_user)):
    return {
        "matches": []
    }
