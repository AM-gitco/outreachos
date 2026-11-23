"use client";

import * as React from "react";
import {
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  X,
  Globe,
  Download,
  Layers,
  ArrowRight,
  ShieldCheck,
  FileCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { PRESET_WORKFLOWS, N8nWorkflowDefinition } from "@/lib/n8n/workflows-data";
import { cn } from "@/lib/utils";

interface PixtexBrowserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workflow: N8nWorkflowDefinition;
  onExportJson?: () => void;
}

export function PixtexBrowserModal({
  open,
  onOpenChange,
  workflow: initialWorkflow,
  onExportJson,
}: PixtexBrowserModalProps) {
  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState(initialWorkflow.id);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [iframeKey, setIframeKey] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [copiedJson, setCopiedJson] = React.useState(false);

  // Sync with prop when opened or prop changes
  React.useEffect(() => {
    setSelectedWorkflowId(initialWorkflow.id);
    setIframeKey((prev) => prev + 1);
    setIsLoading(true);
  }, [initialWorkflow.id, open]);

  const currentWorkflow = React.useMemo(() => {
    return PRESET_WORKFLOWS.find((w) => w.id === selectedWorkflowId) || initialWorkflow;
  }, [selectedWorkflowId, initialWorkflow]);

  const dropdownOptions: DropdownOption[] = React.useMemo(() => {
    return PRESET_WORKFLOWS.map((w) => ({
      value: w.id,
      label: `${w.code} · ${w.name} (${w.nodes.length} nodes)`,
    }));
  }, []);

  const handleSelectWorkflow = (wfId: string) => {
    setSelectedWorkflowId(wfId);
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((k) => k + 1);
  };

  const handleOpenInNewTab = () => {
    window.open(`/pixtex-viewer?wf=${currentWorkflow.id}`, "_blank");
  };

  const handleCopyJson = () => {
    const raw = currentWorkflow.rawJson || JSON.stringify(currentWorkflow, null, 2);
    navigator.clipboard.writeText(raw);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full",
          isFullscreen
            ? "fixed inset-0 rounded-none h-screen w-screen"
            : "max-w-6xl h-[90vh] max-h-[900px]"
        )}
      >
        {/* Browser Chrome Header */}
        <div className="bg-muted/70 border-b border-border/80 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 select-none">
          {/* Window Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-3 w-3 rounded-full bg-rose-500 hover:opacity-80 cursor-pointer transition-opacity"
              title="Close window"
            />
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-3 w-3 rounded-full bg-amber-500 hover:opacity-80 cursor-pointer transition-opacity"
              title="Toggle fullscreen"
            />
            <span
              className="h-3 w-3 rounded-full bg-emerald-500 opacity-80 inline-block"
              title="Active window"
            />
            <span className="text-[11px] font-bold text-foreground ml-2 hidden sm:inline">
              In-Dashboard Pixtex Browser
            </span>
          </div>

          {/* Browser Navigation & Address Bar */}
          <div className="flex-1 max-w-2xl flex items-center gap-1.5 bg-background border border-border/80 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
            <div className="flex items-center gap-1 text-muted-foreground font-mono text-[11px] truncate flex-1">
              <span className="text-foreground font-semibold">https://pixtex.dev</span>
              <span>/</span>
              <span className="text-primary font-bold">viewer?wf={currentWorkflow.code}</span>
              <span className="text-[10px] text-muted-foreground/80 hidden md:inline">
                ({currentWorkflow.nodes.length} nodes pre-loaded)
              </span>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="text-muted-foreground hover:text-foreground p-0.5"
              title="Reload Pixtex with this workflow"
            >
              <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin text-primary")} />
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="h-7 text-xs font-semibold px-2.5 rounded-lg border-border/80 hover:bg-muted gap-1 text-primary"
              title="Open this pre-loaded Pixtex view in a full browser tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Open in New Tab</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
              title="Close window"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Workflow Switcher & Pre-Load Status Ribbon */}
        <div className="bg-primary/5 border-b border-border/70 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 text-xs">
          {/* Workflow Selector inside the Browser */}
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground shrink-0">
              Active Workflow:
            </span>
            <div className="w-56 sm:w-72">
              <CustomDropdown
                options={dropdownOptions}
                value={selectedWorkflowId}
                onChange={handleSelectWorkflow}
                className="h-7.5 text-xs font-semibold rounded-lg bg-card"
              />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold shrink-0">
              ✓ Pre-loaded (No paste needed)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={copiedJson ? "default" : "outline"}
              size="sm"
              onClick={handleCopyJson}
              className={cn(
                "h-7 text-xs font-medium px-2 rounded-lg border-border/80 hover:bg-muted gap-1 text-muted-foreground",
                copiedJson && "bg-emerald-600 text-white border-emerald-600"
              )}
              title="Copy JSON as backup"
            >
              {copiedJson ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="hidden sm:inline">{copiedJson ? "Copied" : "Copy JSON"}</span>
            </Button>

            {onExportJson && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportJson}
                className="h-7 text-xs font-medium px-2 rounded-lg border-border/80 hover:bg-muted gap-1 text-muted-foreground"
                title="Download workflow .json"
              >
                <Download className="h-3 w-3" />
                <span className="hidden sm:inline">JSON</span>
              </Button>
            )}
          </div>
        </div>

        {/* Pixtex Viewport Frame */}
        <div className="flex-1 relative overflow-hidden bg-background">
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-background/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2.5 text-xs">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span className="font-semibold text-foreground">
                Loading Pixtex Visualizer with {currentWorkflow.code} ({currentWorkflow.nodes.length} nodes)...
              </span>
              <span className="text-[11px] text-muted-foreground">
                Connecting directly to pixtex.dev engine with automated workflow injection
              </span>
            </div>
          )}

          <iframe
            key={`${currentWorkflow.id}-${iframeKey}`}
            src={`/pixtex-viewer?wf=${currentWorkflow.id}`}
            title={`Pixtex Workflow Visualizer - ${currentWorkflow.name}`}
            onLoad={() => setIsLoading(false)}
            className="w-full h-full border-none bg-background"
            allow="clipboard-write; clipboard-read"
          />
        </div>
      </div>
    </div>
  );
}
