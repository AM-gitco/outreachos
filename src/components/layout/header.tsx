"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { NAVIGATION_ITEMS } from "@/lib/constants";
import { Search } from "lucide-react";

interface HeaderProps {
  userEmail?: string | null;
  userRole?: string;
}

export function Header({ userEmail, userRole }: HeaderProps) {
  const pathname = usePathname();

  const currentItem =
    NAVIGATION_ITEMS.find((item) =>
      item.href === "/"
        ? pathname === "/"
        : pathname.startsWith(item.href)
    ) || { title: "Operations", description: "Outreach Management" };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between border-b border-border bg-background/85 px-4 sm:px-6 backdrop-blur-md select-none transition-colors duration-200">
      {/* Left side: Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-3">
        <MobileNav />
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-foreground text-base tracking-tight leading-none">
            {currentItem.title}
          </span>
          <span className="hidden sm:inline-block text-muted-foreground/40 text-sm">/</span>
          <span className="hidden sm:inline-block text-xs text-muted-foreground truncate max-w-sm leading-none">
            {currentItem.description}
          </span>
        </div>
      </div>

      {/* Center: Search pill */}
      <div className="hidden md:flex items-center max-w-xs w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search leads, events, companies..."
            className="w-full pl-9 pr-3 h-8 text-xs rounded-lg bg-muted/40 border border-border/80 placeholder:text-muted-foreground/70 focus:outline-none focus:border-foreground/30 focus:bg-background transition-all duration-150"
            disabled
            title="Search activation in Stage 3"
          />
        </div>
      </div>

      {/* Right side: Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        <div className="h-5 w-px bg-border mx-0.5" />
        <UserMenu email={userEmail} role={userRole} />
      </div>
    </header>
  );
}
