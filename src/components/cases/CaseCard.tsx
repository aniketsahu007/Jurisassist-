import { CalendarClock, Gavel, FileText, Clock, Building2, User2, Hash } from "lucide-react";
import type { ApiCase } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Map backend CaseStatus enum values to UI display labels */
const statusLabel: Record<string, string> = {
  ACTIVE: "Active",
  UNDER_TRIAL: "Under Trial",
  RESERVED_FOR_JUDGMENT: "Reserved for Judgment",
  DISPOSED: "Disposed",
  STAYED: "Stayed",
  APPEAL_FILED: "Appeal Filed",
};

const statusClass: Record<string, string> = {
  ACTIVE: "bg-success/12 text-success border-success/25",
  UNDER_TRIAL: "bg-chart-3/12 text-chart-3 border-chart-3/25",
  RESERVED_FOR_JUDGMENT: "bg-accent/15 text-accent border-accent/30",
  DISPOSED: "bg-muted text-muted-foreground border-border",
  STAYED: "bg-destructive/12 text-destructive border-destructive/25",
  APPEAL_FILED: "bg-chart-1/12 text-chart-1 border-chart-1/25",
};

const priorityClass: Record<string, string> = {
  CRITICAL: "bg-destructive",
  HIGH: "bg-warning",
  MEDIUM: "bg-chart-3",
  LOW: "bg-muted-foreground",
};

function fmtDate(iso: string | undefined | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtRelative(iso: string | undefined | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.round(diff / 3600000);
  if (hrs < 24) return `${Math.max(1, hrs)}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function CaseCard({ item, index = 0 }: { item: ApiCase; index?: number }) {
  const statutes = item.statutes ?? [];

  return (
    <article
      className="panel animate-rise group flex flex-col p-5 transition-all hover:-translate-y-0.5 hover:shadow-lift"
      style={{ animationDelay: `${index * 45}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                priorityClass[item.priority] ?? priorityClass.MEDIUM,
              )}
            />
            {item.caseNumber && (
              <span className="font-mono text-[11px] text-muted-foreground">{item.caseNumber}</span>
            )}
          </div>
          <h3 className="mt-1.5 truncate text-base leading-snug font-semibold">{item.title}</h3>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-[11px]", statusClass[item.status])}>
          {statusLabel[item.status] ?? item.status}
        </Badge>
      </div>

      {item.summary && (
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.summary}
        </p>
      )}

      <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 text-xs sm:grid-cols-2">
        {item.clientName && <Row icon={User2} label="Client" value={item.clientName} />}
        {item.courtName && <Row icon={Building2} label="Court" value={item.courtName} />}
        {item.judgeName && <Row icon={Gavel} label="Judge" value={item.judgeName} />}
        {item.firNumber && <Row icon={Hash} label="FIR / Ref" value={item.firNumber} />}
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {item.caseType && (
          <Badge variant="secondary" className="text-[11px]">
            {item.caseType}
          </Badge>
        )}
        {statutes.slice(0, 2).map((s) => (
          <Badge key={s} variant="outline" className="font-mono text-[11px]">
            {s}
          </Badge>
        ))}
        <Badge variant="outline" className="text-[11px]">
          <FileText className="mr-1 h-3 w-3" />
          {item.documentsCount}
        </Badge>
      </div>

      <div className="mt-4 flex items-center justify-between border-t pt-3">
        <div className="space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-medium">
            <CalendarClock className="h-3.5 w-3.5 text-accent" />
            {item.nextHearingDate
              ? `Next hearing · ${fmtDate(item.nextHearingDate)}`
              : "No hearing scheduled"}
          </p>
          {item.updatedAt && (
            <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              Updated {fmtRelative(item.updatedAt)}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs opacity-70 transition-opacity group-hover:opacity-100"
        >
          Open
        </Button>
      </div>
    </article>
  );
}

function Row({ icon: Icon, label, value }: { icon: typeof User2; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <dt className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</dt>
        <dd className="truncate font-medium">{value}</dd>
      </div>
    </div>
  );
}

export function CaseCardSkeleton() {
  return (
    <div className="panel space-y-3 p-5">
      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
      <div className="h-3 w-full animate-pulse rounded bg-muted" />
      <div className="grid grid-cols-2 gap-3 pt-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded bg-muted" />
        ))}
      </div>
      <div className="h-10 animate-pulse rounded bg-muted" />
    </div>
  );
}
