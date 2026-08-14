export interface JudgePreference {
  id: string;
  judge: string;
  court: string;
  grantRate: number;
  avgDaysToOrder: number;
  leaning: string;
  favouredArgument: string;
}

export interface SuccessTrendPoint {
  quarter: string;
  bail: number;
  quashing: number;
  appeals: number;
}

export interface RejectedArgument {
  id: string;
  argument: string;
  rejections: number;
  commonReason: string;
}

export interface SectionOutcome {
  section: string;
  filings: number;
  favourable: number;
}

export interface StrategyOutcome {
  id: string;
  strategy: string;
  wins: number;
  attempts: number;
}

export interface HeatCell {
  judge: string;
  values: { argument: string; score: number }[];
}

export const judgePreferences: JudgePreference[] = [
  {
    id: "jp-1",
    judge: "Justice Revati Mohite Dere",
    court: "Bombay High Court",
    grantRate: 68,
    avgDaysToOrder: 11,
    leaning: "Procedure-first",
    favouredArgument: "Admissibility / 65B defects",
  },
  {
    id: "jp-2",
    judge: "Justice A.S. Oka",
    court: "Supreme Court of India",
    grantRate: 61,
    avgDaysToOrder: 19,
    leaning: "Abuse-of-process sensitive",
    favouredArgument: "Bhajan Lal categories",
  },
  {
    id: "jp-3",
    judge: "Justice Prathiba M. Singh",
    court: "Delhi High Court",
    grantRate: 54,
    avgDaysToOrder: 9,
    leaning: "Commercial pragmatism",
    favouredArgument: "Financial capacity / proportionality",
  },
  {
    id: "jp-4",
    judge: "Justice S. Ravindra Bhat",
    court: "Supreme Court of India",
    grantRate: 72,
    avgDaysToOrder: 14,
    leaning: "Liberty-protective",
    favouredArgument: "Pre-trial detention is punitive",
  },
  {
    id: "jp-5",
    judge: "Judge M.K. Sonawane",
    court: "Sessions Court, Mumbai",
    grantRate: 37,
    avgDaysToOrder: 6,
    leaning: "Prosecution-deferential",
    favouredArgument: "Parity with co-accused",
  },
];

export const successTrend: SuccessTrendPoint[] = [
  { quarter: "Q1 25", bail: 52, quashing: 38, appeals: 44 },
  { quarter: "Q2 25", bail: 57, quashing: 41, appeals: 47 },
  { quarter: "Q3 25", bail: 61, quashing: 45, appeals: 43 },
  { quarter: "Q4 25", bail: 58, quashing: 52, appeals: 49 },
  { quarter: "Q1 26", bail: 66, quashing: 55, appeals: 53 },
  { quarter: "Q2 26", bail: 71, quashing: 59, appeals: 57 },
  { quarter: "Q3 26", bail: 74, quashing: 62, appeals: 60 },
];

export const rejectedArguments: RejectedArgument[] = [
  {
    id: "ra-1",
    argument: "Delay in launching prosecution vitiates the proceedings",
    rejections: 9,
    commonReason: "Continuous correspondence on record explained the interval",
  },
  {
    id: "ra-2",
    argument: "Sanction under S. 197 CrPC was defective",
    rejections: 7,
    commonReason: "Bench held the act was not in discharge of official duty",
  },
  {
    id: "ra-3",
    argument: "Parity with co-accused already enlarged on bail",
    rejections: 6,
    commonReason: "Role attribution in the chargesheet was found materially different",
  },
  {
    id: "ra-4",
    argument: "Dispute is purely civil and arbitrable",
    rejections: 5,
    commonReason: "Allegation of inducement at inception disclosed a prima facie offence",
  },
  {
    id: "ra-5",
    argument: "Chargesheet filed beyond 60 days entitles default bail",
    rejections: 3,
    commonReason: "Extension order under the special statute was already on record",
  },
];

export const sectionOutcomes: SectionOutcome[] = [
  { section: "S. 65B Evidence", filings: 38, favourable: 30 },
  { section: "S. 482 CrPC", filings: 31, favourable: 19 },
  { section: "S. 438 CrPC", filings: 27, favourable: 18 },
  { section: "S. 420 IPC", filings: 24, favourable: 11 },
  { section: "S. 409 IPC", filings: 18, favourable: 7 },
  { section: "S. 45 PMLA", filings: 12, favourable: 4 },
];

export const strategyOutcomes: StrategyOutcome[] = [
  { id: "so-1", strategy: "Attack admissibility before merits", wins: 11, attempts: 14 },
  { id: "so-2", strategy: "Civil-flavour framing for quashing", wins: 8, attempts: 11 },
  { id: "so-3", strategy: "Cooperation record before bail", wins: 6, attempts: 9 },
  { id: "so-4", strategy: "Chain-of-custody cross-examination", wins: 5, attempts: 8 },
  { id: "so-5", strategy: "Parity with co-accused", wins: 3, attempts: 6 },
];

export const heatmapArguments = [
  "65B defect",
  "Abuse of process",
  "Civil dispute",
  "Parity",
  "Delay",
  "Proportionality",
];

export const judgeArgumentHeatmap: HeatCell[] = [
  {
    judge: "Mohite Dere J.",
    values: [
      { argument: "65B defect", score: 92 },
      { argument: "Abuse of process", score: 71 },
      { argument: "Civil dispute", score: 64 },
      { argument: "Parity", score: 43 },
      { argument: "Delay", score: 28 },
      { argument: "Proportionality", score: 55 },
    ],
  },
  {
    judge: "Oka J.",
    values: [
      { argument: "65B defect", score: 68 },
      { argument: "Abuse of process", score: 88 },
      { argument: "Civil dispute", score: 79 },
      { argument: "Parity", score: 51 },
      { argument: "Delay", score: 34 },
      { argument: "Proportionality", score: 47 },
    ],
  },
  {
    judge: "Prathiba Singh J.",
    values: [
      { argument: "65B defect", score: 59 },
      { argument: "Abuse of process", score: 62 },
      { argument: "Civil dispute", score: 74 },
      { argument: "Parity", score: 38 },
      { argument: "Delay", score: 41 },
      { argument: "Proportionality", score: 86 },
    ],
  },
  {
    judge: "Ravindra Bhat J.",
    values: [
      { argument: "65B defect", score: 73 },
      { argument: "Abuse of process", score: 66 },
      { argument: "Civil dispute", score: 58 },
      { argument: "Parity", score: 69 },
      { argument: "Delay", score: 45 },
      { argument: "Proportionality", score: 81 },
    ],
  },
  {
    judge: "Sonawane J.",
    values: [
      { argument: "65B defect", score: 44 },
      { argument: "Abuse of process", score: 31 },
      { argument: "Civil dispute", score: 36 },
      { argument: "Parity", score: 57 },
      { argument: "Delay", score: 22 },
      { argument: "Proportionality", score: 39 },
    ],
  },
];
