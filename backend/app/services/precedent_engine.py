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

async def fetch_and_rerank(query: str, top_k: int = 10) -> List[Dict[str, Any]]:
    # Exact Match Bypass
    if '"' in query or " v. " in query.lower() or re.search(r'\b\d+\s+scc\s+\d+\b', query, re.IGNORECASE):
        logger.info("Exact match bypass detected. Skipping reranking.")
        cands = await run_in_threadpool(fetch_ik_candidates, query, "supremecourt")
        # Give them dummy scores
        for idx, c in enumerate(cands):
            c["vector_sim"] = 1.0 - (idx * 0.01)
        return cands[:top_k]
        
    variants = generate_variants(query)
    variant_results = []
    
    for vq in variants:
        cands = await run_in_threadpool(fetch_ik_candidates, vq, "supremecourt")
        variant_results.append(cands)
        if len(variants) > 1:
            await asyncio.sleep(1.0) # Respect IK 1 req/sec limit
            
    merged_candidates = dedupe(variant_results)
    if not merged_candidates:
        return []
        
    # Reranking using ONNX threadpool
    texts_to_embed = [query] + [f"{c['title']} {c['headline']}" for c in merged_candidates]
    embeddings = await run_in_threadpool(_do_embed, texts_to_embed)
    
    query_emb = np.array(embeddings[0])
    doc_embs = np.array(embeddings[1:])
    
    for idx, c in enumerate(merged_candidates):
        vec_sim = cosine_similarity(query_emb, doc_embs[idx])
        c["vector_sim"] = float(vec_sim)
        rank = c.get('ik_rank', idx)
        rank_score = max(0.0, 1.0 - (rank / 15.0))
        c["hybrid_score"] = float(vec_sim * 0.4 + rank_score * 0.6)
        
    reranked = sorted(merged_candidates, key=lambda x: x.get("hybrid_score", 0), reverse=True)
    return reranked[:top_k]
