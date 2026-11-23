"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AutomationError, QueueHealthStats } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getAutomationErrors(options?: {
  status?: string;
  limit?: number;
}): Promise<{ errors: AutomationError[]; openCount: number }> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    let query = supabase
      .from("automation_errors")
      .select("*")
      .order("created_at", { ascending: false });

    if (options?.status && options.status !== "all") {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data: errors, error } = await query;

    if (error) {
      console.error("Error fetching automation_errors:", error);
      return { errors: [], openCount: 0 };
    }

    const { count: openCount } = await supabase
      .from("automation_errors")
      .select("*", { count: "exact", head: true })
      .eq("status", "open");

    return {
      errors: (errors as AutomationError[]) || [],
      openCount: openCount || 0,
    };
  } catch (err) {
    console.error("Exception in getAutomationErrors:", err);
    return { errors: [], openCount: 0 };
  }
}

export async function updateAutomationErrorStatus(
  id: string,
  status: "open" | "resolved" | "ignored"
) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    const { error } = await supabase
      .from("automation_errors")
      .update({ status })
      .eq("id", id);

    if (error) {
      console.error("Error updating automation error status:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/automation");
    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    console.error("Exception in updateAutomationErrorStatus:", err);
    return { success: false, error: "Failed to update incident status" };
  }
}

export async function deleteAutomationError(id: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    const { error } = await supabase
      .from("automation_errors")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting automation error:", error);
      return { success: false, error: error.message };
    }

    revalidatePath("/automation");
    revalidatePath("/notifications");
    return { success: true };
  } catch (err) {
    console.error("Exception in deleteAutomationError:", err);
    return { success: false, error: "Failed to delete incident" };
  }
}

export async function getQueueHealthStats(): Promise<QueueHealthStats> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    const { count: lockedCount } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("processing", true);

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: staleCount } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("processing", true)
      .lt("processing_started_at", fifteenMinutesAgo);

    const { count: totalActiveCount } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    return {
      lockedCount: lockedCount || 0,
      staleCount: staleCount || 0,
      totalActiveCount: totalActiveCount || 0,
    };
  } catch (err) {
    console.error("Exception in getQueueHealthStats:", err);
    return {
      lockedCount: 0,
      staleCount: 0,
      totalActiveCount: 0,
    };
  }
}

export async function releaseStaleLocksAction(): Promise<{
  success: boolean;
  releasedCount: number;
  message: string;
}> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    const { data, error } = await supabase.rpc("release_stale_prospect_locks");

    if (error) {
      console.error("Error running release_stale_prospect_locks RPC:", error);
      return {
        success: false,
        releasedCount: 0,
        message: error.message || "Failed to release stale prospect locks",
      };
    }

    const released = typeof data === "number" ? data : 0;
    revalidatePath("/automation");
    revalidatePath("/leads");
    revalidatePath("/settings");

    return {
      success: true,
      releasedCount: released,
      message:
        released > 0
          ? `Successfully released ${released} stale prospect lock${released === 1 ? "" : "s"}.`
          : "No stale locks detected. Queue is healthy.",
    };
  } catch (err) {
    console.error("Exception in releaseStaleLocksAction:", err);
    return {
      success: false,
      releasedCount: 0,
      message: "An unexpected error occurred while releasing stale locks.",
    };
  }
}
