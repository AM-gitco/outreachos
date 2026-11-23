"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  Check, 
  FileText, 
  Code2, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { OutreachEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHoverBadge } from "@/components/leads/step-hover-badge";

interface ActivityTableProps {
  events: OutreachEvent[];
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: "sent_at" | "step" | "channel" | "action") => void;
  onViewMessage: (event: OutreachEvent) => void;
  onViewResponse: (event: OutreachEvent) => void;
  isLoading?: boolean;
}

export function ActivityTable({
  events,
  sortBy,
  sortOrder,
  onSort,
  onViewMessage,
  onViewResponse,
  isLoading = false,
}: ActivityTableProps) {
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

  const getChannelBadge = (channel: string) => {
    const c = (channel || "email").toLowerCase();
    if (c.includes("linkedin")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          <LinkedinIcon className="h-3 w-3" />
          LinkedIn
        </span>
      );
    }
    if (c === "reply") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          <MessageSquare className="h-3 w-3" />
          Reply
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-sky-500/10 text-sky-700 dark:text-sky-400 border border-sky-500/20">
        <Mail className="h-3 w-3" />
        Email
      </span>
    );
  };

  const getActionBadge = (action: string) => {
    const a = (action || "").toLowerCase();
    if (a.includes("reply")) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          Reply Received
        </span>
      );
    }
    if (a.includes("connection")) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          Connection Request
        </span>
      );
    }
    if (a.includes("message")) {
      return (
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20">
          Message Sent
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-secondary text-secondary-foreground border border-border">
        {action.replace(/_/g, " ")}
      </span>
    );
  };

  return (
    <div className="relative border border-border/80 rounded-xl bg-card overflow-hidden shadow-xs">
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card px-3 py-1.5 rounded-md border border-border shadow-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            Loading events...
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/30 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <th
                onClick={() => onSort("channel")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Channel {renderSortIndicator("channel")}
              </th>
              <th
                onClick={() => onSort("action")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Action {renderSortIndicator("action")}
              </th>
              <th
                onClick={() => onSort("step")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Step {renderSortIndicator("step")}
              </th>
              <th className="py-2.5 px-3 font-semibold">Prospect & Company</th>
              <th className="py-2.5 px-3 font-semibold">Message Preview</th>
              <th className="py-2.5 px-3 font-semibold">Message ID</th>
              <th
                onClick={() => onSort("sent_at")}
                className="py-2.5 px-3 font-semibold cursor-pointer hover:text-foreground transition-colors"
              >
                Sent At {renderSortIndicator("sent_at")}
              </th>
              <th className="py-2.5 px-3 font-semibold text-right">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {events.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground text-xs">
                  <div className="flex flex-col items-center justify-center gap-1.5">
                    <p className="font-semibold text-foreground text-sm">No outreach events recorded</p>
                    <p className="text-[11px] text-muted-foreground">
                      Try widening the date range, clearing action/channel filters, or check n8n automation executions.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              events.map((event) => {
                const prospectName = event.prospect
                  ? [event.prospect.first_name, event.prospect.last_name].filter(Boolean).join(" ") ||
                    "Unnamed Prospect"
                  : "Unlinked Prospect";

                const hasResponsePayload =
                  event.response && Object.keys(event.response).length > 0;

                return (
                  <tr key={event.id} className="hover:bg-muted/40 transition-colors relative hover:z-20">
                    {/* Channel */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {getChannelBadge(event.channel)}
                    </td>

                    {/* Action */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {getActionBadge(event.action)}
                    </td>

                    {/* Step */}
                    <td className="py-2.5 px-3 align-middle relative overflow-visible whitespace-nowrap">
                      <StepHoverBadge currentStep={event.step} showCompact tooltipPosition="bottom" />
                    </td>

                    {/* Prospect Name & Company */}
                    <td className="py-2.5 px-3 align-middle max-w-[200px]">
                      <div className="flex flex-col min-w-0">
                        {event.prospect_id ? (
                          <Link
                            href={`/leads/${event.prospect_id}`}
                            className="font-medium text-foreground hover:text-primary transition-colors truncate flex items-center gap-1"
                          >
                            <span className="truncate">{prospectName}</span>
                            <ExternalLink className="h-2.5 w-2.5 opacity-50 shrink-0" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground italic truncate">{prospectName}</span>
                        )}
                        <span className="text-[11px] text-muted-foreground truncate">
                          {event.prospect?.company || event.prospect?.email || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td className="py-2.5 px-3 align-middle max-w-[260px]">
                      {event.message ? (
                        <div
                          onClick={() => onViewMessage(event)}
                          className="cursor-pointer group/msg flex items-center gap-1.5"
                          title="Click to read full message"
                        >
                          <span className="truncate text-muted-foreground group-hover/msg:text-foreground transition-colors font-mono text-[11px]">
                            {event.message}
                          </span>
                          <FileText className="h-3 w-3 opacity-40 group-hover/msg:opacity-90 shrink-0" />
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40 italic text-[11px]">—</span>
                      )}
                    </td>

                    {/* Message ID */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      {event.message_id ? (
                        <button
                          type="button"
                          onClick={() => handleCopy(event.message_id!, event.id)}
                          className="font-mono text-[11px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                          title="Click to copy Message ID"
                        >
                          <span>{event.message_id.slice(0, 12)}...</span>
                          {copiedId === event.id ? (
                            <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                          ) : (
                            <Copy className="h-3 w-3 opacity-40 shrink-0" />
                          )}
                        </button>
                      ) : (
                        <span className="text-muted-foreground/40 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Sent At */}
                    <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                      <div className="flex flex-col text-xs tabular-nums text-foreground">
                        <span>
                          {new Date(event.sent_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(event.sent_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Payload Inspector Button */}
                    <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                      {hasResponsePayload ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onViewResponse(event)}
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Inspect JSON Response Payload"
                        >
                          <Code2 className="h-3.5 w-3.5" />
                        </Button>
                      ) : (
                        <span className="text-muted-foreground/30 text-[11px] px-2">—</span>
                      )}
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
