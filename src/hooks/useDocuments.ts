import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi, type ApiDocument } from "@/lib/api";

/**
 * Data access layer — wired to the FastAPI backend.
 *
 * Hooks return flattened shapes so page components can destructure
 * without digging into React Query internals.
 */

export function useRecentUploads(caseId?: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ["documents", caseId ?? "__all"],
    queryFn: () => documentsApi.list(caseId!, { limit: 20 }),
    enabled: !!caseId,
  });

  const items: ApiDocument[] = data?.items ?? [];
  return { items, loading: isLoading };
}

export function useDocument(docId: string | undefined) {
  return useQuery({
    queryKey: ["documents", "detail", docId],
    queryFn: () => documentsApi.get(docId!),
    enabled: !!docId,
  });
}

export function useDocumentStatus(docId: string | undefined) {
  return useQuery({
    queryKey: ["documents", "status", docId],
    queryFn: () => documentsApi.getStatus(docId!),
    enabled: !!docId,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      // Stop polling once done or failed; otherwise poll every 3s
      if (!status || status === "COMPLETED" || status === "FAILED") return false;
      return 3000;
    },
  });
}

export function useUploadDocument(caseId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => documentsApi.upload(caseId!, file),
    onSuccess: () => {
      // Refresh the document list for this case
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    },
  });
}

export function useDeleteDocument(caseId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (docId: string) => documentsApi.delete(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
    },
  });
}

export function useRetryDocument() {
  return useMutation({
    mutationFn: (docId: string) => documentsApi.retry(docId),
  });
}
