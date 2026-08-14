import { FileText, Gavel, Sparkles, ScrollText, Stamp, Inbox } from "lucide-react";
import type { ActivityItem, NotificationItem } from "@/data/dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const kindIcon = {
  filing: ScrollText,
  hearing: Gavel,
  ai: Sparkles,
  document: FileText,
  order: Stamp,
} as const;

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function ActivityPanel({
  items,
  loading,
}: {
  items: ActivityItem[];
  loading: boolean;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Recent activity</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Across your matters</p>
        </div>
        <Button variant="ghost" size="sm" className="text-xs">
          View all
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No activity yet"
          detail="Filings, orders and AI reports will appear here."
        />
      ) : (
        <ol className="relative space-y-1">
          {items.map((item, i) => {
            const Icon = kindIcon[item.kind];
            return (
              <li
                key={item.id}
                className="animate-rise flex gap-3 rounded-lg p-2 transition-colors hover:bg-muted/60"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.actor}</span>{" "}
                    <span className="text-muted-foreground">{item.action}</span>{" "}
                    <span className="font-medium">{item.target}</span>
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono">{item.caseNumber}</span>
                    <span>·</span>
                    <span>{timeAgo(item.timestamp)}</span>
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function NotificationsPanel({
  items,
  loading,
}: {
  items: NotificationItem[];
  loading: boolean;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Notifications</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">Deadlines and registry alerts</p>
        </div>
        <Badge variant="secondary">{items.filter((n) => !n.read).length} new</Badge>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((n, i) => (
            <li
              key={n.id}
              className={cn(
                "animate-rise rounded-lg border p-3 transition-colors hover:bg-muted/50",
                !n.read && "bg-surface-2",
              )}
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={cn(
                    "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                    n.level === "urgent" && "bg-destructive",
                    n.level === "info" && "bg-chart-3",
                    n.level === "success" && "bg-success",
                  )}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {n.detail}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-14 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Inbox className="h-5 w-5" />
      </span>
      <p className="mt-4 text-sm font-medium">{title}</p>
      <p className="mt-1 max-w-xs text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}
