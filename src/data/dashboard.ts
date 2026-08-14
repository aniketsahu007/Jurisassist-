export interface ActivityItem {
  id: string;
  kind: "filing" | "hearing" | "ai" | "document" | "order";
  actor: string;
  action: string;
  target: string;
  caseNumber: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  level: "urgent" | "info" | "success";
  timestamp: string;
  read: boolean;
}

export interface MetricPoint {
  label: string;
  value: number;
}

export const activityFeed: ActivityItem[] = [
  {
    id: "a-1",
    kind: "ai",
    actor: "Lexora AI",
    action: "generated a precedent brief for",
    target: "State of Maharashtra v. Rohan Deshmukh",
    caseNumber: "CRL.A. 482/2024",
    timestamp: "2026-08-02T09:15:00Z",
  },
  {
    id: "a-2",
    kind: "order",
    actor: "Adv. Ritu Ahluwalia",
    action: "uploaded the interim order dated 31 Jul in",
    target: "State (NCT of Delhi) v. Faizan Qureshi",
    caseNumber: "CRL.M.C. 771/2026",
    timestamp: "2026-08-02T06:48:00Z",
  },
  {
    id: "a-3",
    kind: "hearing",
    actor: "Registry Sync",
    action: "rescheduled the next hearing in",
    target: "Helios Renewables v. Rajasthan State Power Corp.",
    caseNumber: "ARB.P. 512/2026",
    timestamp: "2026-08-02T07:55:00Z",
  },
  {
    id: "a-4",
    kind: "document",
    actor: "Sr. Adv. Kavita Menon",
    action: "annotated 12 exhibits in",
    target: "SEBI v. Zephyr Capital Advisors",
    caseNumber: "C.C. 1188/2025",
    timestamp: "2026-08-01T18:05:00Z",
  },
  {
    id: "a-5",
    kind: "filing",
    actor: "Adv. Sanjay Raghavan",
    action: "filed a rejoinder affidavit in",
    target: "Aurelia Textiles Pvt. Ltd. v. Northgate Logistics",
    caseNumber: "C.S. (COMM) 118/2025",
    timestamp: "2026-08-01T14:42:00Z",
  },
  {
    id: "a-6",
    kind: "ai",
    actor: "Lexora AI",
    action: "flagged a conflicting authority in",
    target: "Nandini Iyer v. Union of India",
    caseNumber: "W.P. (C) 9042/2025",
    timestamp: "2026-07-31T16:20:00Z",
  },
  {
    id: "a-7",
    kind: "document",
    actor: "Adv. Priya Nambiar",
    action: "uploaded maintenance computation sheets to",
    target: "Ananya Rao v. Karthik Rao",
    caseNumber: "HMA 2210/2024",
    timestamp: "2026-07-31T13:12:00Z",
  },
  {
    id: "a-8",
    kind: "hearing",
    actor: "Registry Sync",
    action: "recorded cause list position 14 for",
    target: "Vikram Sethi v. Sethi Family Trust",
    caseNumber: "O.S. 3317/2023",
    timestamp: "2026-07-28T08:20:00Z",
  },
];

export const notifications: NotificationItem[] = [
  {
    id: "n-1",
    title: "Hearing in 2 days",
    detail: "ARB.P. 512/2026 listed before Hon'ble Justice Sudesh Bansal on 04 Aug.",
    level: "urgent",
    timestamp: "2026-08-02T08:00:00Z",
    read: false,
  },
  {
    id: "n-2",
    title: "Limitation window closing",
    detail: "Appeal in ITA 604/2025 must be perfected within 9 days.",
    level: "urgent",
    timestamp: "2026-08-02T05:30:00Z",
    read: false,
  },
  {
    id: "n-3",
    title: "AI report ready",
    detail: "Precedent analysis for CRL.A. 482/2024 completed — 23 authorities cited.",
    level: "success",
    timestamp: "2026-08-01T22:10:00Z",
    read: false,
  },
  {
    id: "n-4",
    title: "Registry update",
    detail: "Judgment reserved in W.P. (C) 9042/2025; pronouncement expected 19 Aug.",
    level: "info",
    timestamp: "2026-07-31T10:05:00Z",
    read: true,
  },
  {
    id: "n-5",
    title: "Document parsed",
    detail: "210 pages of exhibits indexed for C.C. 1188/2025.",
    level: "info",
    timestamp: "2026-07-30T19:45:00Z",
    read: true,
  },
];

export const casesByStatus: MetricPoint[] = [
  { label: "Active", value: 42 },
  { label: "Under Trial", value: 28 },
  { label: "Reserved", value: 9 },
  { label: "Stayed", value: 6 },
  { label: "Appeal Filed", value: 14 },
  { label: "Disposed", value: 31 },
];

export const hearingsOverTime: { month: string; hearings: number; adjournments: number }[] = [
  { month: "Feb", hearings: 34, adjournments: 11 },
  { month: "Mar", hearings: 41, adjournments: 9 },
  { month: "Apr", hearings: 38, adjournments: 14 },
  { month: "May", hearings: 52, adjournments: 12 },
  { month: "Jun", hearings: 47, adjournments: 8 },
  { month: "Jul", hearings: 61, adjournments: 15 },
  { month: "Aug", hearings: 24, adjournments: 4 },
];

export const caseTypeMix: MetricPoint[] = [
  { label: "Criminal", value: 38 },
  { label: "Corporate", value: 27 },
  { label: "Civil", value: 21 },
  { label: "Constitutional", value: 12 },
  { label: "Others", value: 32 },
];

export interface DashboardMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: "up" | "down";
  hint: string;
}

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: "m-1",
    label: "Active Cases",
    value: "130",
    delta: "+6.4%",
    trend: "up",
    hint: "across 11 courts",
  },
  {
    id: "m-2",
    label: "Cases Uploaded Today",
    value: "8",
    delta: "+3",
    trend: "up",
    hint: "vs. yesterday",
  },
  {
    id: "m-3",
    label: "Upcoming Hearings",
    value: "17",
    delta: "next 14 days",
    trend: "up",
    hint: "4 listed this week",
  },
  {
    id: "m-4",
    label: "AI Reports Generated",
    value: "246",
    delta: "+18.2%",
    trend: "up",
    hint: "this quarter",
  },
];
