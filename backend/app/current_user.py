"""
FastAPI dependency: get_current_user
-------------------------------------
Verifies the Supabase JWT sent in the Authorization header,
then upserts the user into our Postgres users table.

Supabase signs JWTs with HS256 using the project's JWT secret
(Supabase Dashboard → Project Settings → API → JWT Secret).

The function signature is unchanged from the dev-placeholder:
  get_current_user(...) -> str   # returns the authenticated user's UUID
"""

import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, UserRole

# ─── Config ────────────────────────────────────────────────────────────────────

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

if not SUPABASE_JWT_SECRET:
    raise RuntimeError(
        "SUPABASE_JWT_SECRET is not set. "
        "Add it to your .env (Supabase Dashboard → Project Settings → API → JWT Secret)."
    )

_bearer = HTTPBearer()

# ─── Dependency ────────────────────────────────────────────────────────────────

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> str:
    """
    1. Decode and verify the Supabase JWT from the Authorization header.
    2. Upsert the user into our `users` table (first login creates the row).
    3. Return the user's UUID (sub claim) for use in route handlers.
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"require": ["sub", "email"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str = payload["sub"]
    email: str = payload["email"]
    full_name: str = payload.get("user_metadata", {}).get("full_name") or email

    # Upsert: create user on first login, skip if already exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        user = User(
            id=user_id,
            email=email,
            full_name=full_name,
            role=UserRole.LAWYER,
        )
        db.add(user)
        db.commit()

    return user_id
