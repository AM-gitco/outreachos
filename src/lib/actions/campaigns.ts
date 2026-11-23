"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface PipelineCohort {
  step: number;
  label: string;
  count: number;
  description: string;
}

export interface CampaignOverviewData {
  totalLeads: number;
  activeLeads: number;
  completedLeads: number;
  repliedLeads: number;
  suppressedLeads: number;
  pausedLeads: number;
  cohorts: PipelineCohort[];
  channelTouches: {
    emailSent: number;
    linkedinSent: number;
    replies: number;
    replyRate: number;
  };
  queueStats: {
    scheduledFuture: number;
    readyToSend: number;
    processingLocked: number;
  };
  isFlowPaused: boolean;
}

export async function getCampaignOverview(): Promise<CampaignOverviewData> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // 1. Fetch prospects counts grouped by status and step
    const { data: prospects } = await supabase
      .from("prospects")
      .select("id, status, current_step, next_send_at, processing");

    const totalLeads = prospects?.length || 0;
    let activeLeads = 0;
    let completedLeads = 0;
    let repliedLeads = 0;
    let suppressedLeads = 0;
    let pausedLeads = 0;

    let scheduledFuture = 0;
    let readyToSend = 0;
    let processingLocked = 0;

    const stepCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const now = Date.now();

    (prospects || []).forEach((p) => {
      const s = (p.status || "active").toLowerCase();
      if (s === "active") activeLeads++;
      else if (s === "completed") completedLeads++;
      else if (s === "replied") repliedLeads++;
      else if (s === "suppressed") suppressedLeads++;
      else if (s === "paused") pausedLeads++;

      const step = p.current_step ?? 0;
      stepCounts[step] = (stepCounts[step] || 0) + 1;

      if (p.processing) {
        processingLocked++;
      } else if (p.next_send_at) {
        const sendTime = new Date(p.next_send_at).getTime();
        if (sendTime > now) {
          scheduledFuture++;
        } else {
          readyToSend++;
        }
      }
    });

    const cohorts: PipelineCohort[] = [
      { step: 0, label: "Ingestion & Intake", count: stepCounts[0] || 0, description: "Raw prospects verified & queued for initial touch" },
      { step: 1, label: "Connection Request", count: stepCounts[1] || 0, description: "LinkedIn invitation sent; awaiting connection" },
      { step: 2, label: "Introductory Message", count: stepCounts[2] || 0, description: "Welcome message sent after connection" },
      { step: 3, label: "First Follow-up", count: stepCounts[3] || 0, description: "Nudge email or follow-up direct message" },
      { step: 4, label: "Second Follow-up", count: stepCounts[4] || 0, description: "Value-focused touch or case study share" },
      { step: 5, label: "Final Outreach", count: stepCounts[5] || 0, description: "Final breakup email / completed sequence" },
    ];

    // 2. Fetch event counts
    const { data: events } = await supabase
      .from("outreach_events")
      .select("channel, action");

    let emailSent = 0;
    let linkedinSent = 0;
    let replies = 0;

    (events || []).forEach((e) => {
      const channel = (e.channel || "email").toLowerCase();
      const action = (e.action || "").toLowerCase();

      if (action.includes("reply") || channel === "reply") {
        replies++;
      } else if (channel.includes("linkedin")) {
        linkedinSent++;
      } else {
        emailSent++;
      }
    });

    const totalOutreach = emailSent + linkedinSent;
    const replyRate = totalOutreach > 0 ? Math.round((replies / totalOutreach) * 1000) / 10 : 0;

    // 3. Fetch pause status from outreach_config
    const { data: configData } = await supabase
      .from("outreach_config")
      .select("config")
      .limit(1)
      .single();

    const isFlowPaused = !!(configData?.config as { is_paused?: boolean })?.is_paused;

    return {
      totalLeads,
      activeLeads,
      completedLeads,
      repliedLeads,
      suppressedLeads,
      pausedLeads,
      cohorts,
      channelTouches: {
        emailSent,
        linkedinSent,
        replies,
        replyRate,
      },
      queueStats: {
        scheduledFuture,
        readyToSend,
        processingLocked,
      },
      isFlowPaused,
    };
  } catch (err) {
    console.error("Exception in getCampaignOverview:", err);
    return {
      totalLeads: 0,
      activeLeads: 0,
      completedLeads: 0,
      repliedLeads: 0,
      suppressedLeads: 0,
      pausedLeads: 0,
      cohorts: [],
      channelTouches: { emailSent: 0, linkedinSent: 0, replies: 0, replyRate: 0 },
      queueStats: { scheduledFuture: 0, readyToSend: 0, processingLocked: 0 },
      isFlowPaused: false,
    };
  }
}

export async function toggleFlowPause(newPausedState: boolean) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // Fetch current config
  const { data: configRecord } = await supabase
    .from("outreach_config")
    .select("id, config")
    .limit(1)
    .single();

  if (configRecord) {
    const currentConfig = (configRecord.config as Record<string, unknown>) || {};
    await supabase
      .from("outreach_config")
      .update({
        config: {
          ...currentConfig,
          is_paused: newPausedState,
        },
      })
      .eq("id", configRecord.id);
  }

  revalidatePath("/campaigns");
  revalidatePath("/");
  return { success: true };
}
