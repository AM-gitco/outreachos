<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# OutreachOS — Permanent Engineering & Design Guidelines

## 1. UI & Visual Design (Non-Negotiable)
- **NO AI Tropes**: NEVER use sparkles (`Sparkles`), magic wands, rainbow gradients, oversized glowing pills, or pulsing dots everywhere. The interface must look like a mature enterprise operations platform (Linear, Raycast, Stripe, GitHub).
- **NO Excessive Cards**: Do not wrap every single piece of information in a rounded floating card with heavy padding and box-shadow. Prefer clean bordered sections, hairline dividers (`border-border`), structured tabular layouts, metric ribbons, and compact key-value data displays.
- **Typography & Scale**: Restrained font sizes. Page titles `text-lg` or `text-xl font-semibold`. Section headers `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground`. Body text `text-xs` or `text-sm`. Use `tabular-nums` for all stats, dates, and metrics.
- **Fixed Layout**:
  - Top header is fixed/sticky at the top with a subtle hairline bottom border and backdrop blur.
  - Sidebar is fixed/sticky at the left (`h-screen sticky top-0`) on desktop.
  - Only the main content container scrolls. The sidebar and header never scroll out of view.
- **Components Standard**:
  - Always use `CustomDropdown` for select menus.
  - Always use `DatePicker` or `DateRangePicker` for date controls.
  - Always use `ConfirmDialog` for any action that deletes, pauses, modifies status, removes suppression, or edits operational settings. Never perform destructive or high-impact actions without confirmation.
- **Responsive Layout**:
  - Mobile (320px–767px): Slide-out drawer navigation via hamburger trigger, full-width touch controls, stacked layouts, no horizontal scrolling.
  - Tablet (768px–1023px): Compact views, 2-column grids.
  - Desktop (1024px+): Persistent collapsible sidebar, dense information architecture.

## 2. Database & Data Architecture
- **Supabase PostgreSQL**: Reuses existing tables (`prospects`, `linkedin_accounts`, `outreach_events`, `suppression_list`, `outreach_config`).
- **Never expose secrets**: `SUPABASE_SERVICE_ROLE_KEY` is strictly server-side.
- **Real data only**: No mock numbers or fake event generators.
