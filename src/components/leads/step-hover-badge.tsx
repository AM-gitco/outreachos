"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getStepMeta, StepMeta } from "@/lib/steps";
import { Clock, Layers, Send, MessageSquare, Mail, CheckCircle2, UserPlus } from "lucide-react";

const stepIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layers,
  UserPlus,
  Send,
  MessageSquare,
  Mail,
  CheckCircle2,
};

interface StepHoverBadgeProps {
  currentStep: number;
  targetStep?: number;
  className?: string;
  showCompact?: boolean;
  tooltipPosition?: "top" | "bottom" | "auto";
}

export function StepHoverBadge({
  currentStep,
  targetStep,
  className,
  showCompact = false,
  tooltipPosition = "top",
}: StepHoverBadgeProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const displayStep = targetStep ?? currentStep;
  const meta: StepMeta = getStepMeta(displayStep);
  const Icon = stepIconMap[meta.iconName] || Layers;

  const isCurrent = currentStep === displayStep;
  const isCompleted = currentStep > displayStep;

  return (
    <div
      className="relative inline-block overflow-visible"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border tabular-nums cursor-pointer transition-all duration-200 select-none",
          meta.badgeClass,
          isHovered && "ring-2 shadow-xs scale-[1.03]",
          meta.ringColor,
          className
        )}
      >
        <Icon className="h-3 w-3 shrink-0 opacity-80" />
        <span className="truncate max-w-[120px] sm:max-w-none">
          {showCompact ? meta.compactLabel : meta.label}
        </span>
      </span>

      {/* Enterprise Hover Floating Tooltip */}
      {isHovered && (
        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 z-[90] w-64 p-3 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-xl text-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-none text-left",
            tooltipPosition === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-1.5 pb-2 border-b border-border/60">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon className={cn("h-3.5 w-3.5 shrink-0", meta.textColor)} />
              <span className={cn("font-bold truncate text-[11px]", meta.textColor)}>
                {meta.label}
              </span>
            </div>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-full text-[9px] font-semibold shrink-0 uppercase tracking-wide",
                isCurrent
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : isCompleted
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "bg-muted text-muted-foreground border border-border/60"
              )}
            >
              {isCurrent ? "Active Stage" : isCompleted ? "Completed" : "Upcoming"}
            </span>
          </div>

          {/* Description */}
          <p className="text-[11px] text-foreground/90 leading-relaxed mt-2">
            {meta.description}
          </p>

          {/* Metadata Footer */}
          <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
            <span className="font-medium text-foreground/75 truncate">{meta.channelName}</span>
            <span className="tabular-nums flex items-center gap-1 shrink-0">
              <Clock className="h-2.5 w-2.5" />
              {meta.delayHint}
            </span>
          </div>

          {/* Tooltip caret */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 border-4 border-transparent",
              tooltipPosition === "bottom"
                ? "bottom-full -mb-[1px] border-b-popover"
                : "top-full -mt-[1px] border-t-popover"
            )}
          />
        </div>
      )}
    </div>
  );
}

interface StepSegmentBarProps {
  currentStep: number;
  className?: string;
  tooltipPosition?: "top" | "bottom" | "auto";
}

export function StepSegmentBar({
  currentStep,
  className,
  tooltipPosition = "top",
}: StepSegmentBarProps) {
  const [hoveredStep, setHoveredStep] = React.useState<number | null>(null);

  return (
    <div className={cn("relative flex items-center gap-1 min-w-[120px] overflow-visible", className)}>
      {[0, 1, 2, 3, 4, 5].map((stepNum) => {
        const meta = getStepMeta(stepNum);
        const isReached = currentStep >= stepNum;
        const isCurrent = currentStep === stepNum;
        const isHovered = hoveredStep === stepNum;
        const Icon = stepIconMap[meta.iconName] || Layers;

        return (
          <div
            key={stepNum}
            className="relative flex-1 py-1.5 px-0.5 cursor-pointer select-none group/seg overflow-visible"
            onMouseEnter={() => setHoveredStep(stepNum)}
            onMouseLeave={() => setHoveredStep(null)}
          >
            {/* Visual Bar Segment */}
            <div
              className={cn(
                "h-2 w-full rounded-full transition-all duration-200 border",
                isReached
                  ? cn(meta.barColor, meta.borderColor)
                  : "bg-muted/80 border-border/80 group-hover/seg:bg-muted-foreground/30 group-hover/seg:border-foreground/40",
                isHovered && cn("ring-2 scale-y-125 shadow-2xs", meta.ringColor)
              )}
            />

            {/* Hover Tooltip for each segment (active, done, or upcoming) */}
            {isHovered && (
              <div
                className={cn(
                  "absolute z-[90] w-60 p-2.5 rounded-xl bg-popover/95 backdrop-blur-md border border-border shadow-xl text-xs animate-in fade-in zoom-in-95 duration-150 pointer-events-none text-left",
                  tooltipPosition === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
                  stepNum === 0
                    ? "left-0"
                    : stepNum === 5
                    ? "right-0"
                    : "left-1/2 -translate-x-1/2"
                )}
              >
                <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-border/60">
                  <span className={cn("font-bold text-[11px] flex items-center gap-1", meta.textColor)}>
                    <Icon className="h-3 w-3" />
                    {meta.compactLabel}
                  </span>
                  <span
                    className={cn(
                      "text-[9px] px-1.5 py-0.2 rounded-full font-semibold uppercase border",
                      isCurrent
                        ? "bg-primary/10 text-primary border-primary/20"
                        : isReached
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                        : "bg-muted text-muted-foreground border-border/60"
                    )}
                  >
                    {isCurrent ? "Active Stage" : isReached ? "Completed" : "Upcoming Stage"}
                  </span>
                </div>
                <p className="text-[10px] text-foreground/90 mt-1 leading-normal">
                  {meta.description}
                </p>
                <div className="mt-1.5 pt-1.5 border-t border-border/50 flex items-center justify-between text-[9px] text-muted-foreground">
                  <span>{meta.channelName}</span>
                  <span>{meta.delayHint}</span>
                </div>
                <div
                  className={cn(
                    "absolute border-4 border-transparent",
                    tooltipPosition === "bottom"
                      ? "bottom-full -mb-[1px] border-b-popover"
                      : "top-full -mt-[1px] border-t-popover",
                    stepNum === 0
                      ? "left-3"
                      : stepNum === 5
                      ? "right-3"
                      : "left-1/2 -translate-x-1/2"
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
