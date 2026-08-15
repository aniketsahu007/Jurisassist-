import os

from fastapi import Depends
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, UserRole

DEV_USER_ID = os.getenv("DEV_USER_ID", "dev-user")
DEV_USER_EMAIL = os.getenv("DEV_USER_EMAIL", "dev@jurisassist.local")
DEV_USER_NAME = os.getenv("DEV_USER_NAME", "Development User")


def get_current_user(db: Session = Depends(get_db)) -> str:
    """
    Temporary local identity provider.

    The database schema still expects cases and documents to belong to a user,
    so we seed and reuse one local user while account handling is paused.
    """
    user = db.query(User).filter(User.id == DEV_USER_ID).first()
    if not user:
        user = User(
            id=DEV_USER_ID,
            email=DEV_USER_EMAIL,
            full_name=DEV_USER_NAME,
            role=UserRole.LAWYER,
        )
        db.add(user)
        db.commit()

    return DEV_USER_ID
