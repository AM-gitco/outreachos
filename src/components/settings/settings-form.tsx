"use client";

import * as React from "react";
import { 
  ShieldCheck, 
  Clock, 
  Save, 
  Check, 
  AlertCircle, 
  Globe,
  Sun,
  Moon,
  Calendar,
  Shield,
  Database,
  Lock,
  Unlock,
  RefreshCw
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { 
  OutreachConfigRecord, 
  updateOutreachConfig, 
  OutreachConfigPayload 
} from "@/lib/actions/settings";
import { QueueHealthStats } from "@/lib/types";
import { releaseStaleLocksAction } from "@/lib/actions/automation-errors";
import { cn } from "@/lib/utils";

interface SettingsFormProps {
  initialRecord: OutreachConfigRecord;
  initialQueueStats?: QueueHealthStats;
}

const TIMEZONE_OPTIONS: DropdownOption[] = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US / Canada — EST/EDT)" },
  { value: "America/Chicago", label: "Central Time (US / Canada — CST/CDT)" },
  { value: "America/Denver", label: "Mountain Time (US / Canada — MST/MDT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US / Canada — PST/PDT)" },
  { value: "Europe/London", label: "London (GMT / BST)" },
  { value: "Europe/Berlin", label: "Central European Time (Berlin, Paris)" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai — GST)" },
  { value: "Asia/Karachi", label: "Pakistan Standard Time (Karachi — PKT)" },
  { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
  { value: "Asia/Singapore", label: "Singapore / Hong Kong (SGT)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo — JST)" },
  { value: "Australia/Sydney", label: "Sydney / Melbourne (AEST)" },
];

export function SettingsForm({ initialRecord, initialQueueStats }: SettingsFormProps) {
  // Queue & Locks state
  const [queueStats, setQueueStats] = React.useState<QueueHealthStats>(
    initialQueueStats || { lockedCount: 0, staleCount: 0, totalActiveCount: 0 }
  );
  const [isReleasingLocks, setIsReleasingLocks] = React.useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = React.useState(false);
  const [releaseMessage, setReleaseMessage] = React.useState<string | null>(null);

  // LinkedIn state
  const [maxDailyRequests, setMaxDailyRequests] = React.useState(
    String(initialRecord.config.linkedin?.max_daily_requests ?? 20)
  );
  const [maxWeeklyRequests, setMaxWeeklyRequests] = React.useState(
    String(initialRecord.config.linkedin?.max_weekly_requests ?? 80)
  );
  const [maxDailyMessages, setMaxDailyMessages] = React.useState(
    String(initialRecord.config.linkedin?.max_daily_messages ?? 40)
  );
  const [maxPendingInvites, setMaxPendingInvites] = React.useState(
    String(initialRecord.config.linkedin?.max_pending_invites ?? 100)
  );
  const [minAcceptanceRate, setMinAcceptanceRate] = React.useState(
    String(initialRecord.config.linkedin?.min_acceptance_rate ?? 20)
  );
  const [pauseOnRestriction, setPauseOnRestriction] = React.useState(
    initialRecord.config.linkedin?.pause_on_restriction ?? true
  );

  // Scheduling state
  const [timezone, setTimezone] = React.useState(
    initialRecord.config.scheduling?.default_timezone || "UTC"
  );
  const [businessStartHour, setBusinessStartHour] = React.useState(
    String(initialRecord.config.scheduling?.business_start_hour ?? 9)
  );
  const [businessEndHour, setBusinessEndHour] = React.useState(
    String(initialRecord.config.scheduling?.business_end_hour ?? 17)
  );
  const [delayMin, setDelayMin] = React.useState(
    String(initialRecord.config.scheduling?.delay_business_days_min ?? 2)
  );
  const [delayMax, setDelayMax] = React.useState(
    String(initialRecord.config.scheduling?.delay_business_days_max ?? 3)
  );

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  const formatHour = (hourStr: string) => {
    const h = parseInt(hourStr, 10);
    if (isNaN(h)) return "--:00";
    const period = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${String(hour12).padStart(2, "0")}:00 ${period}`;
  };

  const activeWindowDuration = React.useMemo(() => {
    const s = parseInt(businessStartHour, 10) || 0;
    const e = parseInt(businessEndHour, 10) || 0;
    const diff = e - s;
    return diff > 0 ? `${diff} hours / day` : "Custom";
  }, [businessStartHour, businessEndHour]);

  const handleSaveConfirmed = async () => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      const payload: Partial<OutreachConfigPayload> = {
        linkedin: {
          max_daily_requests: parseInt(maxDailyRequests, 10) || 20,
          max_weekly_requests: parseInt(maxWeeklyRequests, 10) || 80,
          max_daily_messages: parseInt(maxDailyMessages, 10) || 40,
          max_pending_invites: parseInt(maxPendingInvites, 10) || 100,
          min_acceptance_rate: parseFloat(minAcceptanceRate) || 20,
          pause_on_restriction: pauseOnRestriction,
        },
        scheduling: {
          default_timezone: timezone,
          business_start_hour: parseInt(businessStartHour, 10) || 9,
          business_end_hour: parseInt(businessEndHour, 10) || 17,
          delay_business_days_min: parseInt(delayMin, 10) || 2,
          delay_business_days_max: parseInt(delayMax, 10) || 3,
        },
      };

      const res = await updateOutreachConfig(initialRecord.id, payload);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to update configuration.");
        return;
      }

      setIsConfirmOpen(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReleaseStaleLocks = async () => {
    setIsReleasingLocks(true);
    try {
      const res = await releaseStaleLocksAction();
      setReleaseMessage(res.message);
      if (res.success) {
        setQueueStats((prev) => ({
          ...prev,
          lockedCount: Math.max(0, prev.lockedCount - res.releasedCount),
          staleCount: 0,
        }));
      }
      setTimeout(() => setReleaseMessage(null), 5000);
    } catch (err) {
      console.error("Failed to release stale locks:", err);
      setReleaseMessage("Failed to execute release procedure.");
    } finally {
      setIsReleasingLocks(false);
    }
  };

  return (
    <div className="space-y-6 w-full pb-12">
      {/* Top Header: Clean & Focused */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            Outreach Settings
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure sender quota limits, delivery schedules, and sequence intervals.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {saveSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 animate-in fade-in duration-200">
              <Check className="h-3.5 w-3.5" />
              Settings Saved
            </span>
          )}

          <Button
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            disabled={isSaving}
            className="h-8.5 text-xs font-semibold gap-1.5 rounded-lg shadow-xs"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="font-medium">{errorMsg}</span>
        </div>
      )}

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: LinkedIn Quotas & Safety */}
        <div className="border border-border/80 rounded-xl bg-card p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
              <LinkedinIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                LinkedIn Sender Quotas
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Per-account daily limits and automatic safeguard rules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs block">
                Daily Requests
              </label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={maxDailyRequests}
                  onChange={(e) => setMaxDailyRequests(e.target.value)}
                  className="h-8.5 text-xs tabular-nums rounded-lg pr-16 font-medium"
                />
                <span className="absolute right-3 text-[11px] text-muted-foreground pointer-events-none">
                  reqs/day
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs block">
                Weekly Requests Ceiling
              </label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="1"
                  max="400"
                  value={maxWeeklyRequests}
                  onChange={(e) => setMaxWeeklyRequests(e.target.value)}
                  className="h-8.5 text-xs tabular-nums rounded-lg pr-18 font-medium"
                />
                <span className="absolute right-3 text-[11px] text-muted-foreground pointer-events-none">
                  reqs/week
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs block">
                Daily Direct Messages
              </label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="1"
                  max="200"
                  value={maxDailyMessages}
                  onChange={(e) => setMaxDailyMessages(e.target.value)}
                  className="h-8.5 text-xs tabular-nums rounded-lg pr-16 font-medium"
                />
                <span className="absolute right-3 text-[11px] text-muted-foreground pointer-events-none">
                  DMs/day
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs block">
                Pending Invites Cap
              </label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="10"
                  max="1000"
                  value={maxPendingInvites}
                  onChange={(e) => setMaxPendingInvites(e.target.value)}
                  className="h-8.5 text-xs tabular-nums rounded-lg pr-16 font-medium"
                />
                <span className="absolute right-3 text-[11px] text-muted-foreground pointer-events-none">
                  pending
                </span>
              </div>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-foreground text-xs block">
                Min Acceptance Rate Floor (%)
              </label>
              <div className="relative flex items-center">
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={minAcceptanceRate}
                  onChange={(e) => setMinAcceptanceRate(e.target.value)}
                  className="h-8.5 text-xs tabular-nums rounded-lg pr-10 font-medium"
                />
                <span className="absolute right-3 text-[11px] text-muted-foreground pointer-events-none">
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Clean Safeguard Toggle */}
          <div className="pt-2 border-t border-border/50">
            <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/60 cursor-pointer hover:bg-muted/40 transition-colors">
              <input
                type="checkbox"
                checked={pauseOnRestriction}
                onChange={(e) => setPauseOnRestriction(e.target.checked)}
                className="rounded border-border text-primary focus:ring-1 focus:ring-primary h-4 w-4 mt-0.5"
              />
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-foreground block">
                  Pause outbound touches on account restriction
                </span>
                <span className="text-[11px] text-muted-foreground block leading-relaxed">
                  Automatically halts sending if LinkedIn detects a challenge, avoiding account penalties.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 2: Delivery Windows & Cadence */}
        <div className="border border-border/80 rounded-xl bg-card p-5 space-y-5 shadow-xs">
          <div className="flex items-center gap-2.5 border-b border-border/60 pb-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">
                Schedule & Follow-Up Cadence
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Operating timezone, daily business hours, and delays between touches.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            {/* Timezone */}
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs block">
                Default Timezone
              </label>
              <CustomDropdown
                options={TIMEZONE_OPTIONS}
                value={timezone}
                onChange={setTimezone}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            {/* Business Hours */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground text-xs">
                  Active Business Hours
                </label>
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 tabular-nums">
                  {formatHour(businessStartHour)} – {formatHour(businessEndHour)} ({activeWindowDuration})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Start Hour (0–23)</span>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={businessStartHour}
                    onChange={(e) => setBusinessStartHour(e.target.value)}
                    className="h-8.5 text-xs tabular-nums rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground block">End Hour (0–23)</span>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={businessEndHour}
                    onChange={(e) => setBusinessEndHour(e.target.value)}
                    className="h-8.5 text-xs tabular-nums rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Delays Between Touches */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-foreground text-xs">
                  Delay Between Sequence Steps
                </label>
                <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 tabular-nums">
                  {delayMin} to {delayMax} business days
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Min Days</span>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={delayMin}
                    onChange={(e) => setDelayMin(e.target.value)}
                    className="h-8.5 text-xs tabular-nums rounded-lg font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground block">Max Days</span>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={delayMax}
                    onChange={(e) => setDelayMax(e.target.value)}
                    className="h-8.5 text-xs tabular-nums rounded-lg font-medium"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Database Queue & Concurrency Maintenance Section */}
      <div className="border border-border/80 rounded-xl bg-card p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Database Queue & Lock Engine
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                PostgreSQL stored procedures (claim_due_prospects & release_stale_prospect_locks) guarding worker concurrency.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {releaseMessage && (
              <span className="text-xs text-muted-foreground animate-in fade-in duration-150">
                {releaseMessage}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setReleaseDialogOpen(true)}
              disabled={isReleasingLocks}
              className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/80 hover:bg-muted"
            >
              <Unlock className="h-3.5 w-3.5 text-amber-500" />
              <span>{isReleasingLocks ? "Releasing..." : "Release Stale Locks (RPC)"}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
              Active Unlocked Queue
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums block">
              {queueStats.totalActiveCount} Leads
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              Eligible for atomic claim by n8n
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Active Worker Locks
              </span>
              <Lock className="h-3.5 w-3.5 text-amber-500" />
            </div>
            <span className="text-sm font-bold text-foreground tabular-nums block">
              {queueStats.lockedCount} Claimed
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              Currently processing in outreach run
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                Stale Worker Locks
              </span>
              <span className={cn(
                "h-2 w-2 rounded-full",
                queueStats.staleCount > 0 ? "bg-rose-500 animate-pulse" : "bg-emerald-500"
              )} />
            </div>
            <span className={cn(
              "text-sm font-bold tabular-nums block",
              queueStats.staleCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            )}>
              {queueStats.staleCount} Stuck (&gt;15m)
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {queueStats.staleCount > 0
                ? "May require stale lock release"
                : "All worker locks are healthy"}
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Changes Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Apply Outreach Settings?"
        description="Are you sure you want to save these changes? New quota limits and delivery schedules will take effect immediately."
        confirmLabel="Save Settings"
        loading={isSaving}
        onConfirm={handleSaveConfirmed}
      />

      {/* Confirm Release Stale Locks Dialog */}
      <ConfirmDialog
        open={releaseDialogOpen}
        onOpenChange={setReleaseDialogOpen}
        title="Run Stale Lock Maintenance?"
        description="This triggers the PostgreSQL stored procedure 'release_stale_prospect_locks' to reset prospects locked in processing for more than 15 minutes. Use this if an n8n worker crashed mid-run."
        confirmLabel="Release Locks"
        variant="warning"
        loading={isReleasingLocks}
        onConfirm={handleReleaseStaleLocks}
      />
    </div>
  );
}
