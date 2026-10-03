import json
import os
import sys
import time
import re
import numpy as np
from typing import List, Dict

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ik_client import IndianKanoonClient
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction

def generate_variants(query: str) -> List[str]:
    # Strip identifiers
    q = re.sub(r'\b\d{10}\b', '', query)
    q = re.sub(r'WP\(C\)\s*\d+/\d+', '', q, flags=re.IGNORECASE).strip()
    
    variants = []
    
    # Variant 1: Exact quoted citations if present, otherwise base query
    citations = re.findall(r'Section \d+[A-Z]*|Article \d+', q, flags=re.IGNORECASE)
    if citations:
        anchor_q = q
        for c in citations:
            anchor_q = anchor_q.replace(c, f'"{c}"')
        variants.append(anchor_q)
    else:
        variants.append(q)
        
    # Variant 2: Relaxed query (remove stop words)
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
            candidates.append({
                "docid": str(doc.get("tid")),
                "title": doc.get("title", ""),
                "headline": doc.get("headline", ""),
            })
        return candidates
    except Exception as e:
        print(f"Warning: Failed to fetch IK for query '{query}': {e}")
        return []

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

def cosine_similarity(v1: np.ndarray, v2: np.ndarray) -> float:
    if np.linalg.norm(v1) == 0 or np.linalg.norm(v2) == 0: return 0.0
    return np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))

def rerank_minilm(query: str, candidates: List[Dict]) -> List[Dict]:
    if not candidates: return []
    embedder = DefaultEmbeddingFunction()
    query_emb = np.array(embedder([query])[0])
    
    texts = [f"{c['title']} {c['headline']}" for c in candidates]
    doc_embs = np.array(embedder(texts))
    
    for idx, c in enumerate(candidates):
        vec_sim = cosine_similarity(query_emb, doc_embs[idx])
        c["vector_sim"] = float(vec_sim)
        
        # Calculate hybrid score. Assume candidate list was appended in order.
        # c['ik_rank'] is injected during dedupe
        rank = c.get('ik_rank', idx)
        rank_score = max(0.0, 1.0 - (rank / 15.0))
        c["hybrid_score"] = float(vec_sim * 0.4 + rank_score * 0.6)
        
    reranked = sorted(candidates, key=lambda x: x["hybrid_score"], reverse=True)
    return reranked

def run_eval():
    with open("eval_queries.json", "r") as f:
        all_queries = json.load(f)
        
    verified_queries = [q for q in all_queries if q["expected_docids"]]
    tuning_set = verified_queries[:10]
    
    print(f"\\n--- Running Final Production Pipeline Eval on Tuning Set ({len(tuning_set)} queries) ---")
    
    total_ik_calls = 0
    strict_hit_count = 0
    
    os.makedirs("results", exist_ok=True)
    report_lines = []
    report_lines.append("# Precedent Retrieval Pipeline Evaluation\\n")
    
    for q in tuning_set:
        query_text = q["query"]
        expected = q["expected_docids"]
        print(f"\\n> Query: {query_text}")
        
        variants = generate_variants(query_text)
        
        variant_results = []
        for vq in variants:
            cands = fetch_ik_candidates(vq, doctypes="supremecourt")
            variant_results.append(cands)
            total_ik_calls += 1
            time.sleep(1.0) # rate limit
            
        merged_candidates = dedupe(variant_results)
        reranked = rerank_minilm(query_text, merged_candidates)
        
        # Check strict historic recall in Top 5
        hit = False
        top_5 = reranked[:5]
        for c in top_5:
            if c["docid"] in expected:
                hit = True
                break
        if hit:
            strict_hit_count += 1
            
        # Log top 5 to report
        report_lines.append(f"### Query: `{query_text}`")
        report_lines.append(f"**Strict Historic Match Found in Top 5?**: {'Yes ✅' if hit else 'No ❌'}\\n")
        report_lines.append("**Top 5 Reranked Precedents:**")
        for i, c in enumerate(top_5, 1):
            clean_title = c['title'].replace('<b>', '').replace('</b>', '')
            report_lines.append(f"{i}. {clean_title} (ID: {c['docid']}) - *Sim: {c['vector_sim']:.3f}*")
        report_lines.append("\\n---\\n")
        
    total = len(tuning_set)
    
    report_lines.insert(2, f"**Total Queries**: {total}\\n")
    report_lines.insert(3, f"**Recall@5**: {strict_hit_count/total:.2%}\\n\\n")
    
    with open("results/final_product_eval_report.md", "w", encoding="utf-8") as f_out:
        f_out.write("\\n".join(report_lines))
            
    print(f"\\nEvaluation complete. Report saved to results/final_product_eval_report.md")

if __name__ == "__main__":
    run_eval()
