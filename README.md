# outreachos

Multi-Channel Outreach Automation (LinkedIn + Email) Operations Platform.

Built with Next.js 16, Supabase, and n8n to automate 5-touch sequences across LinkedIn and email, with autonomous account health monitoring and failover routing.

## Key Features

- **Clay Lead Ingestion & Deduplication**: Validates inbound prospect payloads, cleans domains, and deduplicates against existing records and global suppression registries.
- **Dynamic Send-Time Channel Router**: Evaluates LinkedIn sender health at send time per step (Steps 1–5), routing to Email fallback when restrictions loom.
- **LinkedIn Account Health Guardian**: Monitors daily/weekly caps, acceptance rate decay, and trips immediate failovers upon restriction notices.
- **8 Production n8n Workflows**: Complete visual workflow suite (WF-01 through WF-08) with in-dashboard interactive canvas, node inspector, and Pixtex integration.
- **In-Dashboard Browser & Pixtex Integration**: Built-in browser preview with 1-click workflow JSON export to [Pixtex.dev](https://pixtex.dev/) for pixel-perfect diagrams.
- **Interactive Assignment & Requirements Spec**: Complete 13-section specification breakdown and embedded interactive PDF viewer.
- **One-Click ZIP Packaging**: Export all workflows and specifications in a single archive (`outreachos-n8n-workflows.zip`).

## Workflows Included

1. **WF-01 - Lead Ingestion & Intake Pipeline** (13 nodes)
2. **WF-02 — Outreach Scheduling & Cadence Engine** (4 nodes)
3. **WF-03 - LinkedIn Health Monitor & Safety Guardian** (12 nodes)
4. **WF-04 - Multi-Channel Sequence Dispatcher** (47 nodes)
5. **WF-05 - Reply Detection & Sentiment Router** (13 nodes)
6. **WF-06 - Daily Reports & Telegram Alerts** (4 nodes)
7. **WF-07 — Outreach Error Recovery & Incident Logger** (4 nodes)
8. **WF-08 — GetSales Task Monitor & Bi-Directional Sync** (21 nodes)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security)
- **Orchestration**: n8n Workflow Automation
- **Execution Channels**: GetSales.io, SMTP / Resend
- **Workflow Visualization**: React Flow (@xyflow/react), Pixtex
- **Styling**: Tailwind CSS
