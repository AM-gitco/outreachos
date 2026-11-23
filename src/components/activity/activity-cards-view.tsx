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
  ExternalLink,
  Layers,
  Send,
  UserPlus
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { OutreachEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { StepHoverBadge } from "@/components/leads/step-hover-badge";

interface ActivityCardsViewProps {
  events: OutreachEvent[];
  onViewMessage: (event: OutreachEvent) => void;
  onViewResponse: (event: OutreachEvent) => void;
  isLoading?: boolean;
}

export function ActivityCardsView({
  events,
  onViewMessage,
  onViewResponse,
  isLoading = false,
}: ActivityCardsViewProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (events.length === 0) {
    return (
      <div className="border border-border/80 rounded-xl bg-card p-12 text-center text-xs text-muted-foreground shadow-xs">
        <p className="font-semibold text-foreground text-sm">No outreach events recorded</p>
        <p className="text-[11px] mt-1 text-muted-foreground">
          Try widening the date range, clearing action/channel filters, or check automation runs.
        </p>
      </div>
    );
  }

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 w-full transition-opacity duration-150", isLoading && "opacity-75")}>
      {events.map((event) => {
        const prospectName = event.prospect
          ? [event.prospect.first_name, event.prospect.last_name].filter(Boolean).join(" ") ||
            "Unnamed Prospect"
          : "Unlinked Prospect";

        const hasResponsePayload =
          event.response && Object.keys(event.response).length > 0;

        const channel = (event.channel || "email").toLowerCase();
        const action = (event.action || "").toLowerCase();
        const isLinkedin = channel.includes("linkedin");
        const isReply = action.includes("reply") || channel === "reply";

        return (
          <div
            key={event.id}
            className="group relative flex flex-col justify-between border border-border/80 rounded-xl bg-card p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-xs shadow-2xs space-y-3"
          >
            {/* Header: Action & Timestamp */}
            <div className="flex items-start justify-between gap-2 border-b border-border/50 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border",
                    isReply
                      ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                      : isLinkedin
                      ? "bg-blue-500/10 border-blue-500/25 text-blue-600 dark:text-blue-400"
                      : "bg-sky-500/10 border-sky-500/25 text-sky-600 dark:text-sky-400"
                  )}
                >
                  {isReply ? (
                    <MessageSquare className="h-3.5 w-3.5" />
                  ) : isLinkedin ? (
                    <LinkedinIcon className="h-3.5 w-3.5" />
                  ) : (
                    <Mail className="h-3.5 w-3.5" />
                  )}
                </div>

                <div className="min-w-0">
                  <span className="font-bold text-xs text-foreground block truncate uppercase tracking-wide">
                    {event.action.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">
                    {event.channel}
                  </span>
                </div>
              </div>

              {/* Step Hover Badge */}
              <div className="shrink-0 relative overflow-visible">
                <StepHoverBadge currentStep={event.step} showCompact />
              </div>
            </div>

            {/* Prospect Information */}
            <div className="p-2.5 rounded-lg bg-muted/30 border border-border/40 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
                Target Prospect
              </span>
              <div className="flex items-center justify-between gap-1.5">
                {event.prospect_id ? (
                  <Link
                    href={`/leads/${event.prospect_id}`}
                    className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate flex items-center gap-1"
                  >
                    <span className="truncate">{prospectName}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-50 shrink-0" />
                  </Link>
                ) : (
                  <span className="text-xs text-muted-foreground italic truncate">{prospectName}</span>
                )}
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {event.prospect?.company || event.prospect?.email || "—"}
                </span>
              </div>
            </div>

            {/* Message Preview Snippet */}
            {event.message ? (
              <div
                onClick={() => onViewMessage(event)}
                className="p-2.5 rounded-lg bg-background border border-border/60 hover:border-foreground/30 transition-colors cursor-pointer group/msg space-y-1"
                title="Click to view full message"
              >
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Message Body</span>
                  <span className="text-primary font-medium group-hover/msg:underline flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Read Message
                  </span>
                </div>
                <p className="text-[11px] text-foreground/90 font-mono line-clamp-2 leading-relaxed">
                  {event.message}
                </p>
              </div>
            ) : (
              <div className="p-2 rounded-lg bg-muted/20 border border-border/40 text-[11px] text-muted-foreground/60 italic text-center">
                No message body recorded for this action
              </div>
            )}

            {/* Footer: Message ID, Timestamp & Payload Inspector */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
              {/* Message ID with Copy */}
              <div className="flex items-center gap-1 truncate max-w-[140px]">
                {event.message_id ? (
                  <button
                    type="button"
                    onClick={() => handleCopy(event.message_id!, event.id)}
                    className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 truncate cursor-pointer"
                    title="Click to copy Message ID"
                  >
                    <span className="truncate">MsgID: {event.message_id.slice(0, 10)}...</span>
                    {copiedId === event.id ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Copy className="h-3 w-3 opacity-40 shrink-0" />
                    )}
                  </button>
                ) : (
                  <span className="text-[10px] italic">No Msg ID</span>
                )}
              </div>

              {/* Timestamp & Payload Button */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="tabular-nums text-[10px] flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5 opacity-60" />
                  {new Date(event.sent_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>

                {hasResponsePayload && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewResponse(event)}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
                    title="Inspect JSON Response Payload"
                  >
                    <Code2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
