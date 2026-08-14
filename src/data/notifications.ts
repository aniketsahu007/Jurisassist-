export type NotificationType =
  | "Upcoming Hearing"
  | "Deadline Alert"
  | "New Similar Judgment"
  | "Document Processed"
  | "AI Report Ready";

export interface CenterNotification {
  id: string;
  type: NotificationType;
  title: string;
  detail: string;
  caseNumber: string;
  caseName: string;
  timestamp: string;
  read: boolean;
  priority: "high" | "medium" | "low";
}

export const notificationCenter: CenterNotification[] = [
  {
    id: "n-1",
    type: "Upcoming Hearing",
    title: "Bail hearing listed before Justice A. S. Kulkarni",
    detail:
      "Item 14, Court No. 27, Bombay High Court — 11 Aug 2026 at 10:30 AM. Written submissions on Section 439 CrPC to be circulated 48 hours in advance.",
    caseNumber: "CRL.A. 482/2024",
    caseName: "State of Maharashtra v. Rohan Deshmukh",
    timestamp: "2026-08-09T03:10:00Z",
    read: false,
    priority: "high",
  },
  {
    id: "n-2",
    type: "Deadline Alert",
    title: "Reply affidavit due in 3 days",
    detail:
      "SEBI's rejoinder to the show-cause reply must be filed by 12 Aug 2026 under Regulation 25(3). Draft is at 60% completion in the workspace.",
    caseNumber: "C.C. 1188/2025",
    caseName: "SEBI v. Zephyr Capital Advisors",
    timestamp: "2026-08-08T14:20:00Z",
    read: false,
    priority: "high",
  },
  {
    id: "n-3",
    type: "New Similar Judgment",
    title: "Supreme Court judgment matches your Section 65B proposition",
    detail:
      "Arjun Panicker v. State of Kerala (2026) 4 SCC 219 reaffirms Anvar P.V. v. P.K. Basheer on certification of electronic evidence. Relevance 94%.",
    caseNumber: "CRL.M.C. 771/2026",
    caseName: "State (NCT of Delhi) v. Faizan Qureshi",
    timestamp: "2026-08-08T09:05:00Z",
    read: false,
    priority: "medium",
  },
  {
    id: "n-4",
    type: "Document Processed",
    title: "Chargesheet OCR and entity extraction complete",
    detail:
      "412 pages parsed, 68 entities extracted (23 persons, 14 statutes, 9 locations). 4 pages flagged as low-confidence scans for manual review.",
    caseNumber: "CRL.A. 482/2024",
    caseName: "State of Maharashtra v. Rohan Deshmukh",
    timestamp: "2026-08-07T18:42:00Z",
    read: true,
    priority: "low",
  },
  {
    id: "n-5",
    type: "AI Report Ready",
    title: "Full case analysis report generated",
    detail:
      "Executive summary, contradictions (6 detected), missing evidence checklist and risk analysis are ready. Overall confidence score: 82%.",
    caseNumber: "ARB.P. 512/2026",
    caseName: "Helios Renewables v. Rajasthan State Power Corp.",
    timestamp: "2026-08-07T11:15:00Z",
    read: false,
    priority: "medium",
  },
  {
    id: "n-6",
    type: "Upcoming Hearing",
    title: "Arbitral tribunal sitting — procedural order No. 4",
    detail:
      "Hybrid sitting at Delhi International Arbitration Centre on 18 Aug 2026, 2:00 PM. Cross-examination of RSPCL's technical witness scheduled.",
    caseNumber: "ARB.P. 512/2026",
    caseName: "Helios Renewables v. Rajasthan State Power Corp.",
    timestamp: "2026-08-06T08:30:00Z",
    read: true,
    priority: "medium",
  },
  {
    id: "n-7",
    type: "Deadline Alert",
    title: "Limitation for appeal expires in 9 days",
    detail:
      "Appeal against the order dated 21 Jul 2026 must be filed by 20 Aug 2026 under Section 34(3) of the Arbitration and Conciliation Act, 1996.",
    caseNumber: "O.M.P. 340/2026",
    caseName: "Trident Infra LLP v. NHAI",
    timestamp: "2026-08-05T16:00:00Z",
    read: true,
    priority: "high",
  },
  {
    id: "n-8",
    type: "Document Processed",
    title: "Audio exhibit transcribed with speaker diarisation",
    detail:
      "38-minute call recording transcribed into 214 utterances across 3 speakers; timestamps mapped to the case chronology.",
    caseNumber: "C.C. 1188/2025",
    caseName: "SEBI v. Zephyr Capital Advisors",
    timestamp: "2026-08-05T07:25:00Z",
    read: false,
    priority: "low",
  },
  {
    id: "n-9",
    type: "New Similar Judgment",
    title: "High Court ruling on delayed FIR registration",
    detail:
      "Nandini Rao v. State of Karnataka, Crl.P. 8821/2026 — delay of 26 hours in FIR registration held fatal where medical evidence contradicted the complaint.",
    caseNumber: "S.C. 96/2025",
    caseName: "State of Karnataka v. Prabhakar Shetty",
    timestamp: "2026-08-04T12:48:00Z",
    read: true,
    priority: "low",
  },
  {
    id: "n-10",
    type: "AI Report Ready",
    title: "Contradiction digest refreshed after new upload",
    detail:
      "Two fresh inconsistencies detected between PW-3's Section 161 CrPC statement and the seizure memo dated 14 Mar 2024.",
    caseNumber: "CRL.A. 482/2024",
    caseName: "State of Maharashtra v. Rohan Deshmukh",
    timestamp: "2026-08-03T19:05:00Z",
    read: false,
    priority: "medium",
  },
  {
    id: "n-11",
    type: "Upcoming Hearing",
    title: "Framing of charges — Sessions Court, Pune",
    detail:
      "Listed 24 Aug 2026 before Additional Sessions Judge S. R. Bhagat. Discharge application under Section 227 CrPC pending consideration.",
    caseNumber: "S.C. 412/2026",
    caseName: "State of Maharashtra v. Ameya Kulkarni",
    timestamp: "2026-08-03T06:12:00Z",
    read: true,
    priority: "medium",
  },
  {
    id: "n-12",
    type: "Document Processed",
    title: "Bank statement bundle indexed",
    detail:
      "1,842 transactions normalised and cross-linked to the forensic audit annexure; 17 flagged as matching the alleged layering pattern.",
    caseNumber: "C.C. 1188/2025",
    caseName: "SEBI v. Zephyr Capital Advisors",
    timestamp: "2026-08-02T10:40:00Z",
    read: true,
    priority: "low",
  },
];
