import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "@/lib/api";

export function useDashboard() {
  const { data, isLoading: loading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardApi.get(),
  });

  return {
    loading,
    metrics: data?.metrics || [],
    activity: data?.activityFeed || [],
    notifications: data?.notifications || [],
    casesByStatus: data?.casesByStatus || [],
    hearingsOverTime: data?.hearingsOverTime || [],
    caseTypeMix: data?.caseTypeMix || [],
  };
}


