from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..current_user import get_current_user
from ..models import Notification

router = APIRouter(prefix="/api/v1/notifications", tags=["Notifications"])

@router.get("/")
def get_notifications(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    notifications = db.query(Notification).filter(Notification.user_id == current_user_id).order_by(Notification.created_at.desc()).all()
    return notifications

@router.patch("/{notification_id}/read")
def mark_notification_read(notification_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    return {"status": "success"}

@router.delete("/{notification_id}")
def delete_notification(notification_id: str, db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    notification = db.query(Notification).filter(Notification.id == notification_id, Notification.user_id == current_user_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    db.delete(notification)
    db.commit()
    return {"status": "success"}

@router.delete("/")
def clear_all_notifications(db: Session = Depends(get_db), current_user_id: str = Depends(get_current_user)):
    db.query(Notification).filter(Notification.user_id == current_user_id).delete()
    db.commit()
    return {"status": "success"}
