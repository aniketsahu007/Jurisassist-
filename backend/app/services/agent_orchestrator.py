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
from ..services.vector_store import vector_store

logger = logging.getLogger(__name__)

# The router prompt is now built dynamically in route_and_execute

def execute_search_documents(args: dict, case_id: str) -> str:
    query = args.get("query", "")
    if not query:
        return "I couldn't identify a search query for documents."
    if not case_id:
        return "No case selected to search documents."
    try:
        results = vector_store.search_documents(query, case_id=case_id, top_k=5)
        if not results:
            return "No relevant information found in the case documents."
        text = "Here is the relevant information from the case documents:\n"
        for r in results:
            text += f"- {r['text']}\n"
        return text
    except Exception as e:
        logger.error(f"Error searching documents: {e}")
        return "Error occurred while searching case documents."
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
    
    case_summary = "None provided."
    case_title = "Unknown Case"
    if case_id:
        with SessionLocal() as db:
            case = db.query(Case).filter(Case.id == case_id).first()
            if case:
                case_title = case.title
                if case.summary:
                    case_summary = case.summary

    router_prompt = f"""You are the AI Orchestrator for JurisAssist, a legal intelligence platform.
Active Case Context:
- Title: {case_title}
- Summary: {case_summary}

Your task is to analyze the user's request and select exactly ONE tool to assist them. If no tool is needed, return "none".

AVAILABLE TOOLS:
1. "find_similar_cases"
   - Purpose: Find legal precedents, similar case laws, or judgments.
   - Arguments: {{"query": "<string>"}}
   - Rule: Formulate a highly specific 5-15 word search query using legal concepts, statutes, or keywords from the Case Summary or User Query. If the summary is empty and the user asks for cases similar to their active case, use the Case Title along with any available context as the query. Do NOT use generic phrases like "similar cases" or "cases like ours".

2. "extract_timeline"
   - Purpose: Provide a chronological sequence of events for the active case.
   - Arguments: {{}}

3. "search_documents"
   - Purpose: Retrieve facts, evidence, contradictions, or summaries directly from the uploaded documents of the active case.
   - Arguments: {{"query": "<string>"}}
   - Rule: Formulate a concise 3-10 word query based on the user's intent. For example, if they want a summary, use "case summary facts overview".

Reply ONLY with a valid JSON object in this exact format:
{{
  "tool": "find_similar_cases" | "extract_timeline" | "search_documents" | "none",
  "arguments": {{
     // include required arguments for the selected tool
  }}
}}
"""
    
    try:
        client = AsyncOpenAI(base_url=provider["base_url"], api_key=provider["api_key"])
        
        api_messages = [{"role": "system", "content": router_prompt}]
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
        elif tool == "search_documents":
            tool_result = execute_search_documents(args, case_id)
        
        # 2. Final Generation
        if tool != "none":
            final_prompt = f"""USER QUERY: {query}

ACTIVE CASE CONTEXT:
- Title: {case_title}
- Summary: {case_summary}

TOOL EXECUTED: {tool}
TOOL RESULT:
{tool_result}

INSTRUCTIONS:
1. Answer the user's query comprehensively using the TOOL RESULT and ACTIVE CASE CONTEXT.
2. Format your response strictly in Markdown. Do NOT use raw HTML tags (like <br> or <table>). Use standard Markdown lists and paragraphs instead.
3. If the TOOL RESULT indicates no information was found, state this clearly and directly. Do NOT hallucinate facts, and do NOT give a canned response asking for "more information about jurisdiction/facts" unless specifically relevant.
4. Maintain a professional, authoritative, yet helpful legal tone."""
        else:
            final_prompt = f"""USER QUERY: {query}

ACTIVE CASE CONTEXT:
- Title: {case_title}
- Summary: {case_summary}

INSTRUCTIONS:
1. Answer the user's query politely and professionally. Format strictly in Markdown without HTML tags.
2. Use the ACTIVE CASE CONTEXT if it's relevant.
3. If the user's query is too brief (e.g., just a case name), acknowledge it and ask how you can assist them with this case."""
            
        final_api_messages = [{"role": "system", "content": "You are JurisAssist, an advanced AI legal assistant. Provide precise, grounded answers based ONLY on the provided tool results and case context. Never hallucinate case law or facts."}]
        
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
            max_tokens=2500,
        ), timeout=30.0)
        
        return final_resp.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Orchestrator failed: {e}")
        return "I'm currently unable to process your request. Please try again later."
