"use client";

import * as React from "react";
import {
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  X,
  FileCode,
  Globe,
  Download,
  AlertCircle,
  HelpCircle,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { N8nWorkflowDefinition } from "@/lib/n8n/workflows-data";
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
  workflow,
  onExportJson,
}: PixtexBrowserModalProps) {
  const [copiedJson, setCopiedJson] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [showJsonPreview, setShowJsonPreview] = React.useState(false);
  const [currentUrl, setCurrentUrl] = React.useState("https://pixtex.dev/");
  const [inputUrl, setInputUrl] = React.useState("https://pixtex.dev/");

  const workflowJsonString = React.useMemo(() => {
    return workflow.rawJson || JSON.stringify(workflow, null, 2);
  }, [workflow]);

  // Handle Copy Workflow JSON
  const handleCopyJson = () => {
    navigator.clipboard.writeText(workflowJsonString);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  // Launch in dedicated window
  const handleLaunchExternal = () => {
    handleCopyJson();
    window.open("https://pixtex.dev/", "PixtexWorkflowViewer", "width=1280,height=820,menubar=no,toolbar=no");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        className={cn(
          "bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 w-full",
          isFullscreen
            ? "fixed inset-0 rounded-none h-screen w-screen"
            : "max-w-5xl h-[88vh] max-h-[860px]"
        )}
      >
        {/* Browser Chrome Window Header */}
        <div className="bg-muted/70 border-b border-border/80 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 select-none">
          {/* Mac/Windows Style Window Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <span
              onClick={() => onOpenChange(false)}
              className="h-3 w-3 rounded-full bg-rose-500 hover:opacity-80 cursor-pointer inline-block"
              title="Close window"
            />
            <span
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-3 w-3 rounded-full bg-amber-500 hover:opacity-80 cursor-pointer inline-block"
              title="Toggle fullscreen"
            />
            <span
              onClick={() => {}}
              className="h-3 w-3 rounded-full bg-emerald-500 hover:opacity-80 cursor-pointer inline-block"
              title="Active window"
            />

            <span className="text-[11px] font-semibold text-muted-foreground ml-2 hidden sm:inline">
              In-Dashboard Browser
            </span>
          </div>

          {/* Browser Navigation & Address Bar */}
          <div className="flex-1 max-w-xl flex items-center gap-1.5 bg-background border border-border/80 rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setCurrentUrl(inputUrl);
                }
              }}
              className="bg-transparent text-foreground text-xs w-full focus:outline-none font-mono"
            />
            <button
              type="button"
              onClick={() => setCurrentUrl(inputUrl)}
              className="text-muted-foreground hover:text-foreground p-0.5"
              title="Refresh / Navigate"
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          </div>

          {/* Window Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleLaunchExternal}
              className="h-7 text-xs font-semibold px-2.5 rounded-lg border-border/80 hover:bg-muted gap-1 text-primary"
              title="Open Pixtex.dev in a new window"
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

        {/* Workflow Quick Action Helper Ribbon */}
        <div className="bg-primary/5 border-b border-border/70 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
              {workflow.code}
            </span>
            <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
              {workflow.name}
            </span>
            <span className="text-[10px] text-muted-foreground">
              ({workflow.nodes.length} nodes ready to render)
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={copiedJson ? "default" : "outline"}
              size="sm"
              onClick={handleCopyJson}
              className={cn(
                "h-7 text-xs font-semibold px-2.5 rounded-lg gap-1.5 transition-all shadow-2xs",
                copiedJson && "bg-emerald-600 text-white border-emerald-600"
              )}
              title="Copy this workflow JSON to clipboard to paste into Pixtex"
            >
              {copiedJson ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>JSON Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Workflow JSON</span>
                </>
              )}
            </Button>

            {onExportJson && (
              <Button
                variant="outline"
                size="sm"
                onClick={onExportJson}
                className="h-7 text-xs font-medium px-2 rounded-lg border-border/80 hover:bg-muted"
                title="Download .json file"
              >
                <Download className="h-3 w-3 sm:mr-1" />
                <span className="hidden sm:inline">Download JSON</span>
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="h-7 text-xs font-medium px-2 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <FileCode className="h-3.5 w-3.5 sm:mr-1" />
              <span className="hidden sm:inline">{showJsonPreview ? "Hide JSON" : "View JSON"}</span>
            </Button>
          </div>
        </div>

        {/* Browser Viewport Area */}
        <div className="flex-1 relative overflow-hidden bg-background flex flex-col">
          {showJsonPreview ? (
            /* JSON Code Preview Mode */
            <div className="flex-1 overflow-auto p-4 bg-muted/20 font-mono text-xs text-foreground leading-relaxed">
              <pre className="whitespace-pre-wrap">{workflowJsonString}</pre>
            </div>
          ) : (
            /* Interactive Pixtex Viewer & Browser Interface */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6 overflow-auto">
              {/* Notice Card on Frame Embedding */}
              <div className="max-w-xl w-full border border-border/80 rounded-2xl bg-card p-6 shadow-md space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">
                      Pixtex n8n Workflow Visualizer
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Pixtex (<code className="font-mono text-foreground font-semibold">https://pixtex.dev/</code>) is a dedicated developer tool that renders pixel-perfect n8n workflows into high-resolution diagrams.
                    </p>
                  </div>
                </div>

                {/* 3 Step Instruction Guide */}
                <div className="border border-border/60 rounded-xl bg-muted/30 p-3.5 space-y-2 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    How to render in 2 clicks:
                  </span>
                  <div className="space-y-1.5 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">1</span>
                      <span>Click <strong className="text-foreground">Copy Workflow JSON</strong> button above.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">2</span>
                      <span>Click <strong className="text-foreground">Launch Pixtex.dev</strong> below to open the canvas.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">3</span>
                      <span>Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-[10px] text-foreground">Ctrl+V</kbd> (or Cmd+V) to drop the workflow into Pixtex.</span>
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-2">
                  <Button
                    variant="default"
                    size="default"
                    onClick={handleLaunchExternal}
                    className="w-full sm:w-auto text-xs font-semibold rounded-xl gap-2 shadow-xs"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>Copy JSON & Launch Pixtex.dev</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => {
                      onOpenChange(false);
                    }}
                    className="w-full sm:w-auto text-xs font-medium rounded-xl border-border/80 hover:bg-muted"
                  >
                    View in Built-in Canvas Instead
                  </Button>
                </div>
              </div>

              {/* Informational Footer Note */}
              <p className="text-[11px] text-muted-foreground max-w-md">
                Tip: OutreachOS also includes a full native interactive canvas with pan, zoom, node inspection, and PNG export built directly into the dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
