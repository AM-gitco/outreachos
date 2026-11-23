"use client";

import * as React from "react";
import { 
  Plus, 
  ShieldAlert, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw,
  Table2,
  LayoutGrid
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AccountCard } from "@/components/linkedin/account-card";
import { FleetTable } from "@/components/linkedin/fleet-table";
import { AddAccountModal } from "@/components/linkedin/add-account-modal";
import { 
  getLinkedinAccounts, 
  updateAccountHealth,
  resetDailyQuota,
  deleteLinkedinAccount,
  LinkedinAccountsResponse 
} from "@/lib/actions/linkedin";
import { LinkedinAccount } from "@/lib/types";
import { cn } from "@/lib/utils";

interface LinkedinManagerProps {
  initialData: LinkedinAccountsResponse;
}

export function LinkedinManager({ initialData }: LinkedinManagerProps) {
  const [data, setData] = React.useState<LinkedinAccountsResponse>(initialData);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  // View Mode: Cards vs Table with localStorage persistence
  const [viewMode, setViewMode] = React.useState<"cards" | "table">("cards");

  // Table confirmation dialog states
  const [accountForHealth, setAccountForHealth] = React.useState<LinkedinAccount | null>(null);
  const [pendingHealth, setPendingHealth] = React.useState<string>("");
  const [isHealthConfirmOpen, setIsHealthConfirmOpen] = React.useState(false);

  const [accountForReset, setAccountForReset] = React.useState<LinkedinAccount | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = React.useState(false);

  const [accountForDelete, setAccountForDelete] = React.useState<LinkedinAccount | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);

  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-linkedin-view-mode");
    if (saved === "cards" || saved === "table") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "cards" | "table") => {
    setViewMode(mode);
    localStorage.setItem("outreachos-linkedin-view-mode", mode);
  };

  const fetchAccounts = React.useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await getLinkedinAccounts();
      setData(res);
    } catch (err) {
      console.error("Failed to refresh accounts:", err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Table actions execution
  const executeHealthChange = async () => {
    if (!accountForHealth) return;
    setIsProcessing(true);
    try {
      const isRestr = pendingHealth === "red" || pendingHealth === "restricted";
      await updateAccountHealth(accountForHealth.id, pendingHealth, isRestr);
      setIsHealthConfirmOpen(false);
      setAccountForHealth(null);
      await fetchAccounts();
    } catch (err) {
      console.error("Failed to update account health:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeResetQuota = async () => {
    if (!accountForReset) return;
    setIsProcessing(true);
    try {
      await resetDailyQuota(accountForReset.id);
      setIsResetConfirmOpen(false);
      setAccountForReset(null);
      await fetchAccounts();
    } catch (err) {
      console.error("Failed to reset daily quota:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const executeDelete = async () => {
    if (!accountForDelete) return;
    setIsProcessing(true);
    try {
      await deleteLinkedinAccount(accountForDelete.id);
      setIsDeleteConfirmOpen(false);
      setAccountForDelete(null);
      await fetchAccounts();
    } catch (err) {
      console.error("Failed to delete account:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalToday = data.accounts.reduce((acc, a) => acc + (a.sent_today || 0), 0);
  const totalWeekly = data.accounts.reduce((acc, a) => acc + (a.sent_this_week || 0), 0);
  const totalPending = data.accounts.reduce((acc, a) => acc + (a.pending_invites || 0), 0);
  const restrictedCount = data.accounts.filter(
    (a) =>
      a.health_state === "red" ||
      a.health_state === "restricted" ||
      a.restriction_detected
  ).length;

  return (
    <div className="space-y-4 w-full">
      {/* Top Header & Actions Ribbon */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground shrink-0 whitespace-nowrap">
            LinkedIn Fleet Management
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border tabular-nums shrink-0 whitespace-nowrap">
            {data.accounts.length} {data.accounts.length === 1 ? "sender profile" : "sender profiles"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Switcher (Desktop/Tablet) */}
          <div className="hidden sm:flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => handleViewModeChange("cards")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Card View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>
            <button
              type="button"
              onClick={() => handleViewModeChange("table")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Table View"
            >
              <Table2 className="h-3.5 w-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAccounts}
            disabled={isRefreshing}
            className="h-8 text-xs gap-1.5 rounded-lg"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddOpen(true)}
            className="h-8 text-xs gap-1.5 rounded-lg shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            Connect Account
          </Button>
        </div>
      </div>

      {/* Fleet Overview Metrics Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Daily Sent (Total)
          </span>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {totalToday}
            <span className="text-xs font-normal text-muted-foreground ml-1.5">
              / {data.accounts.length * data.limits.max_daily_requests} cap
            </span>
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Across {data.accounts.length} active sender(s)
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Weekly Sent (Total)
          </span>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {totalWeekly}
            <span className="text-xs font-normal text-muted-foreground ml-1.5">
              / {data.accounts.length * data.limits.max_weekly_requests} cap
            </span>
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Rolling 7-day request volume
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pending Invites
          </span>
          <p className="text-xl font-bold tabular-nums text-foreground">
            {totalPending}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            Awaiting prospect acceptance
          </span>
        </div>

        <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Fleet Safety Status
          </span>
          <p
            className={`text-xl font-bold tabular-nums ${
              restrictedCount > 0 ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {restrictedCount > 0 ? `${restrictedCount} Restricted` : "100% Healthy"}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate">
            {restrictedCount > 0 ? "Automation safety pause engaged" : "All safety guardrails green"}
          </span>
        </div>
      </div>

      {/* Safety Policy Banner from outreach_config */}
      <div className="border border-border/80 rounded-xl bg-muted/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <p className="font-bold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            Active Fleet Operational Guardrails (from outreach_config)
          </p>
          <p className="text-[11px] text-muted-foreground">
            Daily limit: <strong className="text-foreground">{data.limits.max_daily_requests}</strong> reqs · Weekly limit:{" "}
            <strong className="text-foreground">{data.limits.max_weekly_requests}</strong> reqs · Max pending:{" "}
            <strong className="text-foreground">{data.limits.max_pending_invites}</strong> · Min acceptance:{" "}
            <strong className="text-foreground">{data.limits.min_acceptance_rate}%</strong>
          </p>
        </div>
      </div>

      {/* Accounts Main View */}
      {data.accounts.length === 0 ? (
        <div className="border border-border/80 rounded-xl bg-card p-12 text-center text-xs text-muted-foreground shadow-xs">
          <div className="flex flex-col items-center justify-center gap-2">
            <LinkedinIcon className="h-8 w-8 opacity-40 text-blue-600" />
            <p className="font-semibold text-foreground text-sm">No LinkedIn accounts configured</p>
            <p className="text-[11px] text-muted-foreground">
              Connect your first LinkedIn sender account to start monitoring quotas and automation health.
            </p>
            <Button
              size="sm"
              onClick={() => setIsAddOpen(true)}
              className="mt-2 text-xs gap-1.5 rounded-lg"
            >
              <Plus className="h-3.5 w-3.5" />
              Connect Account
            </Button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <div className="hidden sm:block">
          <FleetTable
            accounts={data.accounts}
            limits={data.limits}
            onSelectHealthChange={(acc, health) => {
              setAccountForHealth(acc);
              setPendingHealth(health);
              setIsHealthConfirmOpen(true);
            }}
            onSelectResetQuota={(acc) => {
              setAccountForReset(acc);
              setIsResetConfirmOpen(true);
            }}
            onSelectDelete={(acc) => {
              setAccountForDelete(acc);
              setIsDeleteConfirmOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {data.accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              limits={data.limits}
              onRefresh={fetchAccounts}
            />
          ))}
        </div>
      )}

      {/* Mobile view if in Table mode on small screens */}
      {viewMode === "table" && data.accounts.length > 0 && (
        <div className="sm:hidden space-y-3">
          {data.accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              limits={data.limits}
              onRefresh={fetchAccounts}
            />
          ))}
        </div>
      )}

      {/* Add Account Modal */}
      <AddAccountModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onSuccess={fetchAccounts}
      />

      {/* Confirm Health Change Dialog (from FleetTable) */}
      <ConfirmDialog
        open={isHealthConfirmOpen}
        onOpenChange={setIsHealthConfirmOpen}
        title={`Change Health State to ${pendingHealth.toUpperCase()}?`}
        description={`Are you sure you want to change the health state of '${accountForHealth?.account_name}' to ${pendingHealth}? This affects n8n automated dispatch rules.`}
        confirmLabel="Apply Health State"
        variant={pendingHealth === "red" ? "destructive" : "default"}
        loading={isProcessing}
        onConfirm={executeHealthChange}
      />

      {/* Confirm Reset Quota Dialog (from FleetTable) */}
      <ConfirmDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="Reset Today's Sent Counter?"
        description={`This will reset the 'sent_today' count for ${accountForReset?.account_name} back to 0. Use this when the LinkedIn day resets or after testing.`}
        confirmLabel="Reset Counter"
        loading={isProcessing}
        onConfirm={executeResetQuota}
      />

      {/* Confirm Delete Account Dialog (from FleetTable) */}
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={`Remove ${accountForDelete?.account_name}?`}
        description="Are you sure you want to remove this LinkedIn account from OutreachOS? Make sure this account is disconnected from your n8n workflow before deleting."
        confirmLabel="Remove Account"
        variant="destructive"
        loading={isProcessing}
        onConfirm={executeDelete}
      />
    </div>
  );
}
