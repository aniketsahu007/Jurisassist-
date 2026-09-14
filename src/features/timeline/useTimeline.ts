import { useEffect, useState } from "react";
import { caseTimeline, type TimelineEvent } from "@/data/timeline";

/** Future integration point: replace with FastAPI-backed queries. */
export function useCaseTimeline(): { events: TimelineEvent[]; loading: boolean } {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);
  return { events: caseTimeline, loading };
}
