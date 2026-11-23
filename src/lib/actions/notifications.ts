"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface SystemNotification {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
}

export async function getSystemNotifications(): Promise<SystemNotification[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const notifications: SystemNotification[] = [];

  try {
    // 1. Check for LinkedIn account restrictions
    const { data: accounts } = await supabase
      .from("linkedin_accounts")
      .select("*")
      .or("restriction_detected.eq.true,health_state.eq.red");

    (accounts || []).forEach((acc) => {
      notifications.push({
        id: `restr-${acc.id}`,
        type: "critical",
        title: `LinkedIn Account Restriction: ${acc.account_name}`,
        message: `Restriction detected for this account. Outbound automation has been halted to prevent account penalties.`,
        timestamp: acc.updated_at,
        actionUrl: "/linkedin",
        actionLabel: "Review Account",
      });
    });

    // 2. Check for stalled processing locks (> 30 mins)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const { data: stalledLeads } = await supabase
      .from("prospects")
      .select("id, first_name, last_name, company, processing_started_at")
      .eq("processing", true)
      .lte("processing_started_at", thirtyMinutesAgo);

    (stalledLeads || []).forEach((lead) => {
      const name = [lead.first_name, lead.last_name].filter(Boolean).join(" ") || "Prospect";
      notifications.push({
        id: `stall-${lead.id}`,
        type: "warning",
        title: `Worker Lock Stalled: ${name}`,
        message: `Prospect has been locked by a worker since ${new Date(
          lead.processing_started_at!
        ).toLocaleTimeString()}. Check if an n8n workflow execution timed out.`,
        timestamp: lead.processing_started_at || new Date().toISOString(),
        actionUrl: `/leads/${lead.id}`,
        actionLabel: "View Prospect Dossier",
      });
    });

    // 3. Recent replies requiring human review
    const { data: recentReplies } = await supabase
      .from("outreach_events")
      .select("id, prospect_id, sent_at, message, prospect:prospects(id, first_name, last_name, company)")
      .eq("action", "reply_received")
      .order("sent_at", { ascending: false })
      .limit(5);

    (recentReplies || []).forEach((r) => {
      const prospect = r.prospect as { first_name?: string; last_name?: string; company?: string } | null;
      const name = prospect
        ? [prospect.first_name, prospect.last_name].filter(Boolean).join(" ")
        : "Prospect";

      notifications.push({
        id: `reply-${r.id}`,
        type: "info",
        title: `New Reply Received from ${name}`,
        message: r.message ? `"${r.message.slice(0, 100)}..."` : "Prospect responded to outreach touchpoint.",
        timestamp: r.sent_at,
        actionUrl: `/leads/${r.prospect_id}`,
        actionLabel: "Open Conversation",
      });
    });

    // 4. Open Automation / n8n workflow errors
    const { data: openErrors } = await supabase
      .from("automation_errors")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(10);

    (openErrors || []).forEach((err) => {
      notifications.push({
        id: `auto-err-${err.id}`,
        type: "critical",
        title: `Automation Error: ${err.workflow_name}${err.failed_node ? ` (${err.failed_node})` : ""}`,
        message: err.error_message || "An execution error occurred in the n8n automation workflow.",
        timestamp: err.created_at,
        actionUrl: err.execution_url || "/automation",
        actionLabel: err.execution_url ? "Open in n8n" : "View Automation Incidents",
      });
    });

    // Sort by newest first
    notifications.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return notifications;
  } catch (err) {
    console.error("Exception in getSystemNotifications:", err);
    return [];
  }
}
