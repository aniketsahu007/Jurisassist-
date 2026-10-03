import os
import sys
import asyncio
import json
import logging
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import TimelineEvent
from app.services.llm_chain import generate_chat_response

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_timeline_events():
    db = SessionLocal()
    try:
        events = db.query(TimelineEvent).all()
        logger.info(f"Found {len(events)} events to process.")
        
        for ev in events:
            # Skip if already formatted or too short
            if "|||" in ev.description:
                continue
                
            prompt = f"""You are a legal assistant. Given the following timeline event description, generate a short, professional, 2-5 word title (e.g., 'FIR Registration', 'Cross-Examination of Witness') that summarizes it.
Return ONLY a JSON object with 'title' and 'description' (the original or slightly polished description). Do not wrap in markdown.

Description: {ev.description}
"""
            try:
                response = await generate_chat_response(prompt)
                data = json.loads(response)
                title = data.get("title", "").strip()
                desc = data.get("description", ev.description).strip()
                
                if title:
                    ev.description = f"{title}|||{desc}"
                    logger.info(f"Updated event {ev.id}: {title}")
                
            except Exception as e:
                logger.error(f"Failed to process event {ev.id}: {e}")
        
        db.commit()
        logger.info("Successfully updated database.")
        
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(fix_timeline_events())
