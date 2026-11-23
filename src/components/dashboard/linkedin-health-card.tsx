"use client";

import * as React from "react";
import Link from "next/link";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateShort } from "@/lib/utils";
import { ChevronRight, ShieldCheck, AlertCircle } from "lucide-react";

interface LinkedInAccountData {
  id: string;
  account_name: string;
  health_state: string;
  sent_today: number;
  sent_this_week: number;
  pending_invites: number;
  acceptance_rate: number | null;
  restriction_detected: boolean | null;
  updated_at: string;
}

interface LinkedInHealthCardProps {
  accounts: LinkedInAccountData[];
}

export function LinkedInHealthCard({ accounts }: LinkedInHealthCardProps) {
  if (!accounts || accounts.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center text-xs text-muted-foreground">
        No LinkedIn accounts connected yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {accounts.map((acc) => (
        <div
          key={acc.id}
          className="rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-border/90 hover:shadow-2xs space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shrink-0">
                <LinkedinIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-foreground truncate">
                  {acc.account_name}
                </h4>
                <p className="text-[11px] text-muted-foreground truncate">
                  Updated {formatDateShort(acc.updated_at)}
                </p>
              </div>
            </div>

            <StatusBadge
              status={acc.restriction_detected ? "restricted" : acc.health_state}
              type="health"
            />
          </div>

          {/* Metric Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/80 text-xs">
            <div className="p-2 rounded-lg bg-muted/30">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Today</span>
              <div className="font-semibold text-foreground tabular-nums text-sm mt-0.5">
                {acc.sent_today} <span className="text-[10px] font-normal text-muted-foreground">/ 20</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted/30">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">This Week</span>
              <div className="font-semibold text-foreground tabular-nums text-sm mt-0.5">
                {acc.sent_this_week} <span className="text-[10px] font-normal text-muted-foreground">/ 80</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted/30">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Pending Invites</span>
              <div className="font-semibold text-foreground tabular-nums text-sm mt-0.5">
                {acc.pending_invites}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-muted/30">
              <span className="text-[10px] text-muted-foreground uppercase font-medium">Acceptance Rate</span>
              <div className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums text-sm mt-0.5">
                {acc.acceptance_rate || 0}%
              </div>
            </div>
          </div>

          {/* Footer Status Message */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
              {acc.restriction_detected ? (
                <>
                  <AlertCircle className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-rose-500 font-medium">Restriction detected on account</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Safety throttles within safe limits</span>
                </>
              )}
            </div>

            <Link
              href="/linkedin"
              className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-0.5"
            >
              <span>Manage account</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
