import JSZip from "jszip";

export async function downloadWorkflowsZip(options?: {
  filename?: string;
  includePdf?: boolean;
}) {
  const filename = options?.filename || "outreachos-n8n-workflows.zip";
  const includePdf = options?.includePdf !== false;

  const zip = new JSZip();

  // 1. List of 8 workflow files to bundle
  const workflows = [
    { file: "WF-01 - Lead Ingestion.json", path: "/workflows/WF-01.json" },
    { file: "WF-02 — Outreach Scheduler.json", path: "/workflows/WF-02.json" },
    { file: "WF-03 - LinkedIn Health Monitor.json", path: "/workflows/WF-03.json" },
    { file: "WF-04 - Outreach Sender.json", path: "/workflows/WF-04.json" },
    { file: "WF-05 - Reply Handler.json", path: "/workflows/WF-05.json" },
    { file: "WF-06 - Reports & Alerts.json", path: "/workflows/WF-06.json" },
    { file: "WF-07 — Outreach Error Recovery.json", path: "/workflows/WF-07.json" },
    { file: "WF-08 — GetSales Task Monitor.json", path: "/workflows/WF-08.json" },
  ];

  // Fetch and append all 8 JSON files
  await Promise.all(
    workflows.map(async (wf) => {
      try {
        const res = await fetch(wf.path);
        if (res.ok) {
          const text = await res.text();
          zip.file(wf.file, text);
        }
      } catch (err) {
        console.warn(`Could not load ${wf.file} for zip:`, err);
      }
    })
  );

  // 2. Fetch and append assignment requirements PDF if requested
  if (includePdf) {
    try {
      const pdfRes = await fetch("/docs/requirements-multi-channel-outreach.pdf");
      if (pdfRes.ok) {
        const pdfBlob = await pdfRes.blob();
        zip.file("Requirements-Multi-Channel-Outreach.pdf", pdfBlob);
      }
    } catch (err) {
      console.warn("Could not load PDF for zip:", err);
    }
  }

  // 3. Add README.md with complete instructions
  const readmeContent = `# OutreachOS — Complete n8n Multi-Channel Outreach Automation Suite

This archive contains the official, verified production n8n workflows for OutreachOS multi-channel cold outreach (LinkedIn + Email) orchestrated with Clay and GetSales.io.

## Workflows Included

1. **WF-01 - Lead Ingestion.json** (13 nodes)
   - Webhook endpoint for inbound Clay prospect payloads and CSV imports.
   - Field validation, domain normalization, deduplication against existing prospects and suppression list.
   - Initializes prospect state at Step 0.

2. **WF-02 — Outreach Scheduler.json** (4 nodes)
   - Automated cadence engine. Runs every 60 minutes.
   - Prospect timezone calculation and business-hours check (9am-5pm Mon-Fri).
   - Acquires atomic worker lock (preventing concurrent touch races) and executes WF-04.

3. **WF-03 - LinkedIn Health Monitor.json** (12 nodes)
   - 15-minute watchdog auditing daily/weekly caps and connection acceptance rates.
   - Trips immediate emergency halt if account restriction, CAPTCHA, or checkpoint is detected.
   - Broadcasts real-time alerts to Telegram.

4. **WF-04 - Outreach Sender.json** (47 nodes)
   - Multi-channel dispatcher executing the 5-step outreach sequence.
   - Real-time channel router: evaluates LinkedIn health at send time and fails over to Email.
   - Dynamic template hydration, GetSales.io API execution, and audit logging to Supabase.

5. **WF-05 - Reply Handler.json** (13 nodes)
   - Real-time inbound webhook for GetSales and Email reply events.
   - Instantly halts future touches on any reply.
   - Sentiment classification (Interested vs Opt-out) and automatic suppression handling.

6. **WF-06 - Reports & Alerts.json** (4 nodes)
   - Daily operations digest summarizing sent counts, replies, and channel breakdown.
   - Transmits morning reports directly to configured Telegram chat.

7. **WF-07 — Outreach Error Recovery.json** (4 nodes)
   - Catches uncaught workflow execution exceptions.
   - Inserts incident logs into \`automation_errors\` table.
   - Dispatches emergency notification to Telegram operators.

8. **WF-08 — GetSales Task Monitor.json** (21 nodes)
   - Bi-directional task status polling and synchronization with GetSales.io.
   - Updates contact status, invitation acceptance, and message delivery confirmations.

## How to Import into n8n

1. In your n8n workspace, navigate to **Workflows** -> **Add Workflow** -> **Import from File...**
2. Select any or all of the \`.json\` files in this archive.
3. Configure your credentials:
   - **Supabase**: OAuth2 or Service Role API connection.
   - **Telegram**: Bot Token and Chat ID.
   - **GetSales.io**: API Key and Webhook URL.
   - **SMTP / Resend**: Outbound mail server credentials.
4. Activate the workflows in numerical order (WF-01 to WF-08).

## Requirements Specification

Refer to the included \`Requirements-Multi-Channel-Outreach.pdf\` for full system requirements, acceptance criteria, and sequence rules.
`;

  zip.file("README.md", readmeContent);

  // 4. Generate and trigger download
  const content = await zip.generateAsync({ type: "blob" });
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
