export type CaseStatus =
  | "Active"
  | "Under Trial"
  | "Reserved for Judgment"
  | "Disposed"
  | "Stayed"
  | "Appeal Filed";

export type CaseType =
  | "Criminal"
  | "Civil"
  | "Corporate"
  | "Family"
  | "Constitutional"
  | "Tax"
  | "Labour"
  | "Property";

export type CasePriority = "Critical" | "High" | "Medium" | "Low";

export interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  client: string;
  court: string;
  judge: string;
  firNumber: string;
  caseType: CaseType;
  status: CaseStatus;
  priority: CasePriority;
  nextHearing: string; // ISO date
  lastUpdated: string; // ISO datetime
  filedOn: string;
  statutes: string[];
  documentsCount: number;
  leadCounsel: string;
  summary: string;
}

export const cases: LegalCase[] = [
  {
    id: "c-1001",
    caseNumber: "CRL.A. 482/2024",
    title: "State of Maharashtra v. Rohan Deshmukh",
    client: "Rohan Deshmukh",
    court: "Bombay High Court",
    judge: "Hon'ble Justice A. S. Chandurkar",
    firNumber: "FIR 214/2023, PS Bandra",
    caseType: "Criminal",
    status: "Under Trial",
    priority: "Critical",
    nextHearing: "2026-08-11",
    lastUpdated: "2026-08-02T09:15:00Z",
    filedOn: "2024-03-18",
    statutes: ["IPC §420", "IPC §467", "BNS §318"],
    documentsCount: 47,
    leadCounsel: "Adv. Meera Kulkarni",
    summary:
      "Appeal against conviction for alleged forgery of property conveyance deeds; challenge to admissibility of seized digital records.",
  },
  {
    id: "c-1002",
    caseNumber: "C.S. (COMM) 118/2025",
    title: "Aurelia Textiles Pvt. Ltd. v. Northgate Logistics",
    client: "Aurelia Textiles Pvt. Ltd.",
    court: "Delhi High Court (Commercial Division)",
    judge: "Hon'ble Justice Prathiba M. Singh",
    firNumber: "N/A — Commercial Suit",
    caseType: "Corporate",
    status: "Active",
    priority: "High",
    nextHearing: "2026-08-06",
    lastUpdated: "2026-08-01T14:42:00Z",
    filedOn: "2025-01-22",
    statutes: ["Contract Act §73", "Commercial Courts Act §12A"],
    documentsCount: 132,
    leadCounsel: "Adv. Sanjay Raghavan",
    summary:
      "Recovery of ₹8.4 crore for breach of a three-year freight services agreement and consequential damages for cargo deterioration.",
  },
  {
    id: "c-1003",
    caseNumber: "W.P. (C) 9042/2025",
    title: "Nandini Iyer v. Union of India",
    client: "Nandini Iyer",
    court: "Supreme Court of India",
    judge: "Hon'ble Justice B. V. Nagarathna",
    firNumber: "N/A — Writ Petition",
    caseType: "Constitutional",
    status: "Reserved for Judgment",
    priority: "Critical",
    nextHearing: "2026-08-19",
    lastUpdated: "2026-07-30T11:05:00Z",
    filedOn: "2025-06-09",
    statutes: ["Constitution Art. 14", "Constitution Art. 21", "DPDP Act §8"],
    documentsCount: 88,
    leadCounsel: "Sr. Adv. Kavita Menon",
    summary:
      "Challenge to mandatory biometric linkage for welfare disbursement on grounds of proportionality and informational privacy.",
  },
  {
    id: "c-1004",
    caseNumber: "O.S. 3317/2023",
    title: "Vikram Sethi v. Sethi Family Trust",
    client: "Vikram Sethi",
    court: "City Civil Court, Bengaluru",
    judge: "Hon'ble Judge R. Padmavathi",
    firNumber: "N/A — Original Suit",
    caseType: "Property",
    status: "Active",
    priority: "Medium",
    nextHearing: "2026-08-14",
    lastUpdated: "2026-07-28T08:20:00Z",
    filedOn: "2023-11-02",
    statutes: ["Transfer of Property Act §54", "Specific Relief Act §34"],
    documentsCount: 61,
    leadCounsel: "Adv. Harish Bhat",
    summary:
      "Partition and declaration of title over 4.2 acres of ancestral land at Yelahanka; contested settlement deed of 1998.",
  },
  {
    id: "c-1005",
    caseNumber: "CRL.M.C. 771/2026",
    title: "State (NCT of Delhi) v. Faizan Qureshi",
    client: "Faizan Qureshi",
    court: "Delhi High Court",
    judge: "Hon'ble Justice Anish Dayal",
    firNumber: "FIR 0119/2026, PS Karol Bagh",
    caseType: "Criminal",
    status: "Active",
    priority: "High",
    nextHearing: "2026-08-05",
    lastUpdated: "2026-08-02T06:48:00Z",
    filedOn: "2026-02-14",
    statutes: ["BNS §316(2)", "BNSS §482"],
    documentsCount: 23,
    leadCounsel: "Adv. Ritu Ahluwalia",
    summary:
      "Petition for quashing of criminal proceedings arising out of a settled commercial dispute between former business partners.",
  },
  {
    id: "c-1006",
    caseNumber: "ITA 604/2025",
    title: "Sundara Infratech Ltd. v. Commissioner of Income Tax",
    client: "Sundara Infratech Ltd.",
    court: "ITAT, Chennai Bench",
    judge: "Hon'ble Member (Judicial) S. Balakrishnan",
    firNumber: "N/A — Tax Appeal",
    caseType: "Tax",
    status: "Appeal Filed",
    priority: "Medium",
    nextHearing: "2026-09-01",
    lastUpdated: "2026-07-25T16:30:00Z",
    filedOn: "2025-08-30",
    statutes: ["Income Tax Act §14A", "Income Tax Act §271(1)(c)"],
    documentsCount: 154,
    leadCounsel: "Adv. Deepak Srinivasan",
    summary:
      "Disallowance of expenditure attributable to exempt income for AY 2021-22 and levy of concealment penalty.",
  },
  {
    id: "c-1007",
    caseNumber: "HMA 2210/2024",
    title: "Ananya Rao v. Karthik Rao",
    client: "Ananya Rao",
    court: "Family Court, Hyderabad",
    judge: "Hon'ble Judge M. Lakshmi Prasanna",
    firNumber: "FIR 88/2024, PS Banjara Hills",
    caseType: "Family",
    status: "Under Trial",
    priority: "High",
    nextHearing: "2026-08-08",
    lastUpdated: "2026-07-31T13:12:00Z",
    filedOn: "2024-07-19",
    statutes: ["Hindu Marriage Act §13(1)(ia)", "DV Act §12"],
    documentsCount: 39,
    leadCounsel: "Adv. Priya Nambiar",
    summary:
      "Petition for dissolution of marriage on grounds of cruelty, consolidated with interim maintenance and custody applications.",
  },
  {
    id: "c-1008",
    caseNumber: "LCA 145/2025",
    title: "Chandrapur Mine Workers Union v. Everest Minerals",
    client: "Chandrapur Mine Workers Union",
    court: "Industrial Tribunal, Nagpur",
    judge: "Hon'ble Presiding Officer V. K. Deshpande",
    firNumber: "N/A — Industrial Dispute",
    caseType: "Labour",
    status: "Active",
    priority: "Medium",
    nextHearing: "2026-08-21",
    lastUpdated: "2026-07-22T10:00:00Z",
    filedOn: "2025-04-11",
    statutes: ["Industrial Disputes Act §25F", "IR Code §62"],
    documentsCount: 74,
    leadCounsel: "Adv. Sameer Joshi",
    summary:
      "Reference concerning retrenchment of 212 contract workmen without statutory compensation or prior notice.",
  },
  {
    id: "c-1009",
    caseNumber: "CRL.A. 90/2022",
    title: "State of Kerala v. Joseph Mathai",
    client: "Joseph Mathai",
    court: "Kerala High Court",
    judge: "Hon'ble Justice Bechu Kurian Thomas",
    firNumber: "FIR 447/2021, PS Ernakulam Central",
    caseType: "Criminal",
    status: "Disposed",
    priority: "Low",
    nextHearing: "2026-09-15",
    lastUpdated: "2026-06-18T09:00:00Z",
    filedOn: "2022-01-27",
    statutes: ["IPC §304A", "MV Act §184"],
    documentsCount: 30,
    leadCounsel: "Adv. Leena George",
    summary:
      "Appeal against conviction for rash and negligent driving; sentence modified to fine with compensation to the claimants.",
  },
  {
    id: "c-1010",
    caseNumber: "ARB.P. 512/2026",
    title: "Helios Renewables v. Rajasthan State Power Corp.",
    client: "Helios Renewables Pvt. Ltd.",
    court: "Rajasthan High Court, Jaipur Bench",
    judge: "Hon'ble Justice Sudesh Bansal",
    firNumber: "N/A — Arbitration Petition",
    caseType: "Corporate",
    status: "Active",
    priority: "Critical",
    nextHearing: "2026-08-04",
    lastUpdated: "2026-08-02T07:55:00Z",
    filedOn: "2026-03-05",
    statutes: ["Arbitration & Conciliation Act §11", "Electricity Act §86"],
    documentsCount: 96,
    leadCounsel: "Sr. Adv. Arjun Malhotra",
    summary:
      "Appointment of an arbitral tribunal for a tariff dispute under a 25-year solar power purchase agreement.",
  },
  {
    id: "c-1011",
    caseNumber: "W.P. (C) 4471/2026",
    title: "Ganga Riverfront Collective v. State of Uttar Pradesh",
    client: "Ganga Riverfront Collective",
    court: "Allahabad High Court",
    judge: "Hon'ble Justice Saumitra Dayal Singh",
    firNumber: "N/A — Public Interest Litigation",
    caseType: "Constitutional",
    status: "Stayed",
    priority: "High",
    nextHearing: "2026-08-27",
    lastUpdated: "2026-07-15T12:25:00Z",
    filedOn: "2026-01-30",
    statutes: ["Environment Protection Act §5", "Constitution Art. 48A"],
    documentsCount: 58,
    leadCounsel: "Adv. Nikhil Bansal",
    summary:
      "PIL against unregulated riverbed mining; interim stay on fresh lease allotments pending NGT expert committee report.",
  },
  {
    id: "c-1012",
    caseNumber: "C.C. 1188/2025",
    title: "SEBI v. Zephyr Capital Advisors",
    client: "Zephyr Capital Advisors LLP",
    court: "Special Court (SEBI), Mumbai",
    judge: "Hon'ble Special Judge P. R. Sawant",
    firNumber: "FIR 62/2025, EOW Mumbai",
    caseType: "Corporate",
    status: "Under Trial",
    priority: "Critical",
    nextHearing: "2026-08-13",
    lastUpdated: "2026-08-01T18:05:00Z",
    filedOn: "2025-09-16",
    statutes: ["SEBI Act §12A", "PFUTP Regulations Reg. 4"],
    documentsCount: 210,
    leadCounsel: "Sr. Adv. Kavita Menon",
    summary:
      "Prosecution for alleged front-running and unregistered investment advisory across 14 client portfolios.",
  },
  {
    id: "c-1013",
    caseNumber: "O.A. 338/2026",
    title: "Lt. Col. (Retd.) Balbir Singh v. Ministry of Defence",
    client: "Lt. Col. (Retd.) Balbir Singh",
    court: "Armed Forces Tribunal, Chandigarh",
    judge: "Hon'ble Justice Dharam Chand Chaudhary",
    firNumber: "N/A — Original Application",
    caseType: "Civil",
    status: "Active",
    priority: "Medium",
    nextHearing: "2026-08-18",
    lastUpdated: "2026-07-27T15:40:00Z",
    filedOn: "2026-02-02",
    statutes: ["Army Act §164", "Pension Regulations Reg. 173"],
    documentsCount: 41,
    leadCounsel: "Adv. Harish Bhat",
    summary:
      "Claim for disability pension denied on the ground that the ailment was not attributable to military service.",
  },
  {
    id: "c-1014",
    caseNumber: "CRL.REV. 233/2025",
    title: "State of Gujarat v. Hetal Parmar",
    client: "Hetal Parmar",
    court: "Gujarat High Court",
    judge: "Hon'ble Justice Divyesh A. Joshi",
    firNumber: "FIR 305/2024, PS Navrangpura",
    caseType: "Criminal",
    status: "Appeal Filed",
    priority: "High",
    nextHearing: "2026-08-25",
    lastUpdated: "2026-07-29T09:35:00Z",
    filedOn: "2025-05-21",
    statutes: ["NI Act §138", "BNSS §397"],
    documentsCount: 27,
    leadCounsel: "Adv. Ritu Ahluwalia",
    summary:
      "Revision against summary conviction in a cheque dishonour matter involving nine instruments totalling ₹1.7 crore.",
  },
  {
    id: "c-1015",
    caseNumber: "C.S. 902/2024",
    title: "Marigold Publishing House v. Inkwell Digital Media",
    client: "Marigold Publishing House",
    court: "Madras High Court",
    judge: "Hon'ble Justice Senthilkumar Ramamoorthy",
    firNumber: "N/A — Civil Suit",
    caseType: "Civil",
    status: "Under Trial",
    priority: "Low",
    nextHearing: "2026-09-08",
    lastUpdated: "2026-07-11T11:50:00Z",
    filedOn: "2024-10-04",
    statutes: ["Copyright Act §51", "Copyright Act §55"],
    documentsCount: 66,
    leadCounsel: "Adv. Leena George",
    summary:
      "Infringement action over unlicensed audiobook adaptations of eleven titles distributed on subscription platforms.",
  },
];

export const caseStatuses: CaseStatus[] = [
  "Active",
  "Under Trial",
  "Reserved for Judgment",
  "Disposed",
  "Stayed",
  "Appeal Filed",
];

export const caseTypes: CaseType[] = [
  "Criminal",
  "Civil",
  "Corporate",
  "Family",
  "Constitutional",
  "Tax",
  "Labour",
  "Property",
];

export const courts: string[] = Array.from(new Set(cases.map((c) => c.court))).sort();
