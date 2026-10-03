import {
  Bell,
  CalendarClock,
  CheckCheck,
  FileCheck2,
  Gavel,
  BrainCircuit,
  TimerReset,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useNotificationCenter, type NotificationType } from "./useNotificationCenter";

const typeMeta: Record<NotificationType, { icon: typeof Bell; tone: string; dot: string }> = {
  "Upcoming Hearing": {
    icon: CalendarClock,
    tone: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  "Deadline Alert": {
    icon: TimerReset,
    tone: "bg-destructive/10 text-destructive border-destructive/20",
    dot: "bg-destructive",
  },
  "New Similar Judgment": {
    icon: Gavel,
    tone: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    dot: "bg-chart-3",
  },
  "Document Processed": {
    icon: FileCheck2,
    tone: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  "AI Report Ready": {
    icon: BrainCircuit,
    tone: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
};

const filters: (NotificationType | "all")[] = [
  "all",
  "Upcoming Hearing",
  "Deadline Alert",
  "New Similar Judgment",
  "Document Processed",
  "AI Report Ready",
];

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.round(diff / 3_600_000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export default function NotificationsPage() {
  const {
    items,
    counts,
    unread,
    type,
    setType,
    unreadOnly,
    setUnreadOnly,
    toggleRead,
    markAllRead,
    dismiss,
  } = useNotificationCenter();

  return (
    <div className="mx-auto max-w-[1100px] space-y-5">
      <header className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-eyebrow">Notifications</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Notification Centre
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {unread} unread across hearings, deadlines, judgments and AI activity.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="unread-only" checked={unreadOnly} onCheckedChange={setUnreadOnly} />
            <Label htmlFor="unread-only" className="text-sm text-muted-foreground">
              Unread only
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={markAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" /> Mark all read
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setType(f)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              type === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface-2 text-muted-foreground hover:text-foreground",
            )}
          >
            {f === "all" ? "All" : f}
            <span className="ml-1.5 opacity-70">{counts.get(f) ?? 0}</span>
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {items.map((n) => {
          const meta = typeMeta[n.type as keyof typeof typeMeta] || {
            icon: Bell,
            tone: "bg-muted/10 text-muted-foreground border-muted/20",
            dot: "bg-muted",
          };
          const Icon = meta.icon;
          return (
            <li
              key={n.id}
              className={cn(
                "panel flex gap-4 p-4 transition-colors",
                !n.is_read && "border-primary/30 bg-primary/[0.03]",
              )}
            >
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                  meta.tone,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!n.is_read && <span className={cn("h-2 w-2 rounded-full", meta.dot)} />}
                  <p className="text-sm font-semibold">{n.title}</p>
                  <Badge variant="outline" className={cn("text-[10px]", meta.tone)}>
                    {n.type}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{n.message}</p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  {n.link ? <a href={n.link} className="hover:underline text-primary mr-2">View Reference</a> : null}
                  {timeAgo(n.created_at)}
                </p>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-1">
                <Button variant="ghost" size="sm" onClick={() => toggleRead(n.id)}>
                  {n.is_read ? "Mark unread" : "Mark read"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Dismiss notification"
                  onClick={() => dismiss(n.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </li>
          );
        })}
        {items.length === 0 && (
          <li className="panel p-10 text-center text-sm text-muted-foreground">
            Nothing here — you're all caught up.
          </li>
        )}
      </ul>
    </div>
  );
}
