import { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Paperclip,
  Quote,
  FileText,
  Scale,
  Sparkle,
  ListChecks,
  GitCompare,
  PenLine,
  Library,
  CalendarRange,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAssistant } from "./useAssistant";
import { MarkdownText } from "@/components/assistant/MarkdownText";
import { useCases } from "@/features/cases/useCases";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type QuickActionId = "summarize" | "contradictions" | "draft" | "similar" | "timeline";

const quickActions: { id: QuickActionId; label: string; prompt: string }[] = [
  { id: "summarize", label: "Summarize", prompt: "Summarize the current case documents." },
  { id: "contradictions", label: "Contradictions", prompt: "Find contradictions in the testimonies." },
  { id: "draft", label: "Draft Reply", prompt: "Draft a reply to the recent petition." },
  { id: "similar", label: "Similar Cases", prompt: "Find precedents similar to this case." },
  { id: "timeline", label: "Build Timeline", prompt: "Create a chronological timeline of events." },
];
const suggestedPrompts: string[] = [
  "What is the limitation period for filing the appeal?",
  "List the key arguments made by the opposing counsel.",
  "What evidence supports the plaintiff's claim?",
];

const actionIcon: Record<QuickActionId, typeof ListChecks> = {
  summarize: ListChecks,
  contradictions: GitCompare,
  draft: PenLine,
  similar: Library,
  timeline: CalendarRange,
};

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export default function AIAssistantPage() {
  const { threads, active, activeId, select, newThread, deleteThread, send, thinking, streaming, busy } =
    useAssistant();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  const { items: cases, loading: casesLoading } = useCases({ pageSize: 100 });
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!selectedCaseId && cases.length > 0) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active.messages.length, streaming, thinking]);

  const submit = (text: string, action?: QuickActionId) => {
    send(text, action, selectedCaseId);
    setInput("");
  };

  return (
    <div className="flex flex-col bg-background overflow-hidden h-[calc(100vh-3.5rem)] -mx-4 sm:-mx-6 lg:-mx-8 -my-6">
      <div className={cn("grid min-w-0 flex-1 overflow-hidden h-full", isSidebarOpen ? "grid-cols-[minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)]" : "grid-cols-1")}>
        {/* Conversation history */}
        {isSidebarOpen && (
          <aside className="hidden rounded-xl border bg-card shadow-panel lg:flex lg:flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b px-3 py-2.5">
            <p className="text-eyebrow">Conversations</p>
            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2" onClick={newThread}>
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
          <div className="flex-1 space-y-1 overflow-y-auto p-2">
            {threads.map((t) => (
              <div
                key={t.id}
                className={cn(
                  "group relative w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                  t.id === activeId ? "bg-secondary" : "hover:bg-surface-2",
                )}
              >
                <button
                  type="button"
                  onClick={() => select(t.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center gap-2 pr-6">
                    <MessageSquare
                      className={cn(
                        "h-3.5 w-3.5 shrink-0",
                        t.id === activeId ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <p className="truncate text-sm font-medium">{t.title}</p>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{t.preview}</p>
                  <div className="mt-1.5 flex items-center justify-between pr-6">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {t.caseNumber}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{fmtDay(t.updatedAt)}</span>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteThread(t.id);
                  }}
                  className="absolute right-2 top-2 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          </aside>
        )}

        {/* Chat window */}
        <section className="flex min-w-0 flex-col relative h-full bg-background overflow-hidden flex-1">
          <div className="flex items-center justify-between px-4 py-3 bg-background z-10 sticky top-0">
            <div className="flex items-center gap-2 min-w-0">
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 hidden lg:flex -ml-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
              <div className="flex flex-col min-w-0">
                <p className="truncate text-sm font-medium px-2">{active.title}</p>
                <Select 
                  value={activeId === "new" ? selectedCaseId : (cases.find(c => c.caseNumber === active.caseNumber)?.id || active.caseNumber)} 
                  onValueChange={setSelectedCaseId}
                  disabled={activeId !== "new"}
                >
                  <SelectTrigger className="h-6 w-auto max-w-[300px] text-[11px] bg-transparent border-none shadow-none focus:ring-0 px-2 text-muted-foreground hover:text-foreground">
                    <SelectValue placeholder={casesLoading ? "Loading cases…" : "Choose a case"} />
                  </SelectTrigger>
                  <SelectContent>
                    {cases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Sparkle className="h-3 w-3 text-primary" />
              jurisAssist Engine v3.2
            </Badge>
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
              {active.messages.length === 0 && !busy && (
                <div className="mx-auto max-w-md py-16 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <p className="mt-3 text-sm font-medium">Ask about the record</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Pleadings, depositions, exhibits and orders on file are already indexed.
                  </p>
                </div>
              )}

              {active.messages.map((m) =>
                m.role === "user" ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] space-y-2">
                      <div className="rounded-xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                        {m.content}
                      </div>
                      {m.attachments && (
                        <div className="flex flex-wrap justify-end gap-2">
                          {m.attachments.map((a) => (
                            <span
                              key={a.id}
                              className="flex items-center gap-1.5 rounded-md border bg-surface-2 px-2 py-1 text-[11px] text-muted-foreground"
                            >
                              <Paperclip className="h-3 w-3" />
                              <span className="max-w-[180px] truncate">{a.name}</span>
                              <span className="opacity-70">{a.sizeLabel}</span>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-right text-[10px] text-muted-foreground">
                        {fmtTime(m.at)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-3">
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                      <Scale className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="overflow-x-auto max-w-full prose prose-sm dark:prose-invert break-words">
                        <MarkdownText text={m.content} />
                      </div>
                      {m.citations && (
                        <div className="grid grid-cols-[minmax(0,1fr)] gap-2 sm:grid-cols-2">
                          {m.citations.map((c) => (
                            <article
                              key={c.id}
                              className="rounded-lg border bg-surface-2 p-3 transition-colors hover:border-primary/40"
                            >
                              <div className="flex items-start gap-2">
                                <Quote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brass" />
                                <div className="min-w-0">
                                  <p className="truncate text-xs font-medium">{c.label}</p>
                                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                                    {c.source} · {c.court}
                                  </p>
                                </div>
                              </div>
                              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                {c.passage}
                              </p>
                            </article>
                          ))}
                        </div>
                      )}
                      <p className="text-[10px] text-muted-foreground">{fmtTime(m.at)}</p>
                    </div>
                  </div>
                ),
              )}

              {thinking && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex items-center gap-2 pt-1.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
                        style={{ animationDelay: `${i * 140}ms` }}
                      />
                    ))}
                    <span className="text-xs text-muted-foreground">Reading the record…</span>
                  </div>
                </div>
              )}

              {streaming && (
                <div className="flex gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <MarkdownText text={streaming} />
                    <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-pulse bg-primary align-middle" />
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          {/* Bottom Area */}
          <div className="px-4 pb-6 pt-2 bg-gradient-to-t from-background via-background to-transparent">
            <div className="mx-auto max-w-4xl">
              {/* Action buttons and Suggested Prompts combined */}
              <div className="flex gap-2 flex-wrap pb-3 items-center justify-center">
                {quickActions.map((a) => {
                  const Icon = actionIcon[a.id];
                  return (
                    <Button
                      key={a.id}
                      size="sm"
                      variant="outline"
                      disabled={busy}
                      className="h-8 gap-1.5 text-[11px] shrink-0 rounded-full bg-background hover:bg-surface-2 transition-colors"
                      onClick={() => submit(a.prompt, a.id)}
                    >
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {a.label}
                    </Button>
                  );
                })}
                <div className="w-[1px] h-4 bg-border mx-1 shrink-0" />
                {suggestedPrompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    disabled={busy}
                    onClick={() => submit(p)}
                    className="shrink-0 rounded-full border bg-background px-4 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Prompt input */}
              <div className="rounded-3xl border border-border/40 bg-surface-2/40 backdrop-blur-md p-1.5 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 shadow-sm transition-all relative group">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(input);
                    }
                  }}
                  placeholder="Ask about exhibits, depositions, statutes or drafting…"
                  className="min-h-[44px] max-h-[160px] resize-none border-0 bg-transparent py-2.5 px-3 text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
                />
                <div className="flex items-center justify-end px-3 pt-1 pb-1">
                  <Button
                    size="sm"
                    className="h-8 gap-1.5 px-4 text-xs rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={busy || !input.trim()}
                    onClick={() => submit(input)}
                  >
                    <Send className="h-3 w-3" />
                    Send
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] text-muted-foreground/60">
                Generated analysis is a drafting aid and must be verified against the original record before filing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
