import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi, type CreateCasePayload } from "@/lib/api";

/**
 * Data access layer — wired to the FastAPI backend.
 * Mock data files in src/data/ are kept as TypeScript type references.
 */

export interface CaseQuery {
  search?: string;
  status?: string;
  caseType?: string;
  court?: string;
  sort?: "recent" | "hearing" | "name" | "priority";
  page?: number;
  pageSize?: number;
}

export function useCases(query: CaseQuery = {}) {
  const { search = "", status = "all", page = 1, pageSize = 6 } = query;

  return useQuery({
    queryKey: ["cases", { search, status, page, pageSize }],
    queryFn: () =>
      casesApi.list({ page, limit: pageSize, status, search: search || undefined }),
    placeholderData: (prev) => prev, // keep previous data visible while loading next page
  });
}

export function useCaseDetail(caseId: string | undefined) {
  return useQuery({
    queryKey: ["cases", caseId],
    queryFn: () => casesApi.get(caseId!),
    enabled: !!caseId,
  });
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCasePayload) => casesApi.create(payload),
    onSuccess: () => {
      // Invalidate the cases list so it refetches and shows the new case
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (caseId: string) => casesApi.delete(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
    },
  });
}

export function useCaseStats() {
  // Derived from the full case list with no filters
  const { data } = useCases({ pageSize: 1 });
  return { total: data?.total ?? 0 };
}
