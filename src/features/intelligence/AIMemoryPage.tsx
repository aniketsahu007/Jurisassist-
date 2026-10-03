import { useState } from "react";
import {
  Brain,
  BookMarked,
  Gavel,
  Lightbulb,
  Search,
  ScrollText,
  BrainCircuit,
  StickyNote,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useMemoryBank, useVectorSearch } from "./useMemoryBank";

function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: typeof Brain;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

const outcomeTone: Record<string, string> = {
  Won: "bg-success/10 text-success border-success/20",
  Lost: "bg-destructive/10 text-destructive border-destructive/20",
  Settled: "bg-muted text-muted-foreground",
  Ongoing: "bg-warning/10 text-warning border-warning/20",
};

import { useSearch } from "@tanstack/react-router";

export default function AIMemoryPage() {
  const searchParams = useSearch({ strict: false });
  const initialQuery = (searchParams as any).q || "";
  
  const { loading, pastCases, strategies, successfulArguments, frequentSections, savedNotes } =
    useMemoryBank();
  const [query, setQuery] = useState(initialQuery);
  const { hits, searching } = useVectorSearch(query);

  if (loading) {
    return (
      <div className="mx-auto max-w-[1400px] space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <p className="text-eyebrow">Institutional knowledge</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">AI memory</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Everything the assistant has retained from your matters — retrieved by meaning, not
          keywords.
        </p>
      </div>

      <div className="panel p-5">
        <div className="relative">
          <BrainCircuit className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Vector search — e.g. “certificate missing for call records”"
            className="h-11 pl-9"
          />
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <Search className="h-3.5 w-3.5" />
          {searching ? "Embedding query and scanning memory…" : `${hits.length} vector matches`}
        </div>

        <ul className="mt-3 space-y-2">
          {hits.map((h) => (
            <li
              key={h.id}
              className={cn(
                "rounded-lg border bg-background/40 p-3 transition-opacity",
                searching && "opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <p className="text-sm leading-relaxed">{h.snippet}</p>
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg leading-none font-semibold text-primary">
                    {h.similarity.toFixed(2)}
                  </p>
                  <p className="text-[10px] tracking-wide text-muted-foreground uppercase">
                    similarity
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  {h.kind}
                </Badge>
                <span className="truncate text-xs text-muted-foreground">{h.source}</span>
              </div>
              <Progress value={h.similarity * 100} className="mt-2 h-1" />
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel icon={Gavel} title="Past cases" subtitle="Matters the assistant has indexed">
          <ul className="space-y-3">
            {pastCases.map((c) => (
              <li key={c.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{c.title}</p>
                  <Badge variant="outline" className={outcomeTone[c.outcome]}>
                    {c.outcome}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {c.court} · {c.year}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{c.takeaway}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          icon={Lightbulb}
          title="Previous strategies"
          subtitle="Approaches reused across matters"
        >
          <ul className="space-y-3">
            {strategies.map((s) => (
              <li key={s.id} className="rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{s.name}</p>
                  <span className="text-xs text-muted-foreground">{s.timesUsed} uses</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.context}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Progress value={s.successRate} className="h-1.5" />
                  <span className="w-10 text-right text-xs font-medium">{s.successRate}%</span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          icon={BookMarked}
          title="Successful arguments"
          subtitle="Propositions that have been accepted from the bar"
        >
          <ul className="space-y-3">
            {successfulArguments.map((a) => (
              <li key={a.id} className="rounded-lg border p-3">
                <p className="text-sm leading-relaxed">{a.argument}</p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    Accepted by {a.acceptedBy} · {a.caseRef}
                  </p>
                  <Badge variant="secondary">{a.strength}% strength</Badge>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel
          icon={ScrollText}
          title="Frequently used sections"
          subtitle="Statutory provisions cited most often"
        >
          <ul className="divide-y">
            {frequentSections.map((s) => (
              <li key={s.id} className="flex items-center gap-3 py-2.5">
                <span className="w-16 shrink-0 font-mono text-sm font-medium">{s.section}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-muted-foreground">{s.act}</p>
                  <Progress value={(s.uses / 38) * 100} className="mt-1.5 h-1" />
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium">{s.uses}</p>
                  <p className="text-[10px] text-muted-foreground">
                    last{" "}
                    {new Date(s.lastUsed).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel
        icon={StickyNote}
        title="Saved notes"
        subtitle="Pinned by you, recalled by the assistant"
      >
        <div className="grid gap-3 md:grid-cols-2">
          {savedNotes.map((n) => (
            <div key={n.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{n.title}</p>
                <span className="text-[11px] text-muted-foreground">
                  {new Date(n.savedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{n.body}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {n.tags.map((t) => (
                  <Badge key={t} variant="outline" className="font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
