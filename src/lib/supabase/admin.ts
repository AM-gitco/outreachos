import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates an admin Supabase client using the Service Role Key.
 *
 * CRITICAL SECURITY NOTICE:
 * This client bypasses Row Level Security (RLS).
 * MUST NEVER be called from browser/client components.
 * Only use in secure server-side operations, webhook handlers, and admin tasks.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key";

  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
