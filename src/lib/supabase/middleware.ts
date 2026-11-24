import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next();

  // Clean and sanitize environment variables (strip quotes, trim whitespace)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? process.env.NEXT_PUBLIC_SUPABASE_URL.trim().replace(/^["']|["']$/g, "")
    : undefined;

  const rawKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const supabaseAnonKey = rawKey
    ? rawKey.trim().replace(/^["']|["']$/g, "")
    : undefined;

  const isLoginPage = request.nextUrl.pathname.startsWith("/login");
  const isAuthCallback = request.nextUrl.pathname.startsWith("/auth");
  const isApiWebhook = request.nextUrl.pathname.startsWith("/api/webhooks");

  // Always allow public access to auth callback and webhooks without session validation
  if (isAuthCallback || isApiWebhook) {
    return supabaseResponse;
  }

  // If Supabase is not configured yet or has invalid/placeholder URL, pass through to avoid hard crash
  if (
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes("placeholder") ||
    !supabaseUrl.startsWith("http")
  ) {
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next();
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: Avoid using getSession() in middleware because it is spoofable.
    // getUser() validates the token against Supabase Auth.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // If unauthenticated and trying to access protected routes, redirect to /login
    if ((!user || error) && !isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // If authenticated and trying to access /login, redirect to /
    if (user && isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (error) {
    // Catch any network, fetch, or configuration errors to prevent 500 MIDDLEWARE_INVOCATION_FAILED
    console.error("[Supabase Middleware] Error updating session:", error);

    // If unauthenticated or session failed, redirect protected pages to /login safely
    if (!isLoginPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirectTo", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }
}

