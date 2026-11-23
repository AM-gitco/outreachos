"use client";

import * as React from "react";
import { 
  Mail, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  ExternalLink, 
  Loader2, 
  Clock, 
  Copy, 
  Check 
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { SuppressionRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

interface SuppressionTableProps {
  records: SuppressionRecord[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: "created_at" | "email" | "reason") => void;
  onRemove: (record: SuppressionRecord) => void;
  isLoading?: boolean;
}

export function SuppressionTable({
  records,
  sortBy,
  sortOrder,
  onSort,
  onRemove,
  isLoading = false,
}: SuppressionTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 opacity-40 ml-1 inline-block" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-1 inline-block" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-1 inline-block" />
    );
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
        {reason || "Manual exclusion"}
      </span>
    );
  };

  return (
    <div className="relative border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border shadow-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Loading suppression list...
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <th
                onClick={() => onSort("email")}
                className="py-2.5 px-3.5 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Blocked Contact {renderSortIndicator("email")}
              </th>
              <th className="py-2.5 px-3 font-semibold">LinkedIn Profile</th>
              <th
                onClick={() => onSort("reason")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Suppression Reason {renderSortIndicator("reason")}
              </th>
              <th
                onClick={() => onSort("created_at")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Added Date {renderSortIndicator("created_at")}
              </th>
              <th className="py-2.5 px-3.5 font-semibold text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {records.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="font-semibold text-foreground text-sm">No suppression records found</p>
                    <p className="text-[11px] text-muted-foreground">
                      No contacts are currently excluded. Add emails or LinkedIn URLs to prevent automated outreach.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec) => (
                <tr key={rec.id} className="hover:bg-muted/30 transition-colors">
                  {/* Email */}
                  <td className="py-2.5 px-3.5 align-middle font-medium text-foreground">
                    {rec.email ? (
                      <div className="flex items-center gap-1.5 group/email">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[220px] font-semibold">{rec.email}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(rec.email!, rec.id)}
                          className="opacity-0 group-hover/email:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Copy email"
                        >
                          {copiedId === rec.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">—</span>
                    )}
                  </td>

                  {/* LinkedIn URL */}
                  <td className="py-2.5 px-3 align-middle">
                    {rec.linkedin_url ? (
                      <a
                        href={rec.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline max-w-[220px] truncate font-medium"
                      >
                        <LinkedinIcon className="h-3 w-3 shrink-0" />
                        <span className="truncate">{rec.linkedin_url}</span>
                        <ExternalLink className="h-2.5 w-2.5 opacity-50 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">—</span>
                    )}
                  </td>

                  {/* Reason */}
                  <td className="py-2.5 px-3 align-middle">
                    {getReasonBadge(rec.reason)}
                  </td>

                  {/* Created At */}
                  <td className="py-2.5 px-3 align-middle whitespace-nowrap tabular-nums text-muted-foreground">
                    <div className="flex items-center gap-1 text-xs">
                      <Clock className="h-3 w-3 opacity-60" />
                      {new Date(rec.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2.5 px-3.5 align-middle text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemove(rec)}
                      className="h-7 text-xs text-muted-foreground hover:text-rose-600 hover:border-rose-500/30 gap-1 rounded-lg"
                      title="Remove from Suppression List"
                    >
                      <Trash2 className="h-3 w-3" />
                      Remove
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
