import * as React from "react";
import { getCurrentUser } from "@/lib/actions/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, role } = await getCurrentUser();

  return (
    <DashboardShell
      userEmail={user?.email || "admin@outreachos.internal"}
      userRole={role}
    >
      {children}
    </DashboardShell>
  );
}
