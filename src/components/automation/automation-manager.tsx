"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Zap, 
  Check, 
  Copy, 
  LayoutGrid, 
  GitBranch, 
  AlertTriangle,
  Lock,
  Unlock,
  RefreshCw,
  ShieldAlert,
  Archive,
  Globe,
  FileText,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WorkflowCard } from "@/components/automation/workflow-card";
import { WorkflowCanvas } from "@/components/workflow/workflow-canvas";
import { AutomationIncidentsFeed } from "@/components/automation/automation-incidents-feed";
import { PixtexBrowserModal } from "@/components/workflow/pixtex-browser-modal";
import { WorkflowTelemetry } from "@/lib/actions/automation";
import { AutomationError, QueueHealthStats } from "@/lib/types";
import { releaseStaleLocksAction } from "@/lib/actions/automation-errors";
import { downloadWorkflowsZip } from "@/lib/n8n/zip-helper";
import { PRESET_WORKFLOWS } from "@/lib/n8n/workflows-data";
import { cn } from "@/lib/utils";

interface AutomationManagerProps {
  workflows: WorkflowTelemetry[];
  errors: AutomationError[];
  openErrorCount: number;
  queueStats: QueueHealthStats;
}

export function AutomationManager({ 
  workflows,
  errors,
  openErrorCount,
  queueStats: initialQueueStats
}: AutomationManagerProps) {
  const [viewMode, setViewMode] = React.useState<"cards" | "canvas" | "incidents">("cards");
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState<string>("WF-01");
  const [copiedGeneralWebhook, setCopiedGeneralWebhook] = React.useState(false);
  const [queueStats, setQueueStats] = React.useState<QueueHealthStats>(initialQueueStats);
  const [isReleasingLocks, setIsReleasingLocks] = React.useState(false);
  const [releaseConfirmOpen, setReleaseConfirmOpen] = React.useState(false);
  const [releaseFeedback, setReleaseFeedback] = React.useState<string | null>(null);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);
  const [isPixtexBrowserOpen, setIsPixtexBrowserOpen] = React.useState(false);

  // Load view mode preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("outreachos-automation-view-mode") as "cards" | "canvas" | "incidents" | null;
    if (saved === "cards" || saved === "canvas" || saved === "incidents") {
      setViewMode(saved);
    }
  }, []);

  const handleViewModeChange = (mode: "cards" | "canvas" | "incidents") => {
    setViewMode(mode);
    localStorage.setItem("outreachos-automation-view-mode", mode);
  };

  const handleInspectCanvas = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    handleViewModeChange("canvas");
  };

  const handleCopyGeneralWebhook = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    navigator.clipboard.writeText(`${origin}/api/webhooks/n8n`);
    setCopiedGeneralWebhook(true);
    setTimeout(() => setCopiedGeneralWebhook(false), 2000);
  };

  const handleDownloadAllZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadWorkflowsZip();
    } catch (err) {
      console.error("Failed to download ZIP:", err);
      alert("Failed to generate zip file. Please try again.");
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const handleReleaseStaleLocks = async () => {
    setIsReleasingLocks(true);
    try {
      const res = await releaseStaleLocksAction();
      setReleaseFeedback(res.message);
      if (res.success) {
        setQueueStats((prev) => ({
          ...prev,
          lockedCount: Math.max(0, prev.lockedCount - res.releasedCount),
          staleCount: 0,
        }));
      }
      setTimeout(() => setReleaseFeedback(null), 4000);
    } catch (err) {
      console.error("Failed to release stale locks:", err);
      setReleaseFeedback("Failed to release locks. Please check database permissions.");
    } finally {
      setIsReleasingLocks(false);
    }
  };

  const activeWorkflowDef = React.useMemo(() => {
    return PRESET_WORKFLOWS.find((w) => w.id === selectedWorkflowId) || PRESET_WORKFLOWS[0];
  }, [selectedWorkflowId]);

  const healthyCount = workflows.filter((w) => w.status === "healthy").length;

  return (
    <div className="space-y-5 w-full pb-12">
      {/* Top Header & View Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/80 pb-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Automation Workflows
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 tabular-nums">
              {healthyCount} of {workflows.length} Operational
            </span>
            {openErrorCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 tabular-nums animate-pulse">
                {openErrorCount} Incident{openErrorCount === 1 ? "" : "s"} Open
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Operational status, live telemetry, and visual n8n workflow canvas for all 8 pipelines.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* View Mode Switcher: Cards vs Canvas vs Incidents */}
          <div className="flex items-center border border-border/80 rounded-lg p-0.5 bg-muted/30">
            <button
              type="button"
              onClick={() => handleViewModeChange("cards")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "cards"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Overview Cards View"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewModeChange("canvas")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "canvas"
                  ? "bg-background text-foreground shadow-xs font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Interactive n8n Node Canvas"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>n8n Canvas</span>
            </button>

            <button
              type="button"
              onClick={() => handleViewModeChange("incidents")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer",
                viewMode === "incidents"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Automation Incident Log"
            >
              <AlertTriangle className={cn("h-3.5 w-3.5", openErrorCount > 0 ? "text-rose-500" : "text-muted-foreground")} />
              <span>Incidents</span>
              <span className={cn(
                "text-[9px] font-mono px-1.5 py-0.2 rounded-full tabular-nums font-bold",
                openErrorCount > 0
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-muted text-muted-foreground"
              )}>
                {openErrorCount}
              </span>
            </button>
          </div>

          {/* Workflow Visualizer Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPixtexBrowserOpen(true)}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/80 hover:bg-muted text-primary"
            title="Open in-dashboard workflow visualizer"
          >
            <Globe className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Visualizer</span>
          </Button>

          {/* Download All as ZIP */}
          <Button
            variant="default"
            size="sm"
            onClick={handleDownloadAllZip}
            disabled={isDownloadingZip}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg shadow-xs"
            title="Download all 8 workflows and assignment requirements as a ZIP archive"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>{isDownloadingZip ? "Zipping..." : "Download as ZIP"}</span>
          </Button>

          {/* Copy Inbound Webhook */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyGeneralWebhook}
            className="h-8 text-xs font-semibold gap-1.5 rounded-lg border-border/80 hover:bg-muted"
          >
            {copiedGeneralWebhook ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            <span className="hidden xl:inline">
              {copiedGeneralWebhook ? "Webhook URL Copied" : "Copy Webhook"}
            </span>
          </Button>
        </div>
      </div>

      {/* Assignment Requirements Spec Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="font-bold text-foreground block">
              Multi-Channel Outreach Automation Specification (LinkedIn + Email)
            </span>
            <span className="text-[11px] text-muted-foreground">
              All 8 production n8n workflows implement the Clay &rarr; n8n &rarr; GetSales.io 5-step sequence with LinkedIn health failover.
            </span>
          </div>
        </div>

        <Link
          href="/assignment"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <span>View Assignment Spec</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Queue & Worker Health Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/80 text-xs shadow-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Active Queue:
            </span>
            <span className="font-bold text-foreground tabular-nums">
              {queueStats.totalActiveCount} Leads
            </span>
          </div>

          <div className="h-3.5 w-px bg-border/80 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Worker Locks:
            </span>
            <span className="font-bold text-foreground tabular-nums flex items-center gap-1">
              <Lock className="h-3 w-3 text-amber-500" />
              {queueStats.lockedCount} Active
            </span>
          </div>

          <div className="h-3.5 w-px bg-border/80 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Stale Locks (&gt;15m):
            </span>
            <span className={cn(
              "font-bold tabular-nums",
              queueStats.staleCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
            )}>
              {queueStats.staleCount}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {releaseFeedback && (
            <span className="text-[11px] text-muted-foreground animate-in fade-in duration-150">
              {releaseFeedback}
            </span>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setReleaseConfirmOpen(true)}
            className="h-7 text-[11px] font-medium gap-1 text-muted-foreground hover:text-foreground border border-border/60 hover:bg-muted"
            title="Release prospect locks stuck in processing"
          >
            <Unlock className="h-3 w-3 text-amber-500" />
            <span>Release Stale Locks</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area based on View Mode */}
      {viewMode === "incidents" ? (
        <AutomationIncidentsFeed initialErrors={errors} openCount={openErrorCount} />
      ) : viewMode === "canvas" ? (
        <div className="space-y-3">
          <WorkflowCanvas initialWorkflowId={selectedWorkflowId} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {workflows.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onInspectCanvas={handleInspectCanvas}
            />
          ))}
        </div>
      )}

      {/* In-Dashboard Pixtex Browser Modal */}
      <PixtexBrowserModal
        open={isPixtexBrowserOpen}
        onOpenChange={setIsPixtexBrowserOpen}
        workflow={activeWorkflowDef}
      />

      {/* Confirm Dialog for Releasing Stale Locks */}
      <ConfirmDialog
        open={releaseConfirmOpen}
        onOpenChange={setReleaseConfirmOpen}
        title="Release Stale Prospect Locks"
        description="This will execute the PostgreSQL release_stale_prospect_locks procedure to reset any leads stuck with 'processing = true' back to active, allowing your workers to claim them again."
        confirmLabel="Release Locks"
        variant="warning"
        onConfirm={handleReleaseStaleLocks}
        loading={isReleasingLocks}
      />
    </div>
  );
}
