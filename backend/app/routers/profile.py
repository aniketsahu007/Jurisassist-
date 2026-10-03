from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..current_user import get_current_user
from ..models import UserProfile
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter(prefix="/api/v1/profile", tags=["Profile"])

class ProfileUpdate(BaseModel):
    designation: str
    bar_council_id: str
    phone: str
    bio: str
    practice_areas: List[str]
    firm_name: str
    firm_role: str
    enrolment_year: str

@router.get("/")
def get_profile(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user_id).first()
    if not profile:
        profile = UserProfile(user_id=current_user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return {
        "designation": profile.designation,
        "barCouncilId": profile.bar_council_id,
        "phone": profile.phone,
        "bio": profile.bio,
        "practiceAreas": profile.practice_areas,
        "firm": {
            "name": profile.firm_name,
            "role": profile.firm_role,
        },
        "enrolmentYear": profile.enrolment_year,
    }

@router.put("/")
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user_id).first()
    if not profile:
        profile = UserProfile(user_id=current_user_id)
        db.add(profile)
        
    profile.designation = data.designation
    profile.bar_council_id = data.bar_council_id
    profile.phone = data.phone
    profile.bio = data.bio
    profile.practice_areas = data.practice_areas
    profile.firm_name = data.firm_name
    profile.firm_role = data.firm_role
    profile.enrolment_year = data.enrolment_year
    
    db.commit()
    db.refresh(profile)
    
    return {"status": "success"}
