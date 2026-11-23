"use client";

import * as React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
  MarkerType,
  Node,
  Edge,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toPng } from "html-to-image";
import {
  Download,
  FileJson,
  Upload,
  Maximize2,
  Minimize2,
  RefreshCw,
  Zap,
  Check,
  Code2,
  FileText,
  AlertCircle,
  FileUp,
  FolderOpen,
  Globe,
  Archive,
  Info,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomDropdown, DropdownOption } from "@/components/ui/custom-dropdown";
import { useTheme } from "@/components/layout/theme-provider";
import { N8nNode } from "@/components/workflow/n8n-node";
import { PixtexBrowserModal } from "@/components/workflow/pixtex-browser-modal";
import {
  PRESET_WORKFLOWS,
  N8nWorkflowDefinition,
  parseN8nJsonToWorkflow
} from "@/lib/n8n/workflows-data";
import { downloadWorkflowsZip } from "@/lib/n8n/zip-helper";
import { cn } from "@/lib/utils";

const nodeTypes = {
  n8nNode: N8nNode,
};

interface WorkflowCanvasProps {
  initialWorkflowId?: string;
  className?: string;
}

function WorkflowCanvasInner({
  initialWorkflowId = "WF-01",
  className,
}: WorkflowCanvasProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [selectedWorkflowId, setSelectedWorkflowId] = React.useState(initialWorkflowId);
  const [currentWorkflow, setCurrentWorkflow] = React.useState<N8nWorkflowDefinition>(
    PRESET_WORKFLOWS.find((w) => w.id === initialWorkflowId) || PRESET_WORKFLOWS[0]
  );
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [isExportingPng, setIsExportingPng] = React.useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = React.useState(false);

  // In-Dashboard Pixtex Browser Modal
  const [isPixtexModalOpen, setIsPixtexModalOpen] = React.useState(false);

  // Selected Node Details Inspector
  const [selectedNodeData, setSelectedNodeData] = React.useState<Record<string, unknown> | null>(null);

  // Import modal state
  const [isImportModalOpen, setIsImportModalOpen] = React.useState(false);
  const [importMode, setImportMode] = React.useState<"file" | "text">("file");
  const [customJsonInput, setCustomJsonInput] = React.useState("");
  const [importedFileName, setImportedFileName] = React.useState<string | null>(null);
  const [importError, setImportError] = React.useState("");
  const [isDraggingFile, setIsDraggingFile] = React.useState(false);

  const reactFlowWrapper = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { fitView } = useReactFlow();

  // Convert N8nWorkflowDefinition to ReactFlow Nodes and Edges
  const generateFlowElements = React.useCallback(
    (wf: N8nWorkflowDefinition, darkMode: boolean) => {
      const flowNodes: Node[] = wf.nodes.map((n) => ({
        id: n.id,
        type: "n8nNode",
        position: { x: n.position[0], y: n.position[1] },
        data: {
          id: n.id,
          name: n.name,
          type: n.type,
          category: n.category,
          service: n.service,
          operation: n.operation,
          description: n.description,
          parameters: n.parameters,
          status: "active",
        },
      }));

      const flowEdges: Edge[] = wf.connections.map((c, idx) => {
        const strokeColor = darkMode ? "#3b82f6" : "#2563eb";
        const labelBg = darkMode ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.95)";
        const labelFill = darkMode ? "#94a3b8" : "#475569";

        return {
          id: `edge-${c.from}-${c.to}-${idx}`,
          source: c.from,
          target: c.to,
          sourceHandle: c.sourceHandle,
          targetHandle: c.targetHandle,
          type: "default", // smooth bezier curve matching n8n
          animated: true,
          label: c.label,
          labelStyle: { fill: labelFill, fontSize: 10, fontWeight: 700 },
          labelBgStyle: { fill: labelBg, fillOpacity: 0.95 },
          labelBgPadding: [6, 2],
          labelBgBorderRadius: 4,
          style: { stroke: strokeColor, strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: strokeColor,
            width: 15,
            height: 15,
          },
        };
      });

      return { flowNodes, flowEdges };
    },
    []
  );

  const initialElements = React.useMemo(
    () => generateFlowElements(currentWorkflow, isDark),
    [currentWorkflow, isDark, generateFlowElements]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.flowEdges);

  // Re-generate edges when theme changes
  React.useEffect(() => {
    const { flowNodes, flowEdges } = generateFlowElements(currentWorkflow, isDark);
    setEdges(flowEdges);
  }, [isDark, currentWorkflow, generateFlowElements, setEdges]);

  // Switch workflow handler
  const handleSelectWorkflow = (workflowId: string) => {
    setSelectedWorkflowId(workflowId);
    setSelectedNodeData(null);
    const target = PRESET_WORKFLOWS.find((w) => w.id === workflowId);
    if (target) {
      setCurrentWorkflow(target);
      const { flowNodes, flowEdges } = generateFlowElements(target, isDark);
      setNodes(flowNodes);
      setEdges(flowEdges);
      setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    }
  };

  // Node Click: Inspect parameters
  const handleNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNodeData(node.data as Record<string, unknown>);
  };

  // Export as PNG
  const handleExportPng = async () => {
    if (!reactFlowWrapper.current) return;
    setIsExportingPng(true);
    try {
      const viewportElement = reactFlowWrapper.current.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;

      if (!viewportElement) throw new Error("Canvas viewport not found.");

      const backgroundColor = isDark ? "#090d16" : "#f8fafc";

      const dataUrl = await toPng(viewportElement, {
        backgroundColor,
        pixelRatio: 2,
        quality: 0.95,
      });

      const downloadLink = document.createElement("a");
      downloadLink.download = `${currentWorkflow.code || "workflow"}-n8n-nodes.png`;
      downloadLink.href = dataUrl;
      downloadLink.click();
    } catch (err) {
      console.error("Failed to export PNG:", err);
      alert("Failed to export workflow as PNG. Please try again.");
    } finally {
      setIsExportingPng(false);
    }
  };

  // Export raw JSON
  const handleExportJson = () => {
    const jsonString = currentWorkflow.rawJson || JSON.stringify(currentWorkflow, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${currentWorkflow.code || "workflow"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download All Workflows as ZIP
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

  // Process and apply workflow JSON string
  const applyWorkflowJson = (jsonString: string, fileName?: string) => {
    setImportError("");
    const parsed = parseN8nJsonToWorkflow(jsonString);
    if (!parsed || parsed.nodes.length === 0) {
      setImportError("Could not extract valid nodes from this file. Please verify it is an exported n8n workflow JSON.");
      return false;
    }

    setCurrentWorkflow(parsed);
    setSelectedWorkflowId("CUSTOM");
    setSelectedNodeData(null);
    const { flowNodes, flowEdges } = generateFlowElements(parsed, isDark);
    setNodes(flowNodes);
    setEdges(flowEdges);
    setIsImportModalOpen(false);
    setCustomJsonInput("");
    setImportedFileName(fileName || "custom-workflow.json");
    setTimeout(() => fitView({ padding: 0.2, duration: 400 }), 50);
    return true;
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        applyWorkflowJson(content, file.name);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Drag & drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.type === "application/json" || file.name.endsWith(".json"))) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          applyWorkflowJson(content, file.name);
        }
      };
      reader.readAsText(file);
    } else {
      setImportError("Please drop a valid .json file.");
    }
  };

  // Dropdown options
  const workflowDropdownOptions: DropdownOption[] = React.useMemo(() => {
    const list: DropdownOption[] = PRESET_WORKFLOWS.map((w) => ({
      value: w.id,
      label: `${w.code} · ${w.name} (${w.nodes.length} nodes)`,
    }));
    if (selectedWorkflowId === "CUSTOM") {
      list.push({ value: "CUSTOM", label: importedFileName ? `Imported: ${importedFileName}` : "Custom Imported Workflow" });
    }
    return list;
  }, [selectedWorkflowId, importedFileName]);

  return (
    <div
      ref={reactFlowWrapper}
      className={cn(
        "relative rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col transition-all duration-300 select-none",
        isFullscreen
          ? "fixed inset-0 z-50 rounded-none h-screen w-screen"
          : "h-[620px] sm:h-[720px] w-full",
        className
      )}
    >
      {/* Top Floating Control Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:px-4 border-b border-border/70 bg-card/95 backdrop-blur-md z-10 shrink-0">
        {/* Left: Workflow Selector & Info */}
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          <div className="w-64 sm:w-80">
            <CustomDropdown
              options={workflowDropdownOptions}
              value={selectedWorkflowId}
              onChange={handleSelectWorkflow}
              className="h-8.5 text-xs font-semibold rounded-lg"
            />
          </div>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0 tabular-nums">
            {currentWorkflow.nodes.length} NODES
          </span>

          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border/50 shrink-0 tabular-nums">
            {currentWorkflow.connections.length} EDGES
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {/* In-Dashboard Pixtex Browser Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPixtexModalOpen(true)}
            className="h-7.5 text-xs font-semibold px-2.5 rounded-lg border-border/80 hover:bg-muted text-primary gap-1.5"
            title="Open in-built dashboard browser to view same to same in pixtex.dev"
          >
            <Globe className="h-3.5 w-3.5" />
            <span>Pixtex Browser</span>
          </Button>

          {/* Download as ZIP (All Workflows) */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAllZip}
            disabled={isDownloadingZip}
            className="h-7.5 text-xs font-medium px-2.5 rounded-lg border-border/80 hover:bg-muted gap-1 text-muted-foreground hover:text-foreground"
            title="Download all 8 workflows and assignment requirements as a ZIP archive"
          >
            <Archive className="h-3.5 w-3.5 text-amber-500" />
            <span className="hidden md:inline">{isDownloadingZip ? "Zipping..." : "Download as ZIP"}</span>
          </Button>

          {/* Recenter / Fit View */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fitView({ padding: 0.2, duration: 300 })}
            className="h-7.5 text-xs font-medium px-2.5 rounded-lg border-border/80 hover:bg-muted"
            title="Recenter and fit nodes to canvas"
          >
            <RefreshCw className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Recenter</span>
          </Button>

          {/* Import JSON Modal */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setImportError("");
              setIsImportModalOpen(true);
            }}
            className="h-7.5 text-xs font-medium px-2.5 rounded-lg border-border/80 hover:bg-muted gap-1"
            title="Import custom n8n workflow JSON (file or text)"
          >
            <FileUp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Import JSON</span>
          </Button>

          {/* Export Raw JSON */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="h-7.5 text-xs font-medium px-2.5 rounded-lg border-border/80 hover:bg-muted gap-1"
            title="Export this workflow as JSON"
          >
            <FileJson className="h-3 w-3" />
            <span className="hidden sm:inline">Export JSON</span>
          </Button>

          {/* Export as PNG */}
          <Button
            variant="default"
            size="sm"
            onClick={handleExportPng}
            disabled={isExportingPng}
            className="h-7.5 text-xs font-semibold px-3 rounded-lg gap-1.5 shadow-xs"
            title="Download high-resolution PNG image of workflow nodes"
          >
            <Download className="h-3.5 w-3.5" />
            <span>{isExportingPng ? "Rendering..." : "Export as PNG"}</span>
          </Button>

          {/* Fullscreen Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-7.5 w-7.5 text-muted-foreground hover:text-foreground rounded-lg ml-0.5"
            title={isFullscreen ? "Exit Fullscreen" : "Full Screen View"}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </div>

      {/* Main React Flow Canvas with Active Theme Mode */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.15}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.85 }}
          className={cn("bg-background select-none", isDark && "dark")}
        >
          {/* Authentic n8n Dot Grid Pattern synced with Theme */}
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1.5}
            color={isDark ? "#26334d" : "#cbd5e1"}
            className="opacity-70 transition-colors"
          />

          {/* Canvas Navigation Controls (Zoom in/out, fit) */}
          <Controls
            position="bottom-left"
            showInteractive={false}
            className="!bg-card !border !border-border/80 !shadow-xs !rounded-lg overflow-hidden [&>button]:!bg-card [&>button]:!border-border/60 [&>button]:!fill-foreground [&>button:hover]:!bg-muted"
          />

          {/* MiniMap Overview synced with Theme */}
          <MiniMap
            position="bottom-right"
            zoomable
            pannable
            nodeStrokeWidth={3}
            bgColor={isDark ? "#0f172a" : "#ffffff"}
            maskColor={isDark ? "rgba(9, 13, 22, 0.75)" : "rgba(241, 245, 249, 0.75)"}
            nodeColor={(n) => {
              const cat = (n.data as unknown as { category?: string })?.category;
              if (cat === "trigger") return "#ff6d5a";
              if (cat === "database") return "#10b981";
              if (cat === "channel") return "#3b82f6";
              if (cat === "logic") return "#a855f7";
              return "#64748b";
            }}
            className="!bg-card/90 !border !border-border/80 !rounded-xl !shadow-xs overflow-hidden hidden sm:block"
          />
        </ReactFlow>

        {/* Selected Node Inspector Drawer (Shows when a node is clicked) */}
        {selectedNodeData && (
          <div className="absolute right-4 top-4 z-20 w-80 max-h-[85%] bg-card/95 backdrop-blur-md border border-border/80 rounded-xl shadow-xl overflow-hidden flex flex-col text-xs animate-in slide-in-from-right-4 duration-200">
            <div className="p-3 border-b border-border/60 flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-1.5 min-w-0">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="font-bold text-foreground truncate">
                  {String(selectedNodeData.name || "Node Inspector")}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNodeData(null)}
                className="h-5 w-5 rounded text-muted-foreground hover:text-foreground flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2.5 font-mono text-[11px]">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Type</span>
                <span className="text-foreground font-semibold break-all">{String(selectedNodeData.type || "")}</span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Service</span>
                <span className="text-foreground">{String(selectedNodeData.service || "")}</span>
              </div>

              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Operation</span>
                <span className="text-foreground">{String(selectedNodeData.operation || "Default")}</span>
              </div>

              {Boolean(selectedNodeData.description) && (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block">Notes</span>
                  <span className="text-muted-foreground font-sans text-xs">{String(selectedNodeData.description)}</span>
                </div>
              )}

              {Boolean(selectedNodeData.parameters) && (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-sans font-semibold block mb-1">Parameters</span>
                  <pre className="p-2 rounded bg-muted/50 border border-border/60 text-[10px] overflow-x-auto whitespace-pre-wrap max-h-48 text-foreground/90">
                    {JSON.stringify(selectedNodeData.parameters, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Floating Description Bar at Bottom */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-3 z-10 max-w-xl w-full px-4 pointer-events-none">
          <div className="p-2.5 rounded-xl bg-card/90 backdrop-blur-md border border-border/80 shadow-md text-center pointer-events-auto flex items-center justify-between gap-3 text-xs">
            <div className="text-left min-w-0">
              <span className="font-bold text-foreground block truncate">
                {currentWorkflow.name}
              </span>
              <span className="text-[10px] text-muted-foreground block truncate">
                {currentWorkflow.description}
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-muted text-muted-foreground font-semibold border border-border/50">
                {currentWorkflow.category}
              </span>
              <button
                type="button"
                onClick={() => setIsPixtexModalOpen(true)}
                className="text-[10px] font-semibold text-primary hover:underline flex items-center gap-1 px-1"
                title="Open in Pixtex"
              >
                <Globe className="h-3 w-3" />
                <span>Pixtex</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* In-Dashboard Pixtex Browser Modal */}
      <PixtexBrowserModal
        open={isPixtexModalOpen}
        onOpenChange={setIsPixtexModalOpen}
        workflow={currentWorkflow}
        onExportJson={handleExportJson}
      />

      {/* Import Custom n8n Workflow JSON Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <FileUp className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Import n8n Workflow JSON
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
                className="h-7 w-7 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center gap-2 border-b border-border/60 pb-2 text-xs">
              <button
                type="button"
                onClick={() => setImportMode("file")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer",
                  importMode === "file"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <FolderOpen className="h-3.5 w-3.5" />
                <span>Upload .json File</span>
              </button>

              <button
                type="button"
                onClick={() => setImportMode("text")}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 cursor-pointer",
                  importMode === "text"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Paste JSON Text</span>
              </button>
            </div>

            {importMode === "file" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all space-y-3",
                  isDraggingFile
                    ? "border-primary bg-primary/10"
                    : "border-border/80 hover:border-foreground/30 hover:bg-muted/30"
                )}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="h-11 w-11 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto border border-primary/20">
                  <FileUp className="h-5 w-5" />
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">
                    Click to browse or drag & drop your n8n workflow file
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Supports exported <code className="font-mono text-foreground font-semibold">.json</code> workflows from any n8n version
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={8}
                  value={customJsonInput}
                  onChange={(e) => setCustomJsonInput(e.target.value)}
                  placeholder='{ "nodes": [...], "connections": { ... } }'
                  className="w-full rounded-xl bg-muted/40 border border-border/80 p-3 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-relaxed"
                />
              </div>
            )}

            {importError && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(false)}
                className="h-8 text-xs rounded-lg"
              >
                Cancel
              </Button>
              {importMode === "text" && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => applyWorkflowJson(customJsonInput)}
                  className="h-8 text-xs font-semibold rounded-lg"
                >
                  Visualize Workflow
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
