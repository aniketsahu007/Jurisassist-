import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional
from openai import AsyncOpenAI
from sqlalchemy.orm import Session
from ..database import SessionLocal
from ..models import Document, TimelineEvent, Case
from ..services.precedent_engine import fetch_and_rerank
from ..services.llm_chain import _get_providers, _grounding_check, breaker

logger = logging.getLogger(__name__)

ROUTER_PROMPT = """You are the AI Orchestrator for JurisAssist, a legal intelligence platform.
You must determine the user's intent and select exactly ONE tool to fulfill their request.
If no tool is appropriate, return "none".
Available tools:
1. find_similar_cases: Use when the user asks for precedents, similar cases, or case laws.
2. extract_timeline: Use when the user asks about the sequence of events, chronology, or timeline of their case.

Reply ONLY in JSON format:
{
  "tool": "find_similar_cases" | "extract_timeline" | "none",
  "arguments": {
     // for find_similar_cases: "query": "<search query>"
  }
}
"""

async def execute_find_similar_cases(args: dict) -> str:
    query = args.get("query", "")
    if not query:
        return "I couldn't identify a search query for precedents."
    results = await fetch_and_rerank(query, top_k=3)
    if not results:
        return "No similar cases found."
    
    text = "Here are the top precedents I found:\n"
    for r in results:
        text += f"- {r['title']} ({r.get('court', 'Unknown')}): {r['headline']}\n"
    return text

def execute_extract_timeline(case_id: str) -> str:
    if not case_id:
        return "I don't have an active case context to pull the timeline from. Please select a case."
    with SessionLocal() as db:
        events = db.query(TimelineEvent).filter(TimelineEvent.case_id == case_id).order_by(TimelineEvent.event_date).all()
        if not events:
            return "No timeline events found for this case."
        
        text = "Case Timeline:\n"
        for e in events:
            date_str = e.event_date.strftime("%Y-%m-%d") if e.event_date else "Unknown Date"
            text += f"- {date_str} ({e.event_type.value}): {e.description}\n"
        return text

async def route_and_execute(query: str, case_id: Optional[str], history: Optional[List[dict]] = None) -> str:
    if history is None:
        history = []
        
    providers = _get_providers()
    if not providers:
        return "I'm sorry, no AI providers are currently configured."
    
    provider = next((p for p in providers if not breaker.is_open(p["id"])), providers[0])
    
    try:
        client = AsyncOpenAI(base_url=provider["base_url"], api_key=provider["api_key"])
        
        api_messages = [{"role": "system", "content": ROUTER_PROMPT}]
        # Extract history, removing the duplicate user query if it's already at the end of history
        route_history = history[:]
        if route_history and route_history[-1].get("role") == "user" and route_history[-1].get("content") == query:
            route_history = route_history[:-1]
            
        for m in route_history:
            api_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
        
        api_messages.append({"role": "user", "content": query})

        # 1. Route
        route_resp = await asyncio.wait_for(client.chat.completions.create(
            model=provider["model"],
            messages=api_messages,
            temperature=0.0,
            response_format={"type": "json_object"}
        ), timeout=8.0)
        
        try:
            route_data = json.loads(route_resp.choices[0].message.content)
            tool = route_data.get("tool", "none")
            args = route_data.get("arguments", {})
        except Exception:
            tool = "none"
            args = {}
        
        tool_result = ""
        if tool == "find_similar_cases":
            tool_result = await execute_find_similar_cases(args)
        elif tool == "extract_timeline":
            tool_result = execute_extract_timeline(case_id)
        
        # 2. Final Generation
        if tool != "none":
            final_prompt = f"User Query: {query}\n\nTool Executed: {tool}\nTool Context:\n{tool_result}\n\nAnswer the user's query based strictly on the tool context if available. If no context, politely explain the tool returned no results."
        else:
            final_prompt = f"User Query: {query}\n\nAnswer the user's query politely. You are a legal AI assistant."
            
        final_api_messages = [{"role": "system", "content": "You are a helpful legal AI assistant for jurisAssist. Be concise and professional."}]
        
        # Add history but exclude the last message if it's the current user query,
        # because we are going to append it wrapped in final_prompt anyway.
        recent_history = history[-5:]
        if recent_history and recent_history[-1].get("role") == "user" and recent_history[-1].get("content") == query:
            recent_history = recent_history[:-1]
            
        for m in recent_history:
            final_api_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})
            
        final_api_messages.append({"role": "user", "content": final_prompt})

        final_resp = await asyncio.wait_for(client.chat.completions.create(
            model=provider["model"],
            messages=final_api_messages,
            temperature=0.7,
            max_tokens=500,
        ), timeout=10.0)
        
        return final_resp.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Orchestrator failed: {e}")
        return "I'm currently unable to process your request. Please try again later."
