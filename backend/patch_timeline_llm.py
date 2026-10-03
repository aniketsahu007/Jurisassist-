"""
Retroactively enhance existing timeline event descriptions using the LLM.
Handles Unicode safely on Windows and processes events one-by-one for reliability.
"""
import asyncio
import json
import re
import os
import sys

# Force UTF-8 output on Windows
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import TimelineEvent
from app.services.llm_chain import generate_chat_response


async def enhance_single_event(event: TimelineEvent) -> str | None:
    """Send a single event to the LLM for enhancement. Returns enhanced text or None."""
    date_str = event.event_date.strftime('%Y-%m-%d') if event.event_date else "Unknown"
    
    # Clean the raw description of non-printable / garbled chars
    raw = event.description or ""
    raw = re.sub(r'[^\x20-\x7E\u00A0-\u024F\u0900-\u097F]', ' ', raw)  # keep ASCII + Latin + Devanagari
    raw = re.sub(r'\s+', ' ', raw).strip()
    
    if len(raw) < 15:
        return None  # Too short to meaningfully enhance
    
    prompt = (
        "You are a legal assistant. Rewrite the following raw text extracted from a legal document "
        "into a single clear, concise, human-readable sentence describing what happened on this date. "
        "Do NOT output JSON. Do NOT include any markdown. Output ONLY the rewritten sentence.\n\n"
        f"Date: {date_str}\n"
        f"Raw text: {raw}\n\n"
        "Rewritten description:"
    )
    
    response = await generate_chat_response(prompt)
    
    # Validate the response is reasonable
    if not response or len(response) < 10:
        return None
    if response.startswith("I'm sorry") or response.startswith("I'm currently"):
        return None
    
    # Clean up: remove leading/trailing quotes if present
    response = response.strip().strip('"').strip("'").strip()
    return response


async def patch_timelines():
    db = SessionLocal()
    try:
        events = db.query(TimelineEvent).all()
        if not events:
            print("No events found.")
            return

        total = len(events)
        print(f"Found {total} events to process.")
        
        success_count = 0
        fail_count = 0
        
        for i, event in enumerate(events):
            try:
                print(f"[{i+1}/{total}] Processing event {event.id} (date: {event.event_date})...")
                enhanced = await enhance_single_event(event)
                
                if enhanced:
                    event.description = enhanced
                    db.commit()
                    success_count += 1
                    print(f"  ✓ Enhanced: {enhanced[:80]}...")
                else:
                    fail_count += 1
                    print(f"  - Skipped (too short or LLM unavailable)")
                    
                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)
                
            except Exception as e:
                fail_count += 1
                print(f"  ✗ Error: {e}")
                db.rollback()
                await asyncio.sleep(1)

        print(f"\nDone! Enhanced: {success_count}, Skipped/Failed: {fail_count}")
    finally:
        db.close()


if __name__ == "__main__":
    asyncio.run(patch_timelines())
