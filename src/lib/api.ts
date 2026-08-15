/**
 * Centralized API client for jurisAssist.
 *
 * All requests automatically include the Clerk JWT token in the
 * Authorization header. Swap BASE_URL via VITE_API_URL env var
 * for production deployments.
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function getAuthToken(): Promise<string | null> {
  // Clerk exposes the session token via a global helper once ClerkProvider is mounted.
  // We use the dynamic import to avoid a hard dependency at module init time.
  try {
    const { default: Clerk } = await import("@clerk/clerk-react");
    // @ts-ignore — clerk singleton access
    const session = window.Clerk?.session;
    if (!session) return null;
    return await session.getToken();
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message ?? `API error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ---- Cases ----
export interface ApiCase {
  id: string;
  title: string;
  clientName?: string;
  courtName?: string;
  judgeName?: string;
  firNumber?: string;
  status: string;
  nextHearingDate?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCasePayload {
  title: string;
  clientName?: string;
  courtName?: string;
  judgeName?: string;
  firNumber?: string;
  caseType?: string;
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
      }
    );

    // Upload directly to Supabase — no file bytes touch our FastAPI server
    await fetch(presignedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    // Confirm and trigger AI processing
    await request<void>(`/api/v1/documents/${docId}/confirm`, { method: "POST" });
    return request<ApiDocument>(`/api/v1/documents/${docId}`);
  },
};
