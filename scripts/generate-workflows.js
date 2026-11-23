const fs = require('fs');
const path = require('path');

const metaMap = {
  'WF-01': {
    code: 'WF-01',
    name: 'Lead Ingestion & Intake Pipeline',
    category: 'Ingestion',
    description: 'Ingests Clay/webhook leads, validates required fields, deduplicates against prospects and suppression list, and initializes Step 0.',
    metricLabel: 'Total Ingested Leads',
  },
  'WF-02': {
    code: 'WF-02',
    name: 'Outreach Scheduling & Cadence Engine',
    category: 'Scheduler',
    description: 'Hourly cron that checks prospect business hours, acquires atomic worker locks, and dispatches due prospects to WF-04.',
    metricLabel: 'Active Sending Queue',
  },
  'WF-03': {
    code: 'WF-03',
    name: 'LinkedIn Account Health & Quota Guardian',
    category: 'Safety Guardrail',
    description: 'Monitors daily connection limits, weekly caps, and error rates. Instantly pauses LinkedIn and trips failover if account reaches Red health.',
    metricLabel: 'Account Health',
  },
  'WF-04': {
    code: 'WF-04',
    name: 'Multi-Channel Sequence Dispatcher',
    category: 'Execution',
    description: 'Executes 5-step outreach sequence (Step 1-5). Evaluates LinkedIn health at send time; falls back to email automatically when unhealthy.',
    metricLabel: 'Dispatched Touches',
  },
  'WF-05': {
    code: 'WF-05',
    name: 'Reply Detection & Sentiment Router',
    category: 'Inbound',
    description: 'Listens for inbound replies from GetSales and email webhooks, immediately stops further sequence touches, classifies sentiment, and handles opt-outs.',
    metricLabel: 'Replies Captured',
  },
  'WF-06': {
    code: 'WF-06',
    name: 'Daily Reports & Alerts Engine',
    category: 'Observability',
    description: 'Aggregates daily outreach metrics, sent counts, replies, and channel breakdown, transmitting summary digests to Telegram.',
    metricLabel: 'Telegram Digests',
  },
  'WF-07': {
    code: 'WF-07',
    name: 'Error Recovery',
    category: 'Resilience',
    description: 'Error Trigger → Format Error Details → Save Automation Error to Supabase → Send Telegram Alert.',
    metricLabel: 'Open Incidents',
  },
  'WF-08': {
    code: 'WF-08',
    name: 'GetSales Callback Handler + Task Monitor',
    category: 'Sync Engine',
    description: 'Flow A (Task Monitor): Schedule Trigger → Get Recent GetSales Tasks → Extract Tasks → Find Prospect → Check Task Status → Update Action Status. Flow B (LinkedIn Callback): Webhook → Find Prospect → Check Connection/Message Result → Log Successful Message or Update Connection Status → Update Prospect Progress.',
    metricLabel: 'GetSales Synced Leads',
  },
};

function parseN8n(id, rawJsonStr) {
  const raw = JSON.parse(rawJsonStr);
  const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : [];
  const rawConnections = raw.connections || {};
  const meta = metaMap[id] || {
    code: id,
    name: raw.name || id,
    category: 'Automation',
    description: 'n8n workflow',
    metricLabel: 'Status',
  };

  let minX = Infinity, minY = Infinity;
  rawNodes.forEach((n) => {
    if (Array.isArray(n.position) && n.position.length >= 2) {
      if (n.position[0] < minX) minX = n.position[0];
      if (n.position[1] < minY) minY = n.position[1];
    }
  });
  if (minX === Infinity) minX = 0;
  if (minY === Infinity) minY = 0;

  const nodes = rawNodes.map((n, idx) => {
    const typeStr = String(n.type || 'n8n-nodes-base.custom');
    const posX = Array.isArray(n.position) ? n.position[0] : 80 + idx * 280;
    const posY = Array.isArray(n.position) ? n.position[1] : 160;

    const normX = Math.round((posX - minX) * 1.35 + 80);
    const normY = Math.round((posY - minY) * 1.2 + 80);

    let category = 'logic';
    if (typeStr.includes('Trigger') || typeStr.includes('trigger') || typeStr.includes('webhook') || typeStr.includes('cron') || typeStr.includes('scheduleTrigger')) {
      category = 'trigger';
    } else if (typeStr.includes('supabase') || typeStr.includes('postgres') || typeStr.includes('database')) {
      category = 'database';
    } else if (typeStr.includes('email') || typeStr.includes('linkedin') || typeStr.includes('httpRequest') || typeStr.includes('executeWorkflow')) {
      category = 'channel';
    } else if (typeStr.includes('telegram') || typeStr.includes('slack') || typeStr.includes('alert')) {
      category = 'alert';
    } else if (typeStr.includes('code') || typeStr.includes('function')) {
      category = 'code';
    }

    const params = n.parameters || {};
    let service = typeStr.split('.').pop() || 'n8n';
    if (typeStr.includes('supabase')) service = 'Supabase';
    else if (typeStr.includes('telegram')) service = 'Telegram';
    else if (typeStr.includes('email') || typeStr.includes('gmail')) service = 'Email';
    else if (typeStr.includes('code') || typeStr.includes('function')) service = 'Code';
    else if (typeStr.includes('httpRequest')) {
      if (String(n.name).toLowerCase().includes('getsales') || JSON.stringify(params).toLowerCase().includes('getsales')) {
        service = 'GetSales API';
      } else {
        service = 'HTTP Request';
      }
    }
    else if (typeStr.includes('webhook')) service = 'Webhook';
    else if (typeStr.includes('scheduleTrigger')) service = 'Schedule';
    else if (typeStr.includes('errorTrigger')) service = 'Error Trigger';
    else if (typeStr.includes('executeWorkflow')) service = 'Sub-Workflow';
    else if (typeStr.includes('.if') || typeStr.includes('.switch')) service = 'Logic Router';

    let op = params.operation ? String(params.operation) : n.name;

    return {
      id: String(n.id || 'node-' + idx),
      name: String(n.name || 'Node ' + (idx + 1)),
      type: typeStr,
      category,
      service,
      operation: op,
      description: String(n.notes || n.name || typeStr),
      position: [normX, normY],
      parameters: params,
    };
  });

  const connections = [];
  Object.keys(rawConnections).forEach((sourceNodeName) => {
    const sourceNode = nodes.find((n) => n.name === sourceNodeName);
    if (!sourceNode) return;

    const outputs = rawConnections[sourceNodeName];
    if (outputs && typeof outputs === 'object') {
      Object.keys(outputs).forEach((outputKey) => {
        const links = outputs[outputKey];
        if (Array.isArray(links)) {
          links.forEach((group, groupIdx) => {
            if (Array.isArray(group)) {
              group.forEach((item) => {
                const targetNodeName = String(item.node || '');
                const targetNode = nodes.find((n) => n.name === targetNodeName);
                if (targetNode) {
                  let label = undefined;
                  let sourceHandle = undefined;
                  if (sourceNode.category === 'logic' || sourceNode.type.includes('.if')) {
                    if (groupIdx === 0) {
                      label = 'True / Match';
                      sourceHandle = 'output-true';
                    } else {
                      label = 'False / No Match';
                      sourceHandle = 'output-false';
                    }
                  } else if (outputKey !== 'main') {
                    label = outputKey;
                  }
                  connections.push({
                    from: sourceNode.id,
                    to: targetNode.id,
                    label,
                    sourceHandle,
                  });
                }
              });
            }
          });
        }
      });
    }
  });

  return {
    id,
    code: meta.code,
    name: meta.name,
    category: meta.category,
    description: meta.description,
    nodeCount: nodes.length,
    connectionCount: connections.length,
    nodes,
    connections,
    rawJson: rawJsonStr,
  };
}

const wfs = ['WF-01', 'WF-02', 'WF-03', 'WF-04', 'WF-05', 'WF-06', 'WF-07', 'WF-08'].map((id) => {
  const content = fs.readFileSync(path.join('public', 'workflows', id + '.json'), 'utf8');
  return parseN8n(id, content);
});

const tsContent = `// Auto-generated from official n8n workflow definitions in public/workflows/
export interface N8nNodeData {
  id: string;
  name: string;
  type: string;
  category: "trigger" | "database" | "channel" | "logic" | "alert" | "code";
  description?: string;
  status?: "active" | "success" | "warning" | "idle";
  parameters?: Record<string, unknown>;
  iconName?: string;
  service?: string;
  operation?: string;
}

export interface N8nWorkflowDefinition {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string;
  nodeCount: number;
  connectionCount: number;
  nodes: Array<{
    id: string;
    name: string;
    type: string;
    category: N8nNodeData["category"];
    service: string;
    description: string;
    operation?: string;
    position: [number, number];
    parameters?: Record<string, unknown>;
  }>;
  connections: Array<{
    from: string;
    to: string;
    label?: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  rawJson?: string;
}

export const PRESET_WORKFLOWS: N8nWorkflowDefinition[] = ${JSON.stringify(wfs, null, 2)};

/**
 * Universal n8n JSON parser:
 * Takes standard n8n exported workflow JSON format and converts it to our definition format.
 */
export function parseN8nJsonToWorkflow(
  jsonString: string,
  fallbackId = "CUSTOM-WF"
): N8nWorkflowDefinition | null {
  try {
    const raw = JSON.parse(jsonString);
    const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : [];
    const rawConnections = raw.connections || {};

    const name = raw.name || "Custom n8n Workflow";
    const id = fallbackId;

    let minX = Infinity, minY = Infinity;
    rawNodes.forEach((n: Record<string, unknown>) => {
      const pos = n.position as number[] | undefined;
      if (Array.isArray(pos) && pos.length >= 2) {
        if (pos[0] < minX) minX = pos[0];
        if (pos[1] < minY) minY = pos[1];
      }
    });
    if (minX === Infinity) minX = 0;
    if (minY === Infinity) minY = 0;

    const nodes: N8nWorkflowDefinition["nodes"] = rawNodes.map((n: Record<string, unknown>, idx: number) => {
      const typeStr = String(n.type || "n8n-nodes-base.custom");
      const pos = n.position as number[] | undefined;
      const posX = Array.isArray(pos) && pos.length >= 2 ? Number(pos[0]) : 80 + idx * 280;
      const posY = Array.isArray(pos) && pos.length >= 2 ? Number(pos[1]) : 160;

      const normX = Math.round((posX - minX) * 1.35 + 80);
      const normY = Math.round((posY - minY) * 1.2 + 80);

      let category: N8nNodeData["category"] = "logic";
      if (typeStr.includes("Trigger") || typeStr.includes("trigger") || typeStr.includes("webhook") || typeStr.includes("cron") || typeStr.includes("scheduleTrigger")) {
        category = "trigger";
      } else if (typeStr.includes("supabase") || typeStr.includes("postgres") || typeStr.includes("database")) {
        category = "database";
      } else if (typeStr.includes("email") || typeStr.includes("linkedin") || typeStr.includes("httpRequest") || typeStr.includes("executeWorkflow")) {
        category = "channel";
      } else if (typeStr.includes("telegram") || typeStr.includes("slack") || typeStr.includes("alert")) {
        category = "alert";
      } else if (typeStr.includes("code") || typeStr.includes("function")) {
        category = "code";
      }

      const params = (n.parameters as Record<string, unknown>) || {};
      let service = typeStr.split(".").pop() || "n8n";
      if (typeStr.includes("supabase")) service = "Supabase";
      else if (typeStr.includes("telegram")) service = "Telegram";
      else if (typeStr.includes("email") || typeStr.includes("gmail")) service = "Email";
      else if (typeStr.includes("code") || typeStr.includes("function")) service = "Code";
      else if (typeStr.includes("httpRequest")) {
        if (String(n.name).toLowerCase().includes("getsales") || JSON.stringify(params).toLowerCase().includes("getsales")) {
          service = "GetSales API";
        } else {
          service = "HTTP Request";
        }
      }
      else if (typeStr.includes("webhook")) service = "Webhook";
      else if (typeStr.includes("scheduleTrigger")) service = "Schedule";
      else if (typeStr.includes("errorTrigger")) service = "Error Trigger";
      else if (typeStr.includes("executeWorkflow")) service = "Sub-Workflow";
      else if (typeStr.includes(".if") || typeStr.includes(".switch")) service = "Logic Router";

      const op = params?.operation ? String(params.operation) : String(n.name || service);

      return {
        id: String(n.id || "node-" + idx),
        name: String(n.name || "Node " + (idx + 1)),
        type: typeStr,
        category,
        service,
        operation: op,
        description: String(n.notes || n.name || typeStr),
        position: [normX, normY],
        parameters: params,
      };
    });

    const connections: N8nWorkflowDefinition["connections"] = [];
    Object.keys(rawConnections).forEach((sourceNodeName) => {
      const sourceNode = nodes.find((n) => n.name === sourceNodeName);
      if (!sourceNode) return;

      const outputs = rawConnections[sourceNodeName];
      if (outputs && typeof outputs === "object") {
        Object.keys(outputs).forEach((outputKey) => {
          const links = outputs[outputKey];
          if (Array.isArray(links)) {
            links.forEach((group, groupIdx) => {
              if (Array.isArray(group)) {
                group.forEach((item: Record<string, unknown>) => {
                  const targetNodeName = String(item.node || "");
                  const targetNode = nodes.find((n) => n.name === targetNodeName);
                  if (targetNode) {
                    let label: string | undefined = undefined;
                    let sourceHandle: string | undefined = undefined;
                    if (sourceNode.category === "logic" || sourceNode.type.includes(".if")) {
                      if (groupIdx === 0) {
                        label = "True / Match";
                        sourceHandle = "output-true";
                      } else {
                        label = "False / No Match";
                        sourceHandle = "output-false";
                      }
                    } else if (outputKey !== "main") {
                      label = outputKey;
                    }
                    connections.push({
                      from: sourceNode.id,
                      to: targetNode.id,
                      label,
                      sourceHandle,
                    });
                  }
                });
              }
            });
          }
        });
      }
    });

    return {
      id,
      code: fallbackId.replace("-WF", ""),
      name,
      category: "Imported Workflow",
      description: "Imported n8n workflow (" + nodes.length + " nodes, " + connections.length + " connections)",
      nodeCount: nodes.length,
      connectionCount: connections.length,
      nodes,
      connections,
      rawJson: jsonString,
    };
  } catch (err) {
    console.error("Failed to parse n8n JSON:", err);
    return null;
  }
}
`;

fs.writeFileSync(path.join('src', 'lib', 'n8n', 'workflows-data.ts'), tsContent, 'utf8');
console.log('Successfully wrote src/lib/n8n/workflows-data.ts with ' + wfs.length + ' workflows');
