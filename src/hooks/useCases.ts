import { useEffect, useMemo, useState } from "react";
import { cases as caseData, type LegalCase } from "@/data/cases";

/**
 * Data access layer. Today these hooks read typed mock data.
 * Future integration point: swap the bodies for FastAPI fetches
 * (e.g. useQuery({ queryKey: ["cases"], queryFn: fetchCases })).
 */

function useSimulatedLoad(delay = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

export interface CaseQuery {
  search?: string;
  status?: string;
  caseType?: string;
  court?: string;
  sort?: "recent" | "hearing" | "name" | "priority";
  page?: number;
  pageSize?: number;
}

const priorityRank: Record<string, number> = {
  Critical: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

export function useCases(query: CaseQuery = {}) {
  const loading = useSimulatedLoad();
  const {
    search = "",
    status = "all",
    caseType = "all",
    court = "all",
    sort = "recent",
    page = 1,
    pageSize = 6,
  } = query;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = caseData.filter((c) => {
      const matchesSearch =
        !q ||
        [c.title, c.client, c.caseNumber, c.judge, c.firNumber, c.court]
          .join(" ")
          .toLowerCase()
          .includes(q);
      return (
        matchesSearch &&
        (status === "all" || c.status === status) &&
        (caseType === "all" || c.caseType === caseType) &&
        (court === "all" || c.court === court)
      );
    });

    const sorted = [...rows].sort((a, b) => {
      switch (sort) {
        case "hearing":
          return a.nextHearing.localeCompare(b.nextHearing);
        case "name":
          return a.title.localeCompare(b.title);
        case "priority":
          return (priorityRank[a.priority] ?? 9) - (priorityRank[b.priority] ?? 9);
        default:
          return b.lastUpdated.localeCompare(a.lastUpdated);
      }
    });
    return sorted;
  }, [search, status, caseType, court, sort]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount);
  const items: LegalCase[] = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return { items, total, page: safePage, pageCount, loading };
}

export function useCaseStats() {
  return useMemo(() => {
    const byStatus = caseData.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1;
      return acc;
    }, {});
    return { total: caseData.length, byStatus };
  }, []);
}
