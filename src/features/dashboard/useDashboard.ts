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
    activity: (data?.activityFeed || []).map((item: any) => ({
      id: item.id,
      kind: item.type === "Document Upload" ? "document" : item.type === "AI Analysis" ? "ai" : "filing",
      actor: "You",
      action: item.title.split(" ")[0],
      target: item.title.split(" ").slice(1).join(" "),
      caseNumber: "N/A",
      timestamp: item.timestamp,
    })),
    notifications: data?.notifications || [],
    casesByStatus: data?.casesByStatus || [],
    hearingsOverTime: data?.hearingsOverTime || [],
    caseTypeMix: data?.caseTypeMix || [],
  };
}


