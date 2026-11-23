"use client";

import * as React from "react";
import { Mail, Trash2, Clock, ExternalLink, Copy, Check, ShieldAlert } from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { SuppressionRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SuppressionCardsViewProps {
  records: SuppressionRecord[];
  onRemove: (record: SuppressionRecord) => void;
  isLoading?: boolean;
}

export function SuppressionCardsView({
  records,
  onRemove,
  isLoading = false,
}: SuppressionCardsViewProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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
        {reason || "Manual Exclusion"}
      </span>
    );
  };

  if (records.length === 0) {
    return (
      <div className="border border-border/80 rounded-xl bg-card p-12 text-center text-xs text-muted-foreground shadow-xs">
        <p className="font-semibold text-foreground text-sm">No suppression records found</p>
        <p className="text-[11px] mt-1 text-muted-foreground">
          No contacts are currently excluded. Add emails or LinkedIn URLs to prevent automated outreach.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 w-full transition-opacity duration-150",
        isLoading && "opacity-75"
      )}
    >
      {records.map((rec) => (
        <div
          key={rec.id}
          className="group relative flex flex-col justify-between border border-border/80 rounded-xl bg-card p-4 transition-all duration-200 hover:border-rose-500/40 hover:shadow-2xs space-y-3.5"
        >
          {/* Card Header: Shield & Suppression Reason */}
          <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/20">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Exclusion Reason
                </span>
                <span className="text-xs font-bold text-foreground block truncate">
                  {rec.reason || "Manual exclusion"}
                </span>
              </div>
            </div>

            {getReasonBadge(rec.reason)}
          </div>

          {/* Blocked Contact Channels */}
          <div className="space-y-2 text-xs">
            {/* Email Pill */}
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                {rec.email ? (
                  <span className="font-semibold text-foreground truncate text-xs" title={rec.email}>
                    {rec.email}
                  </span>
                ) : (
                  <span className="text-muted-foreground italic text-xs">No email blocked</span>
                )}
              </div>

              {rec.email && (
                <button
                  type="button"
                  onClick={() => handleCopy(rec.email!, rec.id)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer"
                  title="Copy email address"
                >
                  {copiedId === rec.id ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3 opacity-50" />
                  )}
                </button>
              )}
            </div>

            {/* LinkedIn Profile Pill */}
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <LinkedinIcon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                {rec.linkedin_url ? (
                  <a
                    href={rec.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-blue-600 hover:underline truncate text-xs flex items-center gap-1"
                    title={rec.linkedin_url}
                  >
                    <span className="truncate">{rec.linkedin_url}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-60 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground italic text-xs">No LinkedIn URL blocked</span>
                )}
              </div>
            </div>
          </div>

          {/* Footer: Date Added & Remove Action */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1 tabular-nums text-[10px]">
              <Clock className="h-3 w-3 opacity-60" />
              Added:{" "}
              {new Date(rec.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemove(rec)}
              className="h-7 text-xs text-muted-foreground hover:text-rose-600 hover:border-rose-500/30 gap-1 rounded-lg"
            >
              <Trash2 className="h-3 w-3" />
              Remove
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
