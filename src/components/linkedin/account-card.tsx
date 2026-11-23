"use client";

import * as React from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  UserCheck, 
  Send, 
  Trash2,
  Settings2,
  Copy,
  Check,
  Activity,
  Cpu
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { LinkedinAccount } from "@/lib/types";
import { LinkedinLimits, updateAccountHealth, resetDailyQuota, deleteLinkedinAccount } from "@/lib/actions/linkedin";
import { cn } from "@/lib/utils";

interface AccountCardProps {
  account: LinkedinAccount;
  limits: LinkedinLimits;
  onRefresh: () => void;
}

export function AccountCard({ account, limits, onRefresh }: AccountCardProps) {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = React.useState(false);
  const [pendingHealthState, setPendingHealthState] = React.useState<string>("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTimestamp = (ts?: string | null) => {
    if (!ts) return "Not recorded";
    try {
      const d = new Date(ts);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return String(ts);
    }
  };

  const health = (account.health_state || "green").toLowerCase();
  const isHealthy = health === "green" || health === "healthy";
  const isCaution = health === "yellow" || health === "caution";
  const isRestricted = Boolean(health === "red" || health === "restricted" || account.restriction_detected);

  const todayPercent = Math.min(100, Math.round((account.sent_today / limits.max_daily_requests) * 100));
  const weekPercent = Math.min(100, Math.round((account.sent_this_week / limits.max_weekly_requests) * 100));
  const pendingPercent = Math.min(100, Math.round((account.pending_invites / limits.max_pending_invites) * 100));

  const handleHealthChange = (newHealth: string) => {
    setPendingHealthState(newHealth);
    setIsStatusConfirmOpen(true);
  };

  const executeHealthChange = async () => {
    setIsProcessing(true);
    try {
      const isRestr = pendingHealthState === "red" || pendingHealthState === "restricted";
      await updateAccountHealth(account.id, pendingHealthState, isRestr);
      setIsStatusConfirmOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to update health state:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeResetQuota = async () => {
    setIsProcessing(true);
    try {
      await resetDailyQuota(account.id);
      setIsResetConfirmOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to reset daily quota:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDelete = async () => {
    setIsProcessing(true);
    try {
      await deleteLinkedinAccount(account.id);
      setIsDeleteConfirmOpen(false);
      onRefresh();
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border border-border/80 rounded-xl bg-card p-4 space-y-4 shadow-xs transition-all duration-200 hover:border-primary/40 hover:shadow-2xs">
      {/* Top Row: Account Name, Channel Icon & Health State */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-500/20">
            <LinkedinIcon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5 flex-wrap">
              <span>{account.account_name}</span>
              {account.getsales_account_uuid ? (
                <span
                  title="Connected to GetSales.io"
                  className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                >
                  GetSales Synced
                </span>
              ) : (
                <span
                  title="Direct n8n sender profile"
                  className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-muted text-muted-foreground border border-border/50"
                >
                  Direct Sender
                </span>
              )}
            </h3>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 opacity-60" />
              Synced:{" "}
              {new Date(account.updated_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Health status pill */}
        <div className="flex items-center gap-2">
          {isRestricted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
              <ShieldAlert className="h-3.5 w-3.5" />
              Restricted / Halted
            </span>
          ) : isCaution ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-3.5 w-3.5" />
              Caution
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="h-3.5 w-3.5" />
              Healthy
            </span>
          )}
        </div>
      </div>

      {/* Safety Alert if Restricted */}
      {isRestricted && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            LinkedIn Safety Guard Triggered
          </p>
          <p className="text-[11px] leading-relaxed opacity-90">
            n8n automated invitations and messages for this account are automatically paused to prevent account penalties.
          </p>
        </div>
      )}

      {/* Quotas & Capacity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Daily Requests */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sent Today
            </span>
            <span className="font-bold text-foreground tabular-nums text-xs">
              {account.sent_today} / {limits.max_daily_requests}
              <span className="text-[10px] text-muted-foreground font-normal ml-1">({todayPercent}%)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                todayPercent >= 90
                  ? "bg-rose-500"
                  : todayPercent >= 70
                  ? "bg-amber-500"
                  : "bg-primary"
              )}
              style={{ width: `${todayPercent}%` }}
            />
          </div>
        </div>

        {/* Weekly Requests */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Sent This Week
            </span>
            <span className="font-bold text-foreground tabular-nums text-xs">
              {account.sent_this_week} / {limits.max_weekly_requests}
              <span className="text-[10px] text-muted-foreground font-normal ml-1">({weekPercent}%)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                weekPercent >= 90
                  ? "bg-rose-500"
                  : weekPercent >= 70
                  ? "bg-amber-500"
                  : "bg-blue-600"
              )}
              style={{ width: `${weekPercent}%` }}
            />
          </div>
        </div>

        {/* Pending Invites */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Pending Invites
            </span>
            <span className="font-bold text-foreground tabular-nums text-xs">
              {account.pending_invites} / {limits.max_pending_invites}
              <span className="text-[10px] text-muted-foreground font-normal ml-1">({pendingPercent}%)</span>
            </span>
          </div>
          <div className="h-2 w-full bg-border rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300",
                pendingPercent >= 90 ? "bg-rose-500" : "bg-purple-600"
              )}
              style={{ width: `${pendingPercent}%` }}
            />
          </div>
        </div>

        {/* Acceptance Rate */}
        <div className="p-3 rounded-lg bg-muted/30 border border-border/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Acceptance Rate
            </span>
            <span className="font-bold text-foreground tabular-nums flex items-center gap-1 text-xs">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
              {account.acceptance_rate ?? 0}%
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-0.5">
            <span>Safety threshold:</span>
            <span className="tabular-nums font-semibold text-foreground">
              {limits.min_acceptance_rate}% min
            </span>
          </div>
        </div>
      </div>

      {/* GetSales.io Sender Integration Section */}
      <div className="border border-border/70 rounded-lg p-3 bg-muted/20 space-y-2.5">
        <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Cpu className="h-3 w-3 text-primary" />
              GetSales Integration
            </span>
            <span
              className={cn(
                "text-[9px] font-mono uppercase px-1.5 py-0.2 rounded font-bold border",
                account.getsales_account_uuid
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-muted text-muted-foreground border-border/50"
              )}
            >
              {account.getsales_account_uuid ? "CONNECTED" : "UNLINKED"}
            </span>
          </div>

          {account.getsales_data?.delay_between_tasks_in_minutes && (
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              Interval: {account.getsales_data.delay_between_tasks_in_minutes}m
            </span>
          )}
        </div>

        {account.getsales_account_uuid || account.getsales_data ? (
          <div className="space-y-2 text-xs">
            {/* Account UUID & Sender Profile UUID Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Account UUID */}
              <div className="p-2 rounded bg-background/60 border border-border/50 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                    GetSales Account UUID
                  </span>
                  <span className="font-mono text-[10px] text-foreground truncate block">
                    {account.getsales_account_uuid || "—"}
                  </span>
                </div>
                {account.getsales_account_uuid && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(account.getsales_account_uuid!, "acc_uuid")}
                    className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0 rounded"
                    title="Copy GetSales Account UUID"
                  >
                    {copiedField === "acc_uuid" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>

              {/* Sender Profile UUID */}
              <div className="p-2 rounded bg-background/60 border border-border/50 flex items-center justify-between gap-1.5">
                <div className="min-w-0">
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Sender Profile UUID
                  </span>
                  <span className="font-mono text-[10px] text-foreground truncate block">
                    {account.getsales_data?.sender_profile_uuid || "—"}
                  </span>
                </div>
                {account.getsales_data?.sender_profile_uuid && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(account.getsales_data!.sender_profile_uuid!, "sender_uuid")}
                    className="h-5 w-5 text-muted-foreground hover:text-foreground shrink-0 rounded"
                    title="Copy Sender Profile UUID"
                  >
                    {copiedField === "sender_uuid" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Heartbeat Timestamps Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {/* Tasks Heartbeat */}
              <div className="p-2 rounded bg-background/60 border border-border/50 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Tasks Heartbeat
                  </span>
                  <span className="font-semibold text-foreground text-[10px] tabular-nums block mt-0.5">
                    {formatTimestamp(account.getsales_data?.last_tasks_heartbeat_at)}
                  </span>
                </div>
                <Activity className="h-3.5 w-3.5 text-blue-500 shrink-0 opacity-80" />
              </div>

              {/* Messages Heartbeat */}
              <div className="p-2 rounded bg-background/60 border border-border/50 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider block">
                    Messages Heartbeat
                  </span>
                  <span className="font-semibold text-foreground text-[10px] tabular-nums block mt-0.5">
                    {formatTimestamp(account.getsales_data?.last_messages_heartbeat_at)}
                  </span>
                </div>
                <Send className="h-3.5 w-3.5 text-sky-500 shrink-0 opacity-80" />
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2 text-center text-[11px] text-muted-foreground">
            <span>No GetSales account link configured for this sender.</span>
          </div>
        )}
      </div>

      {/* Control Actions Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2.5 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Health State:
          </span>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={isHealthy}
              onClick={() => handleHealthChange("green")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg",
                isHealthy && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/35 font-semibold"
              )}
            >
              Healthy
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isCaution}
              onClick={() => handleHealthChange("yellow")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg",
                isCaution && "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/35 font-semibold"
              )}
            >
              Caution
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isRestricted}
              onClick={() => handleHealthChange("red")}
              className={cn(
                "h-7 text-xs px-2.5 rounded-lg text-rose-600",
                isRestricted && "bg-rose-500/15 border-rose-500/35 font-semibold"
              )}
            >
              Restricted
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
            className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground rounded-lg"
            title="Reset daily requests counter to 0"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Daily Count
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:border-rose-500/30 rounded-lg"
            title="Remove LinkedIn Account"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Confirm Health Change Dialog */}
      <ConfirmDialog
        open={isStatusConfirmOpen}
        onOpenChange={setIsStatusConfirmOpen}
        title={`Change Health State to ${pendingHealthState.toUpperCase()}?`}
        description={`Are you sure you want to change the health state of '${account.account_name}' to ${pendingHealthState}? This affects n8n automated dispatch rules.`}
        confirmLabel="Apply Health State"
        variant={pendingHealthState === "red" ? "destructive" : "default"}
        loading={isProcessing}
        onConfirm={executeHealthChange}
      />

      {/* Confirm Reset Quota Dialog */}
      <ConfirmDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset Today's Sent Counter?"
        description={`This will reset the 'sent_today' count for ${account.account_name} back to 0. Use this when the LinkedIn day resets or after testing.`}
        confirmLabel="Reset Counter"
        loading={isProcessing}
        onConfirm={executeResetQuota}
      />

      {/* Confirm Delete Account Dialog */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={`Remove ${account.account_name}?`}
        description="Are you sure you want to remove this LinkedIn account from OutreachOS? Make sure this account is disconnected from your n8n workflow before deleting."
        confirmLabel="Remove Account"
        variant="destructive"
        loading={isProcessing}
        onConfirm={executeDelete}
      />
    </div>
  );
}
