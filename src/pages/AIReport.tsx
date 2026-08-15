import {
  FileBarChart,
  Download,
  Share2,
  CalendarClock,
  ScrollText,
  Scale,
  SearchX,
  GitCompare,
  Library,
  PenLine,
  ShieldAlert,
  CircleCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCaseReport } from "@/hooks/useReport";

function ConfidenceRing({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
        <circle cx="60" cy="60" r={r} className="fill-none stroke-border" strokeWidth="10" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="fill-none stroke-primary transition-[stroke-dashoffset] duration-700"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * value) / 100}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-semibold leading-none">{value}</span>
        <span className="text-[10px] tracking-wide text-muted-foreground uppercase">
          confidence
        </span>
      </div>
    </div>
  );
}

function Section({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: typeof Scale;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl border bg-card p-5 shadow-panel">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

const strengthTint: Record<string, string> = {
  Strong: "bg-success/12 text-success border-success/30",
  Arguable: "bg-warning/12 text-warning border-warning/30",
  Weak: "bg-destructive/12 text-destructive border-destructive/30",
};

const urgencyTint: Record<string, string> = {
  Critical: "bg-destructive/12 text-destructive border-destructive/30",
  High: "bg-warning/12 text-warning border-warning/30",
  Medium: "bg-secondary text-secondary-foreground",
};

const severityTint: Record<string, string> = {
  High: "bg-destructive/12 text-destructive border-destructive/30",
  Medium: "bg-warning/12 text-warning border-warning/30",
  Low: "bg-secondary text-secondary-foreground",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function AIReportPage() {
  const { report, loading } = useCaseReport();

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-4">
        <Skeleton className="h-36 w-full rounded-xl" />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      {/* Header */}
      <header className="rounded-xl border bg-card p-5 shadow-panel">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-eyebrow">AI Report</p>
            <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {report.caseTitle}
            </h1>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {report.caseNumber} · {report.court}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1.5">
                <FileBarChart className="h-3 w-3 text-primary" />
                {report.documentsAnalysed} documents ·{" "}
                {report.pagesAnalysed.toLocaleString("en-IN")} pages
              </Badge>
              <Badge variant="outline">{report.model}</Badge>
              <span className="text-xs text-muted-foreground">
                Generated {fmtDate(report.generatedAt)}
              </span>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export PDF
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Share2 className="h-3.5 w-3.5" />
                Share with team
              </Button>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-center">
            <ConfidenceRing value={report.confidence} />
            <p className="mt-2 max-w-[180px] text-center text-[11px] text-muted-foreground">
              High confidence on admissibility findings; moderate on quantum.
            </p>
          </div>
        </div>
      </header>

      <Section
        id="summary"
        icon={ScrollText}
        title="Executive Summary"
        subtitle="What the record establishes and where the appeal turns"
      >
        <div className="space-y-3">
          {report.executiveSummary.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-muted-foreground">
              {p}
            </p>
          ))}
        </div>
      </Section>

      <Section
        id="timeline"
        icon={CalendarClock}
        title="Case Timeline"
        subtitle="Chronology reconstructed from the indexed documents"
      >
        <ol className="relative space-y-4 border-l pl-6">
          {report.timeline.map((t) => (
            <li key={t.id} className="relative">
              <span className="absolute top-1.5 -left-[27px] h-2.5 w-2.5 rounded-full border-2 border-card bg-primary" />
              <p className="font-mono text-[11px] text-muted-foreground">{fmtDate(t.date)}</p>
              <p className="text-sm font-medium">{t.label}</p>
              <p className="text-sm text-muted-foreground">{t.note}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="facts"
        icon={CircleCheck}
        title="Important Facts"
        subtitle="Extracted with source references and extraction confidence"
      >
        <div className="space-y-3">
          {report.facts.map((f) => (
            <div key={f.id} className="rounded-lg border bg-surface-2 p-3">
              <p className="text-sm leading-relaxed">{f.fact}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="font-mono text-[11px] text-muted-foreground">{f.source}</span>
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Progress value={f.confidence} className="h-1 w-20" />
                  {f.confidence}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="issues"
        icon={Scale}
        title="Legal Issues"
        subtitle="Framed questions with the position available on the present record"
      >
        <div className="space-y-3">
          {report.issues.map((i) => (
            <div key={i.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{i.issue}</p>
                <Badge variant="outline" className={cn("shrink-0", strengthTint[i.strength])}>
                  {i.strength}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{i.position}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="missing"
        icon={SearchX}
        title="Missing Evidence"
        subtitle="Gaps that materially affect the strength of the case"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {report.missingEvidence.map((m) => (
            <div key={m.id} className="rounded-lg border p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium">{m.item}</p>
                <Badge variant="outline" className={cn("shrink-0", urgencyTint[m.urgency])}>
                  {m.urgency}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">{m.why}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="contradictions"
        icon={GitCompare}
        title="Detected Contradictions"
        subtitle="Conflicting statements found across the record"
      >
        <div className="space-y-3">
          {report.contradictions.map((c) => (
            <div key={c.id} className="rounded-lg border p-3">
              <Badge variant="outline" className={cn("mb-2", severityTint[c.severity])}>
                {c.severity} severity
              </Badge>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-surface-2 p-2.5">
                  <p className="text-sm">{c.statementA}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{c.sourceA}</p>
                </div>
                <div className="rounded-md bg-surface-2 p-2.5">
                  <p className="text-sm">{c.statementB}</p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{c.sourceB}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="precedents"
        icon={Library}
        title="Recommended Precedents"
        subtitle="Ranked by relevance to the issues framed above"
      >
        <div className="space-y-3">
          {report.precedents.map((p) => (
            <div key={p.id} className="rounded-lg border p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium">{p.title}</p>
                <span className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Progress value={p.relevance} className="h-1 w-20" />
                  {p.relevance}% match
                </span>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">
                {p.citation} · {p.court}
              </p>
              <p className="mt-1.5 text-sm text-muted-foreground">{p.proposition}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="drafts"
        icon={PenLine}
        title="Draft Suggestions"
        subtitle="Ready-to-edit language for the next filing"
      >
        <div className="space-y-3">
          {report.drafts.map((d) => (
            <div key={d.id} className="rounded-lg border bg-surface-2 p-3">
              <p className="text-sm font-medium">{d.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{d.body}</p>
              <Button size="sm" variant="ghost" className="mt-2 h-7 px-2 text-xs">
                Copy to draft
              </Button>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="risk"
        icon={ShieldAlert}
        title="Risk Analysis"
        subtitle="Modelled exposure across procedural and commercial outcomes"
      >
        <div className="space-y-3">
          {report.risks.map((r) => (
            <div key={r.id}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{r.label}</span>
                <span
                  className={cn(
                    "font-mono text-xs",
                    r.score >= 60
                      ? "text-destructive"
                      : r.score >= 40
                        ? "text-warning"
                        : "text-success",
                  )}
                >
                  {r.score}% likelihood
                </span>
              </div>
              <Progress value={r.score} className="mt-1.5 h-1.5" />
              <p className="mt-1 text-xs text-muted-foreground">{r.note}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        id="confidence"
        icon={FileBarChart}
        title="Confidence Score"
        subtitle="How much of this report is supported by primary material"
      >
        <div className="flex flex-col items-center gap-5 sm:flex-row">
          <ConfidenceRing value={report.confidence} />
          <div className="flex-1 space-y-3">
            {[
              { label: "Document coverage", value: 94 },
              { label: "Citation verification", value: 88 },
              { label: "Entity resolution", value: 79 },
              { label: "Quantum estimation", value: 63 },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-mono text-xs">{row.value}%</span>
                </div>
                <Progress value={row.value} className="mt-1 h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
