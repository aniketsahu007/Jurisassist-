import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { precedentsApi, casesApi } from "@/lib/api";

export interface PrecedentQuery {
  search?: string;
  caseId?: string;
}

export function usePrecedentSearch(queryObj: PrecedentQuery = {}) {
  const { search = "", caseId } = queryObj;

  const { data, isLoading: loading } = useQuery({
    queryKey: ["precedents", search, caseId],
    queryFn: () => precedentsApi.search(search, 10, caseId),
    enabled: !!search.trim(),
  });

  const results = (data?.results || []).map((r) => ({
    id: r.docid,
    title: r.title.replace(/<[^>]*>?/gm, ''), // strip HTML from title
    summary: r.headline.replace(/<[^>]*>?/gm, ''), // used as fallback until lazy loaded AI summary
    court: r.court || "Unknown Court",
    outcome: r.citationStatus || "Unknown",
    relevance: Math.round(r.vectorSim * 100) || 0,
    date: r.date || "",
  }));

  return { results, total: results.length, loading };
}

export function usePrecedentSummary(docid: string, query: string, enabled: boolean, fragment?: string) {
  return useQuery({
    queryKey: ["precedent-summary", docid, query],
    queryFn: () => precedentsApi.generateSummary(docid, query, fragment),
    enabled: enabled && !!docid && !!query.trim(),
    staleTime: Infinity,
  });
}

export function useSavedPrecedents(caseId?: string) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["saved-precedents", caseId],
    queryFn: () => casesApi.getPrecedents(caseId!),
    enabled: !!caseId,
  });

  const savedIds = (data?.items || []).map((item: any) => item.precedentId);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => casesApi.savePrecedent(caseId!, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-precedents", caseId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (precId: string) => casesApi.deletePrecedent(caseId!, precId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["saved-precedents", caseId] }),
  });

  const toggle = (p: any) => {
    if (!caseId) {
      alert("Please select a case to save precedents.");
      return;
    }
    if (savedIds.includes(p.id)) {
      deleteMutation.mutate(p.id);
    } else {
      saveMutation.mutate({
        precedentId: p.id,
        sourceJudgmentUrl: `https://indiankanoon.org/doc/${p.id}/`,
        sourceTitle: p.title,
        courtName: p.court,
        aiSummary: p.summary,
        relevanceScore: p.relevance,
        citationStatus: p.outcome || "Unknown",
      });
    }
  };

  return { saved: savedIds, toggle };
}
