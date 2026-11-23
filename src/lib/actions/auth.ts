"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export interface AuthResponse {
  success: boolean;
  error?: string;
}

export async function checkSupabaseConfigured(): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(url && key && !url.includes("placeholder"));
}

export async function loginAction(
  prevState: AuthResponse | null,
  formData: FormData
): Promise<AuthResponse> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();

  if (!email || !password) {
    return {
      success: false,
      error: "Please enter both email and password.",
    };
  }

  const isConfigured = await checkSupabaseConfigured();
  if (!isConfigured) {
    return {
      success: false,
      error:
        "Supabase credentials are not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || "Invalid email or password.",
      };
    }

    revalidatePath("/", "layout");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Authentication failed.";
    return {
      success: false,
      error: message,
    };
  }

  redirect("/");
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout network error and redirect anyway
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  const isConfigured = await checkSupabaseConfigured();
  if (!isConfigured) {
    return {
      user: null,
      isConfigured: false,
      role: "admin" as const,
    };
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      user,
      isConfigured: true,
      role: (user?.user_metadata?.role as "admin" | "manager" | "viewer") || "admin",
    };
  } catch {
    return {
      user: null,
      isConfigured: true,
      role: "admin" as const,
    };
  }
}
