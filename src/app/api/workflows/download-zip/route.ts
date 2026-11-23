import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import JSZip from "jszip";

export async function GET() {
  try {
    const zip = new JSZip();
    const workflowsDir = path.join(process.cwd(), "public", "workflows");
    const docsDir = path.join(process.cwd(), "public", "docs");

    const workflowFiles = [
      { name: "WF-01 - Lead Ingestion.json", file: "WF-01.json" },
      { name: "WF-02 — Outreach Scheduler.json", file: "WF-02.json" },
      { name: "WF-03 - LinkedIn Health Monitor.json", file: "WF-03.json" },
      { name: "WF-04 - Outreach Sender.json", file: "WF-04.json" },
      { name: "WF-05 - Reply Handler.json", file: "WF-05.json" },
      { name: "WF-06 - Reports & Alerts.json", file: "WF-06.json" },
      { name: "WF-07 — Outreach Error Recovery.json", file: "WF-07.json" },
      { name: "WF-08 — GetSales Task Monitor.json", file: "WF-08.json" },
    ];

    for (const item of workflowFiles) {
      const filePath = path.join(workflowsDir, item.file);
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, "utf8");
        zip.file(item.name, content);
      }
    }

    const pdfPath = path.join(docsDir, "requirements-multi-channel-outreach.pdf");
    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      zip.file("Requirements-Multi-Channel-Outreach.pdf", pdfBuffer);
    }

    const readmePath = path.join(process.cwd(), "README.md");
    if (fs.existsSync(readmePath)) {
      zip.file("PROJECT-README.md", fs.readFileSync(readmePath, "utf8"));
    }

    const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

    return new Response(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="outreachos-n8n-workflows.zip"',
        "Content-Length": String(zipBuffer.byteLength),
      },
    });
  } catch (err) {
    console.error("Failed to generate zip in API:", err);
    return NextResponse.json(
      { error: "Failed to generate workflows zip archive" },
      { status: 500 }
    );
  }
}
