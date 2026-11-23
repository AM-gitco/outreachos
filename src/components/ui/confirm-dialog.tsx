"use client";

import * as React from "react";
import { AlertTriangle, Info, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "default" | "warning";
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  loading = false,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  const isLoading = loading || internalLoading;

  const handleConfirm = async () => {
    try {
      setInternalLoading(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setInternalLoading(false);
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-primary shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-2xs transition-opacity animate-in fade-in"
        onClick={() => !isLoading && onOpenChange(false)}
      />

      {/* Dialog Content */}
      <div className="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-5 shadow-xl transition-all animate-in fade-in-0 zoom-in-95">
        <button
          type="button"
          onClick={() => !isLoading && onOpenChange(false)}
          className="absolute right-3.5 top-3.5 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="flex items-start gap-3.5">
          <div className="mt-0.5">{getIcon()}</div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold text-foreground leading-snug">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="h-8 text-xs font-medium"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "destructive" ? "destructive" : "default"}
            size="sm"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              "h-8 text-xs font-medium",
              variant === "warning" &&
                "bg-amber-600 hover:bg-amber-500 text-white"
            )}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
