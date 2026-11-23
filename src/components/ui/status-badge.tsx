import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string | null | undefined;
  type?: "lead" | "health" | "step" | "channel";
  className?: string;
}

export function StatusBadge({ status, type = "lead", className }: StatusBadgeProps) {
  if (!status) return null;

  const s = status.toLowerCase();

  if (type === "health") {
    if (s === "healthy") {
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800", className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Healthy
        </span>
      );
    }
    if (s === "caution") {
      return (
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800", className)}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Caution
        </span>
      );
    }
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800", className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
        Restricted
      </span>
    );
  }

  if (type === "lead") {
    switch (s) {
      case "active":
        return (
          <Badge variant="info" className={className}>
            Active
          </Badge>
        );
      case "replied":
        return (
          <Badge variant="success" className={className}>
            Replied
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="secondary" className={className}>
            Completed
          </Badge>
        );
      case "paused":
        return (
          <Badge variant="warning" className={className}>
            Paused
          </Badge>
        );
      case "suppressed":
        return (
          <Badge variant="destructive" className={className}>
            Do Not Contact
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={className}>
            {status}
          </Badge>
        );
    }
  }

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}
