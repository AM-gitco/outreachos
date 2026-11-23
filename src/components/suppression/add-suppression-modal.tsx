"use client";

import * as React from "react";
import { X, AlertCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { addSuppression } from "@/lib/actions/suppression";

interface AddSuppressionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const COMMON_REASONS = [
  { value: "Requested Unsubscribe", label: "Requested Unsubscribe" },
  { value: "Negative Reply / Not Interested", label: "Negative Reply / Not Interested" },
  { value: "Hard Email Bounce", label: "Hard Email Bounce" },
  { value: "Competitor", label: "Competitor" },
  { value: "Current Client / Partner", label: "Current Client / Partner" },
  { value: "Custom Reason", label: "Custom Reason..." },
];

export function AddSuppressionModal({
  open,
  onOpenChange,
  onSuccess,
}: AddSuppressionModalProps) {
  const [email, setEmail] = React.useState("");
  const [linkedinUrl, setLinkedinUrl] = React.useState("");
  const [selectedReason, setSelectedReason] = React.useState("Requested Unsubscribe");
  const [customReason, setCustomReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() && !linkedinUrl.trim()) {
      setErrorMsg("Please provide at least an Email address or LinkedIn URL.");
      return;
    }

    const reason =
      selectedReason === "Custom Reason"
        ? customReason.trim() || "Manual suppression"
        : selectedReason;

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await addSuppression({
        email: email.trim() || null,
        linkedin_url: linkedinUrl.trim() || null,
        reason,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Failed to add suppression record.");
        return;
      }

      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="border border-border/80 bg-card rounded-xl max-w-md w-full p-4.5 space-y-4 shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0 border border-rose-500/20">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Add to Suppression List
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Exclude contact from all automated outreach
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Email Address</label>
            <Input
              type="email"
              placeholder="prospect@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-8.5 text-xs rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">LinkedIn Profile URL</label>
            <Input
              type="url"
              placeholder="https://www.linkedin.com/in/prospect/"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="h-8.5 text-xs rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Suppression Reason *</label>
            <CustomDropdown
              options={COMMON_REASONS}
              value={selectedReason}
              onChange={setSelectedReason}
              className="h-8.5 text-xs rounded-lg"
            />
          </div>

          {selectedReason === "Custom Reason" && (
            <div className="space-y-1 animate-in fade-in duration-150">
              <label className="font-semibold text-foreground">Specify Reason *</label>
              <Input
                type="text"
                placeholder="Enter specific suppression reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="h-8.5 text-xs rounded-lg"
                required
              />
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted/40 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
            Contacts on the suppression list are permanently blocked from receiving automated outreach emails or LinkedIn invitations. Any existing prospect record with matching details will immediately be marked as <strong>Suppressed</strong>.
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white rounded-lg shadow-xs"
            >
              {isSubmitting ? "Excluding..." : "Add to Exclusion"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
