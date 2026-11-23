import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cache pixtex template HTML for 10 minutes to make loading instant
let cachedPixtexHtml: string | null = null;
let lastFetchTime = 0;

async function getPixtexHtml(): Promise<string> {
  const now = Date.now();
  if (cachedPixtexHtml && now - lastFetchTime < 10 * 60 * 1000) {
    return cachedPixtexHtml;
  }

  try {
    const res = await fetch("https://pixtex.dev/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch pixtex: ${res.statusText}`);
    }

    const html = await res.text();
    cachedPixtexHtml = html;
    lastFetchTime = now;
    return html;
  } catch (err) {
    console.error("Error fetching pixtex html:", err);
    if (cachedPixtexHtml) return cachedPixtexHtml;
    throw err;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wfId = searchParams.get("wf") || "WF-01";

    // 1. Load the requested workflow JSON
    const workflowsDir = path.join(process.cwd(), "public", "workflows");
    let jsonContent: string | null = null;

    const candidateFile = path.join(workflowsDir, `${wfId}.json`);
    if (fs.existsSync(candidateFile)) {
      jsonContent = fs.readFileSync(candidateFile, "utf8");
    } else {
      // Try fallback to WF-01.json
      const fallbackFile = path.join(workflowsDir, "WF-01.json");
      if (fs.existsSync(fallbackFile)) {
        jsonContent = fs.readFileSync(fallbackFile, "utf8");
      }
    }

    if (!jsonContent) {
      jsonContent = JSON.stringify({
        name: "Default Workflow",
        nodes: [],
        connections: {},
      });
    }

    // 2. Fetch the Pixtex base HTML
    const originalHtml = await getPixtexHtml();

    // 3. Inject <base href="https://pixtex.dev/"> so all bundles, fonts, and images load correctly
    const baseTag = '<base href="https://pixtex.dev/">';

    // 4. Inject session pre-loader script
    // Pixtex reads 'pixtex_session_v1' from sessionStorage on mount to render immediately
    const sessionPayload = {
      v: 1,
      savedAt: Date.now(),
      workflow: JSON.parse(jsonContent),
      pins: {},
      phase: "canvas",
      style: "canvas",
      diagram: {},
    };

    const scriptInjection = `
      <script>
        try {
          const seededSession = ${JSON.stringify(JSON.stringify(sessionPayload))};
          window.sessionStorage.setItem("pixtex_session_v1", seededSession);
          console.log("[OutreachOS] Auto-injected workflow session into Pixtex:", ${JSON.stringify(wfId)});
        } catch (err) {
          console.warn("[OutreachOS] Could not pre-seed sessionStorage:", err);
        }
      </script>
    `;

    let modifiedHtml = originalHtml;
    if (modifiedHtml.includes("<head>")) {
      modifiedHtml = modifiedHtml.replace("<head>", `<head>${baseTag}${scriptInjection}`);
    } else {
      modifiedHtml = `${baseTag}${scriptInjection}${modifiedHtml}`;
    }

    return new Response(modifiedHtml, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        // Remove frame restrictions so it renders cleanly in our dashboard browser
        "X-Frame-Options": "ALLOWALL",
        "Cache-Control": "no-store, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Failed to render pixtex proxy:", err);
    return new Response(
      `<!DOCTYPE html><html><body><h2>Failed to load Pixtex Viewer</h2><p>${String(
        err
      )}</p></body></html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  }
}
