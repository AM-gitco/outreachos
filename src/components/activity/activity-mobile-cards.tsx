"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  Copy, 
  Check, 
  FileText, 
  Code2, 
  ExternalLink 
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { OutreachEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHoverBadge } from "@/components/leads/step-hover-badge";

interface ActivityMobileCardsProps {
  events: OutreachEvent[];
  onViewMessage: (event: OutreachEvent) => void;
  onViewResponse: (event: OutreachEvent) => void;
}

export function ActivityMobileCards({
  events,
  onViewMessage,
  onViewResponse,
}: ActivityMobileCardsProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (events.length === 0) {
    return (
      <div className="md:hidden border border-border rounded-md bg-card p-6 text-center text-xs text-muted-foreground">
        <p className="font-medium text-foreground">No outreach events recorded</p>
        <p className="text-[11px] mt-1 text-muted-foreground">
          Try adjusting the date range or clearing filters.
        </p>
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-2.5">
      {events.map((event) => {
        const prospectName = event.prospect
          ? [event.prospect.first_name, event.prospect.last_name].filter(Boolean).join(" ") ||
            "Unnamed Prospect"
          : "Unlinked Prospect";

        const hasResponsePayload =
          event.response && Object.keys(event.response).length > 0;

        const isLinkedin = (event.channel || "").toLowerCase().includes("linkedin");
        const isReply = (event.action || "").toLowerCase().includes("reply");

        return (
          <div
            key={event.id}
            className="border border-border rounded-md bg-card p-3.5 space-y-2.5 text-xs shadow-xs"
          >
            {/* Header: Channel, Action, Step */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {isReply ? (
                  <span className="p-1 rounded bg-emerald-500/10 text-emerald-600">
                    <MessageSquare className="h-3 w-3" />
                  </span>
                ) : isLinkedin ? (
                  <span className="p-1 rounded bg-blue-500/10 text-blue-600">
                    <LinkedinIcon className="h-3 w-3" />
                  </span>
                ) : (
                  <span className="p-1 rounded bg-sky-500/10 text-sky-600">
                    <Mail className="h-3 w-3" />
                  </span>
                )}
                <span className="font-semibold text-foreground text-xs uppercase tracking-wide">
                  {event.action.replace(/_/g, " ")}
                </span>
              </div>

              <div className="flex items-center gap-1.5 relative overflow-visible">
                <StepHoverBadge currentStep={event.step} showCompact />
                <span className="text-[10px] tabular-nums text-muted-foreground flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 opacity-60" />
                  {new Date(event.sent_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Prospect link & company */}
            <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px]">
              <div>
                {event.prospect_id ? (
                  <Link
                    href={`/leads/${event.prospect_id}`}
                    className="font-medium text-foreground hover:text-primary transition-colors flex items-center gap-1"
                  >
                    <span>{prospectName}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-50" />
                  </Link>
                ) : (
                  <span className="text-muted-foreground">{prospectName}</span>
                )}
                <p className="text-[10px] text-muted-foreground">
                  {event.prospect?.company || event.prospect?.email || "—"}
                </p>
              </div>

              {event.message_id && (
                <button
                  type="button"
                  onClick={() => handleCopy(event.message_id!, event.id)}
                  className="font-mono text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <span>{event.message_id.slice(0, 8)}...</span>
                  {copiedId === event.id ? (
                    <Check className="h-2.5 w-2.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-2.5 w-2.5 opacity-40" />
                  )}
                </button>
              )}
            </div>

            {/* Message Body snippet */}
            {event.message && (
              <div
                onClick={() => onViewMessage(event)}
                className="p-2 rounded bg-muted/40 border border-border/50 text-[11px] font-mono text-muted-foreground line-clamp-2 cursor-pointer hover:text-foreground transition-colors"
              >
                {event.message}
              </div>
            )}

            {/* Footer triggers */}
            <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/50">
              {event.message && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewMessage(event)}
                  className="h-6 text-[11px] px-2 text-primary gap-1"
                >
                  <FileText className="h-3 w-3" />
                  Read Message
                </Button>
              )}

              {hasResponsePayload && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewResponse(event)}
                  className="h-6 text-[11px] px-2 text-muted-foreground hover:text-foreground gap-1"
                >
                  <Code2 className="h-3 w-3" />
                  Inspect JSON
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
