"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Eye, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Clock, 
  ShieldAlert,
  CheckCircle2,
  Check
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getStepMeta } from "@/lib/steps";
import { StepHoverBadge, StepSegmentBar } from "@/components/leads/step-hover-badge";

interface LeadsTableProps {
  leads: Prospect[];
  selectedIds: string[];
  isSelectionMode?: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: "created_at" | "first_name" | "company" | "current_step" | "next_send_at") => void;
  onEdit: (lead: Prospect) => void;
  onDelete: (lead: Prospect) => void;
  isLoading?: boolean;
}

export function LeadsTable({
  leads,
  selectedIds,
  isSelectionMode = false,
  onToggleSelect,
  onToggleSelectAll,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  isLoading = false,
}: LeadsTableProps) {
  const showSelection = isSelectionMode || selectedIds.length > 0;
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.includes(l.id));
  const someSelected = leads.some((l) => selectedIds.includes(l.id)) && !allSelected;

  const renderSortIndicator = (column: string) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3 w-3 opacity-30 ml-1 inline-block" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-3 w-3 text-primary ml-1 inline-block" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary ml-1 inline-block" />
    );
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "active").toLowerCase();
    switch (s) {
      case "active":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            Replied
          </span>
        );
      case "suppressed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-2.5 w-2.5" />
            Suppressed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            Paused
          </span>
        );
      case "failed":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  const formatNextSend = (dateStr: string | null) => {
    if (!dateStr) return <span className="text-muted-foreground/60 text-xs">—</span>;
    try {
      const date = new Date(dateStr);
      const isPast = date.getTime() < Date.now();
      const formatted = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
      return (
        <span
          className={cn(
            "text-xs tabular-nums flex items-center gap-1",
            isPast ? "text-amber-600 dark:text-amber-400 font-medium" : "text-foreground"
          )}
        >
          <Clock className="h-3 w-3 shrink-0 opacity-70" />
          {formatted}
        </span>
      );
    } catch {
      return <span className="text-xs text-muted-foreground">{dateStr}</span>;
    }
  };

  return (
    <div className="relative border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
      {/* Sleek top loading line instead of screen blocking overlay */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary/20 overflow-hidden z-20">
          <div className="h-full bg-primary animate-pulse w-full" />
        </div>
      )}

      <div className={cn("overflow-x-auto transition-opacity duration-150", isLoading && "opacity-75")}>
        <table className="w-full min-w-[880px] text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/70 bg-muted/20 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              {/* Checkbox column only shown when selection mode is active or items selected */}
              {showSelection && (
                <th className="py-2.5 px-3 w-9 text-center animate-in fade-in duration-200">
                  <input
                    type="checkbox"
                    aria-label="Select all leads on page"
                    checked={allSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = someSelected;
                    }}
                    onChange={onToggleSelectAll}
                    className="rounded border-border text-primary focus:ring-1 focus:ring-primary h-3.5 w-3.5 align-middle cursor-pointer"
                  />
                </th>
              )}

              <th
                onClick={() => onSort("first_name")}
                className="py-2.5 px-3.5 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Prospect & Company {renderSortIndicator("first_name")}
              </th>
              <th className="py-2.5 px-3 font-semibold">Channels</th>
              <th
                onClick={() => onSort("current_step")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Progress {renderSortIndicator("current_step")}
              </th>
              <th className="py-2.5 px-3 font-semibold">Status</th>
              <th className="py-2.5 px-3 font-semibold">LinkedIn Status</th>
              <th
                onClick={() => onSort("next_send_at")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Next Touch {renderSortIndicator("next_send_at")}
              </th>
              <th className="py-2.5 px-3 font-semibold">Location</th>
              <th className="py-2.5 px-3.5 font-semibold text-right w-24">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={showSelection ? 9 : 8} className="py-12 text-center text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="font-medium text-foreground text-sm">No prospects found</p>
                    <p className="text-[11px] text-muted-foreground">
                      Try adjusting your search criteria, clear applied filters, or import new leads.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const isSelected = selectedIds.includes(lead.id);
                const fullName =
                  [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unnamed Prospect";
                const stepMeta = getStepMeta(lead.current_step);

                return (
                  <tr
                    key={lead.id}
                    className={cn(
                      "group hover:bg-muted/30 transition-colors duration-150 relative hover:z-30",
                      isSelected && "bg-primary/5"
                    )}
                  >
                    {/* Checkbox column */}
                    {showSelection && (
                      <td className="py-2.5 px-3 text-center align-middle animate-in fade-in duration-150">
                        <input
                          type="checkbox"
                          aria-label={`Select ${fullName}`}
                          checked={isSelected}
                          onChange={() => onToggleSelect(lead.id)}
                          className="rounded border-border text-primary focus:ring-1 focus:ring-primary h-3.5 w-3.5 align-middle cursor-pointer"
                        />
                      </td>
                    )}

                    {/* Prospect Name & Company */}
                    <td className="py-2.5 px-3.5 align-middle max-w-[240px]">
                      <div className="flex flex-col min-w-0">
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-medium text-foreground hover:text-primary transition-colors truncate text-xs flex items-center gap-1.5"
                        >
                          <span className="truncate">{fullName}</span>
                          {lead.getsales_lead_uuid && (
                            <span
                              title={`GetSales Enrolled (${lead.getsales_enrollment_status || "synced"})`}
                              className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0"
                            >
                              GS
                            </span>
                          )}
                          {lead.processing && (
                            <span
                              title="Currently being processed by outreach workflow"
                              className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0"
                            >
                              Lock
                            </span>
                          )}
                        </Link>
                        <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                          {lead.job_title ? `${lead.job_title} ` : ""}
                          {lead.company && (
                            <span className="text-foreground/75 font-normal">
                              {lead.job_title ? `· ${lead.company}` : lead.company}
                            </span>
                          )}
                          {!lead.job_title && !lead.company && "—"}
                        </span>
                      </div>
                    </td>

                    {/* Channels */}
                    <td className="py-2.5 px-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        {lead.email ? (
                          <a
                            href={`mailto:${lead.email}`}
                            title={`Email: ${lead.email}`}
                            className="p-1 rounded-md text-muted-foreground hover:text-sky-600 hover:bg-sky-500/10 transition-colors"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span title="No email available" className="p-1 text-muted-foreground/30">
                            <Mail className="h-3.5 w-3.5" />
                          </span>
                        )}

                        {lead.linkedin_url ? (
                          <a
                            href={lead.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open LinkedIn Profile"
                            className="p-1 rounded-md text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10 transition-colors"
                          >
                            <LinkedinIcon className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span title="No LinkedIn profile" className="p-1 text-muted-foreground/30">
                            <LinkedinIcon className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Current Step with colorful hover badge and hoverable segment bar */}
                    <td className="py-2.5 px-3 align-middle relative overflow-visible">
                      <div className="flex flex-col gap-1 min-w-[130px] relative overflow-visible">
                        <StepHoverBadge currentStep={lead.current_step} showCompact tooltipPosition="bottom" />
                        <StepSegmentBar currentStep={lead.current_step} className="w-28" tooltipPosition="bottom" />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>

                    {/* LinkedIn Connection Status */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {lead.linkedin_connected ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Connected
                        </span>
                      ) : lead.linkedin_url ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500/70" />
                          Pending / Unlinked
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground/40">—</span>
                      )}
                    </td>

                    {/* Next Touch */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {formatNextSend(lead.next_send_at)}
                    </td>

                    {/* Location / TZ */}
                    <td className="py-2.5 px-3 align-middle text-[11px] text-muted-foreground whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-foreground truncate max-w-[90px]">
                          {lead.country || "—"}
                        </span>
                        <span className="text-[10px] text-muted-foreground tabular-nums truncate max-w-[90px]">
                          {lead.timezone || "UTC"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 align-middle text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/leads/${lead.id}`}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            title="View Prospect Dossier"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(lead)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Edit Lead Information"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(lead)}
                          className="h-7 w-7 text-muted-foreground hover:text-rose-600"
                          title="Delete Prospect"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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
