import os
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt # Note: In production we will use the Clerk SDK or a robust JWT verifier with JWKS
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# We will need the CLERK_SECRET_KEY to verify tokens
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

security = HTTPBearer()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    This is the core dependency for protecting FastAPI endpoints.
    It reads the Bearer token from the Authorization header and verifies it against Clerk's public keys.
    Returns the user_id if valid, otherwise raises a 401 Unauthorized.
    """
    token = credentials.credentials
    
    if not CLERK_SECRET_KEY:
        # In a real app, we fetch the JWKS from Clerk's well-known endpoint
        # For scaffolding purposes, we check if the key exists
        raise HTTPException(status_code=500, detail="CLERK_SECRET_KEY is not configured")
        
    try:
        # Here we would decode the token using Clerk's public key
        # payload = jwt.decode(token, clerk_public_key, algorithms=["RS256"])
        # return payload.get("sub") # The Clerk user ID
        
        # Placeholder for actual verification logic until keys are provided
        pass
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # Return a dummy user_id for now until we have real tokens
    return "user_id_placeholder"
