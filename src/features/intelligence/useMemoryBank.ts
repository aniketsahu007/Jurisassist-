import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { memoryApi } from "@/lib/api";

export function useMemoryBank() {
  const queryClient = useQueryClient();

  const { data, isLoading: loading } = useQuery({
    queryKey: ["memory-stats"],
    queryFn: () => memoryApi.search(""), // Basic ping to get stats
  });

  const saveNote = useMutation({
    mutationFn: (content: string) => memoryApi.saveNote(content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memory-stats"] });
    },
  });

  return {
    loading,
    pastCases: data?.pastCases || [],
    strategies: data?.strategies || [],
    successfulArguments: [],
    frequentSections: data?.frequentSections || [],
    savedNotes: [],
    saveNote: saveNote.mutate,
    isSavingNote: saveNote.isPending,
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
