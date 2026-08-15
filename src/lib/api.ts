/**
 * Centralized API client for jurisAssist.
 *
 * Swap BASE_URL via VITE_API_URL env var for production deployments.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export function getApiBaseUrl() {
  return BASE_URL;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.detail ?? error.message ?? `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const systemApi = {
  health: async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) {
      throw new Error(`Backend health check failed: ${res.status}`);
    }
    return res.json() as Promise<{ status: string; message: string }>;
  },
};

// ---- Cases ----

export type CaseStatusEnum =
  "ACTIVE" | "UNDER_TRIAL" | "RESERVED_FOR_JUDGMENT" | "DISPOSED" | "STAYED" | "APPEAL_FILED";

export type CasePriorityEnum = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface ApiCase {
  id: string;
  title: string;
  caseNumber?: string;
  clientName?: string;
  courtName?: string;
  judgeName?: string;
  firNumber?: string;
  caseType?: string;
  status: CaseStatusEnum;
  priority: CasePriorityEnum;
  summary?: string;
  leadCounsel?: string;
  statutes?: string[];
  filedOn?: string;
  documentsCount: number;
  nextHearingDate?: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCasePayload {
  title: string;
  caseNumber?: string;
  clientName?: string;
  courtName?: string;
  judgeName?: string;
  firNumber?: string;
  caseType?: string;
  priority?: CasePriorityEnum;
  summary?: string;
  leadCounsel?: string;
  statutes?: string[];
  filedOn?: string;
}

export const casesApi = {
  list: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    if (params.status && params.status !== "all") q.set("status", params.status);
    if (params.search) q.set("search", params.search);
    return request<PaginatedResponse<ApiCase>>(`/api/v1/cases?${q}`);
  },
  get: (id: string) => request<ApiCase>(`/api/v1/cases/${id}`),
  create: (payload: CreateCasePayload) =>
    request<ApiCase>("/api/v1/cases", { method: "POST", body: JSON.stringify(payload) }),
  delete: (id: string) => request<void>(`/api/v1/cases/${id}`, { method: "DELETE" }),
};

// ---- Documents ----
export interface ApiDocument {
  id: string;
  filename: string;
  status: "UPLOADED" | "PROCESSING_OCR" | "PROCESSING_AI" | "COMPLETED" | "FAILED";
  mimeType: string;
  ocrConfidence?: number;
  downloadUrl?: string;
  createdAt: string;
}

export const documentsApi = {
  list: (caseId: string, params: { page?: number; limit?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.limit) q.set("limit", String(params.limit));
    return request<PaginatedResponse<ApiDocument>>(`/api/v1/cases/${caseId}/documents?${q}`);
  },
  get: (id: string) => request<ApiDocument>(`/api/v1/documents/${id}`),
  getStatus: (id: string) => request<ApiDocument>(`/api/v1/documents/${id}/status`),
  retry: (id: string) => request<void>(`/api/v1/documents/${id}/retry`, { method: "POST" }),
  delete: (id: string) => request<void>(`/api/v1/documents/${id}`, { method: "DELETE" }),

  /**
   * Two-step upload:
   *  1. Ask the backend for a presigned URL.
   *  2. PUT the raw file bytes directly to Supabase Storage.
   *  3. Confirm with the backend so it can queue AI processing.
   */
  upload: async (caseId: string, file: File): Promise<ApiDocument> => {
    const { docId, presignedUrl } = await request<{ docId: string; presignedUrl: string }>(
      `/api/v1/cases/${caseId}/documents`,
      {
        method: "POST",
        body: JSON.stringify({ filename: file.name, mimeType: file.type }),
      },
    );

    // Upload directly to Supabase — no file bytes touch our FastAPI server
    const uploadResponse = await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!uploadResponse.ok) {
      throw new Error(`Storage upload failed: ${uploadResponse.statusText}`);
    }

    // Confirm and trigger AI processing
    await request<void>(`/api/v1/documents/${docId}/confirm`, { method: "POST" });
    return request<ApiDocument>(`/api/v1/documents/${docId}`);
  },
};
