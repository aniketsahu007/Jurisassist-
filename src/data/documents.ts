export type DocumentKind = "pdf" | "image" | "docx" | "audio" | "video";

export type UploadStatus = "queued" | "uploading" | "processing" | "success" | "error";

export interface UploadedFile {
  id: string;
  name: string;
  kind: DocumentKind;
  sizeLabel: string;
  caseNumber: string;
  caseTitle: string;
  uploadedBy: string;
  uploadedAt: string;
  pages: number;
  status: Exclude<UploadStatus, "queued" | "uploading">;
  note: string;
}

export const acceptedFormats: { kind: DocumentKind; label: string; extensions: string }[] = [
  { kind: "pdf", label: "Pleadings & orders", extensions: ".pdf" },
  { kind: "image", label: "Scanned exhibits", extensions: ".jpg, .png, .tiff" },
  { kind: "docx", label: "Drafts & affidavits", extensions: ".docx, .doc" },
  { kind: "audio", label: "Hearing recordings", extensions: ".mp3, .wav, .m4a" },
  { kind: "video", label: "CCTV & site footage", extensions: ".mp4, .mov" },
];

export function kindFromFileName(name: string): DocumentKind {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["jpg", "jpeg", "png", "tif", "tiff", "webp", "heic"].includes(ext)) return "image";
  if (["doc", "docx", "rtf", "odt"].includes(ext)) return "docx";
  if (["mp3", "wav", "m4a", "aac", "ogg"].includes(ext)) return "audio";
  if (["mp4", "mov", "mkv", "avi", "webm"].includes(ext)) return "video";
  return "pdf";
}

export const supportedExtensions =
  ".pdf,.jpg,.jpeg,.png,.tif,.tiff,.webp,.doc,.docx,.rtf,.mp3,.wav,.m4a,.mp4,.mov,.mkv";

export const recentUploads: UploadedFile[] = [
  {
    id: "d-9001",
    name: "Chargesheet_FIR_214-2023_PS_Bandra.pdf",
    kind: "pdf",
    sizeLabel: "14.2 MB",
    caseNumber: "CRL.A. 482/2024",
    caseTitle: "State of Maharashtra v. Rohan Deshmukh",
    uploadedBy: "Adv. Meera Kulkarni",
    uploadedAt: "2026-08-03T06:20:00Z",
    pages: 118,
    status: "success",
    note: "OCR complete · 42 entities extracted · 6 statutory references linked",
  },
  {
    id: "d-9002",
    name: "Freight_Services_Agreement_Aurelia_Northgate.docx",
    kind: "docx",
    sizeLabel: "684 KB",
    caseNumber: "C.S. (COMM) 118/2025",
    caseTitle: "Aurelia Textiles Pvt. Ltd. v. Northgate Logistics",
    uploadedBy: "Adv. Sanjay Raghavan",
    uploadedAt: "2026-08-02T15:48:00Z",
    pages: 27,
    status: "success",
    note: "Clause map generated · Arbitration clause (Cl. 19.3) flagged for review",
  },
  {
    id: "d-9003",
    name: "Cross_Examination_PW3_08Jul2026.mp3",
    kind: "audio",
    sizeLabel: "92.7 MB",
    caseNumber: "HMA 2210/2024",
    caseTitle: "Ananya Rao v. Karthik Rao",
    uploadedBy: "Adv. Priya Nambiar",
    uploadedAt: "2026-08-02T11:05:00Z",
    pages: 0,
    status: "processing",
    note: "Diarised transcript 68% complete · 2 speakers identified",
  },
  {
    id: "d-9004",
    name: "Site_Inspection_Yelahanka_Survey_112.mp4",
    kind: "video",
    sizeLabel: "412 MB",
    caseNumber: "O.S. 3317/2023",
    caseTitle: "Vikram Sethi v. Sethi Family Trust",
    uploadedBy: "Adv. Harish Bhat",
    uploadedAt: "2026-08-01T09:32:00Z",
    pages: 0,
    status: "success",
    note: "Keyframes indexed · Geotag matched to survey record",
  },
  {
    id: "d-9005",
    name: "Seized_Ledger_Exhibit_P14.tiff",
    kind: "image",
    sizeLabel: "8.9 MB",
    caseNumber: "C.C. 1188/2025",
    caseTitle: "SEBI v. Zephyr Capital Advisors",
    uploadedBy: "Sr. Adv. Kavita Menon",
    uploadedAt: "2026-07-31T17:14:00Z",
    pages: 1,
    status: "error",
    note: "Upload failed — file exceeds 250 MB scan limit after de-skew. Retry required.",
  },
  {
    id: "d-9006",
    name: "Interim_Order_31Jul2026_DelhiHC.pdf",
    kind: "pdf",
    sizeLabel: "1.1 MB",
    caseNumber: "CRL.M.C. 771/2026",
    caseTitle: "State (NCT of Delhi) v. Faizan Qureshi",
    uploadedBy: "Adv. Ritu Ahluwalia",
    uploadedAt: "2026-07-31T08:02:00Z",
    pages: 4,
    status: "success",
    note: "Order summary drafted · Next compliance date detected: 05 Aug 2026",
  },
];

/* ------------------------------------------------------------------ */
/* Document viewer mock                                                */
/* ------------------------------------------------------------------ */

export interface DocumentPage {
  number: number;
  heading: string;
  paragraphs: string[];
}

export interface ExtractedSection {
  id: string;
  title: string;
  page: number;
  confidence: number;
  excerpt: string;
}

export interface DocEntity {
  id: string;
  value: string;
  type: "Person" | "Organisation" | "Statute" | "Court" | "Location" | "Date" | "Monetary";
  mentions: number;
  page: number;
}

export interface DocTimelineEvent {
  id: string;
  date: string;
  label: string;
  page: number;
}

export interface Highlight {
  id: string;
  text: string;
  page: number;
  tone: "issue" | "fact" | "law";
  by: string;
}

export interface Annotation {
  id: string;
  author: string;
  page: number;
  createdAt: string;
  body: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  kind: DocumentKind;
  caseNumber: string;
  caseTitle: string;
  metadata: { label: string; value: string }[];
  pages: DocumentPage[];
  sections: ExtractedSection[];
  entities: DocEntity[];
  timeline: DocTimelineEvent[];
  highlights: Highlight[];
  annotations: Annotation[];
}

export const documentRecord: DocumentRecord = {
  id: "d-9001",
  name: "Chargesheet_FIR_214-2023_PS_Bandra.pdf",
  kind: "pdf",
  caseNumber: "CRL.A. 482/2024",
  caseTitle: "State of Maharashtra v. Rohan Deshmukh",
  metadata: [
    { label: "Document type", value: "Chargesheet under BNSS §193" },
    { label: "Filed by", value: "Investigating Officer, PS Bandra" },
    { label: "Filed on", value: "14 September 2023" },
    { label: "Court", value: "Bombay High Court" },
    { label: "FIR reference", value: "FIR 214/2023, PS Bandra" },
    { label: "Pages", value: "118 (6 shown in preview)" },
    { label: "OCR confidence", value: "97.4%" },
    { label: "Language", value: "English with Marathi annexures" },
    { label: "Digital signature", value: "Verified — DSC of IO, valid till 2027" },
    { label: "Checksum (SHA-256)", value: "a71f…9c40" },
  ],
  pages: [
    {
      number: 1,
      heading: "IN THE COURT OF SESSIONS FOR GREATER BOMBAY",
      paragraphs: [
        "Final report under Section 193 of the Bharatiya Nagarik Suraksha Sanhita, 2023, in respect of FIR No. 214 of 2023 registered at Police Station Bandra, Mumbai, for offences punishable under Sections 420, 467 and 471 of the Indian Penal Code, 1860, read with Section 318 of the Bharatiya Nyaya Sanhita, 2023.",
        "The accused, Rohan Anil Deshmukh, aged 41 years, resident of Flat 1204, Sea Breeze Apartments, Perry Cross Road, Bandra (West), Mumbai 400050, is charged with dishonestly inducing the complainant to part with valuable security by presenting forged conveyance deeds.",
      ],
    },
    {
      number: 2,
      heading: "PARTICULARS OF THE COMPLAINT",
      paragraphs: [
        "The complainant, M/s Sundaram Realty LLP, through its authorised signatory Mr. K. Sundaram, lodged a written complaint on 09 August 2023 alleging that four conveyance deeds bearing registration numbers BDR-4/8821/2021 to BDR-4/8824/2021 were fabricated to transfer title over Plot 17-B, CTS No. 442, Bandra Reclamation.",
        "On preliminary verification with the Office of the Sub-Registrar, Bandra, it was found that the said registration numbers stand allotted to unrelated instruments executed in favour of third parties, none of whom have any connection with the accused.",
      ],
    },
    {
      number: 3,
      heading: "INVESTIGATION AND SEIZURE",
      paragraphs: [
        "A panchanama dated 18 August 2023 records the seizure of one laptop computer (HP EliteBook, Sl. No. 5CD1284KQZ), two external drives and a rubber stamp bearing the impression of the Sub-Registrar, Bandra, from the residence of the accused in the presence of two independent panchas.",
        "The seized digital devices were forwarded to the Regional Forensic Science Laboratory, Kalina, vide letter dated 21 August 2023. The FSL report dated 06 October 2023 confirms the presence of editable template files corresponding to the impugned deeds, last modified on 12 May 2021.",
        "Statements of eleven witnesses were recorded under Section 180 BNSS, including that of the Sub-Registrar (PW-3) and the document writer (PW-7).",
      ],
    },
    {
      number: 4,
      heading: "MATERIAL OBJECTS AND EXHIBITS",
      paragraphs: [
        "Exhibit P-1 to P-4: the four impugned conveyance deeds; Exhibit P-5: certified extract of the Sub-Registrar's index-II; Exhibit P-9: FSL report dated 06 October 2023; Exhibit P-14: seized ledger recovered from the office premises at Nariman Point.",
        "The chain of custody for each material object is annexed as Annexure C, duly countersigned by the malkhana in-charge.",
      ],
    },
    {
      number: 5,
      heading: "APPLICABLE LAW",
      paragraphs: [
        "Section 420 IPC — cheating and dishonestly inducing delivery of property; punishable with imprisonment which may extend to seven years and fine.",
        "Section 467 IPC — forgery of valuable security; Section 471 IPC — using as genuine a forged document. Section 318 BNS is invoked for the continuing course of conduct after 01 July 2024.",
        "It is respectfully submitted that a prima facie case is made out against the accused and that the matter be committed to trial.",
      ],
    },
    {
      number: 6,
      heading: "DEFENCE OBJECTIONS ON RECORD",
      paragraphs: [
        "The defence has placed on record an application dated 02 February 2024 objecting to the admissibility of the digital records for want of a certificate under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023, and relying on Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal, (2020) 7 SCC 1.",
        "The prosecution has undertaken to produce the requisite certificate from the FSL nodal officer before the commencement of recording of evidence.",
      ],
    },
  ],
  sections: [
    {
      id: "s-1",
      title: "Charge under IPC §420 — cheating",
      page: 1,
      confidence: 0.98,
      excerpt:
        "Dishonestly inducing the complainant to part with valuable security by presenting forged conveyance deeds.",
    },
    {
      id: "s-2",
      title: "Particulars of the complaint",
      page: 2,
      confidence: 0.96,
      excerpt:
        "Four conveyance deeds BDR-4/8821/2021 to BDR-4/8824/2021 allegedly fabricated over Plot 17-B, CTS 442.",
    },
    {
      id: "s-3",
      title: "Panchanama and seizure memo",
      page: 3,
      confidence: 0.94,
      excerpt:
        "Laptop, two external drives and one rubber stamp seized on 18 August 2023 before two independent panchas.",
    },
    {
      id: "s-4",
      title: "FSL findings on digital records",
      page: 3,
      confidence: 0.91,
      excerpt:
        "Editable template files corresponding to the impugned deeds, last modified 12 May 2021.",
    },
    {
      id: "s-5",
      title: "Exhibit inventory and chain of custody",
      page: 4,
      confidence: 0.89,
      excerpt: "Exhibits P-1 to P-14 with malkhana countersignature at Annexure C.",
    },
    {
      id: "s-6",
      title: "Section 63(4) BSA certificate objection",
      page: 6,
      confidence: 0.93,
      excerpt:
        "Defence objection to admissibility of digital records for want of a certificate; reliance on Arjun Panditrao Khotkar.",
    },
  ],
  entities: [
    { id: "e-1", value: "Rohan Anil Deshmukh", type: "Person", mentions: 24, page: 1 },
    { id: "e-2", value: "M/s Sundaram Realty LLP", type: "Organisation", mentions: 11, page: 2 },
    { id: "e-3", value: "Sub-Registrar, Bandra", type: "Organisation", mentions: 9, page: 2 },
    { id: "e-4", value: "IPC §420", type: "Statute", mentions: 7, page: 1 },
    { id: "e-5", value: "IPC §467", type: "Statute", mentions: 5, page: 5 },
    { id: "e-6", value: "BNS §318", type: "Statute", mentions: 4, page: 5 },
    { id: "e-7", value: "BSA §63(4)", type: "Statute", mentions: 3, page: 6 },
    { id: "e-8", value: "Bombay High Court", type: "Court", mentions: 6, page: 1 },
    {
      id: "e-9",
      value: "Plot 17-B, CTS 442, Bandra Reclamation",
      type: "Location",
      mentions: 8,
      page: 2,
    },
    { id: "e-10", value: "RFSL Kalina", type: "Organisation", mentions: 4, page: 3 },
    { id: "e-11", value: "18 August 2023", type: "Date", mentions: 5, page: 3 },
    { id: "e-12", value: "06 October 2023", type: "Date", mentions: 3, page: 3 },
    { id: "e-13", value: "₹6.75 crore", type: "Monetary", mentions: 2, page: 2 },
    {
      id: "e-14",
      value: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal",
      type: "Person",
      mentions: 1,
      page: 6,
    },
  ],
  timeline: [
    {
      id: "dt-1",
      date: "2021-05-12",
      label: "Template files last modified (per FSL report)",
      page: 3,
    },
    {
      id: "dt-2",
      date: "2023-08-09",
      label: "Written complaint lodged by Sundaram Realty LLP",
      page: 2,
    },
    {
      id: "dt-3",
      date: "2023-08-18",
      label: "Panchanama and seizure at accused's residence",
      page: 3,
    },
    { id: "dt-4", date: "2023-10-06", label: "FSL report received from RFSL Kalina", page: 3 },
    {
      id: "dt-5",
      date: "2024-02-02",
      label: "Defence objection on §63(4) BSA certificate",
      page: 6,
    },
  ],
  highlights: [
    {
      id: "h-1",
      text: "…none of whom have any connection with the accused.",
      page: 2,
      tone: "fact",
      by: "Adv. Meera Kulkarni",
    },
    {
      id: "h-2",
      text: "editable template files corresponding to the impugned deeds, last modified on 12 May 2021",
      page: 3,
      tone: "issue",
      by: "jurisAssist AI",
    },
    {
      id: "h-3",
      text: "want of a certificate under Section 63(4) of the Bharatiya Sakshya Adhiniyam, 2023",
      page: 6,
      tone: "law",
      by: "Sr. Adv. Kavita Menon",
    },
    {
      id: "h-4",
      text: "chain of custody for each material object is annexed as Annexure C",
      page: 4,
      tone: "fact",
      by: "Adv. Meera Kulkarni",
    },
  ],
  annotations: [
    {
      id: "an-1",
      author: "Adv. Meera Kulkarni",
      page: 3,
      createdAt: "2026-07-29T10:12:00Z",
      body: "Seizure memo lists two panchas but only one has been cited as a witness. Press this gap during cross of the IO.",
    },
    {
      id: "an-2",
      author: "Sr. Adv. Kavita Menon",
      page: 6,
      createdAt: "2026-07-30T16:40:00Z",
      body: "Khotkar applies squarely. Move for exclusion of Exhibit P-9 unless the certificate is produced before evidence begins.",
    },
    {
      id: "an-3",
      author: "jurisAssist AI",
      page: 5,
      createdAt: "2026-08-01T07:05:00Z",
      body: "BNS §318 is invoked for conduct predating 01 July 2024 on pages 1 and 5 — potential retrospectivity objection.",
    },
  ],
};
