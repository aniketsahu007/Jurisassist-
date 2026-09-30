import { useQuery } from "@tanstack/react-query";
import { casesApi } from "@/lib/api";
import type { TimelineEvent } from "@/data/timeline";

export function useCaseTimeline(caseId: string | undefined): { events: TimelineEvent[]; loading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ["timeline", caseId],
    queryFn: () => casesApi.getTimeline(caseId!),
    enabled: !!caseId,
  });

  return { 
    events: data?.events || [], 
    loading: isLoading 
  };
}
