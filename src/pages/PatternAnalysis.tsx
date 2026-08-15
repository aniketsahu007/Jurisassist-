import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Gavel, Network, ThumbsDown, TrendingUp, ScrollText, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip as UiTooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { usePatterns } from "@/hooks/usePatterns";

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

const axis = {
  stroke: "var(--color-muted-foreground)",
  fontSize: 11,
  tickLine: false,
  axisLine: false,
};

const tooltipStyle = {
  background: "var(--color-popover)",
  border: "1px solid var(--color-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--color-popover-foreground)",
};

function Panel({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
}: {
  icon: typeof Network;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("panel p-5", className)}>
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function heatStyle(score: number): React.CSSProperties {
  return {
    backgroundColor: `color-mix(in oklab, var(--color-primary) ${Math.round(score * 0.9)}%, transparent)`,
  };
}

export default function PatternAnalysisPage() {
  const {
    loading,
    judgePreferences,
    successTrend,
    rejectedArguments,
    sectionOutcomes,
    strategyOutcomes,
    heatmapArguments,
    judgeArgumentHeatmap,
  } = usePatterns();
  const mounted = useMounted();
  const chartsReady = mounted && !loading;

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <div>
        <p className="text-eyebrow">Analytics</p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Pattern analysis</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          How benches respond, which arguments land, and where the practice is trending.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel
          icon={TrendingUp}
          title="Success rate trend"
          subtitle="Favourable outcomes by matter type, last seven quarters"
        >
          {!chartsReady ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={successTrend} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis dataKey="quarter" {...axis} />
                  <YAxis {...axis} unit="%" />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="bail"
                    name="Bail"
                    stroke="var(--color-chart-1)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="quashing"
                    name="Quashing"
                    stroke="var(--color-chart-2)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="appeals"
                    name="Appeals"
                    stroke="var(--color-chart-3)"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>

        <Panel
          icon={ScrollText}
          title="Frequently used sections"
          subtitle="Filings vs. favourable orders per provision"
        >
          {!chartsReady ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sectionOutcomes}
                  margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--color-border)"
                    vertical={false}
                  />
                  <XAxis dataKey="section" {...axis} interval={0} angle={-18} dy={10} height={48} />
                  <YAxis {...axis} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="filings"
                    name="Filings"
                    fill="var(--color-chart-4)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={26}
                  />
                  <Bar
                    dataKey="favourable"
                    name="Favourable"
                    fill="var(--color-chart-2)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={26}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Panel>
      </div>

      <Panel
        icon={Network}
        title="Judge × argument receptivity heatmap"
        subtitle="Historic acceptance intensity per bench, 0–100"
      >
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] border-separate border-spacing-1">
              <thead>
                <tr>
                  <th className="w-40 text-left text-eyebrow" />
                  {heatmapArguments.map((a) => (
                    <th key={a} className="pb-1 text-xs font-medium text-muted-foreground">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {judgeArgumentHeatmap.map((row) => (
                  <tr key={row.judge}>
                    <th className="pr-3 text-left text-xs font-medium whitespace-nowrap">
                      {row.judge}
                    </th>
                    {row.values.map((cell) => (
                      <td key={cell.argument}>
                        <UiTooltip>
                          <TooltipTrigger asChild>
                            <div
                              style={heatStyle(cell.score)}
                              className="flex h-11 items-center justify-center rounded-md border text-xs font-medium"
                            >
                              {cell.score}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            {row.judge} · {cell.argument}: {cell.score}% acceptance
                          </TooltipContent>
                        </UiTooltip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="h-2 w-40 rounded-full bg-gradient-to-r from-transparent to-primary ring-1 ring-border" />
              <span>High</span>
            </div>
          </div>
        )}
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel icon={Gavel} title="Judge preferences" subtitle="Grant rates and bench tendencies">
          <ul className="divide-y">
            {judgePreferences.map((j) => (
              <li key={j.id} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">{j.judge}</p>
                  <Badge variant="secondary">{j.grantRate}% grant rate</Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {j.court} · median {j.avgDaysToOrder} days to order
                </p>
                <Progress value={j.grantRate} className="mt-2 h-1.5" />
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="font-normal">
                    {j.leaning}
                  </Badge>
                  <Badge variant="outline" className="font-normal">
                    Responds to: {j.favouredArgument}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <div className="space-y-4">
          <Panel
            icon={Trophy}
            title="Most successful strategies"
            subtitle="Wins against attempts across the practice"
          >
            <ul className="space-y-3">
              {strategyOutcomes.map((s) => {
                const pct = Math.round((s.wins / s.attempts) * 100);
                return (
                  <li key={s.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">{s.strategy}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {s.wins}/{s.attempts} · {pct}%
                      </span>
                    </div>
                    <Progress value={pct} className="mt-1.5 h-1.5" />
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            icon={ThumbsDown}
            title="Rejected arguments"
            subtitle="Positions that have consistently failed"
          >
            <ul className="space-y-3">
              {rejectedArguments.map((r) => (
                <li key={r.id} className="rounded-lg border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm leading-relaxed">{r.argument}</p>
                    <Badge
                      variant="outline"
                      className="shrink-0 border-destructive/20 bg-destructive/10 text-destructive"
                    >
                      {r.rejections}×
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{r.commonReason}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </div>
  );
}
