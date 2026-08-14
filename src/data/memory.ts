export interface PastCaseMemory {
  id: string;
  title: string;
  court: string;
  year: number;
  outcome: "Won" | "Lost" | "Settled" | "Ongoing";
  takeaway: string;
}

export interface StrategyMemory {
  id: string;
  name: string;
  context: string;
  timesUsed: number;
  successRate: number;
}

export interface ArgumentMemory {
  id: string;
  argument: string;
  acceptedBy: string;
  caseRef: string;
  strength: number;
}

export interface SectionUsage {
  id: string;
  section: string;
  act: string;
  uses: number;
  lastUsed: string;
}

export interface SavedNote {
  id: string;
  title: string;
  body: string;
  tags: string[];
  savedAt: string;
}

export interface VectorHit {
  id: string;
  snippet: string;
  source: string;
  kind: "Judgment" | "Note" | "Draft" | "Hearing brief";
  similarity: number;
}

export const pastCases: PastCaseMemory[] = [
  {
    id: "pc-1",
    title: "State of Maharashtra v. Rohan Deshmukh",
    court: "Sessions Court, Mumbai",
    year: 2024,
    outcome: "Ongoing",
    takeaway:
      "Prosecution's CDR bundle lacks a 65B certificate — the same defect that carried the day in Aakash Vernekar.",
  },
  {
    id: "pc-2",
    title: "SEBI v. Zephyr Capital Advisors",
    court: "Bombay High Court",
    year: 2023,
    outcome: "Won",
    takeaway:
      "Forensic audit report obtained without notice to the noticee was excluded; regulator conceded on the second date.",
  },
  {
    id: "pc-3",
    title: "Sahyadri Steel Pvt. Ltd. v. Kalyani Infratech",
    court: "Delhi High Court",
    year: 2022,
    outcome: "Settled",
    takeaway:
      "Interim compensation under S. 143A was capped at 8% after we filed audited balance sheets showing negative working capital.",
  },
  {
    id: "pc-4",
    title: "Nikhil Rane v. State of Karnataka",
    court: "Karnataka High Court",
    year: 2022,
    outcome: "Won",
    takeaway: "Second-FIR argument under Bhajan Lal category (3) succeeded without oral evidence.",
  },
  {
    id: "pc-5",
    title: "Meher Pharmachem Ltd. v. Union of India",
    court: "Delhi High Court",
    year: 2021,
    outcome: "Lost",
    takeaway:
      "Delay argument failed because the show-cause notice trail showed continuous correspondence.",
  },
];

export const strategies: StrategyMemory[] = [
  {
    id: "st-1",
    name: "Attack admissibility before merits",
    context: "Digital-evidence heavy prosecutions (CDRs, server logs, WhatsApp exports)",
    timesUsed: 14,
    successRate: 79,
  },
  {
    id: "st-2",
    name: "Civil-flavour framing for quashing",
    context: "Commercial disputes dressed up as S. 420 IPC FIRs",
    timesUsed: 11,
    successRate: 72,
  },
  {
    id: "st-3",
    name: "Cooperation record before bail",
    context: "Economic offences where documents are already seized",
    timesUsed: 9,
    successRate: 67,
  },
  {
    id: "st-4",
    name: "Chain-of-custody cross-examination",
    context: "Seizure panchnamas with unsigned or late-signed entries",
    timesUsed: 8,
    successRate: 63,
  },
  {
    id: "st-5",
    name: "Parity with co-accused",
    context: "Multi-accused chargesheets where similarly placed persons are on bail",
    timesUsed: 6,
    successRate: 50,
  },
];

export const successfulArguments: ArgumentMemory[] = [
  {
    id: "ar-1",
    argument:
      "Printouts of call detail records are secondary evidence; without the 65B(4) certificate they cannot be read even if the nodal officer deposes.",
    acceptedBy: "Justice Revati Mohite Dere",
    caseRef: "State of Maharashtra v. Aakash Vernekar (2023)",
    strength: 94,
  },
  {
    id: "ar-2",
    argument:
      "Where the entire transaction is governed by a written contract with an arbitration clause, criminal process is an abuse under Bhajan Lal category (7).",
    acceptedBy: "Justice A.S. Oka",
    caseRef: "Nikhil Rane v. State of Karnataka (2022)",
    strength: 88,
  },
  {
    id: "ar-3",
    argument:
      "Custodial interrogation serves no purpose once the account statements and ledgers stand seized under panchnama.",
    acceptedBy: "Justice S. Ravindra Bhat",
    caseRef: "Sanjay Chandra line of cases",
    strength: 83,
  },
  {
    id: "ar-4",
    argument:
      "Interim compensation under S. 143A NI Act requires reasons recorded on the drawer's financial capacity.",
    acceptedBy: "Justice Prathiba M. Singh",
    caseRef: "Kalyani Infratech (2021)",
    strength: 77,
  },
];

export const frequentSections: SectionUsage[] = [
  { id: "sec-1", section: "S. 65B", act: "Indian Evidence Act, 1872", uses: 38, lastUsed: "2026-07-28" },
  { id: "sec-2", section: "S. 482", act: "Code of Criminal Procedure, 1973", uses: 31, lastUsed: "2026-07-21" },
  { id: "sec-3", section: "S. 438", act: "Code of Criminal Procedure, 1973", uses: 27, lastUsed: "2026-08-01" },
  { id: "sec-4", section: "S. 420", act: "Indian Penal Code, 1860", uses: 24, lastUsed: "2026-07-30" },
  { id: "sec-5", section: "S. 409", act: "Indian Penal Code, 1860", uses: 18, lastUsed: "2026-06-17" },
  { id: "sec-6", section: "S. 45", act: "Prevention of Money Laundering Act, 2002", uses: 12, lastUsed: "2026-05-09" },
];

export const savedNotes: SavedNote[] = [
  {
    id: "nt-1",
    title: "Mohite Dere J. — bench preferences",
    body: "Prefers a one-page synopsis with dates in the left margin. Impatient with paragraph-long citations; wants the proposition first, the citation after.",
    tags: ["Bombay HC", "Bench notes"],
    savedAt: "2026-07-24",
  },
  {
    id: "nt-2",
    title: "65B certificate checklist",
    body: "Identify device, describe lawful custody, state the record was produced in the ordinary course, sign by a person occupying a responsible official position. Missing any limb invites an Anvar objection.",
    tags: ["Evidence", "Checklist"],
    savedAt: "2026-07-11",
  },
  {
    id: "nt-3",
    title: "Deshmukh — limitation window",
    body: "Revision against the framing of charge must be filed by 12 August 2026. Certified copy applied for on 29 July; follow up with the copying section.",
    tags: ["Deshmukh", "Deadline"],
    savedAt: "2026-08-02",
  },
  {
    id: "nt-4",
    title: "Zephyr — audit disclosure argument",
    body: "Regulator relied on paragraphs 4.2–4.9 of the forensic audit but never supplied Annexure C. Press for the annexure before responding on merits.",
    tags: ["Zephyr", "Strategy"],
    savedAt: "2026-06-28",
  },
];

export const vectorHits: VectorHit[] = [
  {
    id: "vh-1",
    snippet:
      "…the certificate under sub-section (4) of Section 65B is a condition precedent to admissibility, and oral evidence in place of the certificate is impermissible…",
    source: "Anvar P.V. v. P.K. Basheer, para 22",
    kind: "Judgment",
    similarity: 0.94,
  },
  {
    id: "vh-2",
    snippet:
      "Prosecution CDR bundle at pages 118–164 carries no certificate; the nodal officer's affidavit is dated after the chargesheet.",
    source: "Deshmukh — hearing brief, 14 July 2026",
    kind: "Hearing brief",
    similarity: 0.91,
  },
  {
    id: "vh-3",
    snippet:
      "Where the mirrored disk is not hash-verified at the time of seizure, the chain of custody is broken and the derived logs lose evidentiary value.",
    source: "State of Maharashtra v. Aakash Vernekar, para 31",
    kind: "Judgment",
    similarity: 0.87,
  },
  {
    id: "vh-4",
    snippet:
      "Draft ground (E): That the learned trial court erred in reading Exhibit P-14 without the mandatory certificate, thereby vitiating the finding on conspiracy.",
    source: "Revision petition — working draft v3",
    kind: "Draft",
    similarity: 0.83,
  },
  {
    id: "vh-5",
    snippet:
      "Bench prefers the admissibility objection to be taken at the stage of exhibiting the document, not in final arguments.",
    source: "Saved note — Mohite Dere J. bench preferences",
    kind: "Note",
    similarity: 0.78,
  },
  {
    id: "vh-6",
    snippet:
      "…a party who is unable to obtain the certificate may apply to the court for its production from the person in control of the device…",
    source: "Arjun Panditrao Khotkar, para 59",
    kind: "Judgment",
    similarity: 0.75,
  },
];
