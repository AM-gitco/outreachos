"use client";

import * as React from "react";
import { X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { addLinkedinAccount } from "@/lib/actions/linkedin";

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddAccountModal({
  open,
  onOpenChange,
  onSuccess,
}: AddAccountModalProps) {
  const [accountName, setAccountName] = React.useState("");
  const [healthState, setHealthState] = React.useState("green");
  const [sentToday, setSentToday] = React.useState("0");
  const [sentWeek, setSentWeek] = React.useState("0");
  const [pendingInvites, setPendingInvites] = React.useState("0");
  const [acceptanceRate, setAcceptanceRate] = React.useState("30");
  const [getsalesAccountUuid, setGetsalesAccountUuid] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setErrorMsg("Please enter an account name.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await addLinkedinAccount({
        account_name: accountName.trim(),
        health_state: healthState,
        sent_today: parseInt(sentToday, 10) || 0,
        sent_this_week: parseInt(sentWeek, 10) || 0,
        pending_invites: parseInt(pendingInvites, 10) || 0,
        acceptance_rate: parseFloat(acceptanceRate) || 0,
        getsales_account_uuid: getsalesAccountUuid.trim() || undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to create account.");
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="border border-border/80 bg-card rounded-xl max-w-md w-full p-4.5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <h3 className="text-sm font-bold text-foreground">
            Connect LinkedIn Account
          </h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Account Name / Identifier *</label>
            <Input
              type="text"
              placeholder="e.g. Outreach Profile A (Alex)"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="h-8.5 text-xs rounded-lg"
              required
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-foreground">GetSales Account UUID</label>
              <span className="text-[10px] text-muted-foreground">Optional</span>
            </div>
            <Input
              type="text"
              placeholder="e.g. c7a6c1a0-43a3-46b2-9389-ccfead6d5ff7"
              value={getsalesAccountUuid}
              onChange={(e) => setGetsalesAccountUuid(e.target.value)}
              className="h-8.5 text-xs font-mono rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Initial Health State</label>
              <CustomDropdown
                options={[
                  { value: "green", label: "Healthy (Green)" },
                  { value: "yellow", label: "Caution (Yellow)" },
                  { value: "red", label: "Restricted (Red)" },
                ]}
                value={healthState}
                onChange={setHealthState}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Acceptance Rate (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={acceptanceRate}
                onChange={(e) => setAcceptanceRate(e.target.value)}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Sent Today</label>
              <Input
                type="number"
                min="0"
                value={sentToday}
                onChange={(e) => setSentToday(e.target.value)}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Sent This Week</label>
              <Input
                type="number"
                min="0"
                value={sentWeek}
                onChange={(e) => setSentWeek(e.target.value)}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Pending Invites</label>
              <Input
                type="number"
                min="0"
                value={pendingInvites}
                onChange={(e) => setPendingInvites(e.target.value)}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs rounded-lg"
            >
              {isSubmitting ? "Connecting..." : "Connect Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
