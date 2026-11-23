"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Prospect, OutreachEvent } from "@/lib/types";
import { revalidatePath } from "next/cache";

export interface GetLeadsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  country?: string;
  current_step?: number;
  channel?: "all" | "email" | "linkedin" | "both";
  sortBy?: "created_at" | "first_name" | "company" | "current_step" | "next_send_at";
  sortOrder?: "asc" | "desc";
}

export interface GetLeadsResponse {
  leads: Prospect[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  distinctCountries: string[];
}

let cachedCountries: string[] = [];
let lastCountryFetch = 0;

export async function getLeads({
  page = 1,
  pageSize = 10,
  search = "",
  status = "",
  country = "",
  current_step,
  channel = "all",
  sortBy = "created_at",
  sortOrder = "desc",
}: GetLeadsParams = {}): Promise<GetLeadsResponse> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    let query = supabase
      .from("prospects")
      .select("*", { count: "exact" });

    // Exclude completely blank/orphan rows (must have at least name, email, or linkedin)
    query = query.or("first_name.not.is.null,last_name.not.is.null,email.not.is.null,linkedin_url.not.is.null");

    // 1. Search across name, email, company, linkedin_url
    if (search.trim()) {
      const q = search.trim();
      query = query.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,linkedin_url.ilike.%${q}%`
      );
    }

    // 2. Filter by status
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // 3. Filter by country
    if (country && country !== "all") {
      query = query.eq("country", country);
    }

    // 4. Filter by current_step
    if (current_step !== undefined && !isNaN(current_step)) {
      query = query.eq("current_step", current_step);
    }

    // 5. Channel availability filter
    if (channel === "email") {
      query = query.not("email", "is", null).neq("email", "");
    } else if (channel === "linkedin") {
      query = query.not("linkedin_url", "is", null).neq("linkedin_url", "");
    } else if (channel === "both") {
      query = query
        .not("email", "is", null)
        .neq("email", "")
        .not("linkedin_url", "is", null)
        .neq("linkedin_url", "");
    }

    // 6. Sorting & Pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    query = query
      .order(sortBy, { ascending: sortOrder === "asc" })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      return {
        leads: [],
        totalCount: 0,
        page,
        pageSize,
        totalPages: 0,
        distinctCountries: cachedCountries,
      };
    }

    // Cache distinct countries for 5 minutes to avoid redundant queries on every filter click
    const now = Date.now();
    if (cachedCountries.length === 0 || now - lastCountryFetch > 300000) {
      const { data: countryData } = await supabase
        .from("prospects")
        .select("country")
        .not("country", "is", null);

      cachedCountries = Array.from(
        new Set(
          (countryData || [])
            .map((c) => c.country?.trim())
            .filter(Boolean) as string[]
        )
      ).sort();
      lastCountryFetch = now;
    }

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      leads: (data as Prospect[]) || [],
      totalCount,
      page,
      pageSize,
      totalPages,
      distinctCountries: cachedCountries,
    };
  } catch (err) {
    console.error("Exception in getLeads:", err);
    return {
      leads: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0,
      distinctCountries: cachedCountries,
    };
  }
}

export interface LeadDetailResponse {
  lead: Prospect | null;
  events: OutreachEvent[];
  isSuppressed: boolean;
  suppressionReason?: string;
}

export async function getLeadDetail(id: string): Promise<LeadDetailResponse> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // 1. Get Prospect
    const { data: lead, error } = await supabase
      .from("prospects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !lead) {
      return { lead: null, events: [], isSuppressed: false };
    }

    // 2. Check Suppression List
    let isSuppressed = false;
    let suppressionReason: string | undefined;

    if (lead.email || lead.linkedin_url) {
      const filters = [];
      if (lead.email) filters.push(`email.eq.${lead.email}`);
      if (lead.linkedin_url) filters.push(`linkedin_url.eq.${lead.linkedin_url}`);

      const { data: supp } = await supabase
        .from("suppression_list")
        .select("id, reason")
        .or(filters.join(","))
        .limit(1);

      if (supp && supp.length > 0) {
        isSuppressed = true;
        suppressionReason = supp[0].reason || "Contact is on Do Not Contact list";
      }
    }

    // 3. Get full timeline events
    const { data: events } = await supabase
      .from("outreach_events")
      .select("*")
      .eq("prospect_id", id)
      .order("sent_at", { ascending: false });

    return {
      lead: lead as Prospect,
      events: (events as OutreachEvent[]) || [],
      isSuppressed,
      suppressionReason,
    };
  } catch (err) {
    console.error("Exception in getLeadDetail:", err);
    return { lead: null, events: [], isSuppressed: false };
  }
}

export interface CreateLeadInput {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  job_title?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  country?: string | null;
  timezone?: string | null;
  personalization?: Record<string, unknown> | null;
  status?: string;
  current_step?: number;
  getsales_lead_uuid?: string | null;
  getsales_enrollment_uuid?: string | null;
  getsales_enrollment_status?: string | null;
  getsales_action_status?: string | null;
}

export async function createLead(data: CreateLeadInput) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // Basic validation: must have at least email OR linkedin_url
  const email = data.email?.trim() || null;
  const linkedin = data.linkedin_url?.trim() || null;

  if (!email && !linkedin) {
    return { success: false, error: "Please provide either an email address or a LinkedIn profile URL." };
  }

  // 1. Check suppression list
  const orFilters = [];
  if (email) orFilters.push(`email.eq.${email}`);
  if (linkedin) orFilters.push(`linkedin_url.eq.${linkedin}`);

  if (orFilters.length > 0) {
    const { data: suppressed } = await supabase
      .from("suppression_list")
      .select("reason")
      .or(orFilters.join(","))
      .limit(1);

    if (suppressed && suppressed.length > 0) {
      return {
        success: false,
        error: `Cannot add lead: Contact is on the Do Not Contact list. Reason: ${suppressed[0].reason || "Suppressed"}`,
      };
    }
  }

  // 2. Check duplicates in prospects
  if (orFilters.length > 0) {
    const { data: existing } = await supabase
      .from("prospects")
      .select("id, first_name, last_name, company")
      .or(orFilters.join(","))
      .limit(1);

    if (existing && existing.length > 0) {
      const p = existing[0];
      return {
        success: false,
        error: `Duplicate contact detected: Already exists as "${[p.first_name, p.last_name].filter(Boolean).join(" ")}" (${p.company || "No company"}).`,
      };
    }
  }

  // 3. Insert lead
  const { data: newLead, error } = await supabase
    .from("prospects")
    .insert({
      first_name: data.first_name?.trim() || null,
      last_name: data.last_name?.trim() || null,
      company: data.company?.trim() || null,
      job_title: data.job_title?.trim() || null,
      email,
      linkedin_url: linkedin,
      country: data.country?.trim() || null,
      timezone: data.timezone?.trim() || null,
      personalization: data.personalization || {},
      status: data.status || "active",
      current_step: data.current_step !== undefined ? data.current_step : 0,
      processing: false,
      getsales_lead_uuid: data.getsales_lead_uuid?.trim() || null,
      getsales_enrollment_uuid: data.getsales_enrollment_uuid?.trim() || null,
      getsales_enrollment_status: data.getsales_enrollment_status?.trim() || null,
      getsales_action_status: data.getsales_action_status?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true, lead: newLead };
}

export async function updateLead(id: string, data: Partial<CreateLeadInput>) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const payload: Record<string, unknown> = {};
  if (data.first_name !== undefined) payload.first_name = data.first_name?.trim() || null;
  if (data.last_name !== undefined) payload.last_name = data.last_name?.trim() || null;
  if (data.company !== undefined) payload.company = data.company?.trim() || null;
  if (data.job_title !== undefined) payload.job_title = data.job_title?.trim() || null;
  if (data.email !== undefined) payload.email = data.email?.trim() || null;
  if (data.linkedin_url !== undefined) payload.linkedin_url = data.linkedin_url?.trim() || null;
  if (data.country !== undefined) payload.country = data.country?.trim() || null;
  if (data.timezone !== undefined) payload.timezone = data.timezone?.trim() || null;
  if (data.personalization !== undefined) payload.personalization = data.personalization;
  if (data.status !== undefined) payload.status = data.status;
  if (data.current_step !== undefined) payload.current_step = data.current_step;
  if (data.getsales_lead_uuid !== undefined) payload.getsales_lead_uuid = data.getsales_lead_uuid?.trim() || null;
  if (data.getsales_enrollment_uuid !== undefined) payload.getsales_enrollment_uuid = data.getsales_enrollment_uuid?.trim() || null;
  if (data.getsales_enrollment_status !== undefined) payload.getsales_enrollment_status = data.getsales_enrollment_status?.trim() || null;
  if (data.getsales_action_status !== undefined) payload.getsales_action_status = data.getsales_action_status?.trim() || null;

  const { error } = await supabase
    .from("prospects")
    .update(payload)
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteLead(id: string) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { error } = await supabase
    .from("prospects")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true };
}

export async function deleteMultipleLeads(ids: string[]) {
  if (!ids || ids.length === 0) return { success: true, count: 0 };

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { error } = await supabase
    .from("prospects")
    .delete()
    .in("id", ids);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/leads");
  revalidatePath("/");
  return { success: true, count: ids.length };
}

export async function importLeadsBatch(leadsList: CreateLeadInput[]) {
  if (!leadsList || leadsList.length === 0) {
    return { success: false, error: "No lead records provided." };
  }

  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  // 1. Fetch suppression list to filter
  const { data: suppressionData } = await supabase
    .from("suppression_list")
    .select("email, linkedin_url");

  const suppressedEmails = new Set(
    (suppressionData || [])
      .map((s) => s.email?.toLowerCase().trim())
      .filter(Boolean)
  );
  const suppressedLinkedins = new Set(
    (suppressionData || [])
      .map((s) => s.linkedin_url?.toLowerCase().trim())
      .filter(Boolean)
  );

  // 2. Fetch existing prospect emails and linkedins to prevent duplicates
  const { data: existingProspects } = await supabase
    .from("prospects")
    .select("email, linkedin_url");

  const existingEmails = new Set(
    (existingProspects || [])
      .map((p) => p.email?.toLowerCase().trim())
      .filter(Boolean)
  );
  const existingLinkedins = new Set(
    (existingProspects || [])
      .map((p) => p.linkedin_url?.toLowerCase().trim())
      .filter(Boolean)
  );

  let imported = 0;
  let skippedSuppressed = 0;
  let skippedDuplicates = 0;

  const validBatch: Record<string, unknown>[] = [];
  const seenInBatchEmails = new Set<string>();
  const seenInBatchLinkedins = new Set<string>();

  for (const item of leadsList) {
    const email = item.email?.trim() || null;
    const linkedin = item.linkedin_url?.trim() || null;

    if (!email && !linkedin) continue;

    const emailLower = email?.toLowerCase();
    const linkedinLower = linkedin?.toLowerCase();

    // Check suppression
    if (
      (emailLower && suppressedEmails.has(emailLower)) ||
      (linkedinLower && suppressedLinkedins.has(linkedinLower))
    ) {
      skippedSuppressed++;
      continue;
    }

    // Check existing duplicates or duplicates inside current batch
    if (
      (emailLower && (existingEmails.has(emailLower) || seenInBatchEmails.has(emailLower))) ||
      (linkedinLower && (existingLinkedins.has(linkedinLower) || seenInBatchLinkedins.has(linkedinLower)))
    ) {
      skippedDuplicates++;
      continue;
    }

    if (emailLower) seenInBatchEmails.add(emailLower);
    if (linkedinLower) seenInBatchLinkedins.add(linkedinLower);

    validBatch.push({
      first_name: item.first_name?.trim() || null,
      last_name: item.last_name?.trim() || null,
      company: item.company?.trim() || null,
      job_title: item.job_title?.trim() || null,
      email,
      linkedin_url: linkedin,
      country: item.country?.trim() || null,
      timezone: item.timezone?.trim() || "UTC",
      personalization: item.personalization || {},
      status: item.status || "active",
      current_step: item.current_step !== undefined ? item.current_step : 0,
      processing: false,
    });
  }

  if (validBatch.length > 0) {
    const { error } = await supabase.from("prospects").insert(validBatch);
    if (error) {
      return { success: false, error: error.message };
    }
    imported = validBatch.length;
  }

  revalidatePath("/leads");
  revalidatePath("/");

  return {
    success: true,
    imported,
    skippedDuplicates,
    skippedSuppressed,
    totalReceived: leadsList.length,
  };
}

export async function exportLeadsToCsvData(params: GetLeadsParams = {}) {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  let query = supabase.from("prospects").select("*");

  if (params.search?.trim()) {
    const q = params.search.trim();
    query = query.or(
      `first_name.ilike.%${q}%,last_name.ilike.%${q}%,email.ilike.%${q}%,company.ilike.%${q}%,linkedin_url.ilike.%${q}%`
    );
  }
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.country && params.country !== "all") query = query.eq("country", params.country);
  if (params.current_step !== undefined) query = query.eq("current_step", params.current_step);

  const { data } = await query.order("created_at", { ascending: false });
  return (data as Prospect[]) || [];
}
