import { useQuery } from "@tanstack/react-query";
import { memoryApi } from "@/lib/api";

export function useMemoryBank() {
  const { isLoading: loading } = useQuery({
    queryKey: ["memory-stats"],
    queryFn: () => memoryApi.search(""), // Basic ping
  });

  return {
    loading,
    pastCases: [],
    strategies: [],
    successfulArguments: [],
    frequentSections: [],
    savedNotes: [],
  };
}

export function useVectorSearch(query: string) {
  const { data, isLoading: searching } = useQuery({
    queryKey: ["memory-search", query],
    queryFn: () => memoryApi.search(query),
    enabled: query.trim().length > 2,
  });

  return { hits: data?.matches || [], searching };
}
