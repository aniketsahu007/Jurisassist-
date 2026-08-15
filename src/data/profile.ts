export interface LawyerProfile {
  name: string;
  designation: string;
  initials: string;
  email: string;
  phone: string;
  barCouncilId: string;
  enrolmentYear: number;
  practiceAreas: string[];
  courtsOfPractice: string[];
  languages: string[];
  bio: string;
}

export interface FirmInfo {
  name: string;
  role: string;
  address: string;
  gstin: string;
  website: string;
  teamSize: number;
  founded: number;
}

export interface ApiKeyRecord {
  id: string;
  label: string;
  maskedKey: string;
  scope: string;
  created: string;
  lastUsed: string;
  status: "active" | "revoked";
}

export interface InvoiceRecord {
  id: string;
  period: string;
  amount: string;
  status: "Paid" | "Due";
  issued: string;
}

export const lawyerProfile: LawyerProfile = {
  name: "Kavita Menon",
  designation: "Senior Advocate",
  initials: "KM",
  email: "kavita.menon@menonpartners.in",
  phone: "+91 98200 41273",
  barCouncilId: "MAH/2148/2004",
  enrolmentYear: 2004,
  practiceAreas: [
    "Criminal Trials",
    "White-Collar & Securities",
    "Commercial Arbitration",
    "Constitutional Writs",
  ],
  courtsOfPractice: [
    "Supreme Court of India",
    "Bombay High Court",
    "Sessions Court, Mumbai",
    "NCLT Mumbai",
  ],
  languages: ["English", "Hindi", "Marathi", "Malayalam"],
  bio: "Designated Senior Advocate with 21 years at the criminal and securities bar. Lead counsel in 340+ sessions trials and 62 reported matters, with a focus on electronic evidence and economic offences.",
};

export const firmInfo: FirmInfo = {
  name: "Menon & Partners LLP",
  role: "Managing Partner",
  address: "7th Floor, Maker Chambers IV, Nariman Point, Mumbai 400021",
  gstin: "27AABCM1429P1ZQ",
  website: "menonpartners.in",
  teamSize: 34,
  founded: 2011,
};

export const apiKeys: ApiKeyRecord[] = [
  {
    id: "k-1",
    label: "Chambers workflow automation",
    maskedKey: "lxr_live_••••••••••••4b21",
    scope: "cases:read, documents:read",
    created: "14 Feb 2026",
    lastUsed: "2 hours ago",
    status: "active",
  },
  {
    id: "k-2",
    label: "Registry cause-list sync",
    maskedKey: "lxr_live_••••••••••••9fa7",
    scope: "hearings:write",
    created: "03 Nov 2025",
    lastUsed: "Yesterday",
    status: "active",
  },
  {
    id: "k-3",
    label: "Intern research sandbox",
    maskedKey: "lxr_test_••••••••••••1c08",
    scope: "precedents:read",
    created: "21 Aug 2025",
    lastUsed: "16 Mar 2026",
    status: "revoked",
  },
];

export const billing = {
  plan: "Chambers Pro",
  seats: 12,
  seatsUsed: 9,
  renewal: "01 Sep 2026",
  amount: "₹48,000 / month",
  paymentMethod: "HDFC Business Card ending 4417",
  invoices: [
    {
      id: "INV-2026-08",
      period: "Aug 2026",
      amount: "₹48,000",
      status: "Due",
      issued: "01 Aug 2026",
    },
    {
      id: "INV-2026-07",
      period: "Jul 2026",
      amount: "₹48,000",
      status: "Paid",
      issued: "01 Jul 2026",
    },
    {
      id: "INV-2026-06",
      period: "Jun 2026",
      amount: "₹44,000",
      status: "Paid",
      issued: "01 Jun 2026",
    },
    {
      id: "INV-2026-05",
      period: "May 2026",
      amount: "₹44,000",
      status: "Paid",
      issued: "01 May 2026",
    },
  ] as InvoiceRecord[],
};

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export const notificationPreferences: NotificationPreference[] = [
  {
    id: "np-hearings",
    label: "Hearing reminders",
    description: "Alert 48 and 12 hours before every listed matter.",
    enabled: true,
  },
  {
    id: "np-deadlines",
    label: "Limitation & filing deadlines",
    description: "Daily digest of statutory deadlines falling within 14 days.",
    enabled: true,
  },
  {
    id: "np-judgments",
    label: "Similar judgment alerts",
    description: "Notify when a new reported judgment matches a saved proposition.",
    enabled: true,
  },
  {
    id: "np-reports",
    label: "AI report completion",
    description: "Ping when a case analysis or contradiction digest finishes.",
    enabled: false,
  },
  {
    id: "np-weekly",
    label: "Weekly practice summary",
    description: "Monday morning roll-up of caseload, outcomes and pending drafts.",
    enabled: true,
  },
];
