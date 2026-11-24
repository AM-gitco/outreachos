"use client";

import * as React from "react";
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check,
  Eye,
  Globe,
  Download,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { WorkflowTelemetry, triggerWorkflowPing } from "@/lib/actions/automation";
import { PixtexBrowserModal } from "@/components/workflow/pixtex-browser-modal";
import { PRESET_WORKFLOWS } from "@/lib/n8n/workflows-data";
import { cn } from "@/lib/utils";

interface WorkflowCardProps {
  workflow: WorkflowTelemetry;
  onInspectCanvas?: (workflowId: string) => void;
}

export function WorkflowCard({ workflow, onInspectCanvas }: WorkflowCardProps) {
  const [isTriggerConfirmOpen, setIsTriggerConfirmOpen] = React.useState(false);
  const [isTriggering, setIsTriggering] = React.useState(false);
  const [triggerResult, setTriggerResult] = React.useState<string | null>(null);
  const [isPixtexOpen, setIsPixtexOpen] = React.useState(false);

  const isWarning = workflow.status === "warning";

  const workflowDef = React.useMemo(() => {
    return PRESET_WORKFLOWS.find((w) => w.id === workflow.id) || PRESET_WORKFLOWS[0];
  }, [workflow.id]);

  const handleExecuteTrigger = async () => {
    setIsTriggering(true);
    try {
      const res = await triggerWorkflowPing(workflow.id);
      setTriggerResult(res.message);
      setIsTriggerConfirmOpen(false);
      setTimeout(() => setTriggerResult(null), 3000);
    } catch (err) {
      console.error("Failed to trigger workflow:", err);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleDownloadJson = () => {
    const raw = workflowDef.rawJson || JSON.stringify(workflowDef, null, 2);
    const blob = new Blob([raw], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${workflow.id}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-border/80 rounded-xl bg-card p-4 space-y-3 shadow-xs flex flex-col justify-between">
      <div className="space-y-2.5">
        {/* Header: ID, Title, Status */}
        <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                {workflow.id}
              </span>
              <h3 className="text-xs font-bold text-foreground">
                {workflow.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                {workflow.category}
              </span>
              {workflowDef && (
                <span className="text-[10px] font-mono text-muted-foreground/80">
                  · {workflowDef.nodes.length} nodes
                </span>
              )}
            </div>
          </div>

          <div>
            {isWarning ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                <AlertTriangle className="h-2.5 w-2.5" />
                Alert
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-2.5 w-2.5" />
                Active
              </span>
            )}
          </div>
        </div>

        {/* Short Description */}
        <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
          {workflow.description}
        </p>

        {/* 2-Metric Ribbon */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-muted/20 p-2.5 rounded-lg border border-border/50">
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block truncate">
              {workflow.metricLabel}
            </span>
            <p className="font-bold text-foreground tabular-nums text-xs mt-0.5 truncate">
              {workflow.metricValue}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground block truncate">
              Last Active
            </span>
            <p className="text-muted-foreground text-[10px] tabular-nums mt-0.5 flex items-center gap-1 truncate">
              <Clock className="h-2.5 w-2.5 opacity-60 shrink-0" />
              {workflow.lastRunAt
                ? new Date(workflow.lastRunAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })
                : "Idle"}
            </p>
          </div>
        </div>
      </div>

      {triggerResult && (
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <Check className="h-3 w-3 shrink-0" />
          <span>Ping acknowledged</span>
        </div>
      )}

      {/* Action Footer: Inspect Nodes + Pixtex + Download JSON + Test Trigger */}
      <div className="pt-2 border-t border-border/50 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1">
          {onInspectCanvas && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onInspectCanvas(workflow.id)}
              className="h-7 text-xs font-semibold gap-1 text-primary hover:text-primary hover:bg-primary/10 rounded-lg px-2"
              title="Open interactive n8n node canvas for this workflow"
            >
              <Eye className="h-3 w-3" />
              <span>Canvas</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPixtexOpen(true)}
            className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground rounded-lg px-2"
            title="Open in-dashboard workflow visualizer"
          >
            <Globe className="h-3 w-3 text-sky-500" />
            <span className="hidden sm:inline">Visualizer</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadJson}
            className="h-7 text-xs font-medium gap-1 text-muted-foreground hover:text-foreground rounded-lg px-2"
            title="Download workflow JSON file"
          >
            <Download className="h-3 w-3" />
            <span className="hidden sm:inline">JSON</span>
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsTriggerConfirmOpen(true)}
          className="h-7 text-xs font-semibold gap-1 rounded-lg border-border/80 hover:bg-muted ml-auto"
        >
          <Play className="h-2.5 w-2.5" />
          <span>Ping</span>
        </Button>
      </div>

      {/* In-Dashboard Pixtex Browser Modal */}
      <PixtexBrowserModal
        open={isPixtexOpen}
        onOpenChange={setIsPixtexOpen}
        workflow={workflowDef}
        onExportJson={handleDownloadJson}
      />

      {/* Confirm Manual Trigger Dialog */}
      <ConfirmDialog
        open={isTriggerConfirmOpen}
        onOpenChange={setIsTriggerConfirmOpen}
        title={`Trigger Test Ping to ${workflow.id}?`}
        description={`This will send an operational test ping to ${workflow.name} to verify webhook connectivity.`}
        confirmLabel="Send Ping"
        loading={isTriggering}
        onConfirm={handleExecuteTrigger}
      />
    </div>
  );
}
