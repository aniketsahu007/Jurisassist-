import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { casesApi, type CreateCasePayload, type ApiCase } from "@/lib/api";

/**
 * Data access layer — wired to the FastAPI backend.
 *
 * Returns a flattened shape that page components can destructure directly
 * without digging into React Query's `data` wrapper.
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

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["cases", { search, status, page, pageSize }],
    queryFn: () => casesApi.list({ page, limit: pageSize, status, search: search || undefined }),
    placeholderData: (prev) => prev,
  });

  const items: ApiCase[] = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return { items, total, pageCount, loading: isLoading, isError, error };
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
  const { total } = useCases({ pageSize: 1 });
  return { total };
}
