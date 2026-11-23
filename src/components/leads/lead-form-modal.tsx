"use client";

import * as React from "react";
import { 
  X, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Pause, 
  ShieldAlert, 
  Layers 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { createLead, updateLead } from "@/lib/actions/leads";
import { Prospect } from "@/lib/types";

interface LeadFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Prospect | null;
  onSuccess?: () => void;
}

const FORM_STATUS_OPTIONS: DropdownOption[] = [
  { value: "active", label: "Active", icon: Clock, iconColor: "text-blue-500", badge: "In Progress" },
  { value: "replied", label: "Replied", icon: MessageSquare, iconColor: "text-purple-500", badge: "Engaged" },
  { value: "completed", label: "Completed", icon: CheckCircle2, iconColor: "text-emerald-500", badge: "Finished" },
  { value: "paused", label: "Paused", icon: Pause, iconColor: "text-amber-500" },
  { value: "suppressed", label: "Suppressed", icon: ShieldAlert, iconColor: "text-rose-500", badge: "Excluded" },
];

const FORM_STEP_OPTIONS: DropdownOption[] = [
  { value: "0", label: "Step 0 · Ingestion", badge: "Ingested", badgeClassName: "bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30 font-medium" },
  { value: "1", label: "Step 1 · Connect Request", badge: "Invite", badgeClassName: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 font-medium" },
  { value: "2", label: "Step 2 · Intro Message", badge: "Intro", badgeClassName: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30 font-medium" },
  { value: "3", label: "Step 3 · Value Offer", badge: "Followup 1", badgeClassName: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/30 font-medium" },
  { value: "4", label: "Step 4 · Value Pitch", badge: "Followup 2", badgeClassName: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 font-medium" },
  { value: "5", label: "Step 5 · Final Touch", badge: "Final Touch", badgeClassName: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-medium" },
];

export function LeadFormModal({
  open,
  onOpenChange,
  lead,
  onSuccess,
}: LeadFormModalProps) {
  const isEditing = !!lead;

  const [firstName, setFirstName] = React.useState(lead?.first_name || "");
  const [lastName, setLastName] = React.useState(lead?.last_name || "");
  const [company, setCompany] = React.useState(lead?.company || "");
  const [jobTitle, setJobTitle] = React.useState(lead?.job_title || "");
  const [email, setEmail] = React.useState(lead?.email || "");
  const [linkedinUrl, setLinkedinUrl] = React.useState(lead?.linkedin_url || "");
  const [country, setCountry] = React.useState(lead?.country || "");
  const [timezone, setTimezone] = React.useState(lead?.timezone || "UTC");
  const [status, setStatus] = React.useState(lead?.status || "active");
  const [step, setStep] = React.useState(String(lead?.current_step ?? 0));
  const [personalization, setPersonalization] = React.useState(
    lead?.personalization ? JSON.stringify(lead.personalization, null, 2) : ""
  );
  const [getsalesLeadUuid, setGetsalesLeadUuid] = React.useState(lead?.getsales_lead_uuid || "");
  const [getsalesEnrollmentUuid, setGetsalesEnrollmentUuid] = React.useState(lead?.getsales_enrollment_uuid || "");
  const [getsalesEnrollmentStatus, setGetsalesEnrollmentStatus] = React.useState(lead?.getsales_enrollment_status || "");
  const [showAdvancedGetSales, setShowAdvancedGetSales] = React.useState(
    Boolean(lead?.getsales_lead_uuid || lead?.getsales_enrollment_uuid)
  );

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  React.useEffect(() => {
    if (lead) {
      setFirstName(lead.first_name || "");
      setLastName(lead.last_name || "");
      setCompany(lead.company || "");
      setJobTitle(lead.job_title || "");
      setEmail(lead.email || "");
      setLinkedinUrl(lead.linkedin_url || "");
      setCountry(lead.country || "");
      setTimezone(lead.timezone || "UTC");
      setStatus(lead.status || "active");
      setStep(String(lead.current_step ?? 0));
      setPersonalization(
        lead.personalization ? JSON.stringify(lead.personalization, null, 2) : ""
      );
      setGetsalesLeadUuid(lead.getsales_lead_uuid || "");
      setGetsalesEnrollmentUuid(lead.getsales_enrollment_uuid || "");
      setGetsalesEnrollmentStatus(lead.getsales_enrollment_status || "");
      setShowAdvancedGetSales(Boolean(lead.getsales_lead_uuid || lead.getsales_enrollment_uuid));
    } else {
      setFirstName("");
      setLastName("");
      setCompany("");
      setJobTitle("");
      setEmail("");
      setLinkedinUrl("");
      setCountry("");
      setTimezone("UTC");
      setStatus("active");
      setStep("0");
      setPersonalization("");
      setGetsalesLeadUuid("");
      setGetsalesEnrollmentUuid("");
      setGetsalesEnrollmentStatus("");
      setShowAdvancedGetSales(false);
    }
    setErrorMsg("");
  }, [lead, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validation: at least one contact channel required
    if (!email.trim() && !linkedinUrl.trim()) {
      setErrorMsg("Please provide at least an Email address or a LinkedIn profile URL.");
      return;
    }

    // Parse personalization JSON if provided
    let parsedPersonalization: Record<string, unknown> = {};
    if (personalization.trim()) {
      try {
        parsedPersonalization = JSON.parse(personalization);
      } catch {
        setErrorMsg("Invalid Personalization JSON format. Please check syntax.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      if (isEditing && lead) {
        const res = await updateLead(lead.id, {
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          company: company.trim() || null,
          job_title: jobTitle.trim() || null,
          email: email.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          country: country.trim() || null,
          timezone: timezone.trim() || "UTC",
          status,
          current_step: parseInt(step, 10),
          personalization: parsedPersonalization,
          getsales_lead_uuid: getsalesLeadUuid.trim() || null,
          getsales_enrollment_uuid: getsalesEnrollmentUuid.trim() || null,
          getsales_enrollment_status: getsalesEnrollmentStatus.trim() || null,
        });

        if (!res.success) {
          setErrorMsg(res.error || "Failed to update prospect.");
          return;
        }
      } else {
        const res = await createLead({
          first_name: firstName.trim() || null,
          last_name: lastName.trim() || null,
          company: company.trim() || null,
          job_title: jobTitle.trim() || null,
          email: email.trim() || null,
          linkedin_url: linkedinUrl.trim() || null,
          country: country.trim() || null,
          timezone: timezone.trim() || "UTC",
          status,
          current_step: parseInt(step, 10),
          personalization: parsedPersonalization,
          getsales_lead_uuid: getsalesLeadUuid.trim() || null,
          getsales_enrollment_uuid: getsalesEnrollmentUuid.trim() || null,
          getsales_enrollment_status: getsalesEnrollmentStatus.trim() || null,
        });

        if (!res.success) {
          setErrorMsg(res.error || "Failed to create prospect.");
          return;
        }
      }

      onOpenChange(false);
      if (onSuccess) onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />

      {/* Modal Card */}
      <div className="relative z-50 w-full max-w-xl max-h-[90vh] flex flex-col rounded-md border border-border bg-card p-5 sm:p-6 shadow-xl transition-all animate-in fade-in-0 zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              {isEditing ? "Edit Prospect Details" : "Add New Prospect"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isEditing
                ? "Update contact information, status, and outreach progress"
                : "Register a new lead into your continuous outreach pipeline"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
          {errorMsg && (
            <div className="flex items-start gap-2.5 p-3 rounded-md border border-destructive/30 bg-destructive/10 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">First Name</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Last Name</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Smith"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Company & Job Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Company</label>
              <Input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Job Title</label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. VP of Sales"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Contact Channels */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@company.com"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">LinkedIn Profile URL</label>
              <Input
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://linkedin.com/in/username"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Location & Timezone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Country</label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. United States"
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Timezone</label>
              <Input
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. UTC, America/New_York"
                className="h-8 text-xs font-mono"
              />
            </div>
          </div>

          {/* Status & Step with Enhanced Color Dots & Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Lead Status</label>
              <CustomDropdown
                value={status}
                onChange={(val) => setStatus(val)}
                options={FORM_STATUS_OPTIONS}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">Outreach Step</label>
              <CustomDropdown
                value={step}
                onChange={(val) => setStep(val)}
                options={FORM_STEP_OPTIONS}
                className="h-8 text-xs"
              />
            </div>
          </div>

          {/* Personalization JSON */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-foreground">
              Personalization Variables (JSON)
            </label>
            <textarea
              value={personalization}
              onChange={(e) => setPersonalization(e.target.value)}
              placeholder='{\n  "custom_note": "Saw your post on LinkedIn",\n  "mutual_connection": "Sarah"\n}'
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* GetSales.io Synchronization (Advanced) */}
          <div className="pt-0.5">
            <button
              type="button"
              onClick={() => setShowAdvancedGetSales(!showAdvancedGetSales)}
              className="text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer py-1"
            >
              <span>{showAdvancedGetSales ? "▼ Hide GetSales Integration" : "▶ Show GetSales Integration"}</span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground">Optional</span>
            </button>

            {showAdvancedGetSales && (
              <div className="mt-2 p-3 rounded-lg border border-border/70 bg-muted/20 space-y-2.5 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-foreground">GetSales Lead UUID</label>
                    <Input
                      value={getsalesLeadUuid}
                      onChange={(e) => setGetsalesLeadUuid(e.target.value)}
                      placeholder="e.g. 21c9d326-bda7-47dd..."
                      className="h-7.5 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-foreground">Enrollment UUID</label>
                    <Input
                      value={getsalesEnrollmentUuid}
                      onChange={(e) => setGetsalesEnrollmentUuid(e.target.value)}
                      placeholder="e.g. e60368e3-80ea-4dd6..."
                      className="h-7.5 text-xs font-mono"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-foreground">Enrollment Status</label>
                  <Input
                    value={getsalesEnrollmentStatus}
                    onChange={(e) => setGetsalesEnrollmentStatus(e.target.value)}
                    placeholder="e.g. ready, enrolled, completed"
                    className="h-7.5 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs font-semibold"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Prospect"
                : "Create Prospect"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
