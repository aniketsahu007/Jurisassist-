import { ArrowUpRight, TrendingUp, Briefcase, UploadCloud, Gavel, Sparkles } from "lucide-react";
import type { DashboardMetric } from "@/data/dashboard";
import { Skeleton } from "@/components/ui/skeleton";

const icons = [Briefcase, UploadCloud, Gavel, Sparkles];

export function StatCards({
  metrics,
  loading,
}: {
  metrics: DashboardMetric[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="panel p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((m, i) => {
        const Icon = icons[i % icons.length]!;
        return (
          <div
            key={m.id}
            className="panel group animate-rise relative overflow-hidden p-5 transition-shadow hover:shadow-lift"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between">
              <p className="text-eyebrow">{m.label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-secondary-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <p className="font-display mt-4 text-3xl font-semibold tabular-nums">{m.value}</p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 font-medium text-success">
                <TrendingUp className="h-3 w-3" />
                {m.delta}
              </span>
              <span className="text-muted-foreground">{m.hint}</span>
            </div>
            <ArrowUpRight className="absolute right-4 bottom-4 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        );
      })}
    </div>
  );
}
