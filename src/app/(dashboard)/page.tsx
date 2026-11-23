import * as React from "react";
import { getLiveDashboardMetrics } from "@/lib/actions/dashboard";
import { checkSupabaseConfigured } from "@/lib/actions/auth";
import { DashboardView } from "@/components/dashboard/dashboard-view";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const isConfigured = await checkSupabaseConfigured();
  const initialMetrics = await getLiveDashboardMetrics();

  return (
    <DashboardView
      initialMetrics={initialMetrics}
      isConfigured={isConfigured}
    />
  );
}
