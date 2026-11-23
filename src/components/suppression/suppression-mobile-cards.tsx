"use client";

import * as React from "react";
import { Mail, Trash2, Clock, ExternalLink, ShieldAlert } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { SuppressionRecord } from "@/lib/types";

interface SuppressionMobileCardsProps {
  records: SuppressionRecord[];
  onRemove: (record: SuppressionRecord) => void;
}

export function SuppressionMobileCards({
  records,
  onRemove,
}: SuppressionMobileCardsProps) {
  if (records.length === 0) {
    return (
      <div className="md:hidden border border-border/80 rounded-xl bg-card p-6 text-center text-xs text-muted-foreground shadow-xs">
        <p className="font-semibold text-foreground text-sm">No suppression records found</p>
        <p className="text-[11px] mt-1 text-muted-foreground">
          No contacts are currently excluded.
        </p>
      </div>
    );
  }

  const getReasonBadge = (reason: string | null | undefined) => {
    const r = (reason || "").toLowerCase();
    if (r.includes("unsub") || r.includes("opt-out")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25">
          Unsubscribe
        </span>
      );
    }
    if (r.includes("competitor")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/25">
          Competitor
        </span>
      );
    }
    if (r.includes("bounce") || r.includes("invalid")) {
      return (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/25">
          Bounced
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border">
        {reason || "Manual exclusion"}
      </span>
    );
  };

  return (
    <div className="md:hidden space-y-2.5">
      {records.map((rec) => (
        <div
          key={rec.id}
          className="border border-border/80 rounded-xl bg-card p-3.5 space-y-2.5 text-xs shadow-xs"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1 min-w-0">
              {rec.email && (
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{rec.email}</span>
                </div>
              )}
              {rec.linkedin_url && (
                <div className="flex items-center gap-1.5 text-blue-600">
                  <LinkedinIcon className="h-3 w-3 shrink-0" />
                  <a
                    href={rec.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline font-medium"
                  >
                    {rec.linkedin_url}
                  </a>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(rec)}
              className="h-7 text-xs text-muted-foreground hover:text-rose-600 hover:border-rose-500/30 shrink-0 gap-1 rounded-lg"
              title="Remove"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/50 text-muted-foreground">
            {getReasonBadge(rec.reason)}

            <span className="flex items-center gap-1 tabular-nums text-[10px]">
              <Clock className="h-2.5 w-2.5 opacity-60" />
              {new Date(rec.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
