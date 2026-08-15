import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import type { MetricPoint } from "@/data/dashboard";

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

function ChartFrame({
  title,
  subtitle,
  children,
  loading,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="panel p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {loading ? <Skeleton className="h-64 w-full" /> : <div className="h-64">{children}</div>}
    </div>
  );
}

export function CasesByStatusChart({ data, loading }: { data: MetricPoint[]; loading: boolean }) {
  const mounted = useMounted();
  const palette = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)",
    "var(--color-muted-foreground)",
  ];

  return (
    <ChartFrame
      title="Caseload by status"
      subtitle="Distribution across the active docket"
      loading={loading || !mounted}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="label" {...axis} interval={0} angle={-18} dy={10} height={48} />
          <YAxis {...axis} />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--color-muted)" }} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={44}>
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function HearingsChart({
  data,
  loading,
}: {
  data: { month: string; hearings: number; adjournments: number }[];
  loading: boolean;
}) {
  const mounted = useMounted();
  return (
    <ChartFrame
      title="Hearings over time"
      subtitle="Listed hearings vs. adjournments, last 7 months"
      loading={loading || !mounted}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gHearings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.5} />
              <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gAdj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
          <XAxis dataKey="month" {...axis} />
          <YAxis {...axis} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <Area
            type="monotone"
            dataKey="hearings"
            name="Hearings"
            stroke="var(--color-chart-2)"
            strokeWidth={2}
            fill="url(#gHearings)"
          />
          <Area
            type="monotone"
            dataKey="adjournments"
            name="Adjournments"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#gAdj)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
