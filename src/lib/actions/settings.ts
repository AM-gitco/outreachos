"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export interface OutreachConfigPayload {
  linkedin: {
    max_daily_messages: number;
    max_daily_requests: number;
    max_pending_invites: number;
    max_weekly_requests: number;
    min_acceptance_rate: number;
    pause_on_restriction: boolean;
    [key: string]: unknown;
  };
  scheduling: {
    default_timezone: string;
    business_start_hour: number;
    business_end_hour: number;
    delay_business_days_min: number;
    delay_business_days_max: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface OutreachConfigRecord {
  id: number | string;
  config: OutreachConfigPayload;
}

const DEFAULT_CONFIG: OutreachConfigPayload = {
  linkedin: {
    max_daily_messages: 40,
    max_daily_requests: 20,
    max_pending_invites: 100,
    max_weekly_requests: 80,
    min_acceptance_rate: 20,
    pause_on_restriction: true,
  },
  scheduling: {
    default_timezone: "UTC",
    business_start_hour: 9,
    business_end_hour: 17,
    delay_business_days_min: 2,
    delay_business_days_max: 3,
  },
};

export async function getOutreachConfig(): Promise<OutreachConfigRecord> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    const { data, error } = await supabase
      .from("outreach_config")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return { id: 1, config: DEFAULT_CONFIG };
    }

    const cfg = data.config as OutreachConfigPayload;
    return {
      id: data.id,
      config: {
        ...DEFAULT_CONFIG,
        ...cfg,
        linkedin: { ...DEFAULT_CONFIG.linkedin, ...(cfg?.linkedin || {}) },
        scheduling: { ...DEFAULT_CONFIG.scheduling, ...(cfg?.scheduling || {}) },
      },
    };
  } catch (err) {
    console.error("Exception in getOutreachConfig:", err);
    return { id: 1, config: DEFAULT_CONFIG };
  }
}

export async function updateOutreachConfig(
  recordId: number | string,
  newConfig: Partial<OutreachConfigPayload>
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // 1. Fetch current config to preserve unmanaged fields
    const { data: existing } = await supabase
      .from("outreach_config")
      .select("config")
      .eq("id", recordId)
      .single();

    const currentConfig = (existing?.config as Record<string, unknown>) || {};

    // 2. Deep merge newConfig into currentConfig
    const mergedConfig: OutreachConfigPayload = {
      ...currentConfig,
      ...newConfig,
      linkedin: {
        ...((currentConfig.linkedin as Record<string, unknown>) || {}),
        ...(newConfig.linkedin || {}),
      } as OutreachConfigPayload["linkedin"],
      scheduling: {
        ...((currentConfig.scheduling as Record<string, unknown>) || {}),
        ...(newConfig.scheduling || {}),
      } as OutreachConfigPayload["scheduling"],
    };

    // 3. Update the record
    const { error } = await supabase
      .from("outreach_config")
      .update({ config: mergedConfig })
      .eq("id", recordId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/settings");
    revalidatePath("/linkedin");
    revalidatePath("/campaigns");
    revalidatePath("/");
    return { success: true };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update configuration.",
    };
  }
}
