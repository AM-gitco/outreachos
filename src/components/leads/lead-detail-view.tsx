"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Mail, 
  ExternalLink, 
  Pencil, 
  Trash2, 
  Clock, 
  ShieldAlert, 
  Globe, 
  Building2, 
  Briefcase, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  MessageSquare,
  Send,
  Lock,
  Calendar,
  Layers,
  Activity,
  CheckCircle2,
  UserPlus,
  Shield,
  Sun,
  Moon
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { LeadFormModal } from "@/components/leads/lead-form-modal";
import { deleteLead } from "@/lib/actions/leads";
import { Prospect, OutreachEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getStepMeta, STEP_PIPELINE_LIST } from "@/lib/steps";
import { StepHoverBadge } from "@/components/leads/step-hover-badge";

interface LeadDetailViewProps {
  lead: Prospect;
  events: OutreachEvent[];
  isSuppressed: boolean;
  suppressionReason?: string;
}

export function LeadDetailView({
  lead,
  events,
  isSuppressed,
  suppressionReason,
}: LeadDetailViewProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [expandedResponses, setExpandedResponses] = React.useState<Record<string, boolean>>({});
  const [hoveredStep, setHoveredStep] = React.useState<number | null>(null);

  const fullName = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Unnamed Prospect";

  // Initials for avatar monogram
  const initials = React.useMemo(() => {
    const f = lead.first_name?.[0] || "";
    const l = lead.last_name?.[0] || "";
    return (f + l).toUpperCase() || "LP";
  }, [lead.first_name, lead.last_name]);

  const stepMeta = getStepMeta(lead.current_step);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const toggleResponse = (eventId: string) => {
    setExpandedResponses((prev) => ({ ...prev, [eventId]: !prev[eventId] }));
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteLead(lead.id);
      if (res.success) {
        router.push("/leads");
      }
    } catch (err) {
      console.error("Failed to delete lead:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Local time calculation based on prospect's timezone
  const localTimeInfo = React.useMemo(() => {
    if (!lead.timezone) return null;
    try {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat("en-US", {
        timeZone: lead.timezone,
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(now);

      const hour24 = parseInt(
        new Intl.DateTimeFormat("en-US", {
          timeZone: lead.timezone,
          hour: "numeric",
          hour12: false,
        }).format(now),
        10
      );

      const isBusinessHours = hour24 >= 9 && hour24 < 18;

      return {
        formatted: timeStr,
        isBusinessHours,
        hour24,
      };
    } catch {
      return null;
    }
  }, [lead.timezone]);

  return (
    <div className="space-y-5 w-full min-h-[calc(100vh-8rem)] flex flex-col pb-12">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Link href="/leads">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 font-medium rounded-lg"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Pipeline
            </Button>
          </Link>
          <span className="text-muted-foreground/40 font-mono">/</span>
          <span className="text-xs font-bold text-foreground truncate max-w-[200px] sm:max-w-xs">
            {fullName}
          </span>
          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50 hidden sm:inline-block">
            ID: {lead.id.slice(0, 8)}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditOpen(true)}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/80"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDeleteOpen(true)}
            className="h-8 text-xs font-semibold gap-1.5 text-muted-foreground hover:text-rose-600 hover:border-rose-500/30 rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Prospect
          </Button>
        </div>
      </div>

      {/* Suppression Warning Banner */}
      {isSuppressed && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs shadow-2xs">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-xs uppercase tracking-wide">
              Suppression List Match — Outbound Halted
            </p>
            <p className="text-[11px] opacity-90 leading-relaxed">
              Reason: <span className="font-semibold underline decoration-rose-500/50">{suppressionReason || "Suppression rule matched"}</span>. All automated outreach touches, connection requests, and email sequences are blocked for this prospect.
            </p>
          </div>
        </div>
      )}

      {/* Worker Lock / Processing Active Banner */}
      {lead.processing && (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs shadow-2xs">
          <Lock className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-bold text-xs uppercase tracking-wide">
              Worker Lock Active
            </p>
            <p className="text-[11px] opacity-90">
              This prospect is currently locked by an active outreach worker workflow
              {lead.processing_started_at ? ` (since ${new Date(lead.processing_started_at).toLocaleTimeString()})` : ""}.
            </p>
          </div>
        </div>
      )}

      {/* Hero Dossier Header with Monogram Avatar & Executive Metric Ribbon */}
      <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Monogram Avatar */}
            <div className="h-13 w-13 sm:h-15 sm:w-15 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg sm:text-xl shrink-0 shadow-2xs">
              {initials}
            </div>

            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {fullName}
                </h1>
                <StepHoverBadge currentStep={lead.current_step} />
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                {lead.job_title && (
                  <span className="inline-flex items-center gap-1 font-medium text-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                    <Briefcase className="h-3 w-3 text-muted-foreground" />
                    {lead.job_title}
                  </span>
                )}
                {lead.company && (
                  <span className="inline-flex items-center gap-1 font-semibold text-primary bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                    <Building2 className="h-3 w-3 text-primary" />
                    {lead.company}
                  </span>
                )}
                {!lead.job_title && !lead.company && (
                  <span className="text-muted-foreground italic text-xs">
                    No company or title recorded
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-600 dark:text-sky-400 transition-colors border border-sky-500/20 shadow-2xs"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Send Email</span>
              </a>
            )}
            {lead.linkedin_url && (
              <a
                href={lead.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-colors border border-blue-500/20 shadow-2xs"
              >
                <LinkedinIcon className="h-3.5 w-3.5" />
                <span>LinkedIn Profile</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            )}
          </div>
        </div>

        {/* 4-Metric Ribbon */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3 border-t border-border/60">
          <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
              Outreach Step
            </span>
            <span className="text-xs font-bold text-foreground block tabular-nums">
              Step {lead.current_step} of 5
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {stepMeta.shortLabel} · {stepMeta.channelName}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Pipeline Status
              </span>
              <span className={cn(
                "h-2 w-2 rounded-full",
                lead.status === "completed" ? "bg-emerald-500" :
                lead.status === "replied" ? "bg-purple-500" :
                lead.status === "suppressed" ? "bg-rose-500" :
                lead.status === "paused" ? "bg-amber-500" : "bg-blue-500"
              )} />
            </div>
            <span className="text-xs font-bold text-foreground block capitalize">
              {lead.status}
            </span>
            <span className="text-[10px] text-muted-foreground block tabular-nums">
              Added {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                LinkedIn Network
              </span>
              <span className={cn(
                "h-2 w-2 rounded-full",
                lead.linkedin_connected ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </div>
            <span className="text-xs font-bold text-foreground block">
              {lead.linkedin_connected ? "1st Degree Connected" : "Not Linked / Pending"}
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {lead.linkedin_url ? "Profile URL synced" : "No profile registered"}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Outreach History
              </span>
              <Activity className="h-3.5 w-3.5 text-sky-500" />
            </div>
            <span className="text-xs font-bold text-foreground block tabular-nums">
              {events.length} {events.length === 1 ? "Event Logged" : "Events Logged"}
            </span>
            <span className="text-[10px] text-muted-foreground block truncate">
              {events.length > 0
                ? `Last: ${new Date(events[0].sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                : "No activities recorded"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        {/* Left Column (5 cols): Contact Dossier & AI Payload */}
        <div className="lg:col-span-5 space-y-5">
          {/* Contact Details Card */}
          <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                Contact Dossier
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ID: {lead.id.slice(0, 8)}
              </span>
            </div>

            {/* Email Pill */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-sky-500" />
                Email Address
              </span>

              <div className="flex items-center justify-between gap-2">
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs italic">No email address recorded</span>
                )}

                {lead.email && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(lead.email!, "email")}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 rounded"
                    title="Copy Email"
                  >
                    {copiedField === "email" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* LinkedIn Pill */}
            <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <LinkedinIcon className="h-3.5 w-3.5 text-blue-600" />
                LinkedIn Profile
              </span>

              <div className="flex items-center justify-between gap-2">
                {lead.linkedin_url ? (
                  <a
                    href={lead.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-xs text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate flex items-center gap-1"
                  >
                    <span className="truncate">{lead.linkedin_url}</span>
                    <ExternalLink className="h-3 w-3 shrink-0 opacity-60" />
                  </a>
                ) : (
                  <span className="text-muted-foreground text-xs italic">No LinkedIn profile registered</span>
                )}

                {lead.linkedin_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopy(lead.linkedin_url!, "linkedin")}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 rounded"
                    title="Copy LinkedIn URL"
                  >
                    {copiedField === "linkedin" ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Location & Timezone Details */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Country
                  </span>
                  <Globe className="h-3 w-3 text-teal-500" />
                </div>
                <p className="font-semibold text-foreground text-xs truncate">
                  {lead.country || "Unspecified"}
                </p>
                <span className="text-[10px] text-muted-foreground block truncate">
                  Target region
                </span>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Local Time
                  </span>
                  {localTimeInfo?.isBusinessHours ? (
                    <Sun className="h-3 w-3 text-amber-500" />
                  ) : (
                    <Moon className="h-3 w-3 text-indigo-400" />
                  )}
                </div>
                <p className="font-semibold text-foreground text-xs tabular-nums flex items-center gap-1.5">
                  {localTimeInfo ? localTimeInfo.formatted : (lead.timezone || "UTC")}
                </p>
                <span className={cn(
                  "text-[9px] font-semibold uppercase px-1.5 py-0.2 rounded w-fit block",
                  localTimeInfo?.isBusinessHours
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-muted text-muted-foreground"
                )}>
                  {localTimeInfo?.isBusinessHours ? "ACTIVE BUSINESS HRS" : "OFF-HOURS"}
                </span>
              </div>
            </div>

            {/* Next Queued Touch */}
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Calendar className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider block">
                    Next Scheduled Touch
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    {lead.next_send_at ? (
                      new Date(lead.next_send_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    ) : (
                      "No touches currently queued"
                    )}
                  </span>
                </div>
              </div>

              {lead.next_send_at && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold border border-purple-500/20">
                  QUEUED
                </span>
              )}
            </div>
          </div>

          {/* Personalization / n8n Automation Data Viewer */}
          <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    AI Variables & Personalization
                  </h3>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    N8N CONTEXT
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Contextual research variables injected into automated message prompts.
                </p>
              </div>

              {lead.personalization && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(JSON.stringify(lead.personalization, null, 2), "payload")}
                  className="h-7 w-7 text-muted-foreground hover:text-foreground rounded"
                  title="Copy JSON Payload"
                >
                  {copiedField === "payload" ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
            </div>

            {lead.personalization && Object.keys(lead.personalization).length > 0 ? (
              <div className="bg-muted/40 rounded-lg p-3 text-[11px] font-mono text-foreground overflow-x-auto max-h-64 border border-border/60">
                <pre className="leading-relaxed">{JSON.stringify(lead.personalization, null, 2)}</pre>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground space-y-1 bg-muted/10 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground text-xs">No Custom Payload Variables</p>
                <p className="text-[11px] max-w-xs mx-auto">
                  When n8n extracts company signals or icebreaker notes, they will appear formatted here.
                </p>
              </div>
            )}
          </div>

          {/* GetSales.io Orchestration Metadata */}
          <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 space-y-3 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    GetSales.io Integration
                  </h3>
                  <span className={cn(
                    "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border",
                    lead.getsales_enrollment_status === "ready" || lead.getsales_enrollment_status === "enrolled"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : lead.getsales_lead_uuid
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                      : "bg-muted text-muted-foreground border-border/50"
                  )}>
                    {lead.getsales_enrollment_status || (lead.getsales_lead_uuid ? "SYNCED" : "UNLINKED")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Direct synchronization state with GetSales multi-channel sender.
                </p>
              </div>
            </div>

            {lead.getsales_lead_uuid || lead.getsales_enrollment_uuid ? (
              <div className="space-y-2.5 text-xs">
                {/* Lead UUID */}
                {lead.getsales_lead_uuid && (
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        GetSales Lead UUID
                      </span>
                      <span className="font-mono text-[11px] text-foreground truncate block">
                        {lead.getsales_lead_uuid}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(lead.getsales_lead_uuid!, "gs_lead")}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 rounded"
                      title="Copy Lead UUID"
                    >
                      {copiedField === "gs_lead" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Enrollment UUID */}
                {lead.getsales_enrollment_uuid && (
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Enrollment UUID
                      </span>
                      <span className="font-mono text-[11px] text-foreground truncate block">
                        {lead.getsales_enrollment_uuid}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(lead.getsales_enrollment_uuid!, "gs_enroll")}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 rounded"
                      title="Copy Enrollment UUID"
                    >
                      {copiedField === "gs_enroll" ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                )}

                {/* Action Status & Started Timestamp */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Action State
                    </span>
                    <span className="font-semibold text-foreground text-xs capitalize mt-0.5 block truncate">
                      {lead.getsales_action_status && lead.getsales_action_status !== "null"
                        ? lead.getsales_action_status
                        : "Idle / Pending"}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Action Started
                    </span>
                    <span className="font-semibold text-foreground text-xs tabular-nums mt-0.5 block truncate">
                      {lead.getsales_action_started_at
                        ? new Date(lead.getsales_action_started_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "Not started"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground bg-muted/10 rounded-lg border border-border/50">
                <p className="font-semibold text-foreground text-xs">No Active GetSales Enrollment</p>
                <p className="text-[11px] max-w-xs mx-auto mt-0.5">
                  This prospect has not been enrolled into a GetSales.io campaign sequence yet.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (7 cols): Pipeline Stepper & Activity Timeline */}
        <div className="lg:col-span-7 space-y-5">
          {/* Multi-Colored Visual Stepper Card */}
          <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Multi-Touch Sequence Progress
                  </h3>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    6 STAGES
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground mt-0.5">
                  {stepMeta.label}
                </p>
              </div>

              <span className={cn(
                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border tabular-nums w-fit",
                stepMeta.badgeClass
              )}>
                {stepMeta.shortLabel} · {stepMeta.description}
              </span>
            </div>

            {/* 6-Node Step Visual Progression with Rich Hover Cards */}
            <div className="pt-2 pb-1">
              <div className="grid grid-cols-6 gap-2">
                {STEP_PIPELINE_LIST.map((s) => {
                  const isCurrent = lead.current_step === s.step;
                  const isPassed = lead.current_step > s.step;
                  const isHovered = hoveredStep === s.step;

                  return (
                    <div
                      key={s.step}
                      className="relative flex flex-col items-center gap-1.5 text-center group cursor-help py-1"
                      onMouseEnter={() => setHoveredStep(s.step)}
                      onMouseLeave={() => setHoveredStep(null)}
                    >
                      {/* Step Indicator Bar with Distinct Step Color */}
                      <div
                        className={cn(
                          "h-2.5 w-full rounded-full transition-all duration-300",
                          isCurrent
                            ? cn(s.barColor, "ring-2", s.ringColor)
                            : isPassed
                            ? s.barColor
                            : "bg-muted border border-border/60",
                          isHovered && "ring-2 scale-y-125"
                        )}
                      />
                      <div className="flex flex-col items-center w-full">
                        <span
                          className={cn(
                            "text-[10px] font-bold leading-tight truncate w-full",
                            isCurrent
                              ? s.textColor
                              : isPassed
                              ? "text-foreground font-semibold"
                              : "text-muted-foreground/60"
                          )}
                        >
                          Step {s.step}
                        </span>
                        <span className="text-[9px] text-muted-foreground hidden sm:block truncate w-full">
                          {s.compactLabel.split("·")[1]?.trim() || s.shortLabel}
                        </span>
                      </div>

                      {/* Interactive Hover Card for each step */}
                      {isHovered && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-64 p-3 rounded-xl bg-popover/98 backdrop-blur-md border border-border shadow-xl text-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-none text-left">
                          <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-border/60">
                            <span className={cn("font-bold text-[11px]", s.textColor)}>
                              {s.label}
                            </span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold uppercase bg-muted text-muted-foreground border border-border/50">
                              {isCurrent ? "Active" : isPassed ? "Completed" : "Queued"}
                            </span>
                          </div>
                          <p className="text-[10px] text-foreground/90 mt-1.5 leading-relaxed">
                            {s.description}
                          </p>
                          <div className="mt-2 pt-1.5 border-t border-border/50 flex items-center justify-between text-[9px] text-muted-foreground">
                            <span className="font-semibold text-foreground/80">{s.channelName}</span>
                            <span>{s.delayHint}</span>
                          </div>
                          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-[1px] border-4 border-transparent border-t-popover" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Activity Timeline Feed */}
          <div className="border border-border/80 rounded-xl bg-card p-4 sm:p-5 space-y-4 shadow-xs flex-1">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                    Complete Outreach Timeline
                  </h3>
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                    AUDIT LOG
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Live chronological log of invitations, pitches, follow-ups, and incoming replies.
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary text-secondary-foreground border border-border tabular-nums">
                {events.length} {events.length === 1 ? "EVENT" : "EVENTS"}
              </span>
            </div>

            {events.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground space-y-2 bg-muted/10 rounded-xl border border-border/50">
                <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mx-auto">
                  <Activity className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-foreground text-sm">No Outreach Activity Logged Yet</p>
                  <p className="text-[11px] max-w-sm mx-auto text-muted-foreground">
                    When n8n automated workers dispatch connection requests, welcome messages, or receive incoming responses, they are recorded here in real time.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border/80">
                {events.map((event) => {
                  const channel = (event.channel || "email").toLowerCase();
                  const action = (event.action || "").toLowerCase();
                  const isReply = action.includes("reply") || channel === "reply";
                  const isLinkedin = channel.includes("linkedin");
                  const hasResponsePayload =
                    event.response && Object.keys(event.response).length > 0;
                  const isExpanded = !!expandedResponses[event.id];
                  const eventStepMeta = getStepMeta(event.step);

                  return (
                    <div key={event.id} className="relative group">
                      {/* Timeline dot icon */}
                      <div
                        className={cn(
                          "absolute -left-6 top-1 h-5 w-5 rounded-full flex items-center justify-center border bg-background text-[10px] shadow-2xs",
                          isReply
                            ? "border-emerald-500 text-emerald-600 bg-emerald-500/10"
                            : isLinkedin
                            ? "border-blue-500 text-blue-600 bg-blue-500/10"
                            : "border-sky-500 text-sky-600 bg-sky-500/10"
                        )}
                      >
                        {isReply ? (
                          <MessageSquare className="h-2.5 w-2.5" />
                        ) : isLinkedin ? (
                          <LinkedinIcon className="h-2.5 w-2.5" />
                        ) : (
                          <Mail className="h-2.5 w-2.5" />
                        )}
                      </div>

                      {/* Event Card */}
                      <div className="border border-border/80 rounded-xl bg-card p-3.5 space-y-2.5 text-xs shadow-2xs">
                        {/* Header: Action & Timestamp */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-xs uppercase tracking-wide">
                              {event.action.replace(/_/g, " ")}
                            </span>
                            <span className={cn(
                              "text-[10px] px-1.5 py-0.2 rounded-full font-bold border tabular-nums",
                              eventStepMeta.badgeClass
                            )}>
                              Step {event.step}
                            </span>
                            <span className="text-[9px] px-2 py-0.2 rounded uppercase font-semibold bg-muted text-muted-foreground border border-border/50">
                              {event.channel}
                            </span>
                          </div>

                          <span className="text-[11px] text-muted-foreground tabular-nums flex items-center gap-1">
                            <Clock className="h-3 w-3 opacity-60" />
                            {new Date(event.sent_at).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Message body preview */}
                        {event.message && (
                          <div className="p-3 rounded-lg bg-muted/30 border border-border/60 text-xs text-foreground leading-relaxed font-sans whitespace-pre-wrap">
                            {event.message}
                          </div>
                        )}

                        {/* Message ID & Response Payload Toggle */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                          <div className="flex items-center gap-1.5">
                            {event.message_id ? (
                              <button
                                type="button"
                                onClick={() => handleCopy(event.message_id!, event.id)}
                                className="font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer"
                                title="Click to copy Message ID"
                              >
                                <span>MsgID: {event.message_id.slice(0, 16)}...</span>
                                {copiedField === event.id ? (
                                  <Check className="h-2.5 w-2.5 text-emerald-500" />
                                ) : (
                                  <Copy className="h-2.5 w-2.5 opacity-50" />
                                )}
                              </button>
                            ) : (
                              <span className="text-[10px] italic">No Message ID</span>
                            )}
                          </div>

                          {hasResponsePayload && (
                            <button
                              type="button"
                              onClick={() => toggleResponse(event.id)}
                              className="text-primary hover:underline text-[11px] font-semibold flex items-center gap-0.5 cursor-pointer"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronDown className="h-3 w-3" /> Hide Response
                                </>
                              ) : (
                                <>
                                  <ChevronRight className="h-3 w-3" /> View Response Payload
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        {/* Collapsible Response Payload */}
                        {hasResponsePayload && isExpanded && (
                          <div className="mt-2 bg-muted/60 p-2.5 rounded-lg text-[11px] font-mono overflow-x-auto border border-border/50">
                            <pre>{JSON.stringify(event.response, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Lead Modal */}
      <LeadFormModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        lead={lead}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Delete Lead Confirm Dialog */}
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title={`Delete ${fullName}?`}
        description="Are you sure you want to permanently delete this prospect from your database? All associated event history will be removed. This action cannot be undone."
        confirmLabel="Delete Prospect"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleDelete}
      />
    </div>
  );
}
