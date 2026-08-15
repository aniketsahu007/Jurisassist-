export type ChatRole = "user" | "assistant";

export type QuickActionId = "summarize" | "contradictions" | "draft" | "similar" | "timeline";

export interface Citation {
  id: string;
  label: string;
  source: string;
  court: string;
  year: string;
  passage: string;
}

export interface Attachment {
  id: string;
  name: string;
  kind: "pdf" | "docx" | "image" | "audio";
  sizeLabel: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  at: string;
  attachments?: Attachment[];
  citations?: Citation[];
}

export interface Conversation {
  id: string;
  title: string;
  caseNumber: string;
  updatedAt: string;
  preview: string;
  messages: ChatMessage[];
}

export const suggestedPrompts: string[] = [
  "What are the strongest grounds of appeal in CRL.A. 482/2024?",
  "Compare the FSL report with the seizure panchanama",
  "Which statutory presumptions apply to the seized digital records?",
  "Draft a short note on delay in filing the chargesheet",
];

export const quickActions: { id: QuickActionId; label: string; prompt: string }[] = [
  {
    id: "summarize",
    label: "Summarize",
    prompt: "Summarize the record in CRL.A. 482/2024 for a first read.",
  },
  {
    id: "contradictions",
    label: "Find Contradictions",
    prompt: "Find contradictions across the witness statements and the chargesheet.",
  },
  {
    id: "draft",
    label: "Generate Draft",
    prompt: "Generate a draft application under BNSS §482 for quashing.",
  },
  {
    id: "similar",
    label: "Find Similar Cases",
    prompt: "Find similar cases on admissibility of electronic evidence.",
  },
  {
    id: "timeline",
    label: "Extract Timeline",
    prompt: "Extract a chronological timeline from the uploaded documents.",
  },
];

const anvarCitation: Citation = {
  id: "cit-1",
  label: "Anvar P.V. v. P.K. Basheer",
  source: "(2014) 10 SCC 473",
  court: "Supreme Court of India",
  year: "2014",
  passage:
    "Electronic records produced as secondary evidence are inadmissible unless accompanied by a certificate satisfying every condition of Section 65B(4).",
};

const arjunPanditCitation: Citation = {
  id: "cit-2",
  label: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal",
  source: "(2020) 7 SCC 1",
  court: "Supreme Court of India",
  year: "2020",
  passage:
    "The certificate is a condition precedent to admissibility; the requirement can be relaxed only where the party is unable to procure it from the person in control of the device.",
};

const bhajanLalCitation: Citation = {
  id: "cit-3",
  label: "State of Haryana v. Bhajan Lal",
  source: "1992 Supp (1) SCC 335",
  court: "Supreme Court of India",
  year: "1992",
  passage:
    "Proceedings may be quashed where the allegations, taken at their highest, do not disclose the commission of any offence or are manifestly attended with mala fides.",
};

export const conversations: Conversation[] = [
  {
    id: "conv-1",
    title: "Admissibility of seized digital records",
    caseNumber: "CRL.A. 482/2024",
    updatedAt: "2026-08-05T04:40:00Z",
    preview: "The §65B certificate was issued 11 months after the seizure…",
    messages: [
      {
        id: "m-1",
        role: "user",
        at: "2026-08-05T04:32:00Z",
        content:
          "Review the seizure of the laptop and external drives in FIR 214/2023 and tell me whether the digital records can be relied upon at trial.",
        attachments: [
          {
            id: "a-1",
            name: "Panchanama_18Aug2023.pdf",
            kind: "pdf",
            sizeLabel: "2.4 MB",
          },
          {
            id: "a-2",
            name: "FSL_Report_MH-CY-1187-2023.pdf",
            kind: "pdf",
            sizeLabel: "5.1 MB",
          },
        ],
      },
      {
        id: "m-2",
        role: "assistant",
        at: "2026-08-05T04:33:00Z",
        content:
          "**Short answer:** the digital records are vulnerable on two independent grounds.\n\n**1. Section 65B certification.** The certificate on record (Annexure P-14) is dated 04 July 2024 — eleven months after the seizure on 18 August 2023 — and is signed by the Investigating Officer rather than by the person in lawful control of the device at the time the copy was made. On the face of it, the certificate does not satisfy clause (c) of §65B(4).\n\n**2. Chain of custody.** The panchanama records two external drives, while the FSL forwarding memo records three exhibit seals. The discrepancy is unexplained in the case diary between 18 and 22 August 2023.\n\n**What follows:** a preliminary objection to marking Exhibits P-14 to P-19 is worth raising before the prosecution evidence closes, rather than in final arguments.",
        citations: [anvarCitation, arjunPanditCitation],
      },
    ],
  },
  {
    id: "conv-2",
    title: "Quashing note — Faizan Qureshi",
    caseNumber: "CRL.M.C. 771/2026",
    updatedAt: "2026-08-04T11:10:00Z",
    preview: "Settlement of a purely commercial dispute supports quashing…",
    messages: [
      {
        id: "m-3",
        role: "user",
        at: "2026-08-04T11:04:00Z",
        content:
          "Both partners have settled. Prepare the core reasoning for a quashing petition under BNSS §482.",
      },
      {
        id: "m-4",
        role: "assistant",
        at: "2026-08-04T11:05:00Z",
        content:
          "The petition should rest on three propositions:\n\n1. The dispute is, in substance, a partnership accounting dispute; the criminal complaint was filed only after the arbitral notice of 19 January 2026.\n2. The complainant has filed an affidavit of settlement dated 22 July 2026 and does not support the prosecution.\n3. Continuation of proceedings would be an abuse of process, no public interest element being involved and the offence being predominantly private in character.\n\nI would avoid pleading falsity of the allegations — the High Court will not test that at this stage.",
        citations: [bhajanLalCitation],
      },
    ],
  },
  {
    id: "conv-3",
    title: "Damages computation — Aurelia Textiles",
    caseNumber: "C.S. (COMM) 118/2025",
    updatedAt: "2026-08-02T15:26:00Z",
    preview: "Clause 9.3 caps consequential damages at the annual freight value…",
    messages: [
      {
        id: "m-5",
        role: "user",
        at: "2026-08-02T15:20:00Z",
        content:
          "Does the limitation of liability clause cap our ₹8.4 crore claim against Northgate Logistics?",
      },
      {
        id: "m-6",
        role: "assistant",
        at: "2026-08-02T15:21:00Z",
        content:
          "Clause 9.3 caps *consequential* damages at the freight charges paid in the preceding twelve months (₹2.71 crore on the invoices at pages 340-372). It does not, on its terms, cap direct loss.\n\nThe claim should therefore be re-pleaded in two heads: ₹5.69 crore as direct loss of cargo value under §73 of the Contract Act, and ₹2.71 crore as capped consequential loss. Pleading a single composite figure invites the entire claim to be read into clause 9.3.",
      },
    ],
  },
  {
    id: "conv-4",
    title: "Precedent scan — disability pension",
    caseNumber: "O.A. 338/2026",
    updatedAt: "2026-07-31T09:02:00Z",
    preview: "Attributability is presumed once the member was found fit at entry…",
    messages: [
      {
        id: "m-7",
        role: "user",
        at: "2026-07-31T08:58:00Z",
        content:
          "Find authority on the presumption of attributability where the officer was declared fit at the time of commissioning.",
      },
      {
        id: "m-8",
        role: "assistant",
        at: "2026-07-31T08:59:00Z",
        content:
          'The settled position is that where a member is found fit at entry, any subsequent disability is presumed to be attributable to or aggravated by service, and the burden lies on the department to rebut it with reasoned medical opinion. The Release Medical Board here records only the words "constitutional disorder" without reasons, which is precisely the defect the courts have repeatedly held to be insufficient.',
      },
    ],
  },
];

interface MockResponse {
  content: string;
  citations?: Citation[];
}

const responseByAction: Record<QuickActionId, MockResponse> = {
  summarize: {
    content:
      "**CRL.A. 482/2024 — record summary**\n\nThe appellant stands convicted under IPC §§420 and 467 for allegedly procuring four conveyance deeds over Plot 17-B, CTS 442, Bandra Reclamation, bearing registration numbers allotted to unrelated instruments. The prosecution rests on (i) the Index-II extracts, (ii) the FSL image of a laptop seized on 18 August 2023, and (iii) the testimony of PW-3, the sub-registrar's clerk.\n\nThe defence case is that the appellant was a bona fide purchaser who received the deeds through a registered facilitator, since absconding, and that no handwriting or signature was ever attributed to him.\n\n**Posture:** appeal against conviction; sentence suspended by order dated 12 March 2025; next listed 11 August 2026 before Hon'ble Justice A. S. Chandurkar.",
  },
  contradictions: {
    content:
      'I found **three material contradictions** in the record:\n\n1. **Seizure count.** The panchanama dated 18 August 2023 lists two external drives; the FSL forwarding memo dated 22 August 2023 records three sealed exhibits.\n2. **Time of arrest.** The arrest memo records 07:15 hrs, while PW-6 (independent pancha) deposed in cross-examination that he reached the premises "a little after nine in the morning".\n3. **Deed custody.** PW-3 stated the originals never left the sub-registrar\'s strong room, yet Exhibit P-9 is a certified copy issued on an application signed by the complainant three days earlier.\n\nContradictions 1 and 3 go to the integrity of the exhibits and are worth pressing; contradiction 2 is likely to be explained as an approximation.',
    citations: [anvarCitation],
  },
  draft: {
    content:
      "**Draft — Application under BNSS §482 (skeleton)**\n\n*In the High Court of Judicature at Bombay, Criminal Application No. ___ of 2026*\n\n1. The applicant is the sole accused in FIR 214/2023 registered at Police Station Bandra for offences punishable under IPC §§420, 467 and 471.\n2. The dispute between the applicant and the second respondent is, in substance, civil and arises out of a registered agreement to sell dated 14 February 2021.\n3. The second respondent has, by affidavit dated 22 July 2026, recorded a full and final settlement and does not wish to support the prosecution.\n4. No public interest element is involved and continuation of the proceedings would be an abuse of the process of this Hon'ble Court.\n\n**Prayer:** to quash FIR 214/2023 and all proceedings arising therefrom, and to grant such further relief as the nature of the case may require.\n\nI have left the verification and the list of annexures for you to complete.",
    citations: [bhajanLalCitation],
  },
  similar: {
    content:
      "**Four closely comparable matters** from the precedent index:\n\n1. *Anvar P.V. v. P.K. Basheer* — the governing authority on §65B; directly applicable to Exhibits P-14 to P-19.\n2. *Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal* — clarifies when the certificate requirement may be relaxed; note the caveat on parties who could have procured it.\n3. *Sonu v. State of Haryana*, (2017) 8 SCC 570 — objection to mode of proof must be taken at the time of marking; supports raising the objection before evidence closes.\n4. *Ravinder Singh v. State of Punjab*, 2022 SCC OnLine SC 1381 — unexplained breaks in the chain of custody of seized electronic devices.",
    citations: [anvarCitation, arjunPanditCitation],
  },
  timeline: {
    content:
      "**Extracted chronology — CRL.A. 482/2024**\n\n| Date | Event |\n| --- | --- |\n| 12 May 2021 | Impugned conveyance deeds executed |\n| 09 Aug 2023 | FIR 214/2023 registered at PS Bandra |\n| 18 Aug 2023 | Arrest, seizure of laptop and two drives |\n| 05 Sep 2023 | Bail granted on surety of ₹5,00,000 |\n| 14 Sep 2023 | Final report filed under BNSS §193 |\n| 04 Jul 2024 | §65B certificate issued (11 months post-seizure) |\n| 12 Mar 2025 | Sentence suspended pending appeal |\n| 11 Aug 2026 | Next listed for final hearing |\n\nThe eleven-month gap before the certificate is the single most exploitable interval in this chronology.",
  },
};

const genericResponses: MockResponse[] = [
  {
    content:
      "Reading the record as it stands, the point turns on the mode of proof rather than on the substance of the allegation. The prosecution has produced the printouts without the accompanying certificate contemplated by §65B(4), and the objection was not waived because the defence recorded it in the roznama of 09 January 2026.\n\nI would press this as a preliminary objection before the prosecution evidence is closed, and keep the merits argument in reserve.",
    citations: [anvarCitation],
  },
  {
    content:
      "Two threads in the material are worth separating.\n\nFirst, on limitation: the cause of action crystallised on 30 September 2024 when the final invoice was repudiated, which keeps the suit comfortably within three years.\n\nSecond, on quantum: the ledger at pages 214-238 supports ₹5.69 crore as direct loss, while the balance is consequential and subject to the contractual cap. Pleading these separately protects the larger head from the limitation clause.",
  },
  {
    content:
      "The record does not currently contain anything that establishes the appellant's authorship of the impugned instruments. There is no handwriting comparison, no signature admission, and the sub-registrar's clerk (PW-3) did not identify him in the dock.\n\nOn that footing the conviction rests entirely on the recovery of the template files, which brings us back to the admissibility of the FSL image — the weakest link in the prosecution case.",
    citations: [arjunPanditCitation],
  },
];

let genericIndex = 0;

export function mockAssistantResponse(prompt: string, action?: QuickActionId): MockResponse {
  if (action) return responseByAction[action];
  const p = prompt.toLowerCase();
  if (p.includes("contradict")) return responseByAction.contradictions;
  if (p.includes("draft")) return responseByAction.draft;
  if (p.includes("similar") || p.includes("precedent")) return responseByAction.similar;
  if (p.includes("timeline") || p.includes("chronolog")) return responseByAction.timeline;
  if (p.includes("summar")) return responseByAction.summarize;
  const res = genericResponses[genericIndex % genericResponses.length]!;
  genericIndex += 1;
  return res;
}
