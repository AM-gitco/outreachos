"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users,
  Activity,
  ArrowRight,
  Mail,
  Clock,
  ChevronRight,
  SendHorizontal,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import {
  DashboardMetrics,
  getLiveDashboardMetrics,
} from "@/lib/actions/dashboard";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateShort } from "@/lib/utils";
import { DateRangePicker, DateRange, PresetRangeKey } from "@/components/ui/custom-datepicker";
import { OutreachActivityChart } from "@/components/dashboard/outreach-activity-chart";
import { ChannelBreakdownChart } from "@/components/dashboard/channel-breakdown-chart";
import { LinkedInHealthCard } from "@/components/dashboard/linkedin-health-card";
import { AlertsBanner } from "@/components/dashboard/alerts-banner";
import { Button } from "@/components/ui/button";

interface DashboardViewProps {
  initialMetrics: DashboardMetrics;
  isConfigured: boolean;
}

export function DashboardView({
  initialMetrics,
  isConfigured,
}: DashboardViewProps) {
  const [metrics, setMetrics] = React.useState<DashboardMetrics>(initialMetrics);
  const [isPending, startTransition] = React.useTransition();
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);

  const handleDateChange = (newRange: DateRange, presetKey: PresetRangeKey) => {
    setDateRange(newRange);
    startTransition(async () => {
      const fromStr = newRange.from.toISOString();
      const toStr = newRange.to.toISOString();
      const updated = await getLiveDashboardMetrics({ from: fromStr, to: toStr });
      setMetrics(updated);
    });
  };

  const handleRefresh = () => {
    startTransition(async () => {
      const fromStr = dateRange?.from.toISOString();
      const toStr = dateRange?.to.toISOString();
      const updated = await getLiveDashboardMetrics({ from: fromStr, to: toStr });
      setMetrics(updated);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Top Operations Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              Operations Overview
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-border bg-muted/40 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time pipeline metrics from Supabase and active n8n automation sequences
          </p>
        </div>

        {/* Controls: Date Picker & Refresh */}
        <div className="flex items-center gap-2">
          <DateRangePicker value={dateRange} onChange={handleDateChange} />
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isPending}
            title="Refresh metrics from database"
            aria-label="Refresh metrics"
            className="h-9 w-9 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin text-primary" : "text-muted-foreground"}`} />
          </Button>
        </div>
      </div>

      {/* Loading Indicator Bar */}
      {isPending && (
        <div className="h-0.5 w-full bg-primary/20 overflow-hidden rounded-full">
          <div className="h-full bg-primary w-1/3 animate-pulse" />
        </div>
      )}

      {/* Main Dynamic Content Area with Smooth Transition */}
      <div className={`space-y-6 transition-all duration-300 ${isPending ? "opacity-60 scale-[0.998]" : "opacity-100 scale-100"}`}>
        {/* System Alerts */}
        <AlertsBanner alerts={metrics.systemAlerts} />

        {/* Primary KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 rounded-xl border border-border bg-card shadow-2xs divide-x divide-y sm:divide-y-0 divide-border overflow-hidden transition-shadow hover:shadow-xs">
          <div className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Leads
            </span>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground mt-1.5">
              {metrics.totalLeads}
            </div>
            <div className="text-xs text-muted-foreground mt-1">In CRM database</div>
          </div>

          <div className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Leads
            </span>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums text-blue-600 dark:text-blue-400 mt-1.5">
              {metrics.activeLeads}
            </div>
            <div className="text-xs text-muted-foreground mt-1">In active sequence</div>
          </div>

          <div className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Replied
            </span>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-1.5">
              {metrics.repliedLeads}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Rate: <strong className="text-foreground">{metrics.replyRate}%</strong>
            </div>
          </div>

          <div className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Completed
            </span>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground mt-1.5">
              {metrics.completedLeads}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Sequences finished</div>
          </div>

          <div className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Suppressed
            </span>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums text-rose-600 dark:text-rose-400 mt-1.5">
              {metrics.suppressedLeads}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Excluded leads</div>
          </div>

          <div className="p-4 sm:p-5 transition-colors hover:bg-muted/20">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Queue Status
            </span>
            <div className="text-2xl sm:text-3xl font-bold tabular-nums text-foreground mt-1.5 flex items-center gap-1.5">
              <span>{metrics.currentlyProcessing}</span>
              <span className="text-xs font-normal text-muted-foreground">processing</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {metrics.awaitingNextTouch} awaiting touch
            </div>
          </div>
        </div>

        {/* Analytics Section: Area Trend Chart + Donut Ring Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Outreach Activity Trend Chart (2 Columns) */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    Outreach Activity Trend
                  </h3>
                  {metrics.isHourlyView && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                      24-Hour View
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.isHourlyView
                    ? "Hourly distribution of outreach touches across the day"
                    : "Daily volume of sent emails, LinkedIn touches, and prospect replies"}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-muted-foreground">Email</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-muted-foreground">LinkedIn</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span className="text-muted-foreground">Replies</span>
                </span>
              </div>
            </div>

            <OutreachActivityChart
              data={metrics.dailyActivity}
              isHourlyView={metrics.isHourlyView}
            />
          </div>

          {/* Unique Circular Donut Channel Volume (1 Column) */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="text-sm font-semibold text-foreground">
                Channel Distribution
              </h3>
              <p className="text-xs text-muted-foreground">
                Breakdown between Email vs. LinkedIn actions
              </p>
            </div>

            <ChannelBreakdownChart data={metrics.channelPerformance} />
          </div>
        </div>

        {/* Operations 2-Column Grid: Accounts & Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Real Activity Feed & Scheduled Outreach */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Recent Activity Feed */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Recent Outreach Touches
                  </h3>
                </div>
                <Link
                  href="/activity"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>View full history</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {metrics.recentActivity.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                  No activity events recorded in this timeframe.
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {metrics.recentActivity.map((evt) => (
                    <div
                      key={evt.id}
                      className="py-3 flex items-start justify-between gap-3 hover:bg-accent/40 px-2 rounded-lg transition-colors text-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5 shrink-0">
                          {evt.channel.toLowerCase() === "email" ? (
                            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                              <Mail className="h-3.5 w-3.5" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                              <LinkedinIcon className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs truncate">
                              {evt.prospect_name}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate hidden sm:inline">
                              {evt.prospect_company}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-mono">
                            Action: <span className="text-foreground font-medium">{evt.action}</span> • Step {evt.step}
                          </div>
                          {evt.message && (
                            <p className="text-[11px] text-muted-foreground/90 italic truncate max-w-md pt-0.5">
                              "{evt.message}"
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-[11px] tabular-nums font-mono text-muted-foreground shrink-0 text-right">
                        {formatDateShort(evt.sent_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Touches / Lead Queue */}
            <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">
                    Active Outreach Queue
                  </h3>
                </div>
                <Link
                  href="/leads"
                  className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                >
                  <span>Pipeline view</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-border">
                {metrics.upcomingTouches.map((p) => {
                  const name =
                    [p.first_name, p.last_name].filter(Boolean).join(" ") ||
                    "Unnamed Prospect";
                  return (
                    <div
                      key={p.id}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0">
                        <div className="font-medium text-foreground truncate">
                          {name}
                        </div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          {p.company || "No Company"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-muted-foreground">
                          Step {p.current_step}
                        </span>
                        <StatusBadge status={p.status} type="lead" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): LinkedIn Account Health & Quick Actions */}
          <div className="space-y-6">
            {/* LinkedIn Health Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  LinkedIn Account Monitor
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {metrics.linkedinAccounts.length} Active
                </span>
              </div>
              <LinkedInHealthCard accounts={metrics.linkedinAccounts} />
            </div>

            {/* Operational Shortcuts */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-2xs">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Direct Modules
              </h4>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <Link
                  href="/leads"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-foreground">Leads Management</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/automation"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <SendHorizontal className="h-4 w-4 text-purple-500" />
                    <span className="font-medium text-foreground">Automation Center</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>

                <Link
                  href="/suppression"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background hover:bg-accent/60 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-rose-500" />
                    <span className="font-medium text-foreground">Do Not Contact List</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
