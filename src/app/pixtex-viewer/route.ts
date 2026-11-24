import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { PRESET_WORKFLOWS, N8nWorkflowDefinition } from "@/lib/n8n/workflows-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const wfId = searchParams.get("wf") || "WF-01";

  // 1. Locate workflow
  const wf: N8nWorkflowDefinition =
    PRESET_WORKFLOWS.find((w) => w.id === wfId || w.code === wfId) || PRESET_WORKFLOWS[0];

  // Also read raw file if available
  let rawJson = wf.rawJson;
  if (!rawJson) {
    try {
      const filePath = path.join(process.cwd(), "public", "workflows", `${wf.id}.json`);
      if (fs.existsSync(filePath)) {
        rawJson = fs.readFileSync(filePath, "utf-8");
      } else {
        const altPath = path.join(process.cwd(), "public", "workflows", "WF-01.json");
        if (fs.existsSync(altPath)) rawJson = fs.readFileSync(altPath, "utf-8");
      }
    } catch {
      rawJson = JSON.stringify(wf, null, 2);
    }
  }

  // Calculate bounding box for initial centering
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  wf.nodes.forEach((n) => {
    const x = n.position[0];
    const y = n.position[1];
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });

  if (minX === Infinity) {
    minX = 0; minY = 0; maxX = 1200; maxY = 800;
  }

  // Node dimension constants
  const nodeWidth = 240;
  const nodeHeight = 92;

  // Category badge colors
  const categoryColors: Record<string, { bg: string; text: string; border: string; bar: string }> = {
    trigger: { bg: "#064e3b", text: "#34d399", border: "#059669", bar: "#10b981" },
    channel: { bg: "#1e3a8a", text: "#93c5fd", border: "#2563eb", bar: "#3b82f6" },
    database: { bg: "#4c1d95", text: "#c4b5fd", border: "#7c3aed", bar: "#8b5cf6" },
    logic: { bg: "#78350f", text: "#fde68a", border: "#d97706", bar: "#f59e0b" },
    alert: { bg: "#881337", text: "#fecdd3", border: "#e11d48", bar: "#f43f5e" },
    code: { bg: "#164e63", text: "#a5f3fc", border: "#0891b2", bar: "#06b6d4" },
  };

  // Generate connection paths
  const connectionPaths = wf.connections.map((c) => {
    const fromNode = wf.nodes.find((n) => n.name === c.from || n.id === c.from);
    const toNode = wf.nodes.find((n) => n.name === c.to || n.id === c.to);
    if (!fromNode || !toNode) return "";

    const x1 = fromNode.position[0] + nodeWidth;
    const y1 = fromNode.position[1] + nodeHeight / 2;
    const x2 = toNode.position[0];
    const y2 = toNode.position[1] + nodeHeight / 2;
    const dx = Math.abs(x2 - x1) * 0.55;

    return `
      <g class="flow-edge">
        <path
          d="M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}"
          fill="none"
          stroke="#3b82f6"
          stroke-width="2.5"
          stroke-linecap="round"
          class="edge-path"
        />
        <circle cx="${x1}" cy="${y1}" r="3.5" fill="#60a5fa" />
        <circle cx="${x2}" cy="${y2}" r="3.5" fill="#3b82f6" />
      </g>
    `;
  }).join("\n");

  // Generate node DOM elements
  const nodesHtml = wf.nodes.map((n) => {
    const cat = categoryColors[n.category] || categoryColors.channel;
    const op = n.operation || n.service || n.type.replace("n8n-nodes-base.", "");
    const paramsJson = n.parameters ? JSON.stringify(n.parameters, null, 2) : "{}";

    return `
      <div
        id="node-${n.id}"
        class="workflow-node"
        style="transform: translate(${n.position[0]}px, ${n.position[1]}px);"
        onclick="inspectNode(${JSON.stringify(n.name)}, ${JSON.stringify(n.service)}, ${JSON.stringify(n.category)}, ${JSON.stringify(n.description || '')}, ${JSON.stringify(paramsJson)})"
      >
        <div class="node-accent-bar" style="background: ${cat.bar};"></div>
        <div class="node-body">
          <div class="node-header">
            <span class="node-category-badge" style="background: ${cat.bg}; color: ${cat.text}; border: 1px solid ${cat.border};">
              ${n.category.toUpperCase()}
            </span>
            <span class="node-status-dot"></span>
          </div>
          <div class="node-title" title="${n.name}">${n.name}</div>
          <div class="node-subtitle" title="${op}">${op}</div>
        </div>
        <div class="port port-in"></div>
        <div class="port port-out"></div>
      </div>
    `;
  }).join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>${wf.code} · ${wf.name} — Workflow Visualizer</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #09090b;
      color: #f4f4f5;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Geist", Helvetica, Arial, sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      user-select: none;
    }

    /* Grid Canvas */
    #viewport {
      width: 100%;
      height: 100%;
      position: relative;
      background-color: #09090b;
      background-image: 
        radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
      background-size: 24px 24px;
      cursor: grab;
    }
    #viewport:active { cursor: grabbing; }

    #world {
      position: absolute;
      top: 0;
      left: 0;
      transform-origin: 0 0;
      will-change: transform;
    }

    /* Edge Connections */
    #edges-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 8000px;
      height: 8000px;
      pointer-events: none;
      overflow: visible;
    }
    .edge-path {
      filter: drop-shadow(0 0 4px rgba(59, 130, 246, 0.4));
      transition: stroke 0.2s;
    }
    .flow-edge:hover .edge-path {
      stroke: #60a5fa;
      stroke-width: 3.5;
    }

    /* Node Cards */
    .workflow-node {
      position: absolute;
      width: ${nodeWidth}px;
      height: ${nodeHeight}px;
      background: #18181b;
      border: 1px solid #27272a;
      border-radius: 12px;
      box-shadow: 0 4px 20px -2px rgba(0,0,0,0.6), 0 2px 6px -1px rgba(0,0,0,0.4);
      display: flex;
      flex-direction: column;
      overflow: visible;
      cursor: pointer;
      transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
    }
    .workflow-node:hover {
      border-color: #3b82f6;
      box-shadow: 0 8px 30px -4px rgba(59, 130, 246, 0.25);
    }
    .node-accent-bar {
      height: 3px;
      width: 100%;
      border-top-left-radius: 11px;
      border-top-right-radius: 11px;
    }
    .node-body {
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      flex: 1;
    }
    .node-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    .node-category-badge {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    }
    .node-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px #10b981;
    }
    .node-title {
      font-size: 13px;
      font-weight: 600;
      color: #f4f4f5;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    .node-subtitle {
      font-size: 11px;
      color: #a1a1aa;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.2;
    }
    .port {
      position: absolute;
      top: 50%;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #3b82f6;
      border: 2px solid #09090b;
      transform: translateY(-50%);
    }
    .port-in { left: -5px; }
    .port-out { right: -5px; }

    /* Floating Toolbar */
    .top-toolbar {
      position: fixed;
      top: 14px;
      left: 16px;
      right: 16px;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      pointer-events: none;
    }
    .tool-group {
      pointer-events: auto;
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(24, 24, 27, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      padding: 6px 10px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .btn {
      appearance: none;
      background: transparent;
      border: 1px solid rgba(255,255,255,0.12);
      color: #e4e4e7;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      transition: all 0.15s;
    }
    .btn:hover {
      background: rgba(255,255,255,0.08);
      color: #ffffff;
      border-color: rgba(255,255,255,0.25);
    }
    .btn-primary {
      background: #2563eb;
      border-color: #3b82f6;
      color: #ffffff;
    }
    .btn-primary:hover {
      background: #1d4ed8;
    }
    .wf-badge {
      font-size: 11px;
      font-weight: 700;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.25);
      border-radius: 4px;
      padding: 2px 7px;
      font-family: ui-monospace, monospace;
    }
    .wf-name {
      font-size: 13px;
      font-weight: 600;
      color: #ffffff;
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Bottom Inspector Drawer */
    #inspector {
      position: fixed;
      bottom: 16px;
      right: 16px;
      width: 380px;
      max-width: calc(100vw - 32px);
      max-height: 480px;
      background: #18181b;
      border: 1px solid #3f3f46;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.7);
      z-index: 100;
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .drawer-header {
      padding: 10px 14px;
      background: #27272a;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #3f3f46;
    }
    .drawer-title { font-size: 13px; font-weight: 700; color: #ffffff; }
    .drawer-close {
      background: transparent;
      border: none;
      color: #a1a1aa;
      font-size: 18px;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
    }
    .drawer-close:hover { color: #ffffff; }
    .drawer-body {
      padding: 12px 14px;
      overflow-y: auto;
      font-size: 12px;
      color: #d4d4d8;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    pre {
      background: #09090b;
      padding: 8px;
      border-radius: 6px;
      font-family: ui-monospace, monospace;
      font-size: 11px;
      overflow-x: auto;
      color: #93c5fd;
      border: 1px solid #27272a;
    }
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #10b981;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      z-index: 200;
      display: none;
    }
  </style>
</head>
<body>
  <!-- Top Toolbar -->
  <div class="top-toolbar">
    <div class="tool-group">
      <span class="wf-badge">${wf.code}</span>
      <span class="wf-name" title="${wf.name}">${wf.name}</span>
      <span style="font-size: 11px; color: #a1a1aa;">(${wf.nodes.length} nodes · ${wf.connections.length} edges)</span>
    </div>

    <div class="tool-group">
      <button class="btn" onclick="zoomIn()" title="Zoom In">+</button>
      <button class="btn" onclick="zoomOut()" title="Zoom Out">−</button>
      <button class="btn" onclick="fitView()" title="Fit View">⛶ Fit</button>
      <button class="btn" onclick="copyWorkflowJson()" title="Copy Workflow JSON">📋 Copy JSON</button>
      <button class="btn btn-primary" onclick="downloadWorkflowJson()" title="Download JSON">⬇ Download</button>
    </div>
  </div>

  <!-- Interactive Pan/Zoom Canvas -->
  <div id="viewport">
    <div id="world">
      <svg id="edges-svg">
        ${connectionPaths}
      </svg>
      <div id="nodes-container">
        ${nodesHtml}
      </div>
    </div>
  </div>

  <!-- Node Inspector Drawer -->
  <div id="inspector">
    <div class="drawer-header">
      <span class="drawer-title" id="drawer-node-name">Node Inspector</span>
      <button class="drawer-close" onclick="closeInspector()">✕</button>
    </div>
    <div class="drawer-body">
      <div><strong style="color: #a1a1aa;">Service:</strong> <span id="drawer-node-service" style="color: #60a5fa; font-weight: 600;"></span></div>
      <div><strong style="color: #a1a1aa;">Category:</strong> <span id="drawer-node-category" style="text-transform: uppercase; font-family: monospace;"></span></div>
      <div id="drawer-desc-wrap" style="display: none;"><strong style="color: #a1a1aa;">Description:</strong> <p id="drawer-node-desc" style="margin-top: 2px; color: #e4e4e7;"></p></div>
      <div style="margin-top: 4px;">
        <strong style="color: #a1a1aa;">Parameters / Config:</strong>
        <pre id="drawer-node-params">{}</pre>
      </div>
    </div>
  </div>

  <div id="toast" class="toast">JSON copied to clipboard!</div>

  <script>
    const rawWorkflowJson = ${JSON.stringify(rawJson)};
    let scale = 0.85;
    let translateX = 120;
    let translateY = 100;
    let isDragging = false;
    let startX = 0, startY = 0;

    const viewport = document.getElementById("viewport");
    const world = document.getElementById("world");

    function updateTransform() {
      world.style.transform = "translate(" + translateX + "px, " + translateY + "px) scale(" + scale + ")";
    }

    viewport.addEventListener("mousedown", (e) => {
      if (e.target.closest(".workflow-node") || e.target.closest(".top-toolbar") || e.target.closest("#inspector")) return;
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      updateTransform();
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    viewport.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      const newScale = Math.min(Math.max(scale * zoomFactor, 0.2), 2.5);

      const rect = viewport.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      translateX = mouseX - (mouseX - translateX) * (newScale / scale);
      translateY = mouseY - (mouseY - translateY) * (newScale / scale);
      scale = newScale;
      updateTransform();
    }, { passive: false });

    function zoomIn() {
      scale = Math.min(scale * 1.2, 2.5);
      updateTransform();
    }
    function zoomOut() {
      scale = Math.max(scale / 1.2, 0.2);
      updateTransform();
    }
    function fitView() {
      const minX = ${minX};
      const minY = ${minY};
      const maxX = ${maxX + nodeWidth};
      const maxY = ${maxY + nodeHeight};
      const width = maxX - minX + 160;
      const height = maxY - minY + 160;

      const scaleX = (window.innerWidth - 80) / width;
      const scaleY = (window.innerHeight - 120) / height;
      scale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.2);

      translateX = (window.innerWidth - width * scale) / 2 - minX * scale;
      translateY = (window.innerHeight - height * scale) / 2 - minY * scale;
      updateTransform();
    }

    function inspectNode(name, service, category, description, paramsJson) {
      document.getElementById("drawer-node-name").innerText = name;
      document.getElementById("drawer-node-service").innerText = service || "n8n Core";
      document.getElementById("drawer-node-category").innerText = category;
      const descEl = document.getElementById("drawer-node-desc");
      const descWrap = document.getElementById("drawer-desc-wrap");
      if (description) {
        descEl.innerText = description;
        descWrap.style.display = "block";
      } else {
        descWrap.style.display = "none";
      }
      document.getElementById("drawer-node-params").innerText = paramsJson;
      document.getElementById("inspector").style.display = "flex";
    }

    function closeInspector() {
      document.getElementById("inspector").style.display = "none";
    }

    function showToast(msg) {
      const t = document.getElementById("toast");
      t.innerText = msg;
      t.style.display = "block";
      setTimeout(() => { t.style.display = "none"; }, 2000);
    }

    function copyWorkflowJson() {
      navigator.clipboard.writeText(rawWorkflowJson);
      showToast("✓ Workflow JSON copied to clipboard!");
    }

    function downloadWorkflowJson() {
      const blob = new Blob([rawWorkflowJson], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "${wf.code}.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    // Auto fit on load
    window.addEventListener("load", () => {
      fitView();
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Frame-Options": "ALLOWALL",
    },
  });
}
