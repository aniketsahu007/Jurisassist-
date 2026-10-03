import asyncio
import json
import re
import os
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import TimelineEvent
from app.services.llm_chain import generate_chat_response

async def patch_timelines():
    db = SessionLocal()
    try:
        events = db.query(TimelineEvent).all()
        if not events:
            print("No events found.")
            return

        print(f"Found {len(events)} events to process.")
        
        batch_size = 10
        for i in range(0, len(events), batch_size):
            batch = events[i:i + batch_size]
            prompt = "You are a legal assistant. I will provide a list of raw extracted timeline events from a case document. Please rewrite the 'description' field for each event to make it highly readable, concise, and understandable for a user. Return the output as a valid JSON array of objects, where each object has 'index' (matching the input) and 'description' (the enhanced text). Do not wrap in markdown.\n\nEvents:\n"
            
            for idx, ev in enumerate(batch):
                date_str = ev.event_date.strftime('%Y-%m-%d') if ev.event_date else "Unknown"
                prompt += f"[{idx}] Date: {date_str}, Raw: {ev.description}\n"
                
            try:
                print(f"Processing batch {i//batch_size + 1}...")
                response_text = await generate_chat_response(prompt)
                print(f"DEBUG RESPONSE: {response_text}")
                
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    enhanced_data = json.loads(json_match.group(0))
                else:
                    enhanced_data = json.loads(response_text)
                    
                for item in enhanced_data:
                    idx = int(item.get("index", -1))
                    if 0 <= idx < len(batch):
                        batch[idx].description = item.get("description", batch[idx].description)
                        
                db.commit()
                print(f"Batch {i//batch_size + 1} saved.")
            except Exception as e:
                print(f"Failed to process batch {i//batch_size + 1}: {e}")
                
        print("Done patching timelines.")
    finally:
        db.close()

if __name__ == "__main__":
    os.environ["DEV_BYPASS_AUTH"] = "1"
    asyncio.run(patch_timelines())
