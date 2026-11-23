"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  MessageSquare, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Mail,
  Lock,
  Layers,
  Activity
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CampaignOverviewData, toggleFlowPause } from "@/lib/actions/campaigns";
import { getStepMeta } from "@/lib/steps";
import { cn } from "@/lib/utils";

interface CampaignsDashboardProps {
  initialData: CampaignOverviewData;
}

export function CampaignsDashboard({ initialData }: CampaignsDashboardProps) {
  const [data, setData] = React.useState<CampaignOverviewData>(initialData);
  const [isPauseConfirmOpen, setIsPauseConfirmOpen] = React.useState(false);
  const [isToggling, setIsToggling] = React.useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const targetState = !data.isFlowPaused;
      await toggleFlowPause(targetState);
      setData((prev) => ({ ...prev, isFlowPaused: targetState }));
      setIsPauseConfirmOpen(false);
    } catch (err) {
      console.error("Failed to toggle pause status:", err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Top Header & Operational Control Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground shrink-0 whitespace-nowrap">
            Continuous Outreach Engine
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active sequence governing {data.totalLeads} prospects across 6 sequential multi-channel touchpoints.
          </p>
        </div>

        {/* Workflow State Toggle Button */}
        <div className="flex items-center gap-2">
          {data.isFlowPaused ? (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-lg text-xs text-amber-700 dark:text-amber-400">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span className="font-semibold">Automation Paused</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 rounded-lg text-xs text-emerald-700 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold">Automation Active</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPauseConfirmOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            {data.isFlowPaused ? (
              <>
                <Play className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
                Resume Engine
              </>
            ) : (
              <>
                <Pause className="h-3.5 w-3.5 text-amber-600" />
                Pause Engine
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Primary Funnel Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total Pipeline
          </span>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {data.totalLeads}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Prospects in system
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Active Sequence
          </span>
          <p className="text-xl font-bold tabular-nums text-blue-600 dark:text-blue-400">
            {data.activeLeads}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Progressing touches
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Replied / Converted
          </span>
          <p className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
            {data.repliedLeads}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Positive engagement
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Completed Touches
          </span>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {data.completedLeads}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Reached Step 5
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Suppressed / Halted
          </span>
          <p className="text-xl font-bold tabular-nums text-rose-600 dark:text-rose-400">
            {data.suppressedLeads}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Excluded from outreach
          </span>
        </div>
      </div>

      {/* Pipeline Progression Funnel (Cohorts by Step) */}
      <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-primary" />
              Pipeline Step Distribution (Cohorts)
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Volume of prospects currently positioned across sequential outreach stages.
            </p>
          </div>

          <Link href="/leads">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1 rounded-lg">
              View All in CRM
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>

        <div className="space-y-3 pt-1">
          {data.cohorts.map((cohort) => {
            const percentage =
              data.totalLeads > 0
                ? Math.round((cohort.count / data.totalLeads) * 100)
                : 0;
            const meta = getStepMeta(cohort.step);

            return (
              <div key={cohort.step} className="space-y-1.5 p-2 rounded-lg hover:bg-muted/20 transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold border tabular-nums shrink-0",
                      meta.badgeClass
                    )}>
                      {meta.shortLabel}
                    </span>
                    <span className="font-semibold text-foreground truncate">{cohort.label}</span>
                  </div>

                  <div className="flex items-center gap-2 tabular-nums shrink-0 ml-2">
                    <span className="font-bold text-foreground">{cohort.count} leads</span>
                    <span className="text-muted-foreground text-[11px]">({percentage}%)</span>
                  </div>
                </div>

                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      meta.barColor
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Channel Volume & Queue Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs">
        {/* Channel Deliveries */}
        <div className="border border-border/80 rounded-xl bg-card p-4 space-y-3.5 shadow-xs">
          <div className="border-b border-border/60 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Multi-Channel Deliverability
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Historical touchpoints dispatched across integrated channels.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3 text-sky-500" />
                Emails Sent
              </span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {data.channelTouches.emailSent}
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">SMTP dispatches</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <LinkedinIcon className="h-3 w-3 text-blue-600" />
                LinkedIn Actions
              </span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {data.channelTouches.linkedinSent}
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">Invites & Messages</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <MessageSquare className="h-3 w-3 text-emerald-500" />
                Total Replies
              </span>
              <p className="text-lg font-bold tabular-nums text-foreground">
                {data.channelTouches.replies}
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">Recorded responses</span>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-1">
              <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-emerald-500" />
                Reply Conversion
              </span>
              <p className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                {data.channelTouches.replyRate}%
              </p>
              <span className="text-[10px] text-muted-foreground block truncate">Overall engagement rate</span>
            </div>
          </div>
        </div>

        {/* Dispatch Queue & Locks */}
        <div className="border border-border/80 rounded-xl bg-card p-4 space-y-3.5 shadow-xs">
          <div className="border-b border-border/60 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Dispatch Queue & Worker Locks
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live scheduler state monitoring prospects awaiting next outreach touch.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium text-foreground">Scheduled for Future Touch</span>
              </div>
              <strong className="text-foreground tabular-nums">
                {data.queueStats.scheduledFuture} prospects
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium text-foreground">Ready to Send (Eligible Window)</span>
              </div>
              <strong className="text-foreground tabular-nums">
                {data.queueStats.readyToSend} prospects
              </strong>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-amber-500" />
                <span className="font-medium text-foreground">Locked by Active n8n Workers</span>
              </div>
              <strong className="text-foreground tabular-nums">
                {data.queueStats.processingLocked} locked
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Pause / Resume Dialog */}
      <ConfirmDialog
        open={isPauseConfirmOpen}
        onOpenChange={setIsPauseConfirmOpen}
        title={data.isFlowPaused ? "Resume Continuous Outreach?" : "Pause Continuous Outreach?"}
        description={
          data.isFlowPaused
            ? "Resuming the continuous outreach engine will allow n8n workers to continue processing scheduled touches during business hours."
            : "Pausing will immediately halt all scheduled outreach touches. Active workers will complete their current step, but no new emails or LinkedIn invitations will be dispatched."
        }
        confirmLabel={data.isFlowPaused ? "Resume Outreach" : "Pause Outreach"}
        variant={data.isFlowPaused ? "default" : "warning"}
        loading={isToggling}
        onConfirm={handleToggle}
      />
    </div>
  );
}
