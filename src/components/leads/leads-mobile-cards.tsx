"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Eye, 
  Clock, 
  ShieldAlert, 
  Globe,
  Lock
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHoverBadge, StepSegmentBar } from "@/components/leads/step-hover-badge";

interface LeadsMobileCardsProps {
  leads: Prospect[];
  selectedIds: string[];
  isSelectionMode?: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (lead: Prospect) => void;
  onDelete: (lead: Prospect) => void;
}

export function LeadsMobileCards({
  leads,
  selectedIds,
  isSelectionMode = false,
  onToggleSelect,
  onEdit,
  onDelete,
}: LeadsMobileCardsProps) {
  const showSelection = isSelectionMode || selectedIds.length > 0;

  if (leads.length === 0) {
    return (
      <div className="md:hidden border border-border/80 rounded-xl bg-card p-6 text-center text-xs text-muted-foreground shadow-xs">
        <p className="font-semibold text-foreground text-sm">No prospects found</p>
        <p className="text-[11px] mt-1 text-muted-foreground">
          Try adjusting your search criteria, clearing filters, or importing leads.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const s = (status || "active").toLowerCase();
    switch (s) {
      case "active":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            Active
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Completed
          </span>
        );
      case "replied":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
            Replied
          </span>
        );
      case "suppressed":
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            <ShieldAlert className="h-2.5 w-2.5" />
            Suppressed
          </span>
        );
      case "paused":
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            Paused
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="md:hidden space-y-2.5">
      {leads.map((lead) => {
        const isSelected = selectedIds.includes(lead.id);
        const fullName =
          [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unnamed Prospect";

        return (
          <div
            key={lead.id}
            className={cn(
              "border border-border/80 rounded-xl bg-card p-3.5 space-y-3 transition-colors shadow-xs",
              isSelected && "bg-primary/5 border-primary/30 ring-1 ring-primary/20"
            )}
          >
            {/* Top row: Checkbox (conditional), Name, Status */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Checkbox ONLY when selection mode is active */}
                {showSelection && (
                  <input
                    type="checkbox"
                    aria-label={`Select ${fullName}`}
                    checked={isSelected}
                    onChange={() => onToggleSelect(lead.id)}
                    className="mt-0.5 rounded border-border text-primary focus:ring-1 focus:ring-primary h-3.5 w-3.5 shrink-0 cursor-pointer accent-primary animate-in fade-in duration-150"
                  />
                )}
                <div className="min-w-0">
                  <Link
                    href={`/leads/${lead.id}`}
                    className="font-semibold text-xs text-foreground hover:text-primary transition-colors block truncate"
                  >
                    {fullName}
                  </Link>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                    {lead.job_title ? `${lead.job_title} ` : ""}
                    {lead.company && (
                      <span className="text-foreground/75 font-normal">
                        {lead.job_title ? `· ${lead.company}` : lead.company}
                      </span>
                    )}
                    {!lead.job_title && !lead.company && "—"}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                {lead.processing && (
                  <span className="px-1.5 py-0.2 text-[9px] font-medium rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    Lock
                  </span>
                )}
                {getStatusBadge(lead.status)}
              </div>
            </div>

            {/* Channels & Location row */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/50 pt-2">
              <div className="flex items-center gap-2">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="h-3 w-3 text-sky-500" />
                    <span className="truncate max-w-[130px]">{lead.email}</span>
                  </a>
                ) : (
                  <span className="text-muted-foreground/40 text-[10px]">No email</span>
                )}

                {lead.linkedin_url && (
                  <a
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-600 transition-colors"
                    title="LinkedIn"
                  >
                    <LinkedinIcon className="h-3 w-3 text-blue-600" />
                  </a>
                )}
              </div>

              {lead.country && (
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Globe className="h-2.5 w-2.5" />
                  {lead.country}
                </span>
              )}
            </div>

            {/* Step & Sequence Section (Wrapped, truncated, with hover tooltip) */}
            <div className="bg-muted/30 p-2.5 rounded-lg space-y-2 border border-border/40 relative overflow-visible">
              <div className="flex items-center justify-between gap-1.5">
                <StepHoverBadge currentStep={lead.current_step} showCompact />
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {lead.linkedin_connected ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">Connected</span>
                  ) : (
                    <span>Unlinked</span>
                  )}
                </span>
              </div>
              <StepSegmentBar currentStep={lead.current_step} />
            </div>

            {/* Next Touch Row */}
            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
              <span>Next Scheduled Touch:</span>
              {lead.next_send_at ? (
                <span className="tabular-nums text-foreground font-medium flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                  {new Date(lead.next_send_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
              ) : (
                <span className="italic">None queued</span>
              )}
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between pt-1 border-t border-border/50">
              <Link href={`/leads/${lead.id}`}>
                <Button variant="ghost" size="sm" className="h-7 text-xs px-2 gap-1 text-primary">
                  <Eye className="h-3 w-3" />
                  View Dossier
                </Button>
              </Link>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(lead)}
                  className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-3 w-3" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(lead)}
                  className="h-7 text-xs px-2 gap-1 text-muted-foreground hover:text-rose-600"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
