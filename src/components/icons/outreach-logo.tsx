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
  size = 36,
  className,
  variant = "mark",
  showBadge = false,
  ...props
}: OutreachLogoProps) {
  const pixelSize = typeof size === "number" ? size : parseInt(size as string, 10) || 36;

  const markSvg = (
    <svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0 select-none", className)}
      {...props}
    >
      <defs>
        {/* Background Squircle Gradient - Deep Obsidian Navy with rich depth */}
        <linearGradient id="oos-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#090d16" />
          <stop offset="100%" stopColor="#020617" />
        </linearGradient>

        {/* Ambient Top Glow */}
        <radialGradient id="oos-ambient-glow" cx="32" cy="12" r="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#2563eb" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* Crisp Border Highlight Gradient */}
        <linearGradient id="oos-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.6" />
        </linearGradient>

        {/* Dynamic Orbital Ring Gradient */}
        <linearGradient id="oos-ring-grad" x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="40%" stopColor="#2563eb" />
          <stop offset="80%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* Left Wing Facet Gradient */}
        <linearGradient id="oos-wing-left" x1="16" y1="46" x2="48" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="60%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </linearGradient>

        {/* Right Wing Facet Gradient (Darker for 3D bevel depth) */}
        <linearGradient id="oos-wing-right" x1="28" y1="36" x2="48" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="60%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#60a5fa" />
        </linearGradient>

        {/* Bottom Wing Underside */}
        <linearGradient id="oos-wing-under" x1="24" y1="44" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>

        {/* Core Beacon Radial Flare */}
        <radialGradient id="oos-flare" cx="48" cy="16" r="14" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Base Squircle Substrate */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#oos-bg)"
      />
      {/* Top Ambient Glow Layer */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        fill="url(#oos-ambient-glow)"
      />
      {/* Precision Metallic Border */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="16"
        stroke="url(#oos-border)"
        strokeWidth="1.75"
      />

      {/* 2. Outer Orbital Outreach Wave (Concentric Radar Track) */}
      <path
        d="M 18 42 C 14 36 14 26 20 19 C 26 12 36 12 43 17"
        stroke="url(#oos-ring-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.35"
      />

      {/* Secondary Lower Echo Arc */}
      <path
        d="M 23 48 C 32 51 43 47 48 39 C 51 34 51 28 49 23"
        stroke="url(#oos-ring-grad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.25"
      />

      {/* 3. The Central Supersonic Outreach Arrow / Beacon */}
      {/* Left Wing */}
      <path
        d="M 49 15 L 18 36 L 31 38 L 49 15 Z"
        fill="url(#oos-wing-left)"
      />

      {/* Right Wing */}
      <path
        d="M 49 15 L 31 38 L 37 49 L 49 15 Z"
        fill="url(#oos-wing-right)"
      />

      {/* Keel / Underside Notch (Adds striking aeronautical depth) */}
      <path
        d="M 31 38 L 26 43 L 37 49 Z"
        fill="url(#oos-wing-under)"
      />

      {/* Razor-sharp Center Ridge Spine Line */}
      <line
        x1="31"
        y1="38"
        x2="49"
        y2="15"
        stroke="#ffffff"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.9"
      />

      {/* 4. Apex Vector Flare & Focal Target Node */}
      <circle cx="49" cy="15" r="9" fill="url(#oos-flare)" />
      <circle cx="49" cy="15" r="2.5" fill="#ffffff" />

      {/* 5. Origin Signal Touchpoint (Step 0 Anchor) */}
      <circle cx="18" cy="36" r="2" fill="#38bdf8" />
      <circle cx="37" cy="49" r="2" fill="#2563eb" />
    </svg>
  );

  if (variant === "mark") {
    return markSvg;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {markSvg}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className="text-sm font-bold tracking-tight text-foreground font-sans">
            Outreach<span className="text-primary font-black">OS</span>
          </span>
          {showBadge && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wider uppercase leading-none">
              v1.0
            </span>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide mt-1 leading-none">
          Multi-Channel Engine
        </span>
      </div>
    </div>
  );
}
