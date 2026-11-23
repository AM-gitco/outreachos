"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

interface DashboardShellProps {
  children: React.ReactNode;
  userEmail?: string | null;
  userRole?: string;
}

export function DashboardShell({
  children,
  userEmail,
  userRole,
}: DashboardShellProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  // Load sidebar preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-sidebar-collapsed");
    if (saved !== null) {
      setCollapsed(saved === "true");
    }
  }, []);

  const handleToggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("outreachos-sidebar-collapsed", String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground antialiased">
      {/* Desktop Persistent Fixed Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Container with Fixed Header & Scrollable Body */}
      <div className="flex flex-1 flex-col h-screen min-w-0 overflow-hidden">
        <Header userEmail={userEmail} userRole={userRole} />
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-3 sm:pt-4 pb-6 w-full max-w-[1600px] mx-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
