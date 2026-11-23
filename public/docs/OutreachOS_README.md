# OutreachOS --- Outreach Automation & Management Platform

> **Project documentation and implementation handover**
>
> This README documents the current n8n outreach automation assignment,
> its Supabase data model, external integrations, and the OutreachOS
> Next.js management dashboard.
>
> **Current project state:** The eight-workflow architecture has been
> built. Some end-to-end and production verification remains. The
> dashboard's first audit identified 7 of 9 modules as complete;
> Priority 1 (GetSales visibility on LinkedIn Accounts) has since been
> implemented and build-verified. Priority 2 (register WF-07 and WF-08
> in the Automation Center) is currently in progress.

------------------------------------------------------------------------

## 1. Project Overview

OutreachOS is a multi-channel outreach system designed to ingest,
enrich, validate, schedule, send, monitor, and report on prospect
outreach.

It combines:

-   **Clay** for lead enrichment.
-   **n8n** for workflow orchestration, validation, scheduling, routing,
    monitoring, and recovery.
-   **Supabase PostgreSQL** as the central data store for prospects,
    account health, outreach events, configuration, suppression records,
    and errors.
-   **GetSales.io** for LinkedIn account execution, connection requests,
    and LinkedIn messages.
-   **Gmail** for email outreach and inbound email replies.
-   **Telegram** for operational notifications and alerts.
-   **OutreachOS (Next.js)** as a non-technical management dashboard for
    leads, activity, accounts, settings, alerts, and automation
    visibility.

### Architecture principle

Next.js is the management interface, Supabase is the operational data
store, and n8n remains the automation engine. The dashboard must not
duplicate n8n business logic or pretend to execute actions that have no
real webhook/API integration.

``` mermaid
flowchart LR
    A[Clay Lead Enrichment] --> B[WF-01 Lead Ingestion]
    B --> C[(Supabase)]
    C --> D[WF-02 Outreach Scheduler]
    D --> E[WF-04 Outreach Sender]
    E --> F[GetSales.io]
    E --> G[Gmail]
    F --> H[WF-08 GetSales Callback and Task Monitor]
    G --> I[WF-05 Reply Handler]
    H --> C
    I --> C
    J[WF-03 LinkedIn Health Monitor] --> C
    K[WF-06 Daily Reports and Alerts] --> L[Telegram]
    M[WF-07 Error Recovery] --> C
    M --> L
    N[OutreachOS Next.js Dashboard] <--> C
    N -. secure webhooks / supported API actions .-> D
```

------------------------------------------------------------------------

## 2. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Responsibility
  ----------------------- ----------------------- -----------------------
  Automation              n8n Cloud               Workflow orchestration
                                                  and business logic

  Lead enrichment         Clay                    Enrich prospect/company
                                                  data

  Database                Supabase PostgreSQL     Persistent records and
                                                  workflow state

  LinkedIn execution      GetSales.io             LinkedIn account
                                                  actions and
                                                  asynchronous task
                                                  execution

  Email                   Gmail                   Email sending and
                                                  inbound reply detection

  Notifications           Telegram                Operational alerts and
                                                  daily reports

  Dashboard               Next.js App Router      Management interface

  Frontend language       TypeScript              Typed application code

  UI                      Tailwind CSS,           Interface and
                          shadcn/ui, Lucide       components

  Charts                  Recharts                Dashboard analytics

  Forms                   React Hook Form, Zod    Form handling and
                                                  validation

  Hosting                 Next.js deployment      Dashboard hosting
                          (Vercel project used    
                          for the dashboard)      
  -----------------------------------------------------------------------

### Known environment

-   n8n Cloud: `https://mannam.app.n8n.cloud`
-   n8n timezone: `Asia/Karachi`
-   Supabase: PostgreSQL project connected to the n8n workflows.
-   Dashboard: Next.js project built and deployed through the user's
    existing deployment setup.

Do not place credentials, access tokens, webhook secrets, or
service-role keys in this README or in frontend code.

------------------------------------------------------------------------

## 3. n8n Workflow Register

  ------------------------------------------------------------------------------
  Workflow          Name              Main              Current status
                                      responsibility    
  ----------------- ----------------- ----------------- ------------------------
  WF-01             Clay Lead         Receive,          Complete / tested
                    Ingestion         validate,         
                                      deduplicate,      
                                      suppress-check,   
                                      and store         
                                      enriched          
                                      prospects         

  WF-02             Outreach          Claim due         Complete / tested
                    Scheduler         prospects and     
                                      schedule the next 
                                      eligible outreach 
                                      step              

  WF-03             LinkedIn Health   Sync GetSales     Built; GetSales sync
                    Monitor           account metadata  created and tested for
                                      and calculate     one account;
                                      LinkedIn account  multi-account
                                      health            verification remains

  WF-04             Outreach Sender   Route sequence    Built; final end-to-end
                                      steps to LinkedIn integration/regression
                                      or email and      tests remain
                                      initiate          
                                      GetSales/Gmail    
                                      actions           

  WF-05             Reply Handler     Detect Gmail and  Both branches tested;
                                      LinkedIn replies, production webhook
                                      stop sequences,   activation verification
                                      and log replies   remains

  WF-06             Daily Reports &   Generate daily    Complete / tested
                    Alerts            outreach summary  
                                      and send it to    
                                      Telegram          

  WF-07             Error Recovery    Capture failed    Complete / tested
                                      workflow          
                                      executions, save  
                                      incidents, and    
                                      alert Telegram    

  WF-08             GetSales Callback Process GetSales  Built; final
                    Handler + Task    callbacks and     verification remains
                    Monitor           poll asynchronous 
                                      tasks to update   
                                      prospect state    
  ------------------------------------------------------------------------------

### WF-01 --- Clay Lead Ingestion

**Purpose:** Bring enriched prospects into the system while preventing
invalid, duplicate, or suppressed leads from entering outreach.

High-level responsibilities:

1.  Receive lead data from the Clay integration.
2.  Validate contact fields and required data.
3.  Check duplicate prospects.
4.  Check the suppression list.
5.  Prepare/normalize prospect fields.
6.  Store eligible prospects in Supabase.
7.  Preserve the data needed by the later outreach steps.

**Data destination:** `prospects` and related Supabase records.

**Status:** Completed and tested.

### WF-02 --- Outreach Scheduler

**Purpose:** Find prospects whose next outreach action is due and safely
claim them for processing.

Key behavior:

-   Schedule Trigger runs every 5 minutes.
-   Calls Supabase RPC `claim_due_prospects(p_limit=50)`.
-   The RPC uses `FOR UPDATE SKIP LOCKED` to avoid two scheduler
    executions claiming the same prospect.
-   Business-day, timezone, and working-hour scheduling is retained.
-   Execute Sub-workflow is configured to **Run once for each item**.
-   A stale processing lock is considered recoverable after 30 minutes.

Eligibility condition for the GetSales action state:

``` sql
AND (
  p.getsales_action_status IS NULL
  OR p.getsales_action_status = 'failed'
)
```

This allows prospects with no GetSales action state or a failed action
to be considered, while pending and request-sent states are excluded
from a duplicate attempt.

**Status:** Completed and tested.

### WF-03 --- LinkedIn Health Monitor

**Purpose:** Keep LinkedIn account records synchronized with GetSales
metadata and calculate health using the configured limits and Supabase
metrics.

Current workflow shape:

``` text
Schedule Trigger
  → Get GetSales LinkedIn Accounts
  → Get Outreach Config
  → Prepare & Match LinkedIn Accounts
  → Find Existing LinkedIn Account
  → Account Already Exists?
       ├─ False → Create New LinkedIn Account
       └─ True  → Update Existing LinkedIn Account
  → Evaluate LinkedIn Health
  → Update LinkedIn Health
  → LinkedIn Health Red?
       └─ True → Send Health Alert (Telegram)
```

GetSales accounts endpoint:

``` http
GET https://amazing.getsales.io/flows/api/linkedin-accounts?limit=100
Authorization: Bearer <GETSALES_API_TOKEN>
```

The response includes account data such as:

-   `uuid`
-   `nickname`
-   `last_tasks_heartbeat_at`
-   `last_messages_heartbeat_at`
-   `sender_profile_uuid`
-   Other account metadata

The account UUID is stored in `linkedin_accounts.getsales_account_uuid`;
the full API object is stored in `linkedin_accounts.getsales_data`.

**Important data rule:** The GetSales account endpoint does not
currently provide the system's daily/weekly send counts, pending
invitation count, acceptance rate, or explicit numeric health score. Do
not replace existing Supabase metrics with invented zeros or missing
values from GetSales.

Current health evaluation uses the existing Supabase metrics and
`outreach_config` thresholds:

-   Red: restriction detected, daily requests at/above the configured
    maximum, or weekly requests at/above the configured maximum.
-   Yellow: pending invitations at/above the configured maximum or
    acceptance rate below the configured minimum.
-   Green: neither red nor yellow condition applies.

**Known edge case:** A newly created account may have
`acceptance_rate = 0` because no real acceptance metric has yet been
collected. With the current comparison, this can classify a new account
as Yellow. This behavior should be deliberately reviewed before changing
the business rule; do not silently treat unknown as a real measured
zero.

The Telegram alert branch currently checks for Red. A Yellow result
correctly follows the non-red branch unless a separate Yellow alert is
deliberately added.

**Status:** GetSales sync has been built and tested for the account
`abdul-mannan-9b1b8b450`. Verify multiple accounts and the existing
unlinked test account before treating the sync as fully
production-verified.

### WF-04 --- Outreach Sender

**Purpose:** Execute the next eligible outreach step using LinkedIn or
email, while respecting suppression, duplicate protection, account
health, and sequence progress.

Existing routing checks include:

1.  Check suppression before sending.
2.  Stop if the prospect is suppressed.
3.  Check whether the same successful send already exists.
4.  Check LinkedIn account health.
5.  Route by the next outreach step.
6.  Select LinkedIn or email based on available contact data and
    connection state.

The `current_step` field represents the **last completed step**. The
next step is `current_step + 1`.

LinkedIn routing:

``` text
LinkedIn URL Available?
  → LinkedIn Already Connected?
       ├─ Yes → LinkedIn Message flow
       └─ No  → Was Previous LinkedIn Request Failed?
                    ├─ Yes → Email fallback
                    └─ No  → Connection Request flow
```

GetSales flow identifiers:

  Flow                 UUID
  -------------------- ----------------------------------------
  Connection Request   `56798720-1c12-44ab-a831-a8792f93dab4`
  LinkedIn Message     `11ae3ed8-e629-470c-942a-624aa61f18bf`

GetSales lead upsert endpoint:

``` http
POST https://amazing.getsales.io/leads/api/leads/upsert
```

GetSales flow enrollment endpoint:

``` http
POST https://amazing.getsales.io/flows/api/flows/{flow_uuid}/leads/{lead_uuid}
```

The enrollment endpoint returns `204` when accepted. Enrollment
acceptance is **not proof that a LinkedIn action has been sent**. The
action happens asynchronously inside the GetSales flow.

Enrollment verification endpoint:

``` http
POST https://amazing.getsales.io/flows/api/flows-leads/list
Content-Type: application/json
```

Example body:

``` json
{
  "filter": {
    "flow_uuid": ["<FLOW_UUID>"],
    "lead_uuid": ["<LEAD_UUID>"]
  },
  "limit": 20
}
```

Important state fields:

-   `getsales_lead_uuid`
-   `getsales_enrollment_uuid`
-   `getsales_enrollment_status`
-   `getsales_action_status`
-   `getsales_action_started_at`

For pending connection requests, mark the action pending and release the
n8n processing lock so the scheduler does not hold the prospect
indefinitely. Do not treat pending enrollment as a completed connection
request.

For the LinkedIn message flow, the GetSales flow sends a callback to
WF-08 with `connection_result: "message_sent"` after the send action.

**Status:** The sender and GetSales integration have been built.
Complete the end-to-end tests for connection request, accepted
connection, LinkedIn message, email fallback, failed GetSales action,
duplicate prevention, and sequence progression before marking WF-04
fully verified.

### WF-05 --- Reply Handler

**Purpose:** Detect inbound replies, identify the matching prospect,
stop future sequence activity, and log the reply.

There are two independent branches.

**Gmail branch:**

``` text
Gmail Trigger
  → Get Message
  → Clean & Prepare Email Reply
  → Find Reply Prospect
  → Prospect Found?
  → Stop Prospect Sequence
  → Log Reply Event
```

The clean-up step extracts the sender email, removes quoted reply text
where possible, and prepares the message body, message ID, thread ID,
subject, received time, and source.

**LinkedIn branch:**

``` text
Webhook
  → Clean LinkedIn Reply
  → Find Reply Prospect by GetSales Lead UUID
  → Prospect Found?
  → Update LinkedIn Reply Status
  → Log LinkedIn Reply Event
```

The LinkedIn branch uses the GetSales contact UUID to find the matching
`prospects.getsales_lead_uuid`.

When a prospect reply is identified:

-   Set prospect status to `replied`.
-   Set `next_send_at` to `null`.
-   Set `processing` to `false`.
-   Set `processing_started_at` to `null`.
-   Record the inbound event in `outreach_events`.

**Status:** Both Gmail and LinkedIn branches have been tested. Confirm
the production webhook URL and active workflow state.

### WF-06 --- Daily Reports & Alerts

**Purpose:** Send a daily operational summary to Telegram.

Current behavior:

-   Schedule Trigger runs daily at 9:00 AM Asia/Karachi.
-   Reads outreach events for the previous rolling 24 hours.
-   Prepares totals for events, emails, LinkedIn actions, and replies.
-   Sends a formatted Telegram report.

Example report format:

``` text
📊 DAILY OUTREACH REPORT

Total Events: 2
Emails Sent: 0
LinkedIn Actions: 1
Replies Received: 1

Report Date: 2026-11-23
```

**Status:** Completed and tested.

### WF-07 --- Error Recovery

**Purpose:** Capture failed workflow executions centrally and notify the
operator.

Current workflow:

``` text
Error Trigger
  → Format Error Details
  → Create automation_errors Record
  → Send Error Alert (Telegram)
```

Captured fields include:

-   Workflow name
-   Execution ID
-   Failed node
-   Error message
-   Execution URL
-   Telegram message

WF-02 handles stale processing locks after 30 minutes, so WF-07 does not
need to release prospect locks itself.

**Status:** Completed and tested. Dashboard registration is a separate
remaining task.

### WF-08 --- GetSales Callback Handler + Task Monitor

**Purpose:** Reconcile asynchronous GetSales execution with the prospect
state stored in Supabase.

WF-08 contains two flows.

**Flow A --- Scheduled task monitor:**

``` text
Schedule Trigger
  → GetSales - Get Recent Tasks
  → Extract GetSales Tasks
  → Find Prospect by GetSales Lead ID
  → Is Prospect Found?
  → Is GetSales Task Done?
       ├─ True → Mark GetSales Action Sent
       └─ False → Is GetSales Task Failed?
                    ├─ True → Mark Failed
                    └─ False → Mark Failed / unresolved handling
```

Recent tasks endpoint:

``` http
GET https://amazing.getsales.io/flows/api/tasks?limit=100&order=created_at:desc
Authorization: Bearer <GETSALES_API_TOKEN>
```

Other documented task endpoints:

``` http
GET  https://amazing.getsales.io/flows/api/tasks/{task_uuid}
PUT  https://amazing.getsales.io/flows/api/tasks/{task_uuid}/complete
PUT  https://amazing.getsales.io/flows/api/tasks/{task_uuid}/cancel
POST https://amazing.getsales.io/flows/api/flows-leads/list
```

Task state must be matched to the correct prospect using the stored
GetSales lead UUID. Confirm the task type before changing message or
connection-request state; do not let one task type overwrite another
action's state.

**Flow B --- LinkedIn action callback:**

``` text
Webhook
  → Find Prospect by GetSales Lead UUID
  → Is LinkedIn Message Sent?
       ├─ True
       │    → Log Successful LinkedIn Message
       │    → Get LinkedIn Scheduling Config
       │    → Prepare LinkedIn Progress
       │    → Update LinkedIn Prospect Progress
       └─ False
            → Was LinkedIn Connection Accepted?
                 ├─ True → Update Prospect Connected
                 └─ False → Update Prospect Not Connected
```

Webhook path:

``` text
getsales-connection-status
```

The webhook uses Header Auth (`X-Webhook-Secret`) and responds
immediately.

Example message callback payload:

``` json
{
  "getsales_lead_uuid": "{{ contact_uuid }}",
  "connection_result": "message_sent",
  "message": "..."
}
```

On successful LinkedIn message:

-   Log an `outreach_events` record.
-   Advance the prospect's outreach progress using the scheduling
    configuration.
-   Clear pending action state and processing locks.

On connection accepted:

-   Set `linkedin_connected = true`.
-   Clear `getsales_action_status`.
-   Clear `getsales_action_started_at`.
-   Release processing locks.

On connection not accepted/failed:

-   Set `linkedin_connected = false`.
-   Mark the action failed where appropriate.
-   Release processing locks.

Use an actual SQL/API null, not the literal string `"null"`.

**Status:** Both flows have been built. Verify real callbacks, task
status mapping, successful message progression, accepted/not-accepted
connection handling, failure handling, and duplicate event prevention.

------------------------------------------------------------------------

## 4. Supabase Database Reference

The following is the known operational schema used by the workflows. The
live database remains the source of truth; inspect it before migrations
or schema changes.

### `prospects`

  Field                          Purpose
  ------------------------------ -------------------------------------
  `id`                           Prospect UUID
  `first_name`, `last_name`      Contact name
  `company`                      Company
  `job_title`                    Role
  `linkedin_url`                 LinkedIn profile URL
  `email`                        Email address
  `personalization`              JSONB personalization data
  `current_step`                 Last completed outreach step
  `status`                       Prospect lifecycle status
  `next_send_at`                 Next scheduled contact time
  `linkedin_connected`           LinkedIn connection state
  `created_at`                   Record creation time
  `country`                      Prospect country
  `timezone`                     Prospect timezone
  `processing`                   Scheduler/worker lock
  `processing_started_at`        Lock start time
  `getsales_lead_uuid`           GetSales contact UUID
  `getsales_enrollment_uuid`     GetSales flow enrollment identifier
  `getsales_enrollment_status`   Enrollment state
  `getsales_action_status`       Action state such as pending/failed
  `getsales_action_started_at`   Action start timestamp

### `linkedin_accounts`

  Field                     Purpose
  ------------------------- ---------------------------------------------
  `id`                      Internal UUID
  `account_name`            LinkedIn sender/account name
  `health_state`            green / yellow / red
  `sent_today`              Daily send/request metric
  `sent_this_week`          Weekly send/request metric
  `pending_invites`         Pending invitation count
  `acceptance_rate`         Acceptance rate
  `restriction_detected`    Restriction flag
  `updated_at`              Last health update
  `getsales_account_uuid`   GetSales LinkedIn account UUID
  `getsales_data`           JSONB snapshot of GetSales account metadata

### `outreach_events`

  Field           Purpose
  --------------- -----------------------------
  `prospect_id`   Related prospect
  `step`          Outreach sequence step
  `channel`       Email, LinkedIn, or system
  `action`        Event/action name
  `message`       Message content
  `message_id`    Provider message identifier
  `sent_at`       Event timestamp
  `response`      JSONB response/payload

### `automation_errors`

  Field                Purpose
  -------------------- ----------------------------------
  `id`                 Incident record ID
  `workflow_name`      Failed workflow
  `execution_id`       n8n execution ID
  `failed_node`        Node where execution failed
  `error_message`      Error details
  `execution_url`      Link to n8n execution
  `status`             Incident status (default `open`)
  `created_at`         Incident timestamp
  `telegram_message`   Alert message sent to Telegram

### `outreach_config`

Contains one configuration JSONB record. Known configuration values:

``` json
{
  "linkedin": {
    "max_daily_messages": 40,
    "max_daily_requests": 20,
    "max_pending_invites": 100,
    "max_weekly_requests": 80,
    "min_acceptance_rate": 20,
    "pause_on_restriction": true
  },
  "scheduling": {
    "default_timezone": "UTC",
    "business_end_hour": 17,
    "business_start_hour": 9,
    "delay_business_days_min": 2,
    "delay_business_days_max": 3
  }
}
```

The n8n schedule uses Asia/Karachi as its configured timezone in the
current environment. The JSON default timezone shown above is the known
stored configuration value; do not assume these are interchangeable.
Preserve unknown JSON keys when updating configuration.

### `suppression_list`

  Field            Purpose
  ---------------- -------------------------
  `id`             Record ID
  `email`          Suppressed email
  `linkedin_url`   Suppressed LinkedIn URL
  `reason`         Suppression reason
  `created_at`     Record timestamp

### Data integrity rules

-   Do not create duplicate prospects or duplicate event tables.
-   Do not treat GetSales enrollment acceptance as proof of a completed
    send.
-   Do not invent unavailable GetSales account metrics.
-   Do not store `"null"` as text when the intended value is SQL `NULL`.
-   Do not advance `current_step` until the corresponding outreach
    action is confirmed successful.
-   A prospect reply must stop future scheduled sequence activity.
-   Suppressed prospects must not be eligible for outreach.
-   Preserve existing configuration JSON keys.
-   Keep processing locks recoverable and avoid duplicate concurrent
    sends.

------------------------------------------------------------------------

## 5. OutreachOS Dashboard

The dashboard is a Next.js management interface for non-technical
operators. It reads and manages Supabase records and should use secure
n8n webhooks/API routes for supported automation actions.

### Original required navigation

1.  Overview
2.  Leads
3.  Campaigns
4.  Activity Logs
5.  LinkedIn Accounts
6.  Suppression List
7.  Automation
8.  Notifications
9.  Settings

### Dashboard audit result

The Antigravity audit reported:

-   Next.js 16.4.6.
-   All 14 routes compiled with zero errors and zero warnings at the
    time of that audit.
-   Seven of nine modules fully functional.
-   Two modules partially complete: LinkedIn Accounts and Automation.
-   The audit reported real Supabase data across the inspected views,
    not dummy records.

The audit also identified one active `automation_errors` record at the
time of inspection. Database counts are time-specific and will change as
the system runs.

### Module status

  -----------------------------------------------------------------------
  Module                  Audit status            Latest known status
  ----------------------- ----------------------- -----------------------
  Overview                Complete                Complete

  Leads and Lead Profiles Complete                Complete

  Activity Logs           Complete                Complete

  Campaigns               Complete                Complete

  LinkedIn Accounts       Partial                 **Priority 1
                                                  implemented; build
                                                  passed**

  Suppression List        Complete                Complete

  Outreach Settings       Complete                Complete

  Notifications           Complete                Complete

  Automation Control      Partial                 **Priority 2 in
  Center                                          progress**
  -----------------------------------------------------------------------

### Priority 1 --- GetSales account visibility (completed)

Files modified:

-   `src/lib/types.ts`
-   `src/components/linkedin/account-card.tsx`
-   `src/components/linkedin/fleet-table.tsx`
-   `src/lib/actions/linkedin.ts`
-   `src/components/linkedin/add-account-modal.tsx`

Implemented:

-   `GetSalesAccountData` TypeScript interface for the `getsales_data`
    JSONB object.
-   `LinkedinAccount` includes `getsales_account_uuid` and
    `getsales_data`.
-   Account card shows GetSales Synced / Direct Sender badge.
-   Account card shows connection state, account UUID, sender profile
    UUID, task heartbeat, message heartbeat, and task interval.
-   Copy buttons for UUID values.
-   Fleet table shows sync badge, truncated UUID, and heartbeat.
-   Unlinked accounts have a fallback state.
-   Add Account modal optionally accepts `getsales_account_uuid`.

Verification reported by Antigravity:

-   `npm run build` passed.
-   TypeScript passed.
-   Zero errors and zero warnings.
-   The live account `abdul-mannan-9b1b8b450` displayed GetSales account
    UUID `c7a6c1a0-43a3-46b2-9389-ccfead6d5ff7`.
-   Sender profile UUID displayed as
    `b29a23ad-f401-405f-b81d-762a1d6a08bb`.

### Priority 2 --- Automation Center workflow coverage (in progress)

Files being updated:

-   `src/lib/n8n/workflows-data.ts`
-   `src/lib/actions/automation.ts`

Required additions:

-   WF-07 Error Recovery topology and description.
-   WF-08 GetSales Callback Handler + Task Monitor topology, including
    both the scheduled task-monitor branch and callback/webhook branch.
-   Telemetry only where backed by real data.
-   Preserve WF-01 through WF-06.
-   Do not invent last-run times, statuses, or metrics.
-   Do not change n8n workflows or the Supabase schema as part of this
    dashboard task.

### Priority 3 --- Optional n8n API connection

The audit identified optional direct n8n API integration for live
execution history and workflow controls.

Potential environment variables (names are placeholders until
implemented and confirmed by the project):

``` env
N8N_BASE_URL=https://mannam.app.n8n.cloud
N8N_API_KEY=your_n8n_api_key
```

Keep these server-side only. Do not expose the API key in browser code.
If the integration is not configured, the dashboard must show that live
n8n integration is unavailable rather than inventing execution
information.

------------------------------------------------------------------------

## 6. Dashboard Module Capabilities

The audited implementation reported these capabilities.

### Overview

-   Live counts from `prospects`, `outreach_events`, and
    `linkedin_accounts`.
-   24-hour activity curve.
-   Email vs LinkedIn activity breakdown.
-   Queue widgets for leads awaiting next touch and currently
    processing.
-   LinkedIn account health summary.
-   Date range filtering.

### Leads and Lead Profiles

-   Search, pagination, status filtering, step filtering, country
    search, and sorting.
-   CSV import with duplicate and suppression checks.
-   Lead create/edit and detail view.
-   GetSales identifiers and integration status on lead profile.
-   Chronological activity timeline from `outreach_events`.
-   Sequence stepper and personalization JSON viewer.

### Activity Logs

-   Events from `outreach_events`.
-   Filters for channel, step, action, date, and message text.
-   Full message and response payload inspector.
-   CSV export.

### Campaigns

-   Current continuous-flow/cohort model, grouped by outreach progress.
-   Conversion funnel based on actual outreach events.
-   Pause/resume controls where the connected control path exists.
-   A separate campaigns table is optional and has not been assumed.

### LinkedIn Accounts

-   Account cards and fleet table.
-   Daily/weekly quota progress.
-   Health state and restriction controls.
-   GetSales account metadata visibility implemented under Priority 1.

### Suppression List

-   Search, add, remove with confirmation, import, and export.
-   Duplicate/suppression checks in lead import and forms.

### Settings

-   Scheduling hours and delays.
-   Timezone.
-   LinkedIn limits.
-   JSONB deep-merge behavior to preserve unknown configuration keys.
-   Queue/lock information and stale-lock maintenance.

### Notifications

-   LinkedIn restriction warnings.
-   Stalled worker locks.
-   Inbound replies requiring attention.
-   Workflow failures with n8n execution links.

### Automation

-   Workflow registry and visual canvas.
-   Workflow status/telemetry only when actual data is available.
-   `automation_errors` incident feed.
-   n8n webhook ingestion bridge.
-   Queue/lock telemetry and stale-lock maintenance.

------------------------------------------------------------------------

## 7. Important Business Logic and Operational Rules

1.  **A reply stops the sequence.** Once a prospect is marked `replied`,
    `next_send_at` is cleared.
2.  **Suppression is global.** A suppressed email or LinkedIn profile
    must not be contacted.
3.  **The scheduler claims prospects atomically.** Use the Supabase RPC
    and its row-locking behavior; do not replace it with a simple
    unprotected select/update sequence.
4.  **`current_step` is the last completed step.** The next step is
    `current_step + 1`.
5.  **GetSales enrollment is asynchronous.** A successful enrollment API
    response does not mean the connection request or message has already
    been sent.
6.  **Pending actions must not be resubmitted.** WF-02 excludes pending
    GetSales action states.
7.  **Only confirmed success advances the sequence.** Update progress
    after a success callback or verified task outcome.
8.  **Failed LinkedIn connection requests may route to email fallback.**
    Preserve the existing routing logic.
9.  **Health guardrails must be respected.** WF-04 checks LinkedIn
    account health before attempting LinkedIn actions.
10. **Errors are centrally logged.** WF-07 stores the failure in
    `automation_errors` and sends a Telegram alert.
11. **Stale locks are recoverable.** WF-02 uses a 30-minute stale-lock
    threshold.
12. **No fabricated metrics.** Missing GetSales metrics are unknown, not
    automatically actual zero values.
13. **Preserve configuration.** When editing `outreach_config`, retain
    unknown JSONB properties.
14. **Keep credentials private.** Secrets belong in n8n credentials or
    server-side environment variables.

------------------------------------------------------------------------

## 8. Configuration and Credentials

Configure credentials in the appropriate secure credential store. The
following are names/placeholders only; actual values must be supplied by
the project owner.

### n8n credentials

-   Supabase connection / API credentials.
-   GetSales Bearer API token.
-   Gmail OAuth2 credential.
-   Telegram Bot credential.
-   Header Auth secret for the WF-08 callback webhook.
-   Clay webhook/API access as configured in the lead ingestion flow.

### Dashboard environment variables

Use the exact variable names expected by the existing Next.js project.
Common server-side names may include:

``` env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=server_only_service_role_key

N8N_BASE_URL=https://mannam.app.n8n.cloud
N8N_API_KEY=server_only_n8n_api_key
```

Important:

-   Never commit `.env.local`.
-   Never expose `SUPABASE_SERVICE_ROLE_KEY` or `N8N_API_KEY` through
    `NEXT_PUBLIC_*` variables.
-   Use Supabase Auth and RLS for protected dashboard access.
-   Validate permissions in server actions and API routes.
-   Secure webhook endpoints with secrets.
-   Do not paste real credentials into documentation, Git commits,
    prompts, or screenshots.

------------------------------------------------------------------------

## 9. Testing and Verification Checklist

### n8n

-   [x] WF-01 lead ingestion completed and tested.
-   [x] WF-02 scheduler completed and tested.
-   [x] WF-03 GetSales account fetch and one-account sync tested.
-   [ ] WF-03 multiple-account sync and duplicate/unlinked-account
    reconciliation verified.
-   [ ] WF-03 unknown acceptance-rate behavior deliberately resolved.
-   [ ] WF-04 connection request path tested end-to-end.
-   [ ] WF-04 accepted connection and message path tested end-to-end.
-   [ ] WF-04 email fallback tested after LinkedIn request failure.
-   [ ] WF-04 duplicate-send prevention and all sequence steps
    regression-tested.
-   [x] WF-05 Gmail and LinkedIn reply branches tested.
-   [ ] WF-05 production webhook URL and activation verified.
-   [x] WF-06 daily report tested in Telegram.
-   [x] WF-07 Supabase incident creation and Telegram alert tested.
-   [ ] WF-08 real GetSales task outcomes verified.
-   [ ] WF-08 callback outcomes verified for message sent, connection
    accepted, and not accepted/failed.
-   [ ] WF-08 task-type mapping and duplicate event protection verified.

### Dashboard

-   [x] Initial Next.js build and TypeScript audit passed.
-   [x] Priority 1 GetSales account visibility implemented.
-   [x] Priority 1 build passed with zero errors and warnings, as
    reported by Antigravity.
-   [ ] Priority 2 WF-07/WF-08 registration completed.
-   [ ] Priority 2 build and route verification completed.
-   [ ] Confirm Supabase Auth, RLS, and server-side secret handling
    before production use.
-   [ ] Confirm no dashboard action appears enabled unless a real
    handler/webhook exists.
-   [ ] Verify all dashboard metrics against the underlying Supabase
    records.

Only mark a checklist item complete after a real test or inspection
confirms it.

------------------------------------------------------------------------

## 10. Current Known Follow-up Work

Recommended order:

1.  Finish Priority 2: register WF-07 and WF-08 in the Automation
    Center.
2.  Review Antigravity's report and verify the updated workflow registry
    and canvas.
3.  Verify WF-03 with multiple GetSales accounts and resolve unknown
    acceptance-rate handling intentionally.
4.  Finish WF-04 end-to-end sequence tests.
5.  Verify WF-05 production webhook activation.
6.  Verify WF-08 callbacks and task monitor against real GetSales
    outcomes.
7.  Review authentication, RLS, and credential security.
8.  Consider direct n8n API telemetry only if live execution history or
    workflow controls are required.

Do not rebuild the dashboard. Extend the existing codebase and preserve
completed modules.

------------------------------------------------------------------------

## 11. Working Style for Future Changes

-   Make small, controlled changes.
-   Prefer a few nodes or files per implementation step rather than a
    large unverified rebuild.
-   When building n8n, configure and test one node or a small group at a
    time.
-   Do not add unnecessary nodes.
-   For every new n8n node, document its purpose and full configuration.
-   Preserve existing working branches and business logic.
-   Ask for actual node output when behavior is uncertain.
-   Never claim a workflow or feature passed without test evidence.
-   For Antigravity, instruct it to inspect the existing code and modify
    only the requested scope.
-   Run `npm run build` after dashboard changes.
-   Keep this README updated when workflow topology, schema, endpoints,
    or implementation status changes.

------------------------------------------------------------------------

## 12. Project Completion Definition

The assignment is considered operationally complete when:

-   All eight n8n workflows have passed their relevant end-to-end tests.
-   Lead state, outreach events, replies, account health, and errors are
    consistently stored in Supabase.
-   GetSales asynchronous actions are reconciled correctly without
    duplicate sends or premature sequence advancement.
-   The dashboard accurately displays the real operational data.
-   WF-07 and WF-08 appear in the Automation Center with truthful
    telemetry.
-   Authentication, RLS, webhook security, and server-side credential
    handling are verified.
-   No production-facing control is presented as functional unless it is
    connected to a real supported action.

**Source of truth:** The live n8n workflows, Supabase schema/data, and
current dashboard code. This README is a project handover document and
should be updated when those systems change.
