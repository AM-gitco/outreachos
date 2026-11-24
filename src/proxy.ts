import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    console.error("[Proxy] Critical invocation failure caught:", error);
    return NextResponse.next();
  }
}

export default proxy;

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static, _next/image (Next.js assets)
     * - favicon.ico, sitemap.xml, robots.txt
     * - api/webhooks (external automated webhooks like n8n)
     * - workflows, docs (public interactive viewers, downloads, and documentation)
     * - all public static assets with an extension
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|api/webhooks|workflows|docs|.*\\.[\\w]+$).*)",
  ],
};


