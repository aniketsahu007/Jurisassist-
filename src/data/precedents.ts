export interface PrecedentResult {
  id: string;
  title: string;
  citation: string;
  court: string;
  judge: string;
  date: string;
  year: number;
  caseType: string;
  sections: string[];
  summary: string;
  relevance: number;
  outcome: "Allowed" | "Dismissed" | "Partly allowed" | "Remanded";
}

export const precedentCourts = [
  "Supreme Court of India",
  "Bombay High Court",
  "Delhi High Court",
  "Karnataka High Court",
  "Sessions Court, Mumbai",
];

export const precedentJudges = [
  "Justice D.Y. Chandrachud",
  "Justice R.F. Nariman",
  "Justice S. Ravindra Bhat",
  "Justice Revati Mohite Dere",
  "Justice Prathiba M. Singh",
  "Justice A.S. Oka",
];

export const precedentYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2014, 2005];

export const precedentSections = [
  "S. 65B Evidence Act",
  "S. 438 CrPC",
  "S. 482 CrPC",
  "S. 420 IPC",
  "S. 409 IPC",
  "S. 45 PMLA",
  "S. 143A NI Act",
  "S. 173(8) CrPC",
];

export const precedentTypes = [
  "Criminal Appeal",
  "Bail Application",
  "Quashing Petition",
  "Economic Offence",
  "Writ Petition",
];

export const precedents: PrecedentResult[] = [
  {
    id: "p-1",
    title: "Anvar P.V. v. P.K. Basheer",
    citation: "(2014) 10 SCC 473",
    court: "Supreme Court of India",
    judge: "Justice R.F. Nariman",
    date: "2014-09-18",
    year: 2014,
    caseType: "Criminal Appeal",
    sections: ["S. 65B Evidence Act"],
    summary:
      "Electronic records are inadmissible unless accompanied by a certificate under Section 65B(4). Secondary electronic evidence produced without the certificate cannot be read, notwithstanding oral testimony of the person who created the record.",
    relevance: 96,
    outcome: "Allowed",
  },
  {
    id: "p-2",
    title: "Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal",
    citation: "(2020) 7 SCC 1",
    court: "Supreme Court of India",
    judge: "Justice R.F. Nariman",
    date: "2020-07-14",
    year: 2020,
    caseType: "Criminal Appeal",
    sections: ["S. 65B Evidence Act", "S. 173(8) CrPC"],
    summary:
      "Clarifies Anvar P.V.: the 65B certificate is mandatory, but a party unable to procure it may apply to the court to summon the certificate from the custodian of the device. CDR printouts without certification remain inadmissible.",
    relevance: 93,
    outcome: "Partly allowed",
  },
  {
    id: "p-3",
    title: "Sanjay Chandra v. Central Bureau of Investigation",
    citation: "(2012) 1 SCC 40",
    court: "Supreme Court of India",
    judge: "Justice S. Ravindra Bhat",
    date: "2019-11-23",
    year: 2019,
    caseType: "Bail Application",
    sections: ["S. 438 CrPC", "S. 409 IPC"],
    summary:
      "In economic offences with documentary evidence already seized, prolonged pre-trial detention is punitive. Seriousness of the charge alone is not a ground to deny bail where the accused has cooperated with the investigation.",
    relevance: 89,
    outcome: "Allowed",
  },
  {
    id: "p-4",
    title: "State of Haryana v. Bhajan Lal",
    citation: "1992 Supp (1) SCC 335",
    court: "Supreme Court of India",
    judge: "Justice A.S. Oka",
    date: "2018-03-12",
    year: 2018,
    caseType: "Quashing Petition",
    sections: ["S. 482 CrPC", "S. 420 IPC"],
    summary:
      "Lays down the seven categories in which an FIR may be quashed, including where the allegations, taken at face value, do not disclose the commission of any offence, and where proceedings are manifestly attended with mala fides.",
    relevance: 87,
    outcome: "Allowed",
  },
  {
    id: "p-5",
    title: "Vijay Madanlal Choudhary v. Union of India",
    citation: "(2022) SCC OnLine SC 929",
    court: "Supreme Court of India",
    judge: "Justice D.Y. Chandrachud",
    date: "2022-07-27",
    year: 2022,
    caseType: "Economic Offence",
    sections: ["S. 45 PMLA"],
    summary:
      "Upholds the twin conditions under Section 45 PMLA for bail, while holding that the ECIR is not equivalent to an FIR and need not be supplied to the accused, provided grounds of arrest are communicated in writing.",
    relevance: 84,
    outcome: "Dismissed",
  },
  {
    id: "p-6",
    title: "Zephyr Capital Advisors v. Securities & Exchange Board of India",
    citation: "2023 SCC OnLine Bom 1187",
    court: "Bombay High Court",
    judge: "Justice Revati Mohite Dere",
    date: "2023-04-19",
    year: 2023,
    caseType: "Writ Petition",
    sections: ["S. 420 IPC", "S. 409 IPC"],
    summary:
      "Interim attachment of client funds set aside where the regulator failed to record reasons under the delegated order. Court held forensic audit findings must be shared with the noticee before adverse action.",
    relevance: 81,
    outcome: "Partly allowed",
  },
  {
    id: "p-7",
    title: "Rohan Deshmukh v. State of Maharashtra",
    citation: "2024 SCC OnLine Bom 402",
    court: "Bombay High Court",
    judge: "Justice Revati Mohite Dere",
    date: "2024-02-08",
    year: 2024,
    caseType: "Bail Application",
    sections: ["S. 438 CrPC"],
    summary:
      "Anticipatory bail granted in an FIR under Sections 420 and 34 IPC where the dispute was predominantly civil in character and the investigating officer had already seized the disputed ledgers.",
    relevance: 78,
    outcome: "Allowed",
  },
  {
    id: "p-8",
    title: "M/s Kalyani Infratech v. Sahyadri Steel Pvt. Ltd.",
    citation: "2021 SCC OnLine Del 3344",
    court: "Delhi High Court",
    judge: "Justice Prathiba M. Singh",
    date: "2021-08-30",
    year: 2021,
    caseType: "Criminal Appeal",
    sections: ["S. 143A NI Act"],
    summary:
      "Interim compensation under Section 143A NI Act is discretionary, not automatic. The trial court must record reasons proportionate to the prima facie case and the financial capacity of the drawer.",
    relevance: 74,
    outcome: "Remanded",
  },
  {
    id: "p-9",
    title: "Nikhil Suresh Rane v. State of Karnataka",
    citation: "2022 SCC OnLine Kar 918",
    court: "Karnataka High Court",
    judge: "Justice A.S. Oka",
    date: "2022-11-04",
    year: 2022,
    caseType: "Quashing Petition",
    sections: ["S. 482 CrPC", "S. 420 IPC"],
    summary:
      "Continuation of a second FIR on the same set of facts amounts to abuse of process. Court quashed the later FIR while permitting the investigating agency to seek further investigation under Section 173(8) CrPC.",
    relevance: 71,
    outcome: "Allowed",
  },
  {
    id: "p-10",
    title: "State of Maharashtra v. Aakash Vernekar",
    citation: "2023 SCC OnLine Bom 2451",
    court: "Sessions Court, Mumbai",
    judge: "Justice Revati Mohite Dere",
    date: "2023-09-15",
    year: 2023,
    caseType: "Economic Offence",
    sections: ["S. 409 IPC", "S. 65B Evidence Act"],
    summary:
      "Conviction reversed for want of a valid 65B certificate covering the server logs relied upon by the prosecution; the chain of custody of the mirrored hard disk was also found to be broken.",
    relevance: 68,
    outcome: "Allowed",
  },
  {
    id: "p-11",
    title: "Union of India v. Meher Pharmachem Ltd.",
    citation: "2019 SCC OnLine Del 8871",
    court: "Delhi High Court",
    judge: "Justice Prathiba M. Singh",
    date: "2019-05-21",
    year: 2019,
    caseType: "Writ Petition",
    sections: ["S. 482 CrPC"],
    summary:
      "Prosecution launched five years after the alleged contravention was held to be vitiated by unexplained delay, absent any material showing concealment by the company or its directors.",
    relevance: 64,
    outcome: "Dismissed",
  },
  {
    id: "p-12",
    title: "Farhana Sheikh v. State (NCT of Delhi)",
    citation: "2005 SCC OnLine Del 1129",
    court: "Delhi High Court",
    judge: "Justice S. Ravindra Bhat",
    date: "2005-12-02",
    year: 2005,
    caseType: "Criminal Appeal",
    sections: ["S. 173(8) CrPC"],
    summary:
      "Further investigation may be ordered even after cognizance, but the magistrate must apply an independent mind and cannot mechanically endorse the request of the investigating agency.",
    relevance: 59,
    outcome: "Remanded",
  },
];
