"use client";

import * as React from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  X,
  Globe,
  Download,
  FileCode,
  LayoutGrid,
  Zap,
  Info,
  Layers,
  ArrowRight
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
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<"pixtex" | "visualizer" | "json">("pixtex");

  // Sync with prop when opened or prop changes
  React.useEffect(() => {
    setSelectedWorkflowId(initialWorkflow.id);
  }, [initialWorkflow.id, open]);

  const currentWorkflow = React.useMemo(() => {
    return PRESET_WORKFLOWS.find((w) => w.id === selectedWorkflowId) || initialWorkflow;
  }, [selectedWorkflowId, initialWorkflow]);

  const workflowJsonString = React.useMemo(() => {
    return currentWorkflow.rawJson || JSON.stringify(currentWorkflow, null, 2);
  }, [currentWorkflow]);

  const dropdownOptions: DropdownOption[] = React.useMemo(() => {
    return PRESET_WORKFLOWS.map((w) => ({
      value: w.id,
      label: `${w.code} · ${w.name} (${w.nodes.length} nodes)`,
    }));
  }, []);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(workflowJsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleLaunchPixtex = () => {
    handleCopyJson();
    window.open("https://pixtex.dev/", "PixtexViewer", "width=1320,height=860,menubar=no,toolbar=no");
  };

  const handleDownloadJson = () => {
    const blob = new Blob([workflowJsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentWorkflow.code}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full",
          isFullscreen
            ? "fixed inset-0 rounded-none h-screen w-screen"
            : "max-w-5xl h-[88vh] max-h-[860px]"
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
              Pixtex Workflow Hub
            </span>
          </div>

          {/* Tab Controls: Pixtex Guide | Built-in Visualizer | Raw JSON */}
          <div className="flex items-center gap-1 bg-background border border-border/80 rounded-lg p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("pixtex")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5",
                activeTab === "pixtex"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Globe className="h-3 w-3" />
              <span>Pixtex.dev</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("visualizer")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5",
                activeTab === "visualizer"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="h-3 w-3" />
              <span>Built-in Visualizer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors flex items-center gap-1.5",
                activeTab === "json"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <FileCode className="h-3 w-3" />
              <span>JSON Spec</span>
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLaunchPixtex}
              className="h-7 text-xs font-semibold px-2.5 rounded-lg border-border/80 hover:bg-muted gap-1 text-primary"
              title="Copy JSON and open Pixtex.dev in a new window"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Launch Pixtex.dev</span>
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

        {/* Workflow Switcher & Action Ribbon */}
        <div className="bg-primary/5 border-b border-border/70 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground shrink-0">
              Workflow:
            </span>
            <div className="w-56 sm:w-72">
              <CustomDropdown
                options={dropdownOptions}
                value={selectedWorkflowId}
                onChange={setSelectedWorkflowId}
                className="h-7.5 text-xs font-semibold rounded-lg bg-card"
              />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold border border-border/50 shrink-0">
              {currentWorkflow.category} · {currentWorkflow.nodes.length} nodes
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
              title="Copy workflow JSON to clipboard"
            >
              {copiedJson ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              <span className="hidden sm:inline">{copiedJson ? "Copied" : "Copy JSON"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadJson}
              className="h-7 text-xs font-medium px-2 rounded-lg border-border/80 hover:bg-muted gap-1 text-muted-foreground"
              title="Download workflow .json"
            >
              <Download className="h-3 w-3" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        </div>

        {/* Tab Content Viewport */}
        <div className="flex-1 relative overflow-hidden bg-background flex flex-col">
          {/* TAB 1: Pixtex.dev 3-Step Guide (Original Fast Experience) */}
          {activeTab === "pixtex" && (
            <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center text-center space-y-6">
              <div className="max-w-xl w-full border border-border/80 rounded-2xl bg-card p-6 shadow-md space-y-5 text-left">
                {/* Header Description */}
                <div className="flex items-start gap-3.5">
                  <div className="h-11 w-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-xs">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-foreground">
                        Pixtex.dev n8n Workflow Visualizer
                      </h3>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-semibold border border-sky-500/20">
                        {currentWorkflow.code}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Render pixel-perfect, high-resolution n8n visual diagrams on <strong className="text-foreground">https://pixtex.dev/</strong> in 2 clicks.
                    </p>
                  </div>
                </div>

                {/* 3 Step Instruction Guide */}
                <div className="border border-border/60 rounded-xl bg-muted/30 p-4 space-y-2.5 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Quick 2-Click Render Steps:
                  </span>
                  <div className="space-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                      <span>Click <strong className="text-foreground">Copy JSON & Launch Pixtex.dev</strong> below.</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                      <span>Pixtex opens in a dedicated window with your workflow JSON already copied.</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-5 w-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                      <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-foreground font-semibold">Ctrl+V</kbd> (or <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-foreground font-semibold">Cmd+V</kbd>) into Pixtex canvas to drop the diagram.</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleLaunchPixtex}
                    className="w-full sm:w-auto text-xs font-semibold rounded-xl gap-2 shadow-xs"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Copy JSON & Launch Pixtex.dev</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => setActiveTab("visualizer")}
                    className="w-full sm:w-auto text-xs font-medium rounded-xl border-border/80 hover:bg-muted gap-1.5"
                  >
                    <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                    <span>View in Built-in Canvas Instead</span>
                  </Button>
                </div>
              </div>

              {/* Informational Footer Note */}
              <p className="text-[11px] text-muted-foreground max-w-md">
                Tip: If <code className="font-mono text-foreground font-semibold">pixtex.dev</code> is slow or unreachable, use the <button onClick={() => setActiveTab("visualizer")} className="text-primary font-semibold underline hover:text-primary/80">Built-in Visualizer</button> tab to render in under 10ms with zero network latency.
              </p>
            </div>
          )}

          {/* TAB 2: Instant Built-in Vector Visualizer */}
          {activeTab === "visualizer" && (
            <div className="flex-1 relative w-full h-full bg-background">
              <iframe
                src={`/pixtex-viewer?wf=${currentWorkflow.id}`}
                title={`Built-in Workflow Visualizer - ${currentWorkflow.name}`}
                className="w-full h-full border-none bg-background"
                allow="clipboard-write; clipboard-read"
              />
            </div>
          )}

          {/* TAB 3: Raw n8n JSON Spec */}
          {activeTab === "json" && (
            <div className="flex-1 overflow-auto p-4 bg-muted/20 font-mono text-xs text-foreground leading-relaxed">
              <pre className="whitespace-pre-wrap selection:bg-primary/20">{workflowJsonString}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
