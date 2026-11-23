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
  Building2,
  Copy,
  Check,
  Calendar,
  Lock
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getStepMeta } from "@/lib/steps";
import { StepHoverBadge, StepSegmentBar } from "@/components/leads/step-hover-badge";

interface LeadsCardsViewProps {
  leads: Prospect[];
  selectedIds: string[];
  isSelectionMode?: boolean;
  onToggleSelect: (id: string) => void;
  onEdit: (lead: Prospect) => void;
  onDelete: (lead: Prospect) => void;
  isLoading?: boolean;
}

export function LeadsCardsView({
  leads,
  selectedIds,
  isSelectionMode = false,
  onToggleSelect,
  onEdit,
  onDelete,
  isLoading = false,
}: LeadsCardsViewProps) {
  const showSelection = isSelectionMode || selectedIds.length > 0;
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-secondary text-secondary-foreground border border-border">
            {status}
          </span>
        );
    }
  };

  if (leads.length === 0) {
    return (
      <div className="border border-border/80 rounded-xl bg-card p-12 text-center text-xs text-muted-foreground shadow-xs">
        <p className="font-semibold text-foreground text-sm">No prospects found</p>
        <p className="text-[11px] mt-1 text-muted-foreground">
          Try adjusting your search criteria, clearing filters, or importing leads.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 w-full transition-opacity duration-150", isLoading && "opacity-75")}>
      {leads.map((lead) => {
        const isSelected = selectedIds.includes(lead.id);
        const fullName =
          [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unnamed Prospect";
        const initials =
          ((lead.first_name?.[0] || "") + (lead.last_name?.[0] || "")).toUpperCase() || "LP";

        return (
          <div
            key={lead.id}
            className={cn(
              "group relative flex flex-col justify-between border border-border/80 rounded-xl bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs shadow-2xs space-y-3.5",
              isSelected && "bg-primary/5 border-primary/40 ring-1 ring-primary/20"
            )}
          >
            {/* Top Identity Row */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Checkbox (ONLY shown when selection mode is active) */}
                {showSelection && (
                  <div className="pt-0.5 animate-in fade-in duration-150 shrink-0">
                    <input
                      type="checkbox"
                      aria-label={`Select ${fullName}`}
                      checked={isSelected}
                      onChange={() => onToggleSelect(lead.id)}
                      className="rounded border-border text-primary focus:ring-1 focus:ring-primary h-3.5 w-3.5 align-middle cursor-pointer accent-primary"
                    />
                  </div>
                )}

                {/* Avatar Monogram */}
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0 select-none">
                  {initials}
                </div>

                {/* Name & Job Title */}
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
                      <span className="text-foreground/80 font-normal">
                        {lead.job_title ? `· ${lead.company}` : lead.company}
                      </span>
                    )}
                    {!lead.job_title && !lead.company && "—"}
                  </p>
                </div>
              </div>

              {/* Status and Worker Lock Badge */}
              <div className="flex items-center gap-1.5 shrink-0">
                {lead.processing && (
                  <span
                    title="Currently locked by an active outreach worker"
                    className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25"
                  >
                    <Lock className="h-2.5 w-2.5" />
                    Lock
                  </span>
                )}
                {getStatusBadge(lead.status)}
              </div>
            </div>

            {/* Sequence Stage Ribbon with Step Hover Tooltip */}
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50 space-y-2 relative overflow-visible">
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sequence Stage
                </span>
                <StepHoverBadge currentStep={lead.current_step} showCompact />
              </div>

              {/* 5-Step Segmented Bar with Hover Tooltips */}
              <StepSegmentBar currentStep={lead.current_step} />
            </div>

            {/* Contact & Channel Row */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Email */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/60 min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <Mail className="h-3 w-3 text-sky-500 shrink-0" />
                  {lead.email ? (
                    <a
                      href={`mailto:${lead.email}`}
                      className="truncate text-foreground hover:text-primary transition-colors text-[11px]"
                      title={lead.email}
                    >
                      {lead.email}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/50 text-[10px] italic">No email</span>
                  )}
                </div>
                {lead.email && (
                  <button
                    type="button"
                    onClick={() => handleCopy(lead.email!, `email-${lead.id}`)}
                    className="text-muted-foreground hover:text-foreground shrink-0 p-0.5 cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedId === `email-${lead.id}` ? (
                      <Check className="h-2.5 w-2.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-2.5 w-2.5 opacity-50" />
                    )}
                  </button>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-background border border-border/60 min-w-0">
                <div className="flex items-center gap-1.5 truncate">
                  <LinkedinIcon className="h-3 w-3 text-blue-600 shrink-0" />
                  {lead.linkedin_url ? (
                    <a
                      href={lead.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-foreground hover:text-blue-600 transition-colors text-[11px]"
                      title="Open LinkedIn"
                    >
                      Profile Link
                    </a>
                  ) : (
                    <span className="text-muted-foreground/50 text-[10px] italic">No profile</span>
                  )}
                </div>
                {lead.linkedin_url && (
                  <a
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-blue-600 shrink-0 p-0.5"
                    title="Open in new tab"
                  >
                    <ExternalLink className="h-2.5 w-2.5 opacity-60" />
                  </a>
                )}
              </div>
            </div>

            {/* Next Touch & Location Row */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
              <div className="flex items-center gap-1.5 tabular-nums">
                <Clock className="h-3 w-3 opacity-60 shrink-0" />
                {lead.next_send_at ? (
                  <span className="truncate max-w-[140px]">
                    {new Date(lead.next_send_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                ) : (
                  <span className="italic text-[10px]">No touch queued</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] shrink-0">
                <Globe className="h-3 w-3 opacity-60" />
                <span className="truncate max-w-[100px]">{lead.country || "UTC"}</span>
              </div>
            </div>

            {/* Card Action Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <Link href={`/leads/${lead.id}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs px-2.5 gap-1 text-primary hover:bg-primary/10 rounded-md"
                >
                  <Eye className="h-3 w-3" />
                  View Dossier
                </Button>
              </Link>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(lead)}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md"
                  title="Edit Lead"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(lead)}
                  className="h-7 w-7 text-muted-foreground hover:text-rose-600 rounded-md"
                  title="Delete Lead"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
