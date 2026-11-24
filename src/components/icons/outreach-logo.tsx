"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OutreachLogoProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  variant?: "mark" | "full";
  showBadge?: boolean;
}

export function OutreachLogo({
  size = 32,
  className,
  variant = "mark",
  showBadge = false,
  ...props
}: OutreachLogoProps) {
  const pixelSize = typeof size === "number" ? size : parseInt(size as string, 10) || 32;

  const markSvg = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        {/* Substrate Gradient */}
        <linearGradient id="oos-bg-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#18181b" />
          <stop offset="100%" stopColor="#09090b" />
        </linearGradient>

        {/* Primary Accent Vector Gradient */}
        <linearGradient id="oos-vector-grad" x1="8" y1="40" x2="40" y2="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="50%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        {/* Dynamic Outreach Wave Gradient */}
        <linearGradient id="oos-wave-grad" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#818cf8" stopOpacity="0.4" />
        </linearGradient>

        {/* Core Node Glow */}
        <radialGradient id="oos-core-glow" cx="24" cy="24" r="8" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>

        {/* Border Glow Filter */}
        <linearGradient id="oos-border-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="11"
        fill="url(#oos-bg-grad)"
        stroke="url(#oos-border-grad)"
        strokeWidth="1.5"
      />

      {/* Outer Concentric Radar Ring (Subtle OS Layer) */}
      <circle
        cx="24"
        cy="24"
        r="14.5"
        stroke="currentColor"
        strokeOpacity="0.12"
        strokeWidth="1.2"
        strokeDasharray="2 3"
      />

      {/* Primary Forward Trajectory Arc (Multi-Channel Outreach Vector) */}
      <path
        d="M13 29.5C14.8 21.5 21.5 15.2 29.8 14.2M18.5 35C24.8 34.2 30.5 30 33.5 24.5"
        stroke="url(#oos-wave-grad)"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Main Dynamic Vector Chevron (Convergence toward target conversion) */}
      <path
        d="M14 34L26 22L36 12M36 12H27M36 12V21"
        stroke="url(#oos-vector-grad)"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Channel Intersection Anchor Nodes */}
      <circle cx="14" cy="34" r="2.25" fill="#3b82f6" />
      <circle cx="26" cy="22" r="2.75" fill="#60a5fa" />
      <circle cx="36" cy="12" r="2.25" fill="#93c5fd" />

      {/* Internal High-Precision Crosshairs */}
      <path
        d="M26 18.5V20M26 24V25.5M22.5 22H24M28 22H29.5"
        stroke="#ffffff"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.75"
      />
    </svg>
  );

  if (variant === "mark") {
    return markSvg;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {markSvg}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold tracking-tight text-foreground leading-none">
            Outreach<span className="text-primary font-black">OS</span>
          </span>
          {showBadge && (
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wider uppercase">
              v1.0
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide mt-1 leading-none">
          Multi-Channel Operations
        </span>
      </div>
    </div>
  );
}
