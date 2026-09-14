import { useEffect, useState } from "react";
import {
  heatmapArguments,
  judgeArgumentHeatmap,
  judgePreferences,
  rejectedArguments,
  sectionOutcomes,
  strategyOutcomes,
  successTrend,
} from "@/data/patterns";

/** Future integration point: replace with FastAPI-backed analytics queries. */
export function usePatterns() {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 560);
    return () => clearTimeout(t);
  }, []);

  return {
    loading,
    judgePreferences,
    successTrend,
    rejectedArguments,
    sectionOutcomes,
    strategyOutcomes,
    heatmapArguments,
    judgeArgumentHeatmap,
  };
}
