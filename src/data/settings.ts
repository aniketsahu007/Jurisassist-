export interface IntegrationRow {
  id: string;
  name: string;
  category: "Messaging" | "Legal Data" | "AI Models" | "Infrastructure";
  description: string;
  status: "Connected" | "Not connected" | "Planned";
  enabled: boolean;
  detail: string;
}

export const integrations: IntegrationRow[] = [
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
  {
    id: "redis",
    name: "Redis",
    category: "Infrastructure",
    description: "Caching layer for cause lists, search results and session state.",
    status: "Not connected",
    enabled: false,
    detail: "Optional — improves search latency",
  },
  {
    id: "postgresql",
    name: "PostgreSQL",
    category: "Infrastructure",
    description: "Primary datastore for matters, documents and audit trails.",
    status: "Planned",
    enabled: false,
    detail: "Reserved for the production deployment",
  },
  {
    id: "fastapi",
    name: "FastAPI",
    category: "Infrastructure",
    description: "Backend service layer for ingestion, OCR and report generation.",
    status: "Planned",
    enabled: false,
    detail: "Interface contract drafted, endpoints pending",
  },
];

export interface SecurityEvent {
  id: string;
  event: string;
  device: string;
  location: string;
  time: string;
}

export const securityEvents: SecurityEvent[] = [
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
  },
  {
    id: "s-3",
    event: "New device authorised",
    device: "iPad Pro · Safari",
    location: "Pune, IN",
    time: "05 Aug 2026, 11:20 IST",
  },
  {
    id: "s-4",
    event: "Password changed",
    device: "MacBook Pro · Chrome 128",
    location: "Mumbai, IN",
    time: "28 Jul 2026, 09:05 IST",
  },
];
