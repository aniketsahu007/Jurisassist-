import { useState } from "react";
import { integrations, securityEvents, type IntegrationRow } from "@/data/settings";

/** Future integration point: replace with FastAPI-backed settings queries. */
export function useSettings() {
  const [rows, setRows] = useState<IntegrationRow[]>(integrations);

  return {
    integrations: rows,
    securityEvents,
    toggleIntegration: (id: string) =>
      setRows((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                enabled: !r.enabled,
                status: !r.enabled ? "Connected" : "Not connected",
              }
            : r,
        ),
      ),
  };
}
