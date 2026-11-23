"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { OutreachEvent } from "@/lib/types";

export interface GetActivityParams {
  page?: number;
  pageSize?: number;
  search?: string;
  channel?: string;
  action?: string;
  step?: number;
  prospectId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "sent_at" | "step" | "channel" | "action";
  sortOrder?: "asc" | "desc";
}

export interface GetActivityResponse {
  events: OutreachEvent[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  distinctActions: string[];
}

export async function getActivityEvents({
  page = 1,
  pageSize = 15,
  search = "",
  channel = "all",
  action = "all",
  step,
  prospectId,
  startDate,
  endDate,
  sortBy = "sent_at",
  sortOrder = "desc",
}: GetActivityParams = {}): Promise<GetActivityResponse> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    let query = supabase
      .from("outreach_events")
      .select("*, prospect:prospects(id, first_name, last_name, company, email)", {
        count: "exact",
      });

    // 1. Channel filter
    if (channel && channel !== "all") {
      query = query.eq("channel", channel);
    }

    // 2. Action filter
    if (action && action !== "all") {
      query = query.eq("action", action);
    }

    // 3. Step filter
    if (step !== undefined && !isNaN(step)) {
      query = query.eq("step", step);
    }

    // 4. Prospect ID filter
    if (prospectId) {
      query = query.eq("prospect_id", prospectId);
    }

    // 5. Date range filters
    if (startDate) {
      query = query.gte("sent_at", startDate);
    }
    if (endDate) {
      query = query.lte("sent_at", endDate);
    }

    // 6. Search across message content or message_id
    if (search.trim()) {
      const q = search.trim();
      query = query.or(`message.ilike.%${q}%,message_id.ilike.%${q}%`);
    }

    // 7. Pagination & Sorting
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching activity events:", error);
      return {
        events: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        distinctActions: [],
      };
    }

    // Fetch distinct actions from database for filter dropdown
    const { data: actionsData } = await supabase
      .from("outreach_events")
      .select("action");

    const distinctActions = Array.from(
      new Set(
        (actionsData || [])
          .map((a) => a.action?.trim())
          .filter(Boolean) as string[]
      )
    ).sort();

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      events: (data as OutreachEvent[]) || [],
      totalCount,
      page,
      pageSize,
      totalPages,
      distinctActions,
    };
  } catch (err) {
    console.error("Exception in getActivityEvents:", err);
    return {
      events: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
      distinctActions: [],
    };
  }
}

export async function exportActivityToCsvData(params: GetActivityParams = {}) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  let query = supabase
    .from("outreach_events")
    .select("*, prospect:prospects(id, first_name, last_name, company, email)");

  if (params.channel && params.channel !== "all") {
    query = query.eq("channel", params.channel);
  }
  if (params.action && params.action !== "all") {
    query = query.eq("action", params.action);
  }
  if (params.step !== undefined && !isNaN(params.step)) {
    query = query.eq("step", params.step);
  }
  if (params.prospectId) {
    query = query.eq("prospect_id", params.prospectId);
  }
  if (params.startDate) {
    query = query.gte("sent_at", params.startDate);
  }
  if (params.endDate) {
    query = query.lte("sent_at", params.endDate);
  }
  if (params.search?.trim()) {
    const q = params.search.trim();
    query = query.or(`message.ilike.%${q}%,message_id.ilike.%${q}%`);
  }

  const { data } = await query
    .order("sent_at", { ascending: false })
    .limit(5000);

  return (data as OutreachEvent[]) || [];
}
