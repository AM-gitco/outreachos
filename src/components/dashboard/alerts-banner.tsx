"use client";

import * as React from "react";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlertItem {
  id: string;
  severity: "warning" | "destructive" | "info";
  title: string;
  message: string;
}

interface AlertsBannerProps {
  alerts: AlertItem[];
}

export function AlertsBanner({ alerts }: AlertsBannerProps) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.filter((a) => !dismissed.has(a.id));
  if (visibleAlerts.length === 0) return null;

  const handleDismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-2">
      {visibleAlerts.map((alert) => {
        const isDestructive = alert.severity === "destructive";
        const isWarning = alert.severity === "warning";

        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start justify-between gap-3 p-3.5 rounded-xl border text-xs transition-all duration-200 animate-in fade-in-0",
              isDestructive &&
                "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300",
              isWarning &&
                "bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300",
              !isDestructive &&
                !isWarning &&
                "bg-blue-500/10 border-blue-500/30 text-blue-800 dark:text-blue-300"
            )}
          >
            <div className="flex items-start gap-2.5">
              {isDestructive && (
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              )}
              {isWarning && (
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              )}
              {!isDestructive && !isWarning && (
                <Info className="h-4 w-4 shrink-0 mt-0.5 text-blue-500" />
              )}
              <div className="space-y-0.5">
                <div className="font-semibold text-foreground text-xs">
                  {alert.title}
                </div>
                <div className="text-[11px] leading-relaxed opacity-90">
                  {alert.message}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDismiss(alert.id)}
              className="p-1 rounded opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-opacity"
              aria-label="Dismiss alert"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
