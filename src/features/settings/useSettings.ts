import { useState } from "react";

export interface IntegrationRow {
  id: string;
  name: string;
  category: "Messaging" | "Legal Data" | "AI Models" | "Infrastructure";
  description: string;
  status: "Connected" | "Not connected" | "Planned";
  enabled: boolean;
  detail: string;
}

export interface SecurityEvent {
  id: string;
  event: string;
  device: string;
  location: string;
  time: string;
}

const defaultIntegrations: IntegrationRow[] = [
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    category: "Messaging",
    description: "Send hearing reminders and order copies to clients on WhatsApp.",
    status: "Connected",
    enabled: true,
    detail: "Template: hearing_reminder_v3 · +91 22 6811 4400",
  },
  {
    id: "indian-kanoon",
    name: "Indian Kanoon",
    category: "Legal Data",
    description: "Full-text judgment search across Supreme Court, High Courts and tribunals.",
    status: "Connected",
    enabled: true,
    detail: "12,400 documents indexed · last sync 2 hours ago",
  },
  {
    id: "openai",
    name: "OpenAI",
    category: "AI Models",
    description: "Drafting, summarisation and contradiction detection models.",
    status: "Connected",
    enabled: true,
    detail: "Default model for draft generation",
  },
  {
    id: "claude",
    name: "Claude",
    category: "AI Models",
    description: "Long-context analysis of chargesheets and multi-volume records.",
    status: "Connected",
    enabled: true,
    detail: "Used for documents above 200 pages",
  },
  {
    id: "chromadb",
    name: "ChromaDB",
    category: "Infrastructure",
    description: "Vector store powering precedent similarity and AI memory recall.",
    status: "Connected",
    enabled: true,
    detail: "3 collections · 418k embeddings",
  },
];

const securityEvents: SecurityEvent[] = [
  {
    id: "s-1",
    event: "Signed in",
    device: "MacBook Pro · Chrome 129",
    location: "Mumbai, IN",
    time: "Today, 08:12 IST",
  },
  {
    id: "s-2",
    event: "Exported case bundle",
    device: "MacBook Pro · Chrome 129",
    location: "Mumbai, IN",
    time: "Yesterday, 19:44 IST",
  }
];

export function useSettings() {
  const [rows, setRows] = useState<IntegrationRow[]>(defaultIntegrations);

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
