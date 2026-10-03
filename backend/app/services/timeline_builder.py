import logging
from typing import List, Dict, Any
from datetime import datetime
import dateparser

from ..models import EventType

logger = logging.getLogger(__name__)

class TimelineBuilder:
    def __init__(self):
        # Heuristics for event classification based on context
        self.event_keywords = {
            EventType.ARREST: ["arrest", "custody", "apprehend", "bail denied", "remand"],
            EventType.FILING: ["file", "submit", "lodge", "petition", "charge sheet", "chargesheet", "complaint", "fir", "registered"],
            EventType.ORDER: ["order", "directed", "stay", "injunction", "notice issued", "passed by"],
            EventType.JUDGMENT: ["judgment", "convicted", "acquitted", "disposed", "sentenced", "guilty"],
            EventType.HEARING: ["hearing", "listed", "adjourned", "bench", "proceedings"],
        }
        
    def build_timeline(self, entities: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Takes a list of extracted entities (specifically targeting DATE entities),
        parses the dates, classifies the event type based on the text context,
        and returns a chronologically sorted list of timeline events.
        """
        events = []
        
        # Filter for dates. Handle both string names or Enum objects depending on how they are passed.
        date_entities = [
            e for e in entities 
            if e.get("entity_type") == "DATE" or getattr(e.get("entity_type"), "name", "") == "DATE"
        ]
        
        for date_ent in date_entities:
            # Parse the date string into a real datetime object
            parsed_date = dateparser.parse(
                date_ent["value"], 
                settings={'STRICT_PARSING': False, 'PREFER_DATES_FROM': 'past'}
            )
            
            if not parsed_date:
                logger.debug(f"Could not parse date string: {date_ent['value']}")
                continue
                
            # Filter out completely unrealistic dates
            if parsed_date.year < 1900 or parsed_date.year > 2100:
                logger.debug(f"Date out of bounds for {date_ent['value']}: {parsed_date.year}")
                continue
                
            context = date_ent.get("context", "")
            
            # Initial parse
            import re
            clean_context = re.sub(r'\s+', ' ', context).strip()
            
            if len(clean_context) > 250:
                clean_context = clean_context[:247] + "..."
                
            if len(clean_context) < 10:
                description = f"Event recorded on {date_ent['value']}."
            else:
                description = clean_context[0].upper() + clean_context[1:]
            
            events.append({
                "event_date": parsed_date,
                "event_type": self._classify_event(context),
                "description": description,
                "confidence": date_ent.get("confidence", 0.7),
                "is_ai_generated": True,
                "is_user_corrected": False
            })
            
        # Deduplicate by day and raw context string
        unique_events = []
        seen = set()
        for ev in events:
            day_str = ev["event_date"].strftime("%Y-%m-%d")
            key = (day_str, ev["description"])
            if key not in seen:
                seen.add(key)
                unique_events.append(ev)
                
        # Sort chronologically
        unique_events.sort(key=lambda x: x["event_date"])
        
        # Use LLM to enhance the readability of the timeline
        if unique_events:
            try:
                import asyncio
                import json
                from .llm_chain import generate_chat_response
                
                prompt = "You are a legal assistant. I will provide a list of raw extracted timeline events from a case document. Please rewrite the 'description' field for each event to make it highly readable, concise, and understandable for a user. Return the output as a valid JSON array of objects, where each object has 'index' (matching the input) and 'description' (the enhanced text). Do not wrap in markdown.\n\nEvents:\n"
                for i, ev in enumerate(unique_events):
                    prompt += f"[{i}] Date: {ev['event_date'].strftime('%Y-%m-%d')}, Raw: {ev['description']}\n"
                    
                response_text = asyncio.run(generate_chat_response(prompt))
                
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    enhanced_data = json.loads(json_match.group(0))
                else:
                    enhanced_data = json.loads(response_text)
                    
                for item in enhanced_data:
                    idx = int(item.get("index", -1))
                    if 0 <= idx < len(unique_events):
                        unique_events[idx]["description"] = item.get("description", unique_events[idx]["description"])
            except Exception as e:
                logger.error(f"Failed to enhance timeline with AI: {e}")
        
        logger.info(f"Generated {len(unique_events)} timeline events.")
        return unique_events
        
    def _classify_event(self, context: str) -> EventType:
        """Classify the event type by searching the context window for keywords."""
        context_lower = context.lower()
        
        for event_type, keywords in self.event_keywords.items():
            if any(keyword in context_lower for keyword in keywords):
                return event_type
                
        # Default fallback if no keywords match
        return EventType.INCIDENT
