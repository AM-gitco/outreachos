export const APP_NAME = "OutreachOS";
export const APP_DESCRIPTION = "Multi-Channel Outreach Operations Platform";

export const NAVIGATION_ITEMS = [
  {
    title: "Overview",
    href: "/",
    iconName: "LayoutDashboard",
    description: "System pulse, key metrics, and daily activity",
  },
  {
    title: "Leads",
    href: "/leads",
    iconName: "Users",
    description: "Prospects management, outreach tracking & status",
  },
  {
    title: "Campaigns",
    href: "/campaigns",
    iconName: "Target",
    description: "Outreach flow overview and lead volume",
  },
  {
    title: "Activity Logs",
    href: "/activity",
    iconName: "Activity",
    description: "Live history of emails, LinkedIn touches & replies",
  },
  {
    title: "LinkedIn Accounts",
    href: "/linkedin",
    iconName: "Linkedin",
    description: "Account health monitor, limits & active restrictions",
  },
  {
    title: "Suppression List",
    href: "/suppression",
    iconName: "ShieldAlert",
    description: "Do-not-contact registry and exclusion management",
  },
  {
    title: "Automation",
    href: "/automation",
    iconName: "Zap",
    description: "n8n workflow controllers and execution telemetry",
  },
  {
    title: "Assignment Spec",
    href: "/assignment",
    iconName: "FileText",
    description: "Multi-channel automation requirements & architecture",
  },
  {
    title: "Notifications",
    href: "/notifications",
    iconName: "Bell",
    description: "System alerts, health changes & manual interventions",
  },
  {
    title: "Settings",
    href: "/settings",
    iconName: "Settings",
    description: "Scheduling windows, daily limits & operational config",
  },
] as const;

// Friendly translations for non-technical users
export const DB_LABELS: Record<string, string> = {
  current_step: "Outreach Progress",
  next_send_at: "Next Scheduled Contact",
  processing: "Currently Processing",
  health_state: "Account Health",
  suppression_list: "Do Not Contact List",
  outreach_events: "Activity History",
  sent_today: "Sent Today",
  sent_this_week: "Sent This Week",
  pending_invites: "Pending Invitations",
  acceptance_rate: "Acceptance Rate",
  restriction_detected: "Restriction Alert",
  linkedin_connected: "LinkedIn Connected",
  personalization: "Personalization Notes",
  outreach_config: "Outreach Settings",
};

export const STEP_LABELS: Record<number, string> = {
  1: "Step 1: Initial Touch",
  2: "Step 2: Follow-up 1",
  3: "Step 3: Value Offer",
  4: "Step 4: Check-in",
  5: "Step 5: Final Breakup",
};
