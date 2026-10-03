from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
import uuid
from datetime import datetime
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
from ..current_user import get_current_user
from ..database import get_db
from ..models import Conversation, ConversationMessage
from ..services.agent_orchestrator import route_and_execute

router = APIRouter(prefix="/api/v1/assistant", tags=["Assistant"])


# --- Schemas ---

class ChatRequest(BaseModel):
    query: str
    case_id: Optional[str] = None
    conversation_id: Optional[str] = None
    history: Optional[List[dict]] = []


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    citations: Optional[List[dict]] = []


class ConversationOut(BaseModel):
    id: str
    title: str
    caseId: Optional[str] = None
    updatedAt: str
    preview: str
    messages: List[MessageOut] = []


# --- Helpers ---

def _title_from_query(query: str) -> str:
    """Derive a short title from the first user message."""
    cleaned = query.strip()
    if len(cleaned) > 50:
        return cleaned[:47] + "…"
    return cleaned


def _fmt_ts(dt) -> str:
    """Produce a JS-friendly ISO timestamp like 2024-01-15T10:30:00.000Z"""
    if dt is None:
        return ""
    s = dt.isoformat()
    # Strip timezone offset and append Z
    if "+" in s:
        s = s.split("+")[0]
    if not s.endswith("Z"):
        s += "Z"
    return s


def _conv_to_out(conv: Conversation, include_messages: bool = False) -> dict:
    preview = ""
    if conv.messages:
        last = conv.messages[-1]
        preview = last.content[:80] + "…" if len(last.content) > 80 else last.content

    out = {
        "id": conv.id,
        "title": conv.title,
        "caseId": conv.case_id,
        "updatedAt": _fmt_ts(conv.updated_at or conv.created_at),
        "preview": preview,
    }

    if include_messages:
        out["messages"] = [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "timestamp": _fmt_ts(m.created_at),
                "citations": m.citations or [],
            }
            for m in conv.messages
        ]
    else:
        out["messages"] = []

    return out


# --- Routes ---

@router.post("/chat")
async def chat(
    req: ChatRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send a message. If conversation_id is provided, append to that conversation.
    Otherwise create a new one. Returns the assistant reply + conversation metadata.
    """
    conv: Optional[Conversation] = None

    # Resolve or create conversation
    if req.conversation_id:
        conv = (
            db.query(Conversation)
            .options(joinedload(Conversation.messages))
            .filter(
                Conversation.id == req.conversation_id,
                Conversation.user_id == current_user_id,
            )
            .first()
        )

    if conv is None:
        conv = Conversation(
            id=str(uuid.uuid4()),
            user_id=current_user_id,
            title=_title_from_query(req.query),
            case_id=req.case_id if req.case_id and req.case_id != "N/A" else None,
        )
        db.add(conv)
        db.flush()  # get the id

    # Save the user message
    user_msg = ConversationMessage(
        id=str(uuid.uuid4()),
        conversation_id=conv.id,
        role="user",
        content=req.query,
    )
    db.add(user_msg)
    db.flush()

    # Build history from DB messages for context
    history = []
    for m in conv.messages:
        history.append({"role": m.role, "content": m.content})
    # Also include the just-added user message
    history.append({"role": "user", "content": req.query})

    # Call the AI orchestrator
    reply = await route_and_execute(req.query, req.case_id, history)

    # Save the assistant message
    assistant_msg = ConversationMessage(
        id=str(uuid.uuid4()),
        conversation_id=conv.id,
        role="assistant",
        content=reply,
        citations=[],
    )
    db.add(assistant_msg)

    # Update conversation title if this is the first message
    db.commit()
    db.refresh(conv)

    return {
        "id": assistant_msg.id,
        "role": "assistant",
        "content": reply,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "citations": [],
        "conversationId": conv.id,
        "conversationTitle": conv.title,
    }


@router.get("/conversations")
def get_conversations(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all conversations for the current user, newest first."""
    convs = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(Conversation.user_id == current_user_id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    return [_conv_to_out(c) for c in convs]


@router.get("/conversations/{conversation_id}")
def get_conversation(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single conversation with all its messages."""
    conv = (
        db.query(Conversation)
        .options(joinedload(Conversation.messages))
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user_id,
        )
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return _conv_to_out(conv, include_messages=True)


@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a conversation and all its messages."""
    conv = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user_id,
        )
        .first()
    )
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"ok": True}
