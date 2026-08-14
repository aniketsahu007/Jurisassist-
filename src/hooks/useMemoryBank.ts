import { useEffect, useMemo, useState } from "react";
import {
  frequentSections,
  pastCases,
  savedNotes,
  strategies,
  successfulArguments,
  vectorHits,
  type VectorHit,
} from "@/data/memory";

/** Future integration point: replace with a FastAPI + vector-store query. */
export function useMemoryBank() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 520);
    return () => clearTimeout(t);
  }, []);

  return {
    loading,
    pastCases,
    strategies,
    successfulArguments,
    frequentSections,
    savedNotes,
  };
}

export function useVectorSearch(query: string) {
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;
    setSearching(true);
    const t = setTimeout(() => setSearching(false), 500);
    return () => clearTimeout(t);
  }, [query]);

  const hits: VectorHit[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return vectorHits;
    const tokens = q.split(/\s+/);
    return vectorHits
      .map((h) => {
        const text = `${h.snippet} ${h.source} ${h.kind}`.toLowerCase();
        const matched = tokens.filter((t) => text.includes(t)).length;
        const boost = tokens.length ? (matched / tokens.length) * 0.12 : 0;
        return { ...h, similarity: Math.min(0.99, Number((h.similarity + boost).toFixed(2))) };
      })
      .sort((a, b) => b.similarity - a.similarity);
  }, [query]);

  return { hits, searching };
}
