"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { LinkedinAccount } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface LinkedinLimits {
  max_daily_requests: number;
  max_weekly_requests: number;
  max_daily_messages: number;
  max_pending_invites: number;
  min_acceptance_rate: number;
  pause_on_restriction: boolean;
}

export interface LinkedinAccountsResponse {
  accounts: LinkedinAccount[];
  limits: LinkedinLimits;
}

const DEFAULT_LIMITS: LinkedinLimits = {
  max_daily_requests: 20,
  max_weekly_requests: 80,
  max_daily_messages: 40,
  max_pending_invites: 100,
  min_acceptance_rate: 20,
  pause_on_restriction: true,
};

export async function getLinkedinAccounts(): Promise<LinkedinAccountsResponse> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // 1. Fetch accounts
    const { data: accounts, error } = await supabase
      .from("linkedin_accounts")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching linkedin accounts:", error);
    }

    // 2. Fetch limits from outreach_config
    const { data: configData } = await supabase
      .from("outreach_config")
      .select("config")
      .limit(1)
      .single();

    const config = configData?.config as { linkedin?: LinkedinLimits } | undefined;
    const limits = { ...DEFAULT_LIMITS, ...(config?.linkedin || {}) };

    return {
      accounts: (accounts as LinkedinAccount[]) || [],
      limits,
    };
  } catch (err) {
    console.error("Exception in getLinkedinAccounts:", err);
    return {
      accounts: [],
      limits: DEFAULT_LIMITS,
    };
  }
}

export async function updateAccountHealth(
  id: string,
  healthState: string,
  restrictionDetected: boolean
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { error } = await supabase
    .from("linkedin_accounts")
    .update({
      health_state: healthState,
      restriction_detected: restrictionDetected,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/linkedin");
  revalidatePath("/");
  return { success: true };
}

export async function resetDailyQuota(id: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { error } = await supabase
    .from("linkedin_accounts")
    .update({
      sent_today: 0,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/linkedin");
  revalidatePath("/");
  return { success: true };
}

export async function addLinkedinAccount(data: {
  account_name: string;
  health_state?: string;
  sent_today?: number;
  sent_this_week?: number;
  pending_invites?: number;
  acceptance_rate?: number;
  getsales_account_uuid?: string;
}) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  if (!data.account_name?.trim()) {
    return { success: false, error: "Account name is required." };
  }

  const { error } = await supabase.from("linkedin_accounts").insert({
    account_name: data.account_name.trim(),
    health_state: data.health_state || "green",
    sent_today: data.sent_today ?? 0,
    sent_this_week: data.sent_this_week ?? 0,
    pending_invites: data.pending_invites ?? 0,
    acceptance_rate: data.acceptance_rate ?? 0,
    restriction_detected: false,
    updated_at: new Date().toISOString(),
    getsales_account_uuid: data.getsales_account_uuid?.trim() || null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/linkedin");
  revalidatePath("/");
  return { success: true };
}

export async function deleteLinkedinAccount(id: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { error } = await supabase
    .from("linkedin_accounts")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/linkedin");
  revalidatePath("/");
  return { success: true };
}
