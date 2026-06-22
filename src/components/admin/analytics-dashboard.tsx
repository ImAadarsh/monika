"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { formatAnalyticsDate, formatNumber } from "@/lib/utils";
import type { AnalyticsData } from "@/types/form";
import {
  BarChart3,
  Calendar,
  Clock,
  Monitor,
  TrendingUp,
  Users,
} from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];
const CHART_MIN_HEIGHT = 256;

function ChartContainer({
  children,
  className = "h-64 w-full min-h-[16rem]",
  minHeight = CHART_MIN_HEIGHT,
}: {
  children: ReactNode;
  className?: string;
  minHeight?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={className}>
      {mounted ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={minHeight}>
          {children}
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full" />
      )}
    </div>
  );
}

export function AnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const { overview, timeline, fieldStats, recentSubmissions, deviceBreakdown, hourlyDistribution } = data;
  const timelineData = useMemo(
    () =>
      timeline.map((point) => ({
        ...point,
        date: formatAnalyticsDate(point.date, "yyyy-MM-dd", ""),
      })).filter((point) => point.date),
    [timeline]
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Responses" value={formatNumber(overview.totalSubmissions)} icon={Users} />
        <StatCard title="Today" value={formatNumber(overview.submissionsToday)} icon={Calendar} change="Last 24 hours" />
        <StatCard title="This Week" value={formatNumber(overview.submissionsThisWeek)} icon={TrendingUp} />
        <StatCard title="This Month" value={formatNumber(overview.submissionsThisMonth)} icon={BarChart3} />
        {overview.totalViews !== undefined && overview.totalViews > 0 && (
          <StatCard title="Page Views" value={formatNumber(overview.totalViews)} icon={Monitor} change={`${overview.conversionRate}% conversion`} />
        )}
        {overview.avgCompletionTime !== undefined && overview.avgCompletionTime > 0 && (
          <StatCard title="Avg Completion" value={`${Math.round(overview.avgCompletionTime / 1000)}s`} icon={Clock} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submissions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <AreaChart data={timelineData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d) => formatAnalyticsDate(d, "MMM d")}
                    fontSize={12}
                  />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip
                    labelFormatter={(d) => formatAnalyticsDate(d, "MMM d, yyyy")}
                  />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={2} />
                </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hourly Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer>
              <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip labelFormatter={(h) => `${h}:00 - ${Number(h) + 1}:00`} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {deviceBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" /> Device Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-6 sm:flex-row">
              <ChartContainer className="h-48 w-48 min-h-[12rem] min-w-[12rem]" minHeight={192}>
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                    >
                      {deviceBreakdown.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
              </ChartContainer>
              <div className="space-y-2">
                {deviceBreakdown.map((d, i) => (
                  <div key={d.label} className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm">{d.label}</span>
                    <span className="text-sm font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Field Analytics</h3>
        <div className="grid gap-4 lg:grid-cols-2">
          {fieldStats.map((stat) => (
            <Card key={stat.fieldId}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{stat.fieldLabel}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {stat.responseCount} responses
                  {stat.average !== undefined && ` · Avg: ${stat.average.toFixed(1)}`}
                </p>
              </CardHeader>
              <CardContent>
                {stat.options && stat.options.length > 0 ? (
                  <div className="space-y-2">
                    {stat.options.map((opt, i) => (
                      <div key={opt.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span>{opt.label}</span>
                          <span className="text-muted-foreground">{opt.count} ({opt.percentage}%)</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${opt.percentage}%`, background: COLORS[i % COLORS.length] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stat.samples ? (
                  <div className="space-y-1">
                    {stat.samples.map((s, i) => (
                      <p key={i} className="truncate rounded bg-muted px-2 py-1 text-sm">{s}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No responses yet</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {recentSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Recent Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSubmissions.map((sub) => (
                <div key={sub.id} className="rounded-lg border border-border p-4">
                  <p className="mb-2 text-xs text-muted-foreground">
                    {formatAnalyticsDate(sub.submittedAt, "MMM d, yyyy · h:mm a")}
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {sub.answers.slice(0, 4).map((a) => (
                      <div key={a.fieldId} className="text-sm">
                        <span className="text-muted-foreground">{a.fieldLabel}: </span>
                        <span className="font-medium">
                          {Array.isArray(a.value) ? a.value.join(", ") : a.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
