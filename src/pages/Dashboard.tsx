import { CalendarPlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/useDashboard";
import { StatCards } from "@/components/dashboard/StatCards";
import { CasesByStatusChart, HearingsChart } from "@/components/dashboard/Charts";
import { ActivityPanel, NotificationsPanel } from "@/components/dashboard/ActivityPanel";

export default function DashboardPage() {
  const { loading, metrics, activity, notifications, casesByStatus, hearingsOverTime } =
    useDashboard();

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-eyebrow">Monday, 2 August 2026</p>
          <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Practice overview</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Four matters listed this week. Two limitation windows close in under ten days.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <CalendarPlus className="mr-2 h-4 w-4" /> Add hearing
          </Button>
          <Button size="sm">
            <Sparkles className="mr-2 h-4 w-4" /> Generate AI report
          </Button>
        </div>
      </div>

      <StatCards metrics={metrics} loading={loading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <HearingsChart data={hearingsOverTime} loading={loading} />
        <CasesByStatusChart data={casesByStatus} loading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <ActivityPanel items={activity} loading={loading} />
        <NotificationsPanel items={notifications} loading={loading} />
      </div>
    </div>
  );
}
