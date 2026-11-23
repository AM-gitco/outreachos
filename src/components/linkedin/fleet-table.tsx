"use client";

import * as React from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Clock, 
  TrendingUp, 
  Trash2,
  Check,
  Copy,
  Activity,
  Cpu
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { LinkedinAccount } from "@/lib/types";
import { LinkedinLimits } from "@/lib/actions/linkedin";
import { cn } from "@/lib/utils";

interface FleetTableProps {
  accounts: LinkedinAccount[];
  limits: LinkedinLimits;
  onSelectHealthChange: (account: LinkedinAccount, health: string) => void;
  onSelectResetQuota: (account: LinkedinAccount) => void;
  onSelectDelete: (account: LinkedinAccount) => void;
}

const HEALTH_OPTIONS: DropdownOption[] = [
  { value: "green", label: "Healthy", badge: "Healthy", badgeClassName: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium" },
  { value: "yellow", label: "Caution", badge: "Caution", badgeClassName: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30 font-medium" },
  { value: "red", label: "Restricted", badge: "Halted", badgeClassName: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30 font-medium" },
];

export function FleetTable({
  accounts,
  limits,
  onSelectHealthChange,
  onSelectResetQuota,
  onSelectDelete,
}: FleetTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatShortTimestamp = (ts?: string | null) => {
    if (!ts) return "—";
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

  return (
    <div className="relative border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <th className="py-2.5 px-3.5 font-semibold">Sender Profile</th>
              <th className="py-2.5 px-3 font-semibold">Health Status</th>
              <th className="py-2.5 px-3 font-semibold min-w-[170px]">GetSales Sync</th>
              <th className="py-2.5 px-3 font-semibold min-w-[140px]">Daily Sent</th>
              <th className="py-2.5 px-3 font-semibold min-w-[140px]">Weekly Sent</th>
              <th className="py-2.5 px-3 font-semibold min-w-[130px]">Pending Invites</th>
              <th className="py-2.5 px-3 font-semibold">Acceptance Rate</th>
              <th className="py-2.5 px-3.5 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {accounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="font-semibold text-foreground text-sm">No LinkedIn accounts configured</p>
                    <p className="text-[11px] text-muted-foreground">
                      Connect your first sender profile to begin automated outreach tracking.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              accounts.map((account) => {
                const health = (account.health_state || "green").toLowerCase();
                const isHealthy = health === "green" || health === "healthy";
                const isCaution = health === "yellow" || health === "caution";
                const isRestricted = Boolean(
                  health === "red" || health === "restricted" || account.restriction_detected
                );

                const todayPercent = Math.min(
                  100,
                  Math.round((account.sent_today / limits.max_daily_requests) * 100)
                );
                const weekPercent = Math.min(
                  100,
                  Math.round((account.sent_this_week / limits.max_weekly_requests) * 100)
                );
                const pendingPercent = Math.min(
                  100,
                  Math.round((account.pending_invites / limits.max_pending_invites) * 100)
                );

                return (
                  <tr key={account.id} className="hover:bg-muted/30 transition-colors">
                    {/* Account Name & Sync Time */}
                    <td className="py-2.5 px-3.5 align-middle">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
                          <LinkedinIcon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-foreground block truncate">
                            {account.account_name}
                          </span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="h-2.5 w-2.5 opacity-60" />
                            Synced: {new Date(account.updated_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Health Status */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {isRestricted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                          <ShieldAlert className="h-3 w-3" />
                          Restricted
                        </span>
                      ) : isCaution ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="h-3 w-3" />
                          Caution
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="h-3 w-3" />
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* GetSales Sync */}
                    <td className="py-2.5 px-3 align-middle">
                      {account.getsales_account_uuid ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              SYNCED
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(account.getsales_account_uuid!, account.id)}
                              title={`Copy GetSales Account UUID: ${account.getsales_account_uuid}`}
                              className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5 truncate max-w-[100px]"
                            >
                              <span className="truncate">{account.getsales_account_uuid.slice(0, 8)}...</span>
                              {copiedId === account.id ? (
                                <Check className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                              ) : (
                                <Copy className="h-2.5 w-2.5 shrink-0 opacity-60" />
                              )}
                            </button>
                          </div>

                          <div className="text-[10px] text-muted-foreground tabular-nums flex items-center gap-1">
                            <Activity className="h-2.5 w-2.5 text-blue-500 shrink-0" />
                            <span className="truncate">
                              {formatShortTimestamp(
                                account.getsales_data?.last_messages_heartbeat_at ||
                                account.getsales_data?.last_tasks_heartbeat_at
                              )}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">Unlinked</span>
                      )}
                    </td>

                    {/* Sent Today */}
                    <td className="py-2.5 px-3 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold tabular-nums text-foreground">
                            {account.sent_today} / {limits.max_daily_requests}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {todayPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
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
                    </td>

                    {/* Sent This Week */}
                    <td className="py-2.5 px-3 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold tabular-nums text-foreground">
                            {account.sent_this_week} / {limits.max_weekly_requests}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {weekPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
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
                    </td>

                    {/* Pending Invites */}
                    <td className="py-2.5 px-3 align-middle">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold tabular-nums text-foreground">
                            {account.pending_invites} / {limits.max_pending_invites}
                          </span>
                          <span className="text-[10px] text-muted-foreground tabular-nums">
                            {pendingPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full transition-all",
                              pendingPercent >= 90 ? "bg-rose-500" : "bg-purple-600"
                            )}
                            style={{ width: `${pendingPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Acceptance Rate */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <div className="flex items-center gap-1 font-semibold text-foreground tabular-nums text-xs">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{account.acceptance_rate ?? 0}%</span>
                        <span className="text-[10px] text-muted-foreground font-normal ml-1">
                          (min {limits.min_acceptance_rate}%)
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-28 text-left">
                          <CustomDropdown
                            options={HEALTH_OPTIONS}
                            value={health === "caution" ? "yellow" : health === "restricted" ? "red" : "green"}
                            onChange={(val) => onSelectHealthChange(account, val)}
                            className="h-7 text-xs rounded-lg"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectResetQuota(account)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                          title="Reset Daily Sent Counter"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onSelectDelete(account)}
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600 rounded-lg"
                          title="Remove Account"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
