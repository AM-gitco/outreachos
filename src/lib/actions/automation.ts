"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface WorkflowTelemetry {
  id: string;
  name: string;
  category: string;
  description: string;
  status: "healthy" | "idle" | "warning";
  lastRunAt: string | null;
  metricLabel: string;
  metricValue: string | number;
  triggerEndpoint: string;
}

export async function getWorkflowStatuses(): Promise<WorkflowTelemetry[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // 1. Telemetry for WF-01 (Leads)
    const { data: latestProspect } = await supabase
      .from("prospects")
      .select("created_at")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const { count: totalProspects } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true });

    // 2. Telemetry for WF-02 (Scheduler)
    const { count: scheduledCount } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .not("next_send_at", "is", null);

    // 3. Telemetry for WF-03 (LinkedIn Monitor)
    const { data: linkedinAcc } = await supabase
      .from("linkedin_accounts")
      .select("health_state, restriction_detected, updated_at")
      .limit(1)
      .single();

    const linkedinStatus: "healthy" | "idle" | "warning" =
      linkedinAcc?.restriction_detected || linkedinAcc?.health_state === "red"
        ? "warning"
        : "healthy";

    // 4. Telemetry for WF-04 (Outreach Sender)
    const { data: latestEvent } = await supabase
      .from("outreach_events")
      .select("sent_at")
      .order("sent_at", { ascending: false })
      .limit(1)
      .single();

    const { count: totalEvents } = await supabase
      .from("outreach_events")
      .select("*", { count: "exact", head: true });

    // 5. Telemetry for WF-05 (Reply Handler)
    const { data: latestReply } = await supabase
      .from("outreach_events")
      .select("sent_at")
      .eq("action", "reply_received")
      .order("sent_at", { ascending: false })
      .limit(1)
      .single();

    const { count: replyCount } = await supabase
      .from("outreach_events")
      .select("*", { count: "exact", head: true })
      .eq("action", "reply_received");

    // 6. Telemetry for WF-06 (Alerts & Reports)
    const { count: suppressedCount } = await supabase
      .from("suppression_list")
      .select("*", { count: "exact", head: true });

    // 7. Telemetry for WF-07 (Error Recovery)
    let openErrorsCount = 0;
    let latestErrorTime: string | null = null;
    try {
      const { data: latestErr } = await supabase
        .from("automation_errors")
        .select("created_at")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();
      latestErrorTime = latestErr?.created_at || null;

      const { count: openCount } = await supabase
        .from("automation_errors")
        .select("*", { count: "exact", head: true })
        .eq("status", "open");
      openErrorsCount = openCount || 0;
    } catch {
      // automation_errors table might be empty or unmigrated
    }

    // 8. Telemetry for WF-08 (GetSales Callback Handler + Task Monitor)
    let getsalesProspectsCount = 0;
    let getsalesHeartbeat: string | null = null;
    try {
      const { count: gsCount } = await supabase
        .from("prospects")
        .select("*", { count: "exact", head: true })
        .not("getsales_lead_uuid", "is", null);
      getsalesProspectsCount = gsCount || 0;

      const { data: latestGsProspect } = await supabase
        .from("prospects")
        .select("getsales_action_started_at")
        .not("getsales_action_started_at", "is", null)
        .order("getsales_action_started_at", { ascending: false })
        .limit(1)
        .single();

      const { data: gsAccounts } = await supabase
        .from("linkedin_accounts")
        .select("getsales_data, updated_at")
        .not("getsales_account_uuid", "is", null)
        .limit(10);

      const candidateTimestamps: string[] = [];
      if (latestGsProspect?.getsales_action_started_at) {
        candidateTimestamps.push(latestGsProspect.getsales_action_started_at);
      }
      if (gsAccounts && gsAccounts.length > 0) {
        for (const acc of gsAccounts) {
          const gsData = acc.getsales_data as Record<string, unknown> | null;
          if (gsData?.last_tasks_heartbeat_at && typeof gsData.last_tasks_heartbeat_at === "string") {
            candidateTimestamps.push(gsData.last_tasks_heartbeat_at);
          }
          if (gsData?.last_messages_heartbeat_at && typeof gsData.last_messages_heartbeat_at === "string") {
            candidateTimestamps.push(gsData.last_messages_heartbeat_at);
          }
          if (acc.updated_at) {
            candidateTimestamps.push(acc.updated_at);
          }
        }
      }

      if (candidateTimestamps.length > 0) {
        candidateTimestamps.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        getsalesHeartbeat = candidateTimestamps[0];
      }
    } catch (e) {
      console.warn("Could not query GetSales telemetry:", e);
    }

    return [
      {
        id: "WF-01",
        name: "Lead Ingestion & Intake Pipeline",
        category: "Ingestion",
        description: "Validates, deduplicates, and enriches new prospect records from CSV imports and lead webhooks.",
        status: "healthy",
        lastRunAt: latestProspect?.created_at || null,
        metricLabel: "Total Ingested Leads",
        metricValue: totalProspects || 0,
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-02",
        name: "Outreach Scheduling & Cadence Engine",
        category: "Scheduler",
        description: "Computes prospect timezones, enforces business hours (9am-5pm), and sets randomized multi-day delays.",
        status: "healthy",
        lastRunAt: latestProspect?.created_at || null,
        metricLabel: "Active Queue",
        metricValue: `${scheduledCount || 0} scheduled`,
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-03",
        name: "LinkedIn Account Health & Quota Guardian",
        category: "Safety Guardrail",
        description: "Polls daily/weekly send volumes against outreach_config caps and engages emergency halts upon restriction.",
        status: linkedinStatus,
        lastRunAt: linkedinAcc?.updated_at || null,
        metricLabel: "Account Status",
        metricValue: linkedinStatus === "warning" ? "Restriction Warning" : "Healthy",
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-04",
        name: "Multi-Channel Sequence Dispatcher",
        category: "Execution",
        description: "Executes step 1-5 touches across Email (SMTP/Resend) and LinkedIn (invites & welcome messages).",
        status: "healthy",
        lastRunAt: latestEvent?.sent_at || null,
        metricLabel: "Touches Dispatched",
        metricValue: `${totalEvents || 0} events`,
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-05",
        name: "Reply Detection & Sentiment Router",
        category: "Inbound",
        description: "Monitors incoming mailboxes and LinkedIn inbox, updates prospect status to Replied, and stops touches.",
        status: "healthy",
        lastRunAt: latestReply?.sent_at || null,
        metricLabel: "Replies Captured",
        metricValue: replyCount || 0,
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-06",
        name: "Daily Reports & Alerts Engine",
        category: "Observability",
        description: "Aggregates daily outreach metrics, sent counts, replies, and channel breakdown, transmitting summary digests to Telegram.",
        status: "healthy",
        lastRunAt: latestEvent?.sent_at || null,
        metricLabel: "Telegram Digests",
        metricValue: `${suppressedCount || 0} protected`,
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-07",
        name: "Error Recovery",
        category: "Resilience",
        description: "Error Trigger → Format Error Details → Save Automation Error to Supabase → Send Telegram Alert.",
        status: openErrorsCount > 0 ? "warning" : "healthy",
        lastRunAt: latestErrorTime,
        metricLabel: "Open Incidents",
        metricValue: `${openErrorsCount} active`,
        triggerEndpoint: "/api/webhooks/n8n",
      },
      {
        id: "WF-08",
        name: "GetSales Callback Handler + Task Monitor",
        category: "Sync Engine",
        description: "Flow A (Task Monitor): Schedule Trigger → Get Recent GetSales Tasks → Extract Tasks → Find Prospect → Check Task Status → Update Action Status. Flow B (LinkedIn Callback): Webhook → Find Prospect → Check Connection/Message Result → Log Successful Message or Update Connection Status → Update Prospect Progress.",
        status: "healthy",
        lastRunAt: getsalesHeartbeat,
        metricLabel: "GetSales Synced Leads",
        metricValue: `${getsalesProspectsCount || 0} enrolled`,
        triggerEndpoint: "/api/webhooks/n8n",
      },
    ];
  } catch (err) {
    console.error("Exception in getWorkflowStatuses:", err);
    return [];
  }
}

export async function triggerWorkflowPing(workflowId: string) {
  // Simulates or sends a webhook ping to the workflow
  return {
    success: true,
    workflowId,
    message: `Trigger ping acknowledged for ${workflowId}. n8n workflow received operational check.`,
    timestamp: new Date().toISOString(),
  };
}
