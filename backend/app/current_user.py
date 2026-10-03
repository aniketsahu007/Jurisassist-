"""
FastAPI dependency: get_current_user
-------------------------------------
Verifies the Supabase JWT by calling the Supabase Auth API,
then upserts the user into our Postgres users table.

This approach is robust against Supabase key rotations (like the switch to ECC P-256).
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, UserRole
from .storage import get_supabase

_bearer = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> str:
    import os
    if os.getenv("DEV_BYPASS_AUTH") == "1":
        user_id = "00000000-0000-0000-0000-000000000000"
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            db_user = User(
                id=user_id,
                email="dev@test.com",
                full_name="Dev User",
                role=UserRole.LAWYER,
            )
            db.add(db_user)
            db.commit()
        return user_id

    if not credentials:
        raise HTTPException(status_code=403, detail="Not authenticated")
        
    token = credentials.credentials
    supabase = get_supabase()

    try:
        # get_user() validates the JWT with the Supabase server
        auth_response = supabase.auth.get_user(token)
        if not auth_response or not auth_response.user:
            raise ValueError("No user found for token")
        auth_user = auth_response.user
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = auth_user.id
    email = auth_user.email
    full_name = auth_user.user_metadata.get("full_name") or email

    # Upsert: create user on first login, skip if already exists
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        db_user = User(
            id=user_id,
            email=email,
            full_name=full_name,
            role=UserRole.LAWYER,
        )
        db.add(db_user)
        db.commit()

    return user_id
