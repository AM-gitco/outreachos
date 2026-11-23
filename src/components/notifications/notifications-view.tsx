"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Bell, 
  AlertTriangle, 
  ShieldAlert, 
  Info, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Shield,
  Layers,
  Activity,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SystemNotification } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

interface NotificationsViewProps {
  notifications: SystemNotification[];
}

export function NotificationsView({ notifications }: NotificationsViewProps) {
  const [filter, setFilter] = React.useState<"all" | "critical" | "warning" | "info">("all");

  const filtered = React.useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const criticalCount = notifications.filter((n) => n.type === "critical").length;
  const warningCount = notifications.filter((n) => n.type === "warning").length;
  const infoCount = notifications.filter((n) => n.type === "info").length;

  const getRelativeTime = (timestampStr: string) => {
    try {
      const date = new Date(timestampStr);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      const diffMin = Math.floor(diffSec / 60);
      const diffHour = Math.floor(diffMin / 60);
      const diffDays = Math.floor(diffHour / 24);

      if (diffSec < 60) return "Just now";
      if (diffMin < 60) return `${diffMin}m ago`;
      if (diffHour < 24) return `${diffHour}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const getCategoryMeta = (item: SystemNotification) => {
    if (item.type === "critical" || item.id.startsWith("restr-")) {
      return {
        label: "RESTRICTION ALERT",
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        borderClass: "border-l-4 border-l-rose-500 border-y-border/80 border-r-border/80",
        iconContainer: "bg-rose-500/10 text-rose-600 border border-rose-500/20",
        icon: <ShieldAlert className="h-4.5 w-4.5" />,
      };
    }
    if (item.type === "warning" || item.id.startsWith("stall-")) {
      return {
        label: "WORKER LOCK STALL",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        borderClass: "border-l-4 border-l-amber-500 border-y-border/80 border-r-border/80",
        iconContainer: "bg-amber-500/10 text-amber-600 border border-amber-500/20",
        icon: <AlertTriangle className="h-4.5 w-4.5" />,
      };
    }
    if (item.id.startsWith("reply-")) {
      return {
        label: "PROSPECT RESPONSE",
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        borderClass: "border-l-4 border-l-sky-500 border-y-border/80 border-r-border/80",
        iconContainer: "bg-sky-500/10 text-sky-600 border border-sky-500/20",
        icon: <MessageSquare className="h-4.5 w-4.5" />,
      };
    }
    return {
      label: "SYSTEM EVENT",
      badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      borderClass: "border-l-4 border-l-blue-500 border-y-border/80 border-r-border/80",
      iconContainer: "bg-blue-500/10 text-blue-600 border border-blue-500/20",
      icon: <Info className="h-4.5 w-4.5" />,
    };
  };

  return (
    <div className="space-y-6 w-full min-h-[calc(100vh-8rem)] flex flex-col pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Notifications & Alerts
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-secondary-foreground border border-border tabular-nums">
              {notifications.length} {notifications.length === 1 ? "alert" : "alerts"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live feed of LinkedIn restriction warnings, worker lock stalls, and prospect replies.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 text-xs shrink-0 flex-wrap">
          <Button
            variant={filter === "all" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-7.5 text-xs px-3 font-semibold rounded-lg"
          >
            All ({notifications.length})
          </Button>

          <Button
            variant={filter === "critical" ? "destructive" : "ghost"}
            size="sm"
            onClick={() => setFilter("critical")}
            className={cn(
              "h-7.5 text-xs px-3 gap-1.5 font-semibold rounded-lg",
              criticalCount > 0 && filter !== "critical" && "text-rose-600 hover:text-rose-700 bg-rose-500/10"
            )}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            Critical ({criticalCount})
          </Button>

          <Button
            variant={filter === "warning" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("warning")}
            className={cn(
              "h-7.5 text-xs px-3 gap-1.5 font-semibold rounded-lg",
              warningCount > 0 && filter !== "warning" && "text-amber-600 hover:text-amber-700 bg-amber-500/10"
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Warnings ({warningCount})
          </Button>

          <Button
            variant={filter === "info" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setFilter("info")}
            className="h-7.5 text-xs px-3 gap-1.5 font-semibold rounded-lg"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Replies & Info ({infoCount})
          </Button>
        </div>
      </div>

      {/* Alert Summary Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Total Alerts
            </span>
            <Bell className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">
            {notifications.length}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Across all monitored services
          </p>
        </div>

        <div className={cn(
          "p-3.5 rounded-xl bg-card border shadow-2xs space-y-1",
          criticalCount > 0 ? "border-rose-500/40 bg-rose-500/5" : "border-border/80"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Critical Actions
            </span>
            <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400 tabular-nums">
            {criticalCount}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {criticalCount > 0 ? "Account restrictions active" : "Zero account restrictions"}
          </p>
        </div>

        <div className={cn(
          "p-3.5 rounded-xl bg-card border shadow-2xs space-y-1",
          warningCount > 0 ? "border-amber-500/40 bg-amber-500/5" : "border-border/80"
        )}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Stalled Locks
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
            {warningCount}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {warningCount > 0 ? "Stalled > 30 mins in n8n" : "All worker locks healthy"}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-card border border-border/80 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              Recent Replies
            </span>
            <MessageSquare className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold text-foreground tabular-nums">
            {infoCount}
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Incoming prospect responses
          </p>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="space-y-3 flex-1">
        {filtered.length === 0 ? (
          <div className="border border-border/80 rounded-xl bg-card p-12 text-center text-xs text-muted-foreground flex-1 flex flex-col items-center justify-center space-y-3">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-sm font-bold text-foreground">All Systems Operational</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No active restriction warnings, stalled worker locks, or unresolved errors found. Outbound sending runs normally across all connected accounts.
              </p>
            </div>
          </div>
        ) : (
          filtered.map((item) => {
            const meta = getCategoryMeta(item);

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-xl bg-card p-4 space-y-3 text-xs shadow-xs transition-colors border",
                  meta.borderClass
                )}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn("p-2 rounded-lg shrink-0", meta.iconContainer)}>
                      {meta.icon}
                    </div>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={cn(
                          "text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border font-mono",
                          meta.badgeClass
                        )}>
                          {meta.label}
                        </span>
                        <h3 className="text-xs sm:text-sm font-bold text-foreground truncate">
                          {item.title}
                        </h3>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end gap-2 shrink-0">
                    <span className="text-[10px] font-semibold text-muted-foreground tabular-nums flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md border border-border/50">
                      <Clock className="h-3 w-3 opacity-60" />
                      {getRelativeTime(item.timestamp)}
                    </span>
                    <span className="text-[9px] text-muted-foreground/60 hidden sm:block tabular-nums">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {item.actionUrl && (
                  <div className="flex justify-end pt-2 border-t border-border/40">
                    <Link href={item.actionUrl}>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-7 text-xs font-semibold px-3 text-foreground gap-1.5 rounded-lg border-border/80 hover:bg-muted"
                      >
                        {item.actionLabel || "Inspect Target"}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
