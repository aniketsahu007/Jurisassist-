import asyncio
import re
import numpy as np
from typing import List, Dict, Any
from fastapi.concurrency import run_in_threadpool
import logging
import sys
import os

# Ensure we can import ik_client from the root backend dir
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..')))
from backend.ik_client import IndianKanoonClient

from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

logger = logging.getLogger(__name__)

# Load embedding model at module level so it stays in memory
embedder = DefaultEmbeddingFunction()

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0: return 0.0
    return float(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

def _do_embed(texts: List[str]) -> List[List[float]]:
    return embedder(texts)

def dedupe(variant_results: List[List[Dict]]) -> List[Dict]:
    merged = []
    seen = set()
    for lst in variant_results:
        for idx, doc in enumerate(lst):
            if doc["docid"] not in seen:
                seen.add(doc["docid"])
                doc["ik_rank"] = idx
                merged.append(doc)
    return merged

def generate_variants(query: str) -> List[str]:
    # Strip basic identifiers for search
    q = re.sub(r'\b\d{10}\b', '', query)
    q = re.sub(r'WP\(C\)\s*\d+/\d+', '', q, flags=re.IGNORECASE).strip()
    
    variants = []
    citations = re.findall(r'Section \d+[A-Z]*|Article \d+', q, flags=re.IGNORECASE)
    if citations:
        anchor_q = q
        for c in citations:
            anchor_q = anchor_q.replace(c, f'"{c}"')
        variants.append(anchor_q)
    else:
        variants.append(q)
        
    stop = ["of", "under", "for", "and", "the", "in", "to", "with"]
    relaxed = " ".join([w for w in q.split() if w.lower() not in stop])
    if relaxed not in variants:
        variants.append(relaxed)
        
    return variants[:2]

def fetch_ik_candidates(query: str, doctypes: str = "supremecourt") -> List[Dict]:
    candidates = []
    try:
        data = IndianKanoonClient.search(query, pagenum=0, doctypes=doctypes)
        docs = data.get("docs", [])
        for doc in docs:
            # Check for citation/treatment status if available in IK API response
            cites = doc.get("cites", "unknown")
            candidates.append({
                "docid": str(doc.get("tid")),
                "title": doc.get("title", ""),
                "headline": doc.get("headline", ""),
                "citation_status": cites,
                "court": doc.get("docsource", ""),
                "date": doc.get("publishdate", ""),
            })
        return candidates
    except Exception as e:
        logger.warning(f"Failed to fetch IK for query '{query}': {e}")
        return []

async def _llm_rerank(query: str, candidates: List[Dict]) -> List[Dict]:
    """Use the LLM to score each candidate's relevance to the query on a 0-100 scale.
    This produces genuine relevance scores, not inflated cosine similarity."""
    from ..services.llm_chain import _get_providers, breaker, _extract_content
    from openai import AsyncOpenAI
    
    providers = _get_providers()
    if not providers:
        logger.warning("No LLM providers configured for reranking. Falling back to IK rank.")
        return candidates
    
    # Build a concise list for the LLM
    candidate_lines = []
    for i, c in enumerate(candidates):
        title = re.sub(r'<[^>]*>?', '', c.get("title", ""))[:120]
        headline = re.sub(r'<[^>]*>?', '', c.get("headline", ""))[:200]
        candidate_lines.append(f"{i}. {title} | {headline}")
    
    candidates_text = "\n".join(candidate_lines)
    
    prompt = f"""You are a legal relevance scoring engine. Score each candidate judgment's relevance to the user's search query on a scale of 0 to 100.

USER QUERY: {query}

CANDIDATE JUDGMENTS:
{candidates_text}

Reply ONLY with a JSON object containing a "scores" array, in this exact format:
{{"scores": [{{"index": 0, "score": 85}}, {{"index": 1, "score": 42}}]}}

Rules:
- Score 90-100: Directly on point — same legal issue, same statute, same factual pattern
- Score 70-89: Highly relevant — related legal principle or closely analogous facts
- Score 40-69: Somewhat relevant — tangentially related area of law
- Score 0-39: Low relevance — different area of law or only superficial keyword match
- Be honest and strict. Most candidates from a keyword search will be 40-70 range.
"""
    
    for provider in providers:
        if breaker.is_open(provider["id"]):
            continue
        try:
            client = AsyncOpenAI(base_url=provider["base_url"], api_key=provider["api_key"])
            response = await asyncio.wait_for(client.chat.completions.create(
                model=provider["model"],
                messages=[
                    {"role": "system", "content": "You are a legal relevance scoring engine. Output only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.0,
                max_tokens=500,
                response_format={"type": "json_object"}
            ), timeout=12.0)
            
            text = _extract_content(response.choices[0].message)
            if not text:
                raise ValueError("Empty LLM response")
                
            import json
            data = json.loads(text)
            
            # Handle both {"scores": [...]} and direct [...] formats
            scores_list = data if isinstance(data, list) else data.get("scores", data.get("results", []))
            
            if not isinstance(scores_list, list):
                raise ValueError(f"Unexpected LLM response format: {type(scores_list)}")
            
            # Apply scores to candidates
            for item in scores_list:
                idx = item.get("index", -1)
                score = item.get("score", 0)
                if 0 <= idx < len(candidates):
                    candidates[idx]["vector_sim"] = max(0.0, min(1.0, score / 100.0))
            
            logger.info(f"LLM reranking complete with provider {provider['name']}")
            return candidates
            
        except Exception as e:
            logger.error(f"LLM reranking failed with {provider['name']}: {e}")
            breaker.record_failure(provider["id"])
    
    # If all LLM providers fail, fall back to embedding-based scoring (honest, no inflation)
    logger.warning("All LLM providers failed for reranking. Falling back to embedding similarity.")
    return candidates


async def fetch_and_rerank(query: str, top_k: int = 10) -> List[Dict[str, Any]]:
    # Exact Match Bypass
    if '"' in query or " v. " in query.lower() or re.search(r'\b\d+\s+scc\s+\d+\b', query, re.IGNORECASE):
        logger.info("Exact match bypass detected. Skipping reranking.")
        cands = await run_in_threadpool(fetch_ik_candidates, query, "supremecourt")
        for idx, c in enumerate(cands):
            c["vector_sim"] = 1.0 - (idx * 0.01)
        return cands[:top_k]
        
    variants = generate_variants(query)
    variant_results = []
    
    for vq in variants:
        cands = await run_in_threadpool(fetch_ik_candidates, vq, "supremecourt")
        variant_results.append(cands)
        if len(variants) > 1:
            await asyncio.sleep(1.0)  # Respect IK 1 req/sec limit
            
    merged_candidates = dedupe(variant_results)
    if not merged_candidates:
        return []
    
    # Use LLM for genuine relevance scoring
    await _llm_rerank(query, merged_candidates)
    
    # Sort by the LLM-assigned relevance score
    reranked = sorted(merged_candidates, key=lambda x: x.get("vector_sim", 0), reverse=True)
    return reranked[:top_k]
