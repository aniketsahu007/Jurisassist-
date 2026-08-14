import { useEffect, useState } from "react";
import { caseReport, type CaseReport } from "@/data/report";

/** Future integration point: replace with a FastAPI-backed report fetch. */
export function useCaseReport(): { report: CaseReport; loading: boolean } {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, []);
  return { report: caseReport, loading };
}
