import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Sparkles,
  MapPin,
  Scale,
  Building2,
  User2,
  CalendarDays,
  IndianRupee,
  Highlighter,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useDocument } from "@/hooks/useDocuments";
import type { DocEntity } from "@/data/documents";

const entityIcon: Record<DocEntity["type"], typeof User2> = {
  Person: User2,
  Organisation: Building2,
  Statute: Scale,
  Court: Scale,
  Location: MapPin,
  Date: CalendarDays,
  Monetary: IndianRupee,
};

const toneClass: Record<string, string> = {
  issue: "border-destructive/25 bg-destructive/10 text-destructive",
  fact: "border-chart-3/25 bg-chart-3/10 text-chart-3",
  law: "border-accent/30 bg-accent/12 text-accent",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function DocumentViewerPage() {
  const { document: doc, loading } = useDocument();
  const [page, setPage] = useState(1);
  const current = doc.pages.find((p) => p.number === page) ?? doc.pages[0]!;

  return (
    <div className="mx-auto max-w-[1500px] space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-eyebrow">Document viewer</p>
          <h1 className="mt-1 truncate text-xl font-semibold sm:text-2xl">{doc.name}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {doc.caseNumber} · {doc.caseTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
          <Button size="sm">
            <Sparkles className="mr-2 h-4 w-4" /> Summarise
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Left: paginated document */}
        <section className="panel flex flex-col">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <FileText className="h-4 w-4" />
              Page {current.number} of {doc.pages.length} shown · 118 pp. total
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Previous page"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label="Next page"
                disabled={page >= doc.pages.length}
                onClick={() => setPage((p) => Math.min(doc.pages.length, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-3 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (
            <article className="mx-auto w-full max-w-[720px] flex-1 px-8 py-10">
              <p className="text-center font-mono text-[11px] tracking-wider text-muted-foreground uppercase">
                {doc.caseNumber} · Page {current.number}
              </p>
              <h2 className="mt-6 text-center font-display text-base font-semibold">
                {current.heading}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-7">
                {current.paragraphs.map((para, i) => (
                  <p key={i} className="text-justify">
                    <span className="mr-2 font-mono text-[11px] text-muted-foreground">
                      {current.number}.{i + 1}
                    </span>
                    {para}
                  </p>
                ))}
              </div>
            </article>
          )}

          <div className="flex items-center gap-1.5 overflow-x-auto border-t px-5 py-3">
            {doc.pages.map((p) => (
              <button
                key={p.number}
                onClick={() => setPage(p.number)}
                className={cn(
                  "flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded border text-[11px] transition-colors",
                  p.number === page
                    ? "border-accent bg-accent/12 text-accent"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
                aria-label={`Go to page ${p.number}`}
              >
                <FileText className="h-4 w-4" />
                {p.number}
              </button>
            ))}
          </div>
        </section>

        {/* Right: tabbed intelligence */}
        <section className="panel min-w-0">
          <Tabs defaultValue="sections">
            <div className="overflow-x-auto border-b px-3 py-2">
              <TabsList className="w-max">
                <TabsTrigger value="sections" className="text-xs">
                  Sections
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="metadata" className="text-xs">
                  Metadata
                </TabsTrigger>
                <TabsTrigger value="entities" className="text-xs">
                  Entities
                </TabsTrigger>
                <TabsTrigger value="highlights" className="text-xs">
                  Highlights
                </TabsTrigger>
                <TabsTrigger value="annotations" className="text-xs">
                  Annotations
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[620px]">
              <TabsContent value="sections" className="m-0 divide-y">
                {doc.sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setPage(s.page)}
                    className="block w-full px-5 py-4 text-left transition-colors hover:bg-muted/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-medium">{s.title}</p>
                      <Badge variant="outline" className="shrink-0 font-mono text-[10px]">
                        p. {s.page}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {s.excerpt}
                    </p>
                    <div className="mt-2.5 flex items-center gap-2">
                      <Progress value={s.confidence * 100} className="h-1 w-24" />
                      <span className="text-[10px] text-muted-foreground">
                        {Math.round(s.confidence * 100)}% extraction confidence
                      </span>
                    </div>
                  </button>
                ))}
              </TabsContent>

              <TabsContent value="timeline" className="m-0 px-5 py-4">
                <ol className="relative space-y-5 border-l pl-5">
                  {doc.timeline.map((e) => (
                    <li key={e.id} className="relative">
                      <span className="absolute top-1.5 -left-[25px] h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-background" />
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {fmtDate(e.date)}
                      </p>
                      <p className="mt-0.5 text-sm">{e.label}</p>
                      <button
                        onClick={() => setPage(e.page)}
                        className="mt-1 text-[11px] text-accent hover:underline"
                      >
                        Jump to page {e.page}
                      </button>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="metadata" className="m-0 divide-y">
                {doc.metadata.map((m) => (
                  <div key={m.label} className="flex gap-4 px-5 py-3">
                    <dt className="w-40 shrink-0 text-[11px] tracking-wider text-muted-foreground uppercase">
                      {m.label}
                    </dt>
                    <dd className="min-w-0 text-xs font-medium break-words">{m.value}</dd>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="entities" className="m-0 px-5 py-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  {doc.entities.map((e) => {
                    const Icon = entityIcon[e.type];
                    return (
                      <button
                        key={e.id}
                        onClick={() => setPage(e.page)}
                        className="flex items-start gap-2.5 rounded-lg border p-3 text-left transition-colors hover:bg-muted/60"
                      >
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium">{e.value}</p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {e.type} · {e.mentions} mention{e.mentions > 1 ? "s" : ""} · p. {e.page}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>

              <TabsContent value="highlights" className="m-0 divide-y">
                {doc.highlights.map((h) => (
                  <div key={h.id} className="px-5 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="outline" className={cn("text-[10px]", toneClass[h.tone])}>
                        <Highlighter className="mr-1 h-3 w-3" />
                        {h.tone === "issue" ? "Issue" : h.tone === "law" ? "Point of law" : "Fact"}
                      </Badge>
                      <button
                        onClick={() => setPage(h.page)}
                        className="font-mono text-[10px] text-muted-foreground hover:text-accent"
                      >
                        p. {h.page}
                      </button>
                    </div>
                    <blockquote className="mt-2 border-l-2 border-accent/60 pl-3 text-xs leading-relaxed italic">
                      “{h.text}”
                    </blockquote>
                    <p className="mt-1.5 text-[10px] text-muted-foreground">Marked by {h.by}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="annotations" className="m-0 divide-y">
                {doc.annotations.map((a) => (
                  <div key={a.id} className="flex gap-3 px-5 py-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium">
                        {a.author}
                        <span className="ml-2 font-normal text-muted-foreground">
                          p. {a.page} · {fmtDate(a.createdAt)}
                        </span>
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{a.body}</p>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </section>
      </div>
    </div>
  );
}
