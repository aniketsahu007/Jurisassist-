import { useState } from "react";
import {
  AlertTriangle,
  FileWarning,
  Fingerprint,
  FileStack,
  Gavel,
  ScrollText,
  ChevronDown,
  MapPin,
  UserCog,
  Paperclip,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useCaseTimeline } from "@/hooks/useTimeline";
import type { TimelineEvent, TimelineStage, TimelineStatus } from "@/data/timeline";

const stageIcon: Record<TimelineStage, typeof Gavel> = {
  Incident: AlertTriangle,
  "FIR Registered": FileWarning,
  Arrest: Fingerprint,
  Chargesheet: FileStack,
  Hearing: Gavel,
  Judgment: ScrollText,
};

const statusStyles: Record<TimelineStatus, { dot: string; badge: string; label: string }> = {
  completed: {
    dot: "bg-success text-success-foreground",
    badge: "border-success/25 bg-success/12 text-success",
    label: "Completed",
  },
  current: {
    dot: "bg-accent text-accent-foreground",
    badge: "border-accent/30 bg-accent/12 text-accent",
    label: "Next listed",
  },
  adjourned: {
    dot: "bg-destructive text-destructive-foreground",
    badge: "border-destructive/25 bg-destructive/12 text-destructive",
    label: "Adjourned",
  },
  upcoming: {
    dot: "bg-muted text-muted-foreground",
    badge: "border-border bg-muted text-muted-foreground",
    label: "Anticipated",
  },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function CaseTimelinePage() {
  const { events, loading } = useCaseTimeline();
  const [open, setOpen] = useState<string | null>("t-9");

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <div>
        <p className="text-eyebrow">Case timeline</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          State of Maharashtra v. Rohan Deshmukh
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          CRL.A. 482/2024 · Bombay High Court · Incident through judgment, reconstructed from the
          record.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(Object.keys(statusStyles) as TimelineStatus[]).map((s) => (
          <Badge key={s} variant="outline" className={cn("text-[11px]", statusStyles[s].badge)}>
            {statusStyles[s].label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="panel h-24 animate-pulse bg-muted/40" />
          ))}
        </div>
      ) : (
        <ol className="relative space-y-4 border-l-2 border-border pl-6 sm:pl-8">
          {events.map((event, i) => (
            <TimelineNode
              key={event.id}
              event={event}
              index={i}
              expanded={open === event.id}
              onToggle={() => setOpen(open === event.id ? null : event.id)}
            />
          ))}
        </ol>
      )}
    </div>
  );
}

function TimelineNode({
  event,
  index,
  expanded,
  onToggle,
}: {
  event: TimelineEvent;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = stageIcon[event.stage];
  const style = statusStyles[event.status];

  return (
    <li className="animate-rise relative" style={{ animationDelay: `${index * 45}ms` }}>
      <span
        className={cn(
          "absolute top-4 -left-[37px] flex h-7 w-7 items-center justify-center rounded-full ring-4 ring-background sm:-left-[45px]",
          style.dot,
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>

      <div
        className={cn(
          "panel transition-shadow hover:shadow-lift",
          event.status === "current" && "border-accent/40",
        )}
      >
        <button
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-start justify-between gap-3 p-4 text-left sm:p-5"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground">
                {fmtDate(event.date)}
              </span>
              <Badge variant="secondary" className="text-[10px]">
                {event.stage}
              </Badge>
              <Badge variant="outline" className={cn("text-[10px]", style.badge)}>
                {style.label}
              </Badge>
            </div>
            <h3 className="mt-1.5 text-sm font-semibold sm:text-base">{event.title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {event.description}
            </p>
          </div>
          <ChevronDown
            className={cn(
              "mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        {expanded && (
          <div className="space-y-3 border-t px-4 py-4 text-xs sm:px-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Detail icon={MapPin} label="Venue" value={event.details.location} />
              <Detail icon={UserCog} label="Before / by" value={event.details.officer} />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground uppercase">
                <Paperclip className="h-3 w-3" /> Documents on record
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {event.details.documents.map((d) => (
                  <Badge key={d} variant="outline" className="text-[10px]">
                    {d}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="rounded-md bg-muted/60 p-3 leading-relaxed text-muted-foreground">
              {event.details.notes}
            </p>
          </div>
        )}
      </div>
    </li>
  );
}

function Detail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
