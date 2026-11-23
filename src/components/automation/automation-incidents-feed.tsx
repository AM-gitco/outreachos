"use client";

import * as React from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Clock, 
  Send, 
  RefreshCw, 
  Check, 
  AlertCircle,
  FileCode2,
  Workflow
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomDropdown } from "@/components/ui/custom-dropdown";
import { AutomationError } from "@/lib/types";
import { updateAutomationErrorStatus, deleteAutomationError } from "@/lib/actions/automation-errors";
import { cn } from "@/lib/utils";

interface AutomationIncidentsFeedProps {
  initialErrors: AutomationError[];
  openCount: number;
}

export function AutomationIncidentsFeed({
  initialErrors,
  openCount: initialOpenCount,
}: AutomationIncidentsFeedProps) {
  const [errors, setErrors] = React.useState<AutomationError[]>(initialErrors);
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [resolvingId, setResolvingId] = React.useState<string | null>(null);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<{
    type: "resolve" | "delete";
    errorId: string;
    workflowName: string;
  } | null>(null);

  // Sync state if props change
  React.useEffect(() => {
    setErrors(initialErrors);
  }, [initialErrors]);

  const filteredErrors = React.useMemo(() => {
    if (statusFilter === "all") return errors;
    return errors.filter((e) => e.status === statusFilter);
  }, [errors, statusFilter]);

  const openCount = React.useMemo(() => {
    return errors.filter((e) => e.status === "open").length;
  }, [errors]);

  const handleOpenResolveDialog = (errorItem: AutomationError) => {
    setConfirmAction({
      type: "resolve",
      errorId: errorItem.id,
      workflowName: errorItem.workflow_name,
    });
    setConfirmDialogOpen(true);
  };

  const handleOpenDeleteDialog = (errorItem: AutomationError) => {
    setConfirmAction({
      type: "delete",
      errorId: errorItem.id,
      workflowName: errorItem.workflow_name,
    });
    setConfirmDialogOpen(true);
  };

  const handleExecuteConfirm = async () => {
    if (!confirmAction) return;
    setIsUpdating(true);

    try {
      if (confirmAction.type === "resolve") {
        const res = await updateAutomationErrorStatus(confirmAction.errorId, "resolved");
        if (res.success) {
          setErrors((prev) =>
            prev.map((e) =>
              e.id === confirmAction.errorId ? { ...e, status: "resolved" } : e
            )
          );
        }
      } else if (confirmAction.type === "delete") {
        const res = await deleteAutomationError(confirmAction.errorId);
        if (res.success) {
          setErrors((prev) => prev.filter((e) => e.id !== confirmAction.errorId));
        }
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setIsUpdating(false);
      setConfirmAction(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Subheader & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20 border border-border/80 rounded-xl p-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Automation Incident Log
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Failed executions, node exceptions, and alert dispatches recorded from n8n.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="w-36">
            <CustomDropdown
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: `All Status (${errors.length})` },
                { value: "open", label: `Open Issues (${openCount})` },
                { value: "resolved", label: "Resolved" },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Incidents Table / Card list */}
      {filteredErrors.length === 0 ? (
        <div className="border border-border/80 rounded-xl bg-card p-12 text-center space-y-2.5 shadow-xs">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Incidents Recorded</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {statusFilter === "open"
              ? "All previous automation exceptions have been resolved. The n8n execution pipeline is running cleanly."
              : "No automation errors have been recorded in the automation_errors database table."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredErrors.map((incident) => {
            const isResolved = incident.status === "resolved";

            return (
              <div
                key={incident.id}
                className={cn(
                  "border rounded-xl bg-card p-4 space-y-3 transition-colors shadow-xs",
                  isResolved
                    ? "border-border/60 opacity-80"
                    : "border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/5"
                )}
              >
                {/* Header row: Workflow, Status, Node, Time */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                      <Workflow className="h-3.5 w-3.5 text-muted-foreground" />
                      {incident.workflow_name}
                    </span>

                    {incident.failed_node && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-muted border border-border/70 text-foreground">
                        <FileCode2 className="h-3 w-3 text-rose-500" />
                        Node: {incident.failed_node}
                      </span>
                    )}

                    <span
                      className={cn(
                        "text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border",
                        isResolved
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 animate-pulse"
                      )}
                    >
                      {incident.status.toUpperCase()}
                    </span>
                  </div>

                  <span className="text-[11px] text-muted-foreground tabular-nums flex items-center gap-1">
                    <Clock className="h-3 w-3 shrink-0 opacity-70" />
                    {new Date(incident.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Error Message & Details */}
                <div className="space-y-2">
                  {incident.error_message && (
                    <div className="p-2.5 rounded-lg bg-background/80 border border-border/70 font-mono text-xs text-rose-600 dark:text-rose-300 overflow-x-auto leading-relaxed">
                      {incident.error_message}
                    </div>
                  )}

                  {incident.telegram_message && (
                    <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 pt-0.5">
                      <Send className="h-3 w-3 text-sky-500 shrink-0" />
                      <span className="font-semibold text-foreground">Telegram Broadcast:</span>
                      <span className="truncate">{incident.telegram_message}</span>
                    </div>
                  )}
                </div>

                {/* Footer Controls: Links & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    {incident.execution_url && (
                      <a
                        href={incident.execution_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Open Execution in n8n</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    {incident.execution_id && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        Exec ID: {incident.execution_id}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {!isResolved && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenResolveDialog(incident)}
                        className="h-7 text-xs font-semibold gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
                      >
                        <Check className="h-3 w-3" />
                        <span>Acknowledge / Resolve</span>
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDeleteDialog(incident)}
                      className="h-7 w-7 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded"
                      title="Delete Incident Record"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title={
          confirmAction?.type === "resolve"
            ? "Resolve Automation Incident"
            : "Delete Incident Record"
        }
        description={
          confirmAction?.type === "resolve"
            ? `Mark incident for workflow "${confirmAction?.workflowName}" as resolved?`
            : `Permanently delete this incident record from the database?`
        }
        confirmLabel={confirmAction?.type === "resolve" ? "Mark Resolved" : "Delete"}
        variant={confirmAction?.type === "resolve" ? "default" : "destructive"}
        onConfirm={handleExecuteConfirm}
        loading={isUpdating}
      />
    </div>
  );
}
