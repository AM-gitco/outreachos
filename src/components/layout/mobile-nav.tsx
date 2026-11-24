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
  Menu,
  SendHorizontal,
  FileText,
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { OutreachLogo } from "@/components/icons/outreach-logo";
import { NAVIGATION_ITEMS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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

export function MobileNav() {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close sheet when pathname changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Open mobile navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[85vw] max-w-xs p-0 flex flex-col bg-card/95 backdrop-blur-md border-r border-border shadow-2xl select-none"
      >
        {/* Brand Header — Matches Desktop Sidebar */}
        <SheetHeader className="p-4 border-b border-border/80 text-left">
          <SheetTitle className="flex items-center gap-3">
            <OutreachLogo size={34} />
            <div className="flex flex-col">
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
          </SheetTitle>
        </SheetHeader>

        {/* Navigation list — Matches Desktop Sidebar layout */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label="Mobile Navigation">
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
                onClick={() => setOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "bg-accent text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-[18px] w-[18px] shrink-0 transition-colors",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                <span className="truncate leading-none">{item.title}</span>

                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Telemetry pill — Matches Desktop Sidebar */}
        <div className="p-3 border-t border-border/80 shrink-0">
          <div className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs text-muted-foreground bg-muted/40 border border-border/50">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-medium text-foreground">
                Automation Live
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              WF: 8
            </span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
