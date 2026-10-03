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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAssistant } from "./useAssistant";
import { MarkdownText } from "@/components/assistant/MarkdownText";

export type QuickActionId = "summarize" | "contradictions" | "draft" | "similar" | "timeline";

const quickActions: { id: QuickActionId; label: string; prompt: string }[] = [];
const suggestedPrompts: string[] = [];

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
  const { threads, active, activeId, select, newThread, send, thinking, streaming, busy } =
    useAssistant();
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active.messages.length, streaming, thinking]);

  const submit = (text: string, action?: QuickActionId) => {
    send(text, action);
    setInput("");
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-4">
      <header>
        <p className="text-eyebrow">Intelligence</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
          AI Legal Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Grounded in the documents on file for {active.caseNumber}. Responses are generated from
          indexed material and always cite their source.
        </p>
      </header>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        {/* Conversation history */}
        <aside className="hidden rounded-xl border bg-card shadow-panel lg:flex lg:flex-col">
          <div className="flex items-center justify-between border-b px-3 py-2.5">
            <p className="text-eyebrow">Conversations</p>
            <Button size="sm" variant="ghost" className="h-7 gap-1 px-2" onClick={newThread}>
              <Plus className="h-3.5 w-3.5" />
              New
            </Button>
          </div>
          <div className="h-[560px] space-y-1 overflow-y-auto p-2">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => select(t.id)}
                className={cn(
                  "w-full rounded-lg px-3 py-2.5 text-left transition-colors",
                  t.id === activeId ? "bg-secondary" : "hover:bg-surface-2",
                )}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      t.id === activeId ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                  <p className="truncate text-sm font-medium">{t.title}</p>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">{t.preview}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {t.caseNumber}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{fmtDay(t.updatedAt)}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat window */}
        <section className="flex min-h-[640px] min-w-0 flex-col rounded-xl border bg-card shadow-panel">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{active.title}</p>
              <p className="font-mono text-[11px] text-muted-foreground">{active.caseNumber}</p>
            </div>
            <Badge variant="outline" className="gap-1.5">
              <Sparkle className="h-3 w-3 text-primary" />
              jurisAssist Engine v3.2
            </Badge>
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto">
            <div className="min-w-0 space-y-5 px-4 py-5 sm:px-6">
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
                      <MarkdownText text={m.content} />
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

          {/* Suggested prompts */}
          <div className="border-t px-4 pt-3">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {suggestedPrompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  disabled={busy}
                  onClick={() => submit(p)}
                  className="shrink-0 rounded-full border bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 px-4 pb-3">
            {quickActions.map((a) => {
              const Icon = actionIcon[a.id];
              return (
                <Button
                  key={a.id}
                  size="sm"
                  variant="outline"
                  disabled={busy}
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => submit(a.prompt, a.id)}
                >
                  <Icon className="h-3.5 w-3.5 text-primary" />
                  {a.label}
                </Button>
              );
            })}
          </div>

          {/* Prompt input */}
          <div className="border-t p-3 sm:p-4">
            <div className="rounded-xl border bg-surface-2 p-2 focus-within:border-primary/50">
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
                className="min-h-[64px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
              />
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <FileText className="h-3 w-3" />
                  47 documents indexed
                </span>
                <Button
                  size="sm"
                  className="h-8 gap-1.5"
                  disabled={busy || !input.trim()}
                  onClick={() => submit(input)}
                >
                  <Send className="h-3.5 w-3.5" />
                  Send
                </Button>
              </div>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Generated analysis is a drafting aid and must be verified against the original record
              before filing.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
