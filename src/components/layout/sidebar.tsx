"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Target,
  Activity,
  ShieldAlert,
  Zap,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  SendHorizontal,
  FileText,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { OutreachLogo } from "@/components/icons/outreach-logo";
import { NAVIGATION_ITEMS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  Target,
  Activity,
  Linkedin: LinkedinIcon,
  ShieldAlert,
  Zap,
  FileText,
  Bell,
  Settings,
};

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: collapsed ? 68 : 256,
        minWidth: collapsed ? 68 : 256,
        maxWidth: collapsed ? 68 : 256,
        transition: "width 2500ms cubic-bezier(0.16, 1, 0.3, 1), min-width 2500ms cubic-bezier(0.16, 1, 0.3, 1), max-width 2500ms cubic-bezier(0.16, 1, 0.3, 1)",
        willChange: "width, min-width, max-width",
      }}
      className={cn(
        "relative hidden lg:flex flex-col h-screen shrink-0 border-r border-border/80 bg-card/90 backdrop-blur-md select-none z-30 overflow-hidden",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center px-3.5 border-b border-border/70 shrink-0 overflow-hidden">
        <Link
          href="/"
          className="flex items-center gap-3 font-semibold overflow-hidden w-full group"
        >
          <OutreachLogo size={34} className="group-hover:scale-105 transition-transform duration-200" />
          <div
            className={cn(
              "flex flex-col overflow-hidden whitespace-nowrap transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
              collapsed
                ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none"
                : "max-w-[170px] opacity-100 translate-x-0"
            )}
          >
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-sm font-bold tracking-tight text-foreground leading-none">
                {APP_NAME}
              </span>
              <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-semibold tracking-wider uppercase leading-none">
                v1.0
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground font-normal tracking-wide mt-1 leading-none">
              Outreach Engine
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 overflow-x-hidden" aria-label="Main Navigation">
        {NAVIGATION_ITEMS.map((item) => {
          const Icon = iconMap[item.iconName] || Activity;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.title : undefined}
              className={cn(
                "group relative flex items-center rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap overflow-hidden cursor-pointer h-9 w-full px-2.5",
                isActive
                  ? "bg-accent text-foreground font-semibold shadow-2xs"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-center h-5 w-5 shrink-0">
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors duration-200",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
              </div>
              <span
                className={cn(
                  "truncate leading-none transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden",
                  collapsed
                    ? "max-w-0 opacity-0 -translate-x-2 pointer-events-none ml-0"
                    : "max-w-[180px] opacity-100 translate-x-0 ml-3"
                )}
              >
                {item.title}
              </span>

              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r transition-all duration-200" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Telemetry pill */}
      <div className="p-3 border-t border-border/70 shrink-0 overflow-hidden">
        <div
          className="flex items-center rounded-lg px-2.5 py-2 text-xs text-muted-foreground bg-muted/40 border border-border/50 whitespace-nowrap overflow-hidden w-full justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden shrink-0">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span
              className={cn(
                "font-medium text-foreground transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden",
                collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[120px] opacity-100"
              )}
            >
              Automation Live
            </span>
          </div>
          <span
            className={cn(
              "text-xs font-mono text-muted-foreground transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden shrink-0",
              collapsed ? "max-w-0 opacity-0 pointer-events-none" : "max-w-[40px] opacity-100"
            )}
          >
            WF: 8
          </span>
        </div>
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-2.5 border-t border-border/70 shrink-0 overflow-hidden">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="h-8 w-full flex items-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors duration-150 cursor-pointer text-xs px-2.5 overflow-hidden"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className="flex items-center justify-center h-5 w-5 shrink-0">
            <ChevronLeft
              className={cn(
                "h-4 w-4 shrink-0 transition-transform duration-[2500ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                collapsed && "rotate-180"
              )}
            />
          </div>
          <span
            className={cn(
              "transition-all duration-[2000ms] ease-[cubic-bezier(0.16,1,0.3,1)] whitespace-nowrap overflow-hidden",
              collapsed ? "max-w-0 opacity-0 pointer-events-none ml-0" : "max-w-[120px] opacity-100 font-medium ml-2"
            )}
          >
            Collapse Sidebar
          </span>
        </button>
      </div>
    </aside>
  );
}
