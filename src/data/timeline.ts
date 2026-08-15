export type TimelineStage =
  | "Incident"
  | "FIR Registered"
  | "Arrest"
  | "Chargesheet"
  | "Hearing"
  | "Judgment";

export type TimelineStatus = "completed" | "current" | "upcoming" | "adjourned";

export interface TimelineEvent {
  id: string;
  stage: TimelineStage;
  title: string;
  date: string;
  status: TimelineStatus;
  description: string;
  details: {
    location: string;
    officer: string;
    documents: string[];
    notes: string;
  };
}

export const caseTimeline: TimelineEvent[] = [
  {
    id: "t-1",
    stage: "Incident",
    title: "Execution of the impugned conveyance deeds",
    date: "2021-05-12",
    status: "completed",
    description:
      "Four conveyance deeds over Plot 17-B, CTS 442, Bandra Reclamation were executed and later found to bear registration numbers allotted to unrelated instruments.",
    details: {
      location: "Bandra Reclamation, Mumbai",
      officer: "Reported by M/s Sundaram Realty LLP",
      documents: ["Deeds BDR-4/8821/2021 to BDR-4/8824/2021", "Index-II extract"],
      notes:
        "FSL later placed the last modification of the underlying template files on this date, which anchors the prosecution's chronology.",
    },
  },
  {
    id: "t-2",
    stage: "FIR Registered",
    title: "FIR 214/2023 registered at PS Bandra",
    date: "2023-08-09",
    status: "completed",
    description:
      "FIR registered under IPC §§420, 467 and 471 on the written complaint of the authorised signatory of the complainant firm.",
    details: {
      location: "Police Station Bandra, Mumbai",
      officer: "PI S. R. Kadam, Investigating Officer",
      documents: ["FIR 214/2023", "Written complaint dated 09 Aug 2023"],
      notes:
        "Complaint routed through the Economic Offences Wing before registration; no preliminary enquiry was recorded.",
    },
  },
  {
    id: "t-3",
    stage: "Arrest",
    title: "Arrest of the accused and remand",
    date: "2023-08-18",
    status: "completed",
    description:
      "Accused arrested at his residence; panchanama drawn for seizure of one laptop, two external drives and a rubber stamp. Produced before the Magistrate the same evening.",
    details: {
      location: "Sea Breeze Apartments, Bandra (West)",
      officer: "PI S. R. Kadam with two independent panchas",
      documents: ["Arrest memo", "Panchanama dated 18 Aug 2023", "Remand application"],
      notes:
        "Police custody granted for three days; judicial custody thereafter. Bail granted on 05 September 2023 on a surety of ₹5,00,000.",
    },
  },
  {
    id: "t-4",
    stage: "Chargesheet",
    title: "Final report filed under BNSS §193",
    date: "2023-09-14",
    status: "completed",
    description:
      "118-page chargesheet filed with statements of eleven witnesses and exhibits P-1 to P-14, including the FSL report on the seized digital devices.",
    details: {
      location: "Court of Sessions for Greater Bombay",
      officer: "Investigating Officer, PS Bandra",
      documents: ["Chargesheet FIR 214/2023", "FSL report dated 06 Oct 2023", "Annexure C — chain of custody"],
      notes:
        "Cognizance taken on 22 September 2023; matter committed to the Sessions Court on 11 October 2023.",
    },
  },
  {
    id: "t-5",
    stage: "Hearing",
    title: "Framing of charges",
    date: "2024-01-19",
    status: "completed",
    description:
      "Charges framed under IPC §§420, 467 and 471. The accused pleaded not guilty and claimed trial.",
    details: {
      location: "Sessions Court, Greater Bombay",
      officer: "Hon'ble Sessions Judge V. M. Pathade",
      documents: ["Order on charge dated 19 Jan 2024"],
      notes: "Discharge application under BNSS §250 rejected in the same order.",
    },
  },
  {
    id: "t-6",
    stage: "Hearing",
    title: "Application challenging admissibility of digital records",
    date: "2024-02-02",
    status: "completed",
    description:
      "Defence objected to Exhibit P-9 for want of a certificate under BSA §63(4), relying on Arjun Panditrao Khotkar v. Kailash Kushanrao Gorantyal.",
    details: {
      location: "Sessions Court, Greater Bombay",
      officer: "Adv. Meera Kulkarni for the accused",
      documents: ["Application dated 02 Feb 2024", "Reply of the prosecution"],
      notes:
        "Court directed the prosecution to produce the certificate before the recording of evidence commences.",
    },
  },
  {
    id: "t-7",
    stage: "Hearing",
    title: "Examination-in-chief of PW-3 (Sub-Registrar)",
    date: "2024-11-08",
    status: "adjourned",
    description:
      "Adjourned at the request of the prosecution as the witness was on official deputation. Costs of ₹5,000 imposed.",
    details: {
      location: "Sessions Court, Greater Bombay",
      officer: "Hon'ble Sessions Judge V. M. Pathade",
      documents: ["Roznama dated 08 Nov 2024"],
      notes: "Fresh summons issued to PW-3 returnable on the next date.",
    },
  },
  {
    id: "t-8",
    stage: "Hearing",
    title: "Appeal admitted before the Bombay High Court",
    date: "2025-06-24",
    status: "completed",
    description:
      "CRL.A. 482/2024 admitted; interim protection from coercive steps continued pending disposal.",
    details: {
      location: "Bombay High Court",
      officer: "Hon'ble Justice A. S. Chandurkar",
      documents: ["Admission order dated 24 Jun 2025", "Paper book Vol. I–III"],
      notes: "Registry directed to call for the trial court record within six weeks.",
    },
  },
  {
    id: "t-9",
    stage: "Hearing",
    title: "Final arguments on admissibility and sentence",
    date: "2026-08-11",
    status: "current",
    description:
      "Next listed date. Arguments to be advanced on the §63(4) BSA certificate and, in the alternative, on quantum of sentence.",
    details: {
      location: "Bombay High Court, Court Room 26",
      officer: "Sr. Adv. Kavita Menon leading Adv. Meera Kulkarni",
      documents: ["Written submissions (draft v4)", "Compilation of judgments"],
      notes:
        "jurisAssist AI has flagged three coordinate-bench rulings on retrospectivity of BNS §318 for inclusion in the compilation.",
    },
  },
  {
    id: "t-10",
    stage: "Judgment",
    title: "Judgment expected",
    date: "2026-09-22",
    status: "upcoming",
    description:
      "Judgment anticipated after conclusion of arguments; the Bench has indicated a reserved order.",
    details: {
      location: "Bombay High Court",
      officer: "Hon'ble Justice A. S. Chandurkar",
      documents: ["—"],
      notes:
        "Historical disposal pattern for this Bench suggests pronouncement within 4–6 weeks of reservation.",
    },
  },
];
