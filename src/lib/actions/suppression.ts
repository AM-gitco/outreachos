"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { SuppressionRecord } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface GetSuppressionParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "created_at" | "email" | "reason";
  sortOrder?: "asc" | "desc";
}

export interface GetSuppressionResponse {
  records: SuppressionRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getSuppressionList({
  page = 1,
  pageSize = 15,
  search = "",
  sortBy = "created_at",
  sortOrder = "desc",
}: GetSuppressionParams = {}): Promise<GetSuppressionResponse> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    let query = supabase
      .from("suppression_list")
      .select("*", { count: "exact" });

    if (search.trim()) {
      const q = search.trim();
      query = query.or(`email.ilike.%${q}%,linkedin_url.ilike.%${q}%,reason.ilike.%${q}%`);
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching suppression list:", error);
      return {
        records: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
      };
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      records: (data as SuppressionRecord[]) || [],
      totalCount,
      page,
      pageSize,
      totalPages,
    };
  } catch (err) {
    console.error("Exception in getSuppressionList:", err);
    return {
      records: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
    };
  }
}

export async function addSuppression(data: {
  email?: string | null;
  linkedin_url?: string | null;
  reason: string;
}) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const email = data.email?.trim() || null;
  const linkedin = data.linkedin_url?.trim() || null;
  const reason = data.reason?.trim() || "Unspecified suppression reason";

  if (!email && !linkedin) {
    return { success: false, error: "Please provide either an email or a LinkedIn profile URL." };
  }

  // Check duplicate suppression
  const filters = [];
  if (email) filters.push(`email.eq.${email}`);
  if (linkedin) filters.push(`linkedin_url.eq.${linkedin}`);

  const { data: existing } = await supabase
    .from("suppression_list")
    .select("id")
    .or(filters.join(","))
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "This contact is already on the suppression list." };
  }

  // Insert suppression record
  const { error: insertError } = await supabase.from("suppression_list").insert({
    email,
    linkedin_url: linkedin,
    reason,
  });

  if (insertError) {
    return { success: false, error: insertError.message };
  }

  // Update matching prospect to "suppressed" status
  if (email) {
    await supabase.from("prospects").update({ status: "suppressed" }).eq("email", email);
  }
  if (linkedin) {
    await supabase.from("prospects").update({ status: "suppressed" }).eq("linkedin_url", linkedin);
  }

  revalidatePath("/suppression");
  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true };
}

export async function removeSuppression(id: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { error } = await supabase
    .from("suppression_list")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/suppression");
  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true };
}

export async function importSuppressionBatch(
  records: { email?: string; linkedin_url?: string; reason?: string }[]
) {
  if (!records || records.length === 0) {
    return { success: false, error: "No records provided." };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const validBatch: { email: string | null; linkedin_url: string | null; reason: string }[] = [];
  for (const item of records) {
    const email = item.email?.trim() || null;
    const linkedin = item.linkedin_url?.trim() || null;
    const reason = item.reason?.trim() || "Batch CSV Import";
    if (email || linkedin) {
      validBatch.push({ email, linkedin_url: linkedin, reason });
    }
  }

  if (validBatch.length === 0) {
    return { success: false, error: "No valid email or LinkedIn URLs found in the uploaded file." };
  }

  const { error } = await supabase.from("suppression_list").insert(validBatch);
  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/suppression");
  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true, count: validBatch.length };
}

export async function exportSuppressionCsv() {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data } = await supabase
    .from("suppression_list")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as SuppressionRecord[]) || [];
}
