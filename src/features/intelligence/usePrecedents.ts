import { useEffect, useMemo, useState } from "react";
import { precedents, type PrecedentResult } from "@/data/precedents";

/** Future integration point: swap for a FastAPI-backed precedent search. */
export interface PrecedentQuery {
  search?: string;
  court?: string;
  judge?: string;
  year?: string;
  section?: string;
  caseType?: string;
}

export function usePrecedentSearch(query: PrecedentQuery = {}) {
  const [loading, setLoading] = useState(true);
  const {
    search = "",
    court = "all",
    judge = "all",
    year = "all",
    section = "all",
    caseType = "all",
  } = query;

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, [search, court, judge, year, section, caseType]);

  const results: PrecedentResult[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    return precedents
      .filter((p) => {
        const haystack = [p.title, p.citation, p.summary, p.judge, p.court, ...p.sections]
          .join(" ")
          .toLowerCase();
        return (
          (!q || haystack.includes(q)) &&
          (court === "all" || p.court === court) &&
          (judge === "all" || p.judge === judge) &&
          (year === "all" || String(p.year) === year) &&
          (section === "all" || p.sections.includes(section)) &&
          (caseType === "all" || p.caseType === caseType)
        );
      })
      .sort((a, b) => b.relevance - a.relevance);
  }, [search, court, judge, year, section, caseType]);

  return { results, total: results.length, loading };
}

export function useSavedPrecedents() {
  const [saved, setSaved] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSaved((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return { saved, toggle };
}
