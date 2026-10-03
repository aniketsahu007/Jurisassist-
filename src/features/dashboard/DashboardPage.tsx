import { Link } from "@tanstack/react-router";
import { CalendarPlus, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboard } from "./useDashboard";
import { useNotificationCenter } from "@/features/notifications/useNotificationCenter";
import { StatCards } from "@/components/dashboard/StatCards";
import { CasesByStatusChart, HearingsChart } from "@/components/dashboard/Charts";
import { ActivityPanel, NotificationsPanel } from "@/components/dashboard/ActivityPanel";

export default function DashboardPage() {
  const { loading, metrics, activity, casesByStatus, hearingsOverTime } =
    useDashboard();
  const { items: notifications } = useNotificationCenter();

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
          <Button variant="outline" size="sm" asChild>
            <Link to="/timeline">
              <CalendarPlus className="mr-2 h-4 w-4" /> View timeline
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/reports">
              <BrainCircuit className="mr-2 h-4 w-4" /> Generate AI report
            </Link>
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
