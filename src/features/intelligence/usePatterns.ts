import { useQuery } from "@tanstack/react-query";
import { patternsApi } from "@/lib/api";

export function usePatterns() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["patterns"],
    queryFn: () => patternsApi.get(),
  });

  return {
    loading,
    judgePreferences: data?.judgePreferences || [],
    successTrend: data?.successTrend || [],
    rejectedArguments: data?.rejectedArguments || [],
    sectionOutcomes: data?.sectionOutcomes || [],
    strategyOutcomes: data?.strategyOutcomes || data?.successfulStrategies || [],
    heatmapArguments: data?.heatmapArguments || [],
    judgeArgumentHeatmap: data?.judgeArgumentHeatmap || [],
  };
}
