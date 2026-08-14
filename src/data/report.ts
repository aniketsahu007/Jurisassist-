export interface ReportFact {
  id: string;
  fact: string;
  source: string;
  confidence: number;
}

export interface LegalIssue {
  id: string;
  issue: string;
  position: string;
  strength: "Strong" | "Arguable" | "Weak";
}

export interface MissingEvidence {
  id: string;
  item: string;
  why: string;
  urgency: "Critical" | "High" | "Medium";
}

export interface Contradiction {
  id: string;
  statementA: string;
  sourceA: string;
  statementB: string;
  sourceB: string;
  severity: "High" | "Medium" | "Low";
}

export interface Precedent {
  id: string;
  title: string;
  citation: string;
  court: string;
  relevance: number;
  proposition: string;
}

export interface DraftSuggestion {
  id: string;
  title: string;
  body: string;
}

export interface RiskItem {
  id: string;
  label: string;
  score: number;
  note: string;
}

export interface ReportTimelineItem {
  id: string;
  date: string;
  label: string;
  note: string;
}

export interface CaseReport {
  id: string;
  caseNumber: string;
  caseTitle: string;
  court: string;
  generatedAt: string;
  model: string;
  pagesAnalysed: number;
  documentsAnalysed: number;
  confidence: number;
  executiveSummary: string[];
  timeline: ReportTimelineItem[];
  facts: ReportFact[];
  issues: LegalIssue[];
  missingEvidence: MissingEvidence[];
  contradictions: Contradiction[];
  precedents: Precedent[];
  drafts: DraftSuggestion[];
  risks: RiskItem[];
}

export const caseReport: CaseReport = {
  id: "rep-4471",
  caseNumber: "CRL.A. 482/2024",
  caseTitle: "State of Maharashtra v. Rohan Deshmukh",
  court: "Bombay High Court",
  generatedAt: "2026-08-05T04:10:00Z",
  model: "Lexora Analysis Engine v3.2",
  pagesAnalysed: 1_284,
  documentsAnalysed: 47,
  confidence: 82,
  executiveSummary: [
    "The appeal challenges a conviction under IPC §§420 and 467 arising out of four conveyance deeds over Plot 17-B, CTS 442, Bandra Reclamation, which the prosecution says bore registration numbers allotted to unrelated instruments.",
    "The prosecution case rests almost entirely on the forensic image of a laptop seized on 18 August 2023. The §65B(4) certificate supporting that image was issued on 04 July 2024 and is signed by the Investigating Officer rather than the person in lawful control of the device — a defect that goes to admissibility, not merely to weight.",
    "No handwriting comparison, signature admission or dock identification connects the appellant to the impugned instruments. If Exhibits P-14 to P-19 are excluded, the residue of the prosecution evidence is unlikely to sustain the conviction.",
    "The recommended course is a preliminary objection to the mode of proof before the appeal is argued on merits, supported by the unexplained discrepancy in the number of seized drives.",
  ],
  timeline: [
    {
      id: "rt-1",
      date: "2021-05-12",
      label: "Impugned deeds executed",
      note: "Deeds BDR-4/8821/2021 to BDR-4/8824/2021 presented for registration.",
    },
    {
      id: "rt-2",
      date: "2023-08-09",
      label: "FIR 214/2023 registered",
      note: "PS Bandra; IPC §§420, 467, 471 on the complaint of M/s Sundaram Realty LLP.",
    },
    {
      id: "rt-3",
      date: "2023-08-18",
      label: "Arrest and seizure",
      note: "Laptop and two external drives seized under panchanama; remand granted the same evening.",
    },
    {
      id: "rt-4",
      date: "2023-09-14",
      label: "Final report filed",
      note: "Chargesheet under BNSS §193 with 22 listed witnesses.",
    },
    {
      id: "rt-5",
      date: "2024-07-04",
      label: "§65B certificate issued",
      note: "Eleven months after the seizure; signed by the Investigating Officer.",
    },
    {
      id: "rt-6",
      date: "2025-03-12",
      label: "Sentence suspended",
      note: "Appeal admitted; appellant released on bail pending disposal.",
    },
    {
      id: "rt-7",
      date: "2026-08-11",
      label: "Next listed for final hearing",
      note: "Before Hon'ble Justice A. S. Chandurkar.",
    },
  ],
  facts: [
    {
      id: "f-1",
      fact: "Four conveyance deeds were registered on 12 May 2021 bearing serial numbers already allotted to instruments from Andheri sub-district.",
      source: "Index-II extract, Exhibit P-4 (pages 88-96)",
      confidence: 94,
    },
    {
      id: "f-2",
      fact: "The laptop and two external drives were seized on 18 August 2023 in the presence of two independent panchas.",
      source: "Panchanama dated 18 Aug 2023, Exhibit P-11",
      confidence: 91,
    },
    {
      id: "f-3",
      fact: "The FSL forwarding memo records three sealed exhibits, one more than the panchanama.",
      source: "FSL memo MH-CY/1187/2023 (page 412)",
      confidence: 88,
    },
    {
      id: "f-4",
      fact: "The appellant paid ₹1.9 crore by banking channels to a facilitator, Mr. Prashant Wagh, who has since absconded.",
      source: "Bank statement, Exhibit D-3 (pages 604-611)",
      confidence: 86,
    },
    {
      id: "f-5",
      fact: "PW-3, the sub-registrar's clerk, did not identify the appellant during examination-in-chief.",
      source: "Deposition dated 19 Nov 2025 (pages 902-914)",
      confidence: 97,
    },
  ],
  issues: [
    {
      id: "i-1",
      issue: "Whether the forensic image of the seized laptop is admissible without a compliant §65B(4) certificate.",
      position:
        "The certificate is signed by the Investigating Officer eleven months after seizure and does not identify the device in lawful control at the time of copying.",
      strength: "Strong",
    },
    {
      id: "i-2",
      issue: "Whether the break in the chain of custody between 18 and 22 August 2023 vitiates the recovery.",
      position:
        "The case diary is silent for four days and the exhibit count differs between the panchanama and the FSL memo.",
      strength: "Strong",
    },
    {
      id: "i-3",
      issue: "Whether authorship of the impugned instruments has been proved against the appellant.",
      position:
        "No handwriting comparison under §45 was sought and no signature was admitted or proved.",
      strength: "Arguable",
    },
    {
      id: "i-4",
      issue: "Whether the appellant can claim protection as a bona fide purchaser for value.",
      position:
        "Consideration is documented, but the facilitator's absconding weakens the plea of due diligence.",
      strength: "Weak",
    },
  ],
  missingEvidence: [
    {
      id: "me-1",
      item: "Hash values of the seized drives recorded at the point of seizure",
      why: "Without a seizure-stage hash, the integrity of the FSL image cannot be independently verified.",
      urgency: "Critical",
    },
    {
      id: "me-2",
      item: "Case diary entries for 19-22 August 2023",
      why: "Fills the custody gap between seizure and forensic deposit.",
      urgency: "Critical",
    },
    {
      id: "me-3",
      item: "Sub-registrar's server audit log for 12 May 2021",
      why: "Would establish whether the duplicate serial numbers originated inside the registry system.",
      urgency: "High",
    },
    {
      id: "me-4",
      item: "Handwriting expert opinion on the endorsement pages",
      why: "Currently no expert material connects the appellant to the instruments.",
      urgency: "Medium",
    },
  ],
  contradictions: [
    {
      id: "cd-1",
      statementA: "Two external hard drives were seized and sealed.",
      sourceA: "Panchanama dated 18 Aug 2023, page 3",
      statementB: "Three sealed exhibits were received for forensic examination.",
      sourceB: "FSL forwarding memo dated 22 Aug 2023",
      severity: "High",
    },
    {
      id: "cd-2",
      statementA: "The arrest was effected at 07:15 hrs.",
      sourceA: "Arrest memo, Exhibit P-10",
      statementB: "The pancha reached the premises 'a little after nine in the morning'.",
      sourceB: "PW-6, cross-examination dated 04 Feb 2026",
      severity: "Medium",
    },
    {
      id: "cd-3",
      statementA: "The original deeds never left the strong room.",
      sourceA: "PW-3, examination-in-chief",
      statementB: "Certified copies were issued on an application signed three days earlier.",
      sourceB: "Exhibit P-9, issuance endorsement",
      severity: "High",
    },
  ],
  precedents: [
    {
      id: "p-1",
      title: "Anvar P.V. v. P.K. Basheer",
      citation: "(2014) 10 SCC 473",
      court: "Supreme Court of India",
      relevance: 96,
      proposition:
        "Secondary electronic evidence is inadmissible without a certificate satisfying every condition of §65B(4).",
    },
    {
      id: "p-2",
      title: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal",
      citation: "(2020) 7 SCC 1",
      court: "Supreme Court of India",
      relevance: 93,
      proposition:
        "The certificate is a condition precedent; relaxation is confined to parties unable to procure it.",
    },
    {
      id: "p-3",
      title: "Sonu v. State of Haryana",
      citation: "(2017) 8 SCC 570",
      court: "Supreme Court of India",
      relevance: 81,
      proposition:
        "Objections to the mode of proof must be raised when the document is tendered in evidence.",
    },
    {
      id: "p-4",
      title: "Ravinder Singh v. State of Punjab",
      citation: "2022 SCC OnLine SC 1381",
      court: "Supreme Court of India",
      relevance: 74,
      proposition:
        "Unexplained gaps in the custody of seized articles entitle the accused to the benefit of doubt.",
    },
  ],
  drafts: [
    {
      id: "dr-1",
      title: "Preliminary objection to Exhibits P-14 to P-19",
      body: "It is respectfully submitted that the certificate at Annexure P-14, being dated 04 July 2024 and signed by the Investigating Officer, does not satisfy clause (c) of Section 65B(4), the deponent not having been in lawful control of the device at the time the copy was produced. The exhibits are therefore liable to be excluded from consideration.",
    },
    {
      id: "dr-2",
      title: "Application for production of case diary entries",
      body: "The applicant seeks a direction to the prosecution to produce the case diary entries for the period 19 to 22 August 2023, the same being necessary to establish the continuity of custody of the articles seized under the panchanama dated 18 August 2023.",
    },
    {
      id: "dr-3",
      title: "Ground of appeal on authorship",
      body: "The learned trial court erred in convicting the appellant in the absence of any expert opinion under Section 45 of the Evidence Act, no handwriting or signature having been attributed to the appellant on any of the impugned instruments.",
    },
  ],
  risks: [
    {
      id: "r-1",
      label: "Adverse finding on admissibility",
      score: 28,
      note: "The certificate defect is on the face of the record; the risk is largely limited to the court permitting a fresh certificate.",
    },
    {
      id: "r-2",
      label: "Prosecution cures the custody gap",
      score: 46,
      note: "The case diary may explain the four-day interval; prepare a fallback on the exhibit count discrepancy.",
    },
    {
      id: "r-3",
      label: "Delay in disposal beyond 2027",
      score: 61,
      note: "The roster change in December 2026 may require re-argument before a different bench.",
    },
    {
      id: "r-4",
      label: "Costs exposure on the civil side",
      score: 34,
      note: "A parallel suit by the complainant firm may follow an unfavourable finding on possession.",
    },
  ],
};
