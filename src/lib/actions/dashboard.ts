"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DailyActivityPoint {
  date: string;
  fullDate: string;
  email: number;
  linkedin: number;
  replies: number;
  total: number;
}

export interface ChannelPerformance {
  channel: string;
  actions: number;
  percentage: number;
}

export interface DashboardMetrics {
  totalLeads: number;
  activeLeads: number;
  completedLeads: number;
  repliedLeads: number;
  suppressedLeads: number;
  totalEmailsSent: number;
  totalLinkedinActions: number;
  totalReplies: number;
  replyRate: number;
  awaitingNextTouch: number;
  currentlyProcessing: number;
  dailyActivity: DailyActivityPoint[];
  channelPerformance: ChannelPerformance[];
  isHourlyView: boolean;
  linkedinAccounts: Array<{
    id: string;
    account_name: string;
    health_state: string;
    sent_today: number;
    sent_this_week: number;
    pending_invites: number;
    acceptance_rate: number | null;
    restriction_detected: boolean | null;
    updated_at: string;
  }>;
  recentActivity: Array<{
    id: string;
    step: number;
    channel: string;
    action: string;
    message: string | null;
    sent_at: string;
    prospect_id: string;
    prospect_name: string;
    prospect_company: string;
  }>;
  upcomingTouches: Array<{
    id: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    current_step: number;
    status: string;
    next_send_at: string | null;
  }>;
  systemAlerts: Array<{
    id: string;
    severity: "warning" | "destructive" | "info";
    title: string;
    message: string;
  }>;
}

export async function getLiveDashboardMetrics(dateRange?: {
  from?: string;
  to?: string;
}): Promise<DashboardMetrics> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  try {
    // 1. Query Prospects counts
    const { count: totalLeads } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true });

    const { count: activeLeads } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active");

    const { count: completedLeads } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("status", "completed");

    const { count: repliedLeads } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("status", "replied");

    const { count: currentlyProcessing } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("processing", true);

    const { count: awaitingNextTouch } = await supabase
      .from("prospects")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .not("next_send_at", "is", null);

    // 2. Query Suppression count
    const { count: suppressedLeads } = await supabase
      .from("suppression_list")
      .select("*", { count: "exact", head: true });

    // 3. Query Outreach Events with optional date filtering
    let eventsQuery = supabase
      .from("outreach_events")
      .select("id, step, channel, action, message, message_id, sent_at, prospect_id, response")
      .order("sent_at", { ascending: true });

    if (dateRange?.from) {
      eventsQuery = eventsQuery.gte("sent_at", dateRange.from);
    }
    if (dateRange?.to) {
      eventsQuery = eventsQuery.lte("sent_at", dateRange.to);
    }

    const { data: events } = await eventsQuery;
    const allEvents = events || [];

    // Aggregate counts
    let totalEmailsSent = 0;
    let totalLinkedinActions = 0;
    let totalReplies = 0;

    allEvents.forEach((evt) => {
      const isEmail = evt.channel?.toLowerCase() === "email";
      const isLinkedin = evt.channel?.toLowerCase() === "linkedin";
      const isReply =
        evt.action?.toLowerCase() === "reply_received" ||
        evt.action?.toLowerCase().includes("reply") ||
        (evt.response && Object.keys(evt.response).length > 0);

      if (isReply) {
        totalReplies++;
      } else if (isEmail) {
        totalEmailsSent++;
      } else if (isLinkedin) {
        totalLinkedinActions++;
      }
    });

    // Check if the filtered range represents a single day or "today"
    let isSingleDay = false;
    if (dateRange?.from && dateRange?.to) {
      const fromTime = new Date(dateRange.from).getTime();
      const toTime = new Date(dateRange.to).getTime();
      const diffHours = (toTime - fromTime) / (1000 * 60 * 60);
      if (diffHours <= 26) {
        isSingleDay = true;
      }
    }

    let dailyActivity: DailyActivityPoint[] = [];

    if (isSingleDay) {
      // HOURLY VIEW FOR TODAY / SINGLE DAY:
      // Generate 8 intervals across the 24 hours: 00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00
      const hourlyBuckets = [
        { hour: 0, label: "12 AM" },
        { hour: 3, label: "3 AM" },
        { hour: 6, label: "6 AM" },
        { hour: 9, label: "9 AM" },
        { hour: 12, label: "12 PM" },
        { hour: 15, label: "3 PM" },
        { hour: 18, label: "6 PM" },
        { hour: 21, label: "9 PM" },
      ];

      const bucketCounts = hourlyBuckets.map((b) => ({
        date: b.label,
        fullDate: `${b.label}`,
        email: 0,
        linkedin: 0,
        replies: 0,
        total: 0,
      }));

      allEvents.forEach((evt) => {
        const d = new Date(evt.sent_at);
        const h = d.getUTCHours(); // or local hours
        // find nearest 3-hour bucket
        const bucketIndex = Math.min(Math.floor(h / 3), 7);

        const isEmail = evt.channel?.toLowerCase() === "email";
        const isLinkedin = evt.channel?.toLowerCase() === "linkedin";
        const isReply =
          evt.action?.toLowerCase() === "reply_received" ||
          evt.action?.toLowerCase().includes("reply") ||
          (evt.response && Object.keys(evt.response).length > 0);

        if (isReply) {
          bucketCounts[bucketIndex].replies++;
        } else if (isEmail) {
          bucketCounts[bucketIndex].email++;
        } else if (isLinkedin) {
          bucketCounts[bucketIndex].linkedin++;
        }
        bucketCounts[bucketIndex].total++;
      });

      dailyActivity = bucketCounts;
    } else {
      // MULTI-DAY VIEW: Group by calendar day
      const dayMap = new Map<string, { email: number; linkedin: number; replies: number; total: number }>();

      allEvents.forEach((evt) => {
        const isEmail = evt.channel?.toLowerCase() === "email";
        const isLinkedin = evt.channel?.toLowerCase() === "linkedin";
        const isReply =
          evt.action?.toLowerCase() === "reply_received" ||
          evt.action?.toLowerCase().includes("reply") ||
          (evt.response && Object.keys(evt.response).length > 0);

        const dateKey = evt.sent_at.slice(0, 10);
        const curr = dayMap.get(dateKey) || { email: 0, linkedin: 0, replies: 0, total: 0 };

        if (isReply) {
          curr.replies++;
        } else if (isEmail) {
          curr.email++;
        } else if (isLinkedin) {
          curr.linkedin++;
        }
        curr.total++;
        dayMap.set(dateKey, curr);
      });

      // If we have events, populate a continuous timeline of dates
      const entries = Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b));

      if (entries.length === 1) {
        // If there's only 1 calendar day of events in the whole DB, provide context dates before and after
        const singleDate = new Date(entries[0][0] + "T00:00:00Z");
        const prevDate = new Date(singleDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const nextDate = new Date(singleDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

        dailyActivity = [
          { date: fmt(prevDate), fullDate: prevDate.toISOString().slice(0, 10), email: 0, linkedin: 0, replies: 0, total: 0 },
          { date: fmt(singleDate), fullDate: entries[0][0], email: entries[0][1].email, linkedin: entries[0][1].linkedin, replies: entries[0][1].replies, total: entries[0][1].total },
          { date: fmt(nextDate), fullDate: nextDate.toISOString().slice(0, 10), email: 0, linkedin: 0, replies: 0, total: 0 },
        ];
      } else {
        dailyActivity = entries.map(([dateStr, vals]) => {
          const d = new Date(dateStr + "T00:00:00Z");
          const formatted = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          return {
            date: formatted,
            fullDate: dateStr,
            email: vals.email,
            linkedin: vals.linkedin,
            replies: vals.replies,
            total: vals.total,
          };
        });
      }
    }

    // Channel comparison
    const totalActions = totalEmailsSent + totalLinkedinActions;
    const channelPerformance: ChannelPerformance[] = [
      {
        channel: "Email",
        actions: totalEmailsSent,
        percentage: totalActions > 0 ? Math.round((totalEmailsSent / totalActions) * 100) : 0,
      },
      {
        channel: "LinkedIn",
        actions: totalLinkedinActions,
        percentage: totalActions > 0 ? Math.round((totalLinkedinActions / totalActions) * 100) : 0,
      },
    ];

    // Reply rate
    const calculatedReplyRate =
      totalActions > 0
        ? Math.round((totalReplies / totalActions) * 100)
        : repliedLeads
        ? Math.round(((repliedLeads ?? 0) / (totalLeads || 1)) * 100)
        : 0;

    // 4. Query LinkedIn Accounts
    const { data: accounts } = await supabase
      .from("linkedin_accounts")
      .select("*");

    // 5. Query Prospects map for naming recent events
    const { data: prospectsList } = await supabase
      .from("prospects")
      .select("id, first_name, last_name, company, current_step, status, next_send_at")
      .limit(50);

    const prospectMap = new Map<string, { name: string; company: string }>();
    prospectsList?.forEach((p) => {
      const name = [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unnamed Prospect";
      prospectMap.set(p.id, { name, company: p.company || "No Company" });
    });

    // Build recent activity (descending by sent_at)
    const recentActivity = [...allEvents]
      .reverse()
      .slice(0, 8)
      .map((evt) => {
        const pInfo = prospectMap.get(evt.prospect_id) || {
          name: "Prospect #" + evt.prospect_id.slice(0, 6),
          company: "Unknown",
        };
        return {
          id: evt.id,
          step: evt.step,
          channel: evt.channel,
          action: evt.action,
          message: evt.message,
          sent_at: evt.sent_at,
          prospect_id: evt.prospect_id,
          prospect_name: pInfo.name,
          prospect_company: pInfo.company,
        };
      });

    // Upcoming touches
    const upcomingTouches = (prospectsList || [])
      .filter((p) => p.status === "active")
      .slice(0, 5);

    // System alerts
    const systemAlerts: DashboardMetrics["systemAlerts"] = [];

    (accounts || []).forEach((acc) => {
      if (acc.restriction_detected) {
        systemAlerts.push({
          id: `rest-${acc.id}`,
          severity: "destructive",
          title: "LinkedIn Account Restricted",
          message: `Account "${acc.account_name}" has an active restriction detected. Automated sends are paused.`,
        });
      } else if (acc.health_state === "caution" || acc.health_state === "yellow") {
        systemAlerts.push({
          id: `warn-${acc.id}`,
          severity: "warning",
          title: "Account Health Warning",
          message: `Account "${acc.account_name}" health state is currently Caution. Acceptance rate: ${acc.acceptance_rate || 0}%.`,
        });
      }
    });

    if ((currentlyProcessing ?? 0) > 0) {
      systemAlerts.push({
        id: "proc-notice",
        severity: "info",
        title: "Active Automation Execution",
        message: `${currentlyProcessing} prospect(s) are currently being processed by n8n workflows.`,
      });
    }

    return {
      totalLeads: totalLeads ?? 0,
      activeLeads: activeLeads ?? 0,
      completedLeads: completedLeads ?? 0,
      repliedLeads: repliedLeads ?? 0,
      suppressedLeads: suppressedLeads ?? 0,
      totalEmailsSent,
      totalLinkedinActions,
      totalReplies,
      replyRate: calculatedReplyRate,
      awaitingNextTouch: awaitingNextTouch ?? 0,
      currentlyProcessing: currentlyProcessing ?? 0,
      dailyActivity,
      channelPerformance,
      isHourlyView: isSingleDay,
      linkedinAccounts: accounts || [],
      recentActivity,
      upcomingTouches,
      systemAlerts,
    };
  } catch (error) {
    console.error("Error calculating dashboard metrics:", error);
    return {
      totalLeads: 0,
      activeLeads: 0,
      completedLeads: 0,
      repliedLeads: 0,
      suppressedLeads: 0,
      totalEmailsSent: 0,
      totalLinkedinActions: 0,
      totalReplies: 0,
      replyRate: 0,
      awaitingNextTouch: 0,
      currentlyProcessing: 0,
      dailyActivity: [],
      channelPerformance: [],
      isHourlyView: false,
      linkedinAccounts: [],
      recentActivity: [],
      upcomingTouches: [],
      systemAlerts: [],
    };
  }
}
