"use client";

import * as React from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { 
  Clock, 
  Database, 
  Mail, 
  Code2, 
  GitBranch, 
  Send, 
  Zap, 
  Check,
  AlertTriangle,
  Globe,
  Layers,
  ArrowRightCircle,
  ShieldCheck,
  Bot
} from "lucide-react";
import { LinkedinIcon } from "@/components/icons/linkedin";
import { cn } from "@/lib/utils";
import { N8nNodeData } from "@/lib/n8n/workflows-data";

export function N8nNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as N8nNodeData;

  const getCategoryTheme = () => {
    const typeStr = (nodeData.type || "").toLowerCase();
    const serviceStr = (nodeData.service || "").toLowerCase();
    const nameStr = (nodeData.name || "").toLowerCase();

    // 1. Triggers
    if (nodeData.category === "trigger" || typeStr.includes("trigger") || typeStr.includes("webhook")) {
      if (typeStr.includes("error")) {
        return {
          borderClass: "border-l-4 border-l-rose-500",
          iconBg: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30",
          badge: "ERROR TRIGGER",
          badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
          icon: <AlertTriangle className="h-4 w-4" />,
        };
      }
      if (typeStr.includes("schedule") || typeStr.includes("cron")) {
        return {
          borderClass: "border-l-4 border-l-amber-500",
          iconBg: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30",
          badge: "SCHEDULE",
          badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          icon: <Clock className="h-4 w-4" />,
        };
      }
      return {
        borderClass: "border-l-4 border-l-[#ff6d5a]",
        iconBg: "bg-[#ff6d5a]/15 text-[#ff6d5a] border border-[#ff6d5a]/30",
        badge: "WEBHOOK",
        badgeClass: "bg-[#ff6d5a]/10 text-[#ff6d5a] border-[#ff6d5a]/20",
        icon: <Zap className="h-4 w-4 fill-current" />,
      };
    }

    // 2. Database (Supabase / Postgres)
    if (nodeData.category === "database" || typeStr.includes("supabase") || typeStr.includes("postgres")) {
      return {
        borderClass: "border-l-4 border-l-emerald-500",
        iconBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30",
        badge: "SUPABASE",
        badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        icon: <Database className="h-4 w-4" />,
      };
    }

    // 3. Channels (LinkedIn, Email, GetSales HTTP, Sub-workflow)
    if (nameStr.includes("linkedin") || serviceStr.includes("linkedin")) {
      return {
        borderClass: "border-l-4 border-l-[#0a66c2]",
        iconBg: "bg-[#0a66c2]/15 text-[#0a66c2] dark:text-[#388be8] border border-[#0a66c2]/30",
        badge: "LINKEDIN",
        badgeClass: "bg-[#0a66c2]/10 text-[#0a66c2] dark:text-[#388be8] border-[#0a66c2]/20",
        icon: <LinkedinIcon className="h-4 w-4" />,
      };
    }

    if (nameStr.includes("getsales") || serviceStr.includes("getsales")) {
      return {
        borderClass: "border-l-4 border-l-indigo-500",
        iconBg: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30",
        badge: "GETSALES",
        badgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        icon: <Bot className="h-4 w-4" />,
      };
    }

    if (nameStr.includes("email") || serviceStr.includes("email") || typeStr.includes("email")) {
      return {
        borderClass: "border-l-4 border-l-sky-500",
        iconBg: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30",
        badge: "EMAIL",
        badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
        icon: <Mail className="h-4 w-4" />,
      };
    }

    if (typeStr.includes("executeworkflow")) {
      return {
        borderClass: "border-l-4 border-l-violet-500",
        iconBg: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border border-violet-500/30",
        badge: "SUB-WORKFLOW",
        badgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
        icon: <ArrowRightCircle className="h-4 w-4" />,
      };
    }

    if (nodeData.category === "channel" || typeStr.includes("httprequest")) {
      return {
        borderClass: "border-l-4 border-l-blue-500",
        iconBg: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30",
        badge: "HTTP API",
        badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        icon: <Globe className="h-4 w-4" />,
      };
    }

    // 4. Alerts (Telegram)
    if (nodeData.category === "alert" || typeStr.includes("telegram")) {
      return {
        borderClass: "border-l-4 border-l-[#0088cc]",
        iconBg: "bg-[#0088cc]/15 text-[#0088cc] dark:text-[#33a5e0] border border-[#0088cc]/30",
        badge: "TELEGRAM",
        badgeClass: "bg-[#0088cc]/10 text-[#0088cc] dark:text-[#33a5e0] border-[#0088cc]/20",
        icon: <Send className="h-4 w-4" />,
      };
    }

    // 5. Code / JavaScript
    if (nodeData.category === "code" || typeStr.includes("code") || typeStr.includes("function")) {
      return {
        borderClass: "border-l-4 border-l-teal-500",
        iconBg: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30",
        badge: "CODE (JS)",
        badgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        icon: <Code2 className="h-4 w-4" />,
      };
    }

    // 6. Logic / If / Switch
    if (nodeData.category === "logic" || typeStr.includes(".if") || typeStr.includes("switch")) {
      return {
        borderClass: "border-l-4 border-l-purple-500",
        iconBg: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30",
        badge: "ROUTER",
        badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
        icon: <GitBranch className="h-4 w-4" />,
      };
    }

    // Default Fallback
    return {
      borderClass: "border-l-4 border-l-muted-foreground",
      iconBg: "bg-muted text-muted-foreground border border-border",
      badge: "NODE",
      badgeClass: "bg-muted text-muted-foreground border-border",
      icon: <Layers className="h-4 w-4" />,
    };
  };

  const theme = getCategoryTheme();
  const isLogicRouter = nodeData.category === "logic" || nodeData.type?.includes(".if") || nodeData.type?.includes("switch");
  const isRootTrigger = nodeData.category === "trigger" || nodeData.type?.toLowerCase().includes("trigger");

  return (
    <div
      className={cn(
        "relative rounded-xl bg-card border border-border/80 shadow-xs hover:shadow-md transition-all min-w-[220px] max-w-[280px] text-left select-none group",
        theme.borderClass,
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      {/* Target Handle (Input Port) - Not on root triggers */}
      {!isRootTrigger && (
        <Handle
          type="target"
          position={Position.Left}
          className="!h-3.5 !w-3.5 !rounded-full !bg-card !border-2 !border-primary hover:!scale-125 !transition-transform !-left-2 shadow-2xs"
          title="Input Port"
        />
      )}

      {/* Main Node Card Body */}
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2.5">
          {/* Left Service Icon Container */}
          <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center shrink-0 shadow-2xs", theme.iconBg)}>
            {theme.icon}
          </div>

          {/* Node Title & Service Name */}
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center justify-between gap-1">
              <span className="text-[10px] font-mono font-bold text-muted-foreground truncate" title={nodeData.service}>
                {nodeData.service || "n8n"}
              </span>

              {/* Status Indicator */}
              <span className="h-3.5 w-3.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0" title="Active in Pipeline">
                <Check className="h-2 w-2 stroke-[3]" />
              </span>
            </div>

            <h4 className="text-xs font-bold text-foreground truncate leading-snug" title={nodeData.name}>
              {nodeData.name}
            </h4>
          </div>
        </div>

        {/* Lower Operation Ribbon */}
        <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1 text-[10px]">
          <span className="text-muted-foreground font-mono truncate max-w-[170px]" title={nodeData.operation || nodeData.description}>
            {nodeData.operation || nodeData.description || "Active Node"}
          </span>

          <span className={cn(
            "text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border shrink-0",
            theme.badgeClass
          )}>
            {theme.badge}
          </span>
        </div>
      </div>

      {/* Source Output Handles on Right */}
      {isLogicRouter ? (
        <>
          {/* True / Match branch handle */}
          <Handle
            id="output-true"
            type="source"
            position={Position.Right}
            style={{ top: "35%" }}
            className="!h-3.5 !w-3.5 !rounded-full !bg-emerald-500 !border-2 !border-card hover:!scale-125 !transition-transform !-right-2 shadow-2xs"
            title="True / Match Branch"
          />
          {/* False / No Match branch handle */}
          <Handle
            id="output-false"
            type="source"
            position={Position.Right}
            style={{ top: "65%" }}
            className="!h-3.5 !w-3.5 !rounded-full !bg-rose-500 !border-2 !border-card hover:!scale-125 !transition-transform !-right-2 shadow-2xs"
            title="False / No Match Branch"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Right}
          className="!h-3.5 !w-3.5 !rounded-full !bg-primary !border-2 !border-card hover:!scale-125 !transition-transform !-right-2 shadow-2xs"
          title="Output Port"
        />
      )}
    </div>
  );
}
