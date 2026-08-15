from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
import os
from ..database import get_db
from ..models import User, UserRole

router = APIRouter()

CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

@router.post("/webhooks/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """
    This endpoint listens for Webhook events fired by Clerk.
    When a new user signs up on the frontend, Clerk sends a 'user.created' event here.
    We use this to create a corresponding row in our PostgreSQL database.
    """
    
    if not CLERK_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="CLERK_WEBHOOK_SECRET is not set")
    
    # In production, we MUST verify the Svix signature of the webhook payload 
    # to ensure it actually came from Clerk and isn't malicious.
    
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")
        
    event_type = payload.get("type")
    data = payload.get("data", {})
    
    if event_type == "user.created":
        # Extract user info from Clerk payload
        clerk_id = data.get("id")
        email_addresses = data.get("email_addresses", [])
        primary_email = email_addresses[0].get("email_address") if email_addresses else "no-email@clerk.com"
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        full_name = f"{first_name} {last_name}".strip() or "Unnamed User"
        
        # Create user in our Supabase DB
        new_user = User(
            id=clerk_id, # Link our DB ID directly to the Clerk ID
            email=primary_email,
            full_name=full_name,
            role=UserRole.LAWYER
        )
        
        try:
            db.add(new_user)
            db.commit()
            print(f"Successfully synced Clerk user {clerk_id} to database")
        except Exception as e:
            db.rollback()
            print(f"Failed to sync user: {e}")
            raise HTTPException(status_code=500, detail="Database sync failed")
            
    return {"status": "success"}
