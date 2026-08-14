import { useEffect, useMemo, useState } from "react";
import {
  recentUploads,
  documentRecord,
  type UploadedFile,
  type DocumentRecord,
} from "@/data/documents";

/**
 * Data access layer. Today these hooks read typed mock data.
 * Future integration point: swap the bodies for FastAPI fetches.
 */

function useSimulatedLoad(delay = 500) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return loading;
}

export function useRecentUploads(): { items: UploadedFile[]; loading: boolean } {
  const loading = useSimulatedLoad();
  const items = useMemo(
    () => [...recentUploads].sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt)),
    [],
  );
  return { items, loading };
}

export function useDocument(): { document: DocumentRecord; loading: boolean } {
  const loading = useSimulatedLoad(450);
  return { document: documentRecord, loading };
}
