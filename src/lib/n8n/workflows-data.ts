// Auto-generated from official n8n workflow definitions in public/workflows/
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

export const PRESET_WORKFLOWS: N8nWorkflowDefinition[] = [
  {
    "id": "WF-01",
    "code": "WF-01",
    "name": "Lead Ingestion & Intake Pipeline",
    "category": "Ingestion",
    "description": "Ingests Clay/webhook leads, validates required fields, deduplicates against prospects and suppression list, and initializes Step 0.",
    "nodeCount": 13,
    "connectionCount": 14,
    "nodes": [
      {
        "id": "e701e4ef-62b1-435d-9d6d-595b40a09ded",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "category": "trigger",
        "service": "Webhook",
        "operation": "Webhook",
        "description": "Webhook",
        "position": [
          80,
          214
        ],
        "parameters": {
          "httpMethod": "POST",
          "path": "outreach-leads",
          "options": {}
        }
      },
      {
        "id": "01f9fdb7-889b-472a-ba72-14bdd7172497",
        "name": "Validate Prospect",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Validate Prospect",
        "description": "Validate Prospect",
        "position": [
          382,
          214
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "ef17ff78-f970-4360-b125-50b98be41dbd",
                "leftValue": "={{ $json.body.first_name }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              },
              {
                "id": "924b725d-c18e-426c-9d1c-ea0f3a0a30d0",
                "leftValue": "={{ $json.body.last_name }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              },
              {
                "id": "7e8aabf6-7ad2-4c9b-82b0-7867a600dc3a",
                "leftValue": "={{ $json.body.company }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "d1f31e3e-55b6-4941-a5a0-5c31c036765e",
        "name": "Prospect Already Exists?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Prospect Already Exists?",
        "description": "Prospect Already Exists?",
        "position": [
          1592,
          118
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "loose",
              "version": 4
            },
            "conditions": [
              {
                "id": "c0d87d77-c97a-4a6f-a854-b84e2e950bbc",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "exists",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "looseTypeValidation": true,
          "options": {}
        }
      },
      {
        "id": "e6c90f46-3847-45bd-addb-517f0fefcf21",
        "name": "Check Existing Prospect",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Check Existing Prospect",
        "position": [
          1290,
          118
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "matchType": "allFilters",
          "filters": {
            "conditions": [
              {
                "keyName": "email",
                "condition": "eq",
                "keyValue": "={{ $json.body.email }}"
              }
            ]
          }
        }
      },
      {
        "id": "4a2c2d84-22a9-48dd-a388-1f3d52dfaaa9",
        "name": "Prepare Prospect Data",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Prepare Prospect Data",
        "description": "Prepare Prospect Data",
        "position": [
          3406,
          253
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "\nconst lead = $('Webhook').item.json.body;\n\nreturn {\n  json: {\n    first_name: lead.first_name,\n    last_name: lead.last_name,\n    company: lead.company,\n    job_title: lead.job_title,\n    linkedin_url: lead.linkedin_url || null,\n    email: lead.email || null,\n    personalization: lead.personalization || {},\n    country: lead.country || null,\n    timezone: lead.timezone || null,\n    status: 'active',\n    current_step: 0,\n    next_send_at: new Date().toISOString(),\n    linkedin_connected: false\n  }\n};\n"
        }
      },
      {
        "id": "cbf56d43-5714-4320-aaa1-c07aa681f2a9",
        "name": "Check Existing LinkedIn",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Check Existing LinkedIn",
        "position": [
          2218,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "matchType": "allFilters",
          "filters": {
            "conditions": [
              {
                "keyName": "linkedin_url",
                "condition": "eq",
                "keyValue": "={{ $('Webhook').item.json.body.linkedin_url }}"
              }
            ]
          }
        }
      },
      {
        "id": "3000e931-dd96-43a5-ad0d-e225cf0b780f",
        "name": "LinkedIn Already Exists?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn Already Exists?",
        "description": "LinkedIn Already Exists?",
        "position": [
          2521,
          80
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "loose",
              "version": 4
            },
            "conditions": [
              {
                "id": "4b506539-36e5-46e7-bf4a-ee38a7d99d81",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "number",
                  "operation": "exists",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "looseTypeValidation": true,
          "options": {}
        }
      },
      {
        "id": "648bf17f-39aa-42c9-a84f-48ac23930566",
        "name": "Save New Prospect",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Save New Prospect",
        "description": "Save New Prospect",
        "position": [
          3709,
          253
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "first_name",
                "fieldValue": "={{ $json.first_name }}"
              },
              {
                "fieldId": "last_name",
                "fieldValue": "={{ $json.last_name }}"
              },
              {
                "fieldId": "company",
                "fieldValue": "={{ $json.company }}"
              },
              {
                "fieldId": "job_title",
                "fieldValue": "={{ $json.job_title }}"
              },
              {
                "fieldId": "linkedin_url",
                "fieldValue": "={{ $json.linkedin_url }}"
              },
              {
                "fieldId": "email",
                "fieldValue": "={{ $json.email }}"
              },
              {
                "fieldId": "personalization",
                "fieldValue": "={{ $json.personalization }}"
              },
              {
                "fieldId": "current_step",
                "fieldValue": "={{ $json.current_step }}"
              },
              {
                "fieldId": "status",
                "fieldValue": "={{ $json.status }}"
              },
              {
                "fieldId": "country",
                "fieldValue": "={{ $json.country }}"
              },
              {
                "fieldId": "timezone",
                "fieldValue": "={{ $json.timezone }}"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ $json.next_send_at }}"
              }
            ]
          }
        }
      },
      {
        "id": "9828a8bd-1a4c-4ef6-b502-eeb625db321f",
        "name": "At Least One Contact Method?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "At Least One Contact Method?",
        "description": "At Least One Contact Method?",
        "position": [
          685,
          214
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "16068005-bd98-4638-9618-3db5c74bb800",
                "leftValue": "={{ $('Webhook').item.json.body.email }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              },
              {
                "id": "015babaa-066e-4c21-9d6b-57d171374093",
                "leftValue": "={{ $('Webhook').item.json.body.linkedin_url }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "or"
          },
          "options": {}
        }
      },
      {
        "id": "e20af796-455b-4254-a71f-6c9b2d0e4a84",
        "name": "Email Available?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Email Available?",
        "description": "Email Available?",
        "position": [
          987,
          214
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "70ca3091-e334-495d-a800-1854a521b7b1",
                "leftValue": "={{ $json.body.email }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "d7d66421-d4db-44ae-8d92-b508191b1596",
        "name": "LinkedIn URL Available?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn URL Available?",
        "description": "LinkedIn URL Available?",
        "position": [
          1894,
          234
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "92b1ea39-4537-4503-b1cc-245e4a347418",
                "leftValue": "={{ $('Webhook').item.json.body.linkedin_url }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "a6f0ec85-29c5-41be-8d03-4c844ab0d2d8",
        "name": "Check Suppression List",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Check Suppression List",
        "position": [
          2802,
          253
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "suppression_list",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "email",
                "condition": "eq",
                "keyValue": "={{ $('Webhook').item.json.body.email }}"
              },
              {
                "keyName": "linkedin_url",
                "condition": "eq",
                "keyValue": "={{ $('Webhook').item.json.body.linkedin_url }}"
              }
            ]
          }
        }
      },
      {
        "id": "dad075f3-7d1e-4e44-8690-2c2516299762",
        "name": "If",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "If",
        "description": "If",
        "position": [
          3104,
          253
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "loose",
              "version": 4
            },
            "conditions": [
              {
                "id": "14b70f2b-4fdb-4523-aef2-2456ffb6b6a9",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "exists",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "looseTypeValidation": true,
          "options": {}
        }
      }
    ],
    "connections": [
      {
        "from": "e701e4ef-62b1-435d-9d6d-595b40a09ded",
        "to": "01f9fdb7-889b-472a-ba72-14bdd7172497"
      },
      {
        "from": "01f9fdb7-889b-472a-ba72-14bdd7172497",
        "to": "9828a8bd-1a4c-4ef6-b502-eeb625db321f",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "e6c90f46-3847-45bd-addb-517f0fefcf21",
        "to": "d1f31e3e-55b6-4941-a5a0-5c31c036765e"
      },
      {
        "from": "d1f31e3e-55b6-4941-a5a0-5c31c036765e",
        "to": "d7d66421-d4db-44ae-8d92-b508191b1596",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "4a2c2d84-22a9-48dd-a388-1f3d52dfaaa9",
        "to": "648bf17f-39aa-42c9-a84f-48ac23930566"
      },
      {
        "from": "cbf56d43-5714-4320-aaa1-c07aa681f2a9",
        "to": "3000e931-dd96-43a5-ad0d-e225cf0b780f"
      },
      {
        "from": "3000e931-dd96-43a5-ad0d-e225cf0b780f",
        "to": "a6f0ec85-29c5-41be-8d03-4c844ab0d2d8",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "9828a8bd-1a4c-4ef6-b502-eeb625db321f",
        "to": "e20af796-455b-4254-a71f-6c9b2d0e4a84",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "e20af796-455b-4254-a71f-6c9b2d0e4a84",
        "to": "e6c90f46-3847-45bd-addb-517f0fefcf21",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "e20af796-455b-4254-a71f-6c9b2d0e4a84",
        "to": "d7d66421-d4db-44ae-8d92-b508191b1596",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "d7d66421-d4db-44ae-8d92-b508191b1596",
        "to": "cbf56d43-5714-4320-aaa1-c07aa681f2a9",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "d7d66421-d4db-44ae-8d92-b508191b1596",
        "to": "a6f0ec85-29c5-41be-8d03-4c844ab0d2d8",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "a6f0ec85-29c5-41be-8d03-4c844ab0d2d8",
        "to": "dad075f3-7d1e-4e44-8690-2c2516299762"
      },
      {
        "from": "dad075f3-7d1e-4e44-8690-2c2516299762",
        "to": "4a2c2d84-22a9-48dd-a388-1f3d52dfaaa9",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-01 - Lead Ingestion\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"httpMethod\": \"POST\",\n        \"path\": \"outreach-leads\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.webhook\",\n      \"typeVersion\": 2.2,\n      \"position\": [\n        -288,\n        -96\n      ],\n      \"id\": \"e701e4ef-62b1-435d-9d6d-595b40a09ded\",\n      \"name\": \"Webhook\",\n      \"webhookId\": \"230b9d77-3dc4-4bdc-af71-c1e17d21395b\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"ef17ff78-f970-4360-b125-50b98be41dbd\",\n              \"leftValue\": \"={{ $json.body.first_name }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            },\n            {\n              \"id\": \"924b725d-c18e-426c-9d1c-ea0f3a0a30d0\",\n              \"leftValue\": \"={{ $json.body.last_name }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            },\n            {\n              \"id\": \"7e8aabf6-7ad2-4c9b-82b0-7867a600dc3a\",\n              \"leftValue\": \"={{ $json.body.company }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        -64,\n        -96\n      ],\n      \"id\": \"01f9fdb7-889b-472a-ba72-14bdd7172497\",\n      \"name\": \"Validate Prospect\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"loose\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"c0d87d77-c97a-4a6f-a854-b84e2e950bbc\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"exists\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"looseTypeValidation\": true,\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        832,\n        -176\n      ],\n      \"id\": \"d1f31e3e-55b6-4941-a5a0-5c31c036765e\",\n      \"name\": \"Prospect Already Exists?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"matchType\": \"allFilters\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"email\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.body.email }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        608,\n        -176\n      ],\n      \"id\": \"e6c90f46-3847-45bd-addb-517f0fefcf21\",\n      \"name\": \"Check Existing Prospect\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"\\nconst lead = $('Webhook').item.json.body;\\n\\nreturn {\\n  json: {\\n    first_name: lead.first_name,\\n    last_name: lead.last_name,\\n    company: lead.company,\\n    job_title: lead.job_title,\\n    linkedin_url: lead.linkedin_url || null,\\n    email: lead.email || null,\\n    personalization: lead.personalization || {},\\n    country: lead.country || null,\\n    timezone: lead.timezone || null,\\n    status: 'active',\\n    current_step: 0,\\n    next_send_at: new Date().toISOString(),\\n    linkedin_connected: false\\n  }\\n};\\n\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        2176,\n        -64\n      ],\n      \"id\": \"4a2c2d84-22a9-48dd-a388-1f3d52dfaaa9\",\n      \"name\": \"Prepare Prospect Data\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"matchType\": \"allFilters\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"linkedin_url\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('Webhook').item.json.body.linkedin_url }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1296,\n        -208\n      ],\n      \"id\": \"cbf56d43-5714-4320-aaa1-c07aa681f2a9\",\n      \"name\": \"Check Existing LinkedIn\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"loose\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"4b506539-36e5-46e7-bf4a-ee38a7d99d81\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"number\",\n                \"operation\": \"exists\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"looseTypeValidation\": true,\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1520,\n        -208\n      ],\n      \"id\": \"3000e931-dd96-43a5-ad0d-e225cf0b780f\",\n      \"name\": \"LinkedIn Already Exists?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"first_name\",\n              \"fieldValue\": \"={{ $json.first_name }}\"\n            },\n            {\n              \"fieldId\": \"last_name\",\n              \"fieldValue\": \"={{ $json.last_name }}\"\n            },\n            {\n              \"fieldId\": \"company\",\n              \"fieldValue\": \"={{ $json.company }}\"\n            },\n            {\n              \"fieldId\": \"job_title\",\n              \"fieldValue\": \"={{ $json.job_title }}\"\n            },\n            {\n              \"fieldId\": \"linkedin_url\",\n              \"fieldValue\": \"={{ $json.linkedin_url }}\"\n            },\n            {\n              \"fieldId\": \"email\",\n              \"fieldValue\": \"={{ $json.email }}\"\n            },\n            {\n              \"fieldId\": \"personalization\",\n              \"fieldValue\": \"={{ $json.personalization }}\"\n            },\n            {\n              \"fieldId\": \"current_step\",\n              \"fieldValue\": \"={{ $json.current_step }}\"\n            },\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"={{ $json.status }}\"\n            },\n            {\n              \"fieldId\": \"country\",\n              \"fieldValue\": \"={{ $json.country }}\"\n            },\n            {\n              \"fieldId\": \"timezone\",\n              \"fieldValue\": \"={{ $json.timezone }}\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ $json.next_send_at }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2400,\n        -64\n      ],\n      \"id\": \"648bf17f-39aa-42c9-a84f-48ac23930566\",\n      \"name\": \"Save New Prospect\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"16068005-bd98-4638-9618-3db5c74bb800\",\n              \"leftValue\": \"={{ $('Webhook').item.json.body.email }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            },\n            {\n              \"id\": \"015babaa-066e-4c21-9d6b-57d171374093\",\n              \"leftValue\": \"={{ $('Webhook').item.json.body.linkedin_url }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"or\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        160,\n        -96\n      ],\n      \"id\": \"9828a8bd-1a4c-4ef6-b502-eeb625db321f\",\n      \"name\": \"At Least One Contact Method?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"70ca3091-e334-495d-a800-1854a521b7b1\",\n              \"leftValue\": \"={{ $json.body.email }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        384,\n        -96\n      ],\n      \"id\": \"e20af796-455b-4254-a71f-6c9b2d0e4a84\",\n      \"name\": \"Email Available?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"92b1ea39-4537-4503-b1cc-245e4a347418\",\n              \"leftValue\": \"={{ $('Webhook').item.json.body.linkedin_url }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1056,\n        -80\n      ],\n      \"id\": \"d7d66421-d4db-44ae-8d92-b508191b1596\",\n      \"name\": \"LinkedIn URL Available?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"suppression_list\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"email\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('Webhook').item.json.body.email }}\"\n            },\n            {\n              \"keyName\": \"linkedin_url\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('Webhook').item.json.body.linkedin_url }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1728,\n        -64\n      ],\n      \"id\": \"a6f0ec85-29c5-41be-8d03-4c844ab0d2d8\",\n      \"name\": \"Check Suppression List\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"loose\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"14b70f2b-4fdb-4523-aef2-2456ffb6b6a9\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"exists\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"looseTypeValidation\": true,\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1952,\n        -64\n      ],\n      \"id\": \"dad075f3-7d1e-4e44-8690-2c2516299762\",\n      \"name\": \"If\"\n    }\n  ],\n  \"pinData\": {\n    \"Webhook\": [\n      {\n        \"json\": {\n          \"headers\": {\n            \"host\": \"mannam.app.n8n.cloud\",\n            \"user-agent\": \"Clay/1.0\",\n            \"content-length\": \"232\",\n            \"accept-encoding\": \"gzip, br\",\n            \"cdn-loop\": \"cloudflare; loops=1; subreqs=1\",\n            \"cf-connecting-ip\": \"32.198.57.195\",\n            \"cf-ew-via\": \"15\",\n            \"cf-ipcountry\": \"US\",\n            \"cf-ray\": \"a5e03211f8f9841f-IAD\",\n            \"cf-visitor\": \"{\\\"scheme\\\":\\\"https\\\"}\",\n            \"cf-worker\": \"n8n.cloud\",\n            \"content-type\": \"application/json\",\n            \"x-forwarded-for\": \"32.198.57.195, 104.22.100.51\",\n            \"x-forwarded-host\": \"mannam.app.n8n.cloud\",\n            \"x-forwarded-port\": \"443\",\n            \"x-forwarded-proto\": \"https\",\n            \"x-forwarded-server\": \"traefik-prod-users-gwc-59-678f9f8554-4m87n\",\n            \"x-is-trusted\": \"yes\",\n            \"x-real-ip\": \"32.198.57.195\"\n          },\n          \"params\": {},\n          \"query\": {},\n          \"body\": {\n            \"first_name\": \"Tony\",\n            \"last_name\": \"Robbins\",\n            \"company\": \"Robbins Research International\",\n            \"job_title\": \"Chairman\",\n            \"email\": \"tony@tonyrobbins.com\",\n            \"linkedin_url\": \"https://www.linkedin.com/in/officialtonyrobbins/\",\n            \"country\": \"United States\"\n          },\n          \"webhookUrl\": \"https://mannam.app.n8n.cloud/webhook-test/outreach-leads\",\n          \"executionMode\": \"test\"\n        },\n        \"pairedItem\": {\n          \"item\": 0\n        }\n      }\n    ]\n  },\n  \"connections\": {\n    \"Webhook\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Validate Prospect\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Validate Prospect\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"At Least One Contact Method?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Check Existing Prospect\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prospect Already Exists?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prospect Already Exists?\": {\n      \"main\": [\n        [],\n        [\n          {\n            \"node\": \"LinkedIn URL Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare Prospect Data\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Save New Prospect\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Check Existing LinkedIn\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"LinkedIn Already Exists?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn Already Exists?\": {\n      \"main\": [\n        [],\n        [\n          {\n            \"node\": \"Check Suppression List\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"At Least One Contact Method?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Email Available?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Check Existing Prospect\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"LinkedIn URL Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn URL Available?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Check Existing LinkedIn\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Check Suppression List\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Check Suppression List\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"If\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"If\": {\n      \"main\": [\n        [],\n        [\n          {\n            \"node\": \"Prepare Prospect Data\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": true,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"d8b74df5-1220-4123-8de4-0503774c17bf\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"rNiyLwzPkJ7KOGqY\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-02",
    "code": "WF-02",
    "name": "Outreach Scheduling & Cadence Engine",
    "category": "Scheduler",
    "description": "Hourly cron that checks prospect business hours, acquires atomic worker locks, and dispatches due prospects to WF-04.",
    "nodeCount": 4,
    "connectionCount": 2,
    "nodes": [
      {
        "id": "8af6b2c3-88e6-4d76-bda6-8cd7269d049a",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "category": "trigger",
        "service": "Schedule",
        "operation": "Schedule Trigger",
        "description": "Schedule Trigger",
        "position": [
          80,
          80
        ],
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "minutes"
              }
            ]
          }
        }
      },
      {
        "id": "234caeb5-23dc-4062-a8c6-d2cc7ce19a85",
        "name": "Run Outreach Sender",
        "type": "n8n-nodes-base.executeWorkflow",
        "category": "channel",
        "service": "Sub-Workflow",
        "operation": "Run Outreach Sender",
        "description": "Run Outreach Sender",
        "position": [
          685,
          80
        ],
        "parameters": {
          "workflowId": {
            "__rl": true,
            "value": "1TlecjdgfEqqsqQC",
            "mode": "list",
            "cachedResultUrl": "/workflow/1TlecjdgfEqqsqQC",
            "cachedResultName": "WF-04 - Outreach Sender"
          },
          "workflowInputs": {
            "mappingMode": "defineBelow",
            "value": {},
            "matchingColumns": [],
            "schema": [],
            "attemptToConvertTypes": false,
            "convertFieldsToString": true
          },
          "mode": "each",
          "options": {
            "waitForSubWorkflow": true
          }
        }
      },
      {
        "id": "01cccd08-8801-457c-81c5-6c6c16f5d414",
        "name": "Within Business Hours?",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Within Business Hours?",
        "description": "Within Business Hours?",
        "position": [
          80,
          349
        ],
        "parameters": {
          "jsCode": "const prospect = $input.item.json;\n\n// Simulate Monday at 10 AM\nconst testDay = 'Mon';\nconst testHour = 10;\n\nconst allowed =\n  !['Sat', 'Sun'].includes(testDay) &&\n  testHour >= 9 &&\n  testHour < 17;\n\nreturn allowed ? { json: prospect } : [];"
        }
      },
      {
        "id": "b20ac68f-ecfd-4e7b-b7cb-80651bfe338a",
        "name": "Claim Due Prospects",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "Claim Due Prospects",
        "description": "Claim Due Prospects",
        "position": [
          382,
          80
        ],
        "parameters": {
          "method": "POST",
          "url": "https://wwimtwtynhssvpasbdjg.supabase.co/rest/v1/rpc/claim_due_prospects",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "apikey",
                "value": "YOUR_SUPABASE_SERVICE_ROLE_KEY"
              },
              {
                "name": "Authorization",
                "value": "Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "{\n  \"p_limit\": 50\n}",
          "options": {}
        }
      }
    ],
    "connections": [
      {
        "from": "8af6b2c3-88e6-4d76-bda6-8cd7269d049a",
        "to": "b20ac68f-ecfd-4e7b-b7cb-80651bfe338a"
      },
      {
        "from": "b20ac68f-ecfd-4e7b-b7cb-80651bfe338a",
        "to": "234caeb5-23dc-4062-a8c6-d2cc7ce19a85"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-02 — Outreach Scheduler\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"rule\": {\n          \"interval\": [\n            {\n              \"field\": \"minutes\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.scheduleTrigger\",\n      \"typeVersion\": 1.4,\n      \"position\": [\n        0,\n        -160\n      ],\n      \"id\": \"8af6b2c3-88e6-4d76-bda6-8cd7269d049a\",\n      \"name\": \"Schedule Trigger\"\n    },\n    {\n      \"parameters\": {\n        \"workflowId\": {\n          \"__rl\": true,\n          \"value\": \"1TlecjdgfEqqsqQC\",\n          \"mode\": \"list\",\n          \"cachedResultUrl\": \"/workflow/1TlecjdgfEqqsqQC\",\n          \"cachedResultName\": \"WF-04 - Outreach Sender\"\n        },\n        \"workflowInputs\": {\n          \"mappingMode\": \"defineBelow\",\n          \"value\": {},\n          \"matchingColumns\": [],\n          \"schema\": [],\n          \"attemptToConvertTypes\": false,\n          \"convertFieldsToString\": true\n        },\n        \"mode\": \"each\",\n        \"options\": {\n          \"waitForSubWorkflow\": true\n        }\n      },\n      \"type\": \"n8n-nodes-base.executeWorkflow\",\n      \"typeVersion\": 1.4,\n      \"position\": [\n        448,\n        -160\n      ],\n      \"id\": \"234caeb5-23dc-4062-a8c6-d2cc7ce19a85\",\n      \"name\": \"Run Outreach Sender\"\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const prospect = $input.item.json;\\n\\n// Simulate Monday at 10 AM\\nconst testDay = 'Mon';\\nconst testHour = 10;\\n\\nconst allowed =\\n  !['Sat', 'Sun'].includes(testDay) &&\\n  testHour >= 9 &&\\n  testHour < 17;\\n\\nreturn allowed ? { json: prospect } : [];\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        0,\n        64\n      ],\n      \"id\": \"01cccd08-8801-457c-81c5-6c6c16f5d414\",\n      \"name\": \"Within Business Hours?\",\n      \"alwaysOutputData\": true\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"https://wwimtwtynhssvpasbdjg.supabase.co/rest/v1/rpc/claim_due_prospects\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"apikey\",\n              \"value\": \"YOUR_SUPABASE_SERVICE_ROLE_KEY\"\n            },\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_SUPABASE_SERVICE_ROLE_KEY\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"{\\n  \\\"p_limit\\\": 50\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        224,\n        -160\n      ],\n      \"id\": \"b20ac68f-ecfd-4e7b-b7cb-80651bfe338a\",\n      \"name\": \"Claim Due Prospects\"\n    }\n  ],\n  \"pinData\": {},\n  \"connections\": {\n    \"Schedule Trigger\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Claim Due Prospects\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Within Business Hours?\": {\n      \"main\": [\n        []\n      ]\n    },\n    \"Claim Due Prospects\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Run Outreach Sender\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": false,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"de9a0b71-4ded-49c1-aea2-518cf783542d\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"bgG2Z2dOMiHYvHEC\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-03",
    "code": "WF-03",
    "name": "LinkedIn Account Health & Quota Guardian",
    "category": "Safety Guardrail",
    "description": "Monitors daily connection limits, weekly caps, and error rates. Instantly pauses LinkedIn and trips failover if account reaches Red health.",
    "nodeCount": 12,
    "connectionCount": 12,
    "nodes": [
      {
        "id": "15d24aac-9db2-44ef-a81c-f3527967ff0d",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "category": "trigger",
        "service": "Schedule",
        "operation": "Schedule Trigger",
        "description": "Schedule Trigger",
        "position": [
          80,
          195
        ],
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "hours"
              }
            ]
          }
        }
      },
      {
        "id": "e1ec02ea-9b7c-48b4-ad30-7ce7cf83438b",
        "name": "Get Outreach Config",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get Outreach Config",
        "position": [
          685,
          195
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_config",
          "limit": 1
        }
      },
      {
        "id": "71681b78-9ac0-4dff-8af5-3cccc3a773f2",
        "name": "LinkedIn Health Red?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn Health Red?",
        "description": "LinkedIn Health Red?",
        "position": [
          2802,
          195
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "5496c0d8-ea13-4e86-a19d-fd5dd89fdc2a",
                "leftValue": "={{ $json.health_state }}",
                "rightValue": "red",
                "operator": {
                  "type": "string",
                  "operation": "equals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "dae199a4-8c4d-43f9-a3e4-7d221e88a5a5",
        "name": "Send Health Alert",
        "type": "n8n-nodes-base.telegram",
        "category": "alert",
        "service": "Telegram",
        "operation": "Send Health Alert",
        "description": "Send Health Alert",
        "position": [
          3104,
          195
        ],
        "parameters": {
          "chatId": "-1003811814921",
          "text": "=🚨 LINKEDIN ACCOUNT HEALTH ALERT  Account: {{ $json.account_name }} Health: RED  LinkedIn activity is paused. Please check the account for restrictions before resuming.",
          "additionalFields": {}
        }
      },
      {
        "id": "02f7ebf8-7dba-4f79-a343-be9dd9fc4bec",
        "name": "Prepare & Match LinkedIn Accounts",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Prepare & Match LinkedIn Accounts",
        "description": "Prepare & Match LinkedIn Accounts",
        "position": [
          987,
          195
        ],
        "parameters": {
          "jsCode": "const response = $('Get GetSales LinkedIn Accounts').first().json;\nconst accounts = response.data || [];\n\nconst config = $('Get Outreach Config').first().json.config.linkedin;\n\nreturn accounts.map(account => ({\n  json: {\n    getsales_account_uuid: account.uuid,\n    account_name: account.nickname || 'Unknown Account',\n    getsales_data: account,\n    config\n  }\n}));"
        }
      },
      {
        "id": "883b40a2-23cd-48d4-9ef4-3d71d66fb412",
        "name": "Get GetSales LinkedIn Accounts",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "Get GetSales LinkedIn Accounts",
        "description": "Get GetSales LinkedIn Accounts",
        "position": [
          382,
          195
        ],
        "parameters": {
          "url": "https://amazing.getsales.io/flows/api/linkedin-accounts",
          "sendQuery": true,
          "queryParameters": {
            "parameters": [
              {
                "name": "limit",
                "value": "100"
              }
            ]
          },
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              }
            ]
          },
          "options": {}
        }
      },
      {
        "id": "3eeada12-e873-45c7-9174-130e866e9c84",
        "name": "Find Existing LinkedIn Account",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Find Existing LinkedIn Account",
        "position": [
          1290,
          195
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "linkedin_accounts",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "getsales_account_uuid",
                "condition": "eq",
                "keyValue": "={{ $json.getsales_account_uuid }}"
              }
            ]
          }
        }
      },
      {
        "id": "18950116-bf7b-4d7d-9951-5ed38f70798b",
        "name": "Account Already Exists?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Account Already Exists?",
        "description": "Account Already Exists?",
        "position": [
          1592,
          195
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "700a1df4-1c01-4f7c-95f2-8b74a8badd84",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "861788ed-99be-4fcd-aca6-3b02744cfc94",
        "name": "Create New LinkedIn Account",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Create New LinkedIn Account",
        "description": "Create New LinkedIn Account",
        "position": [
          1894,
          310
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "linkedin_accounts",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "account_name",
                "fieldValue": "={{ $('Prepare & Match LinkedIn Accounts').item.json.account_name }}"
              },
              {
                "fieldId": "getsales_account_uuid",
                "fieldValue": "={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_account_uuid }}"
              },
              {
                "fieldId": "getsales_data",
                "fieldValue": "={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_data }}"
              }
            ]
          }
        }
      },
      {
        "id": "00532aca-b0a9-4cc5-b399-caee00282fc3",
        "name": "Update Existing LinkedIn Account",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update Existing LinkedIn Account",
        "position": [
          1894,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "linkedin_accounts",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('Find Existing LinkedIn Account').item.json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "account_name",
                "fieldValue": "={{ $('Prepare & Match LinkedIn Accounts').item.json.account_name }}"
              },
              {
                "fieldId": "getsales_account_uuid",
                "fieldValue": "={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_account_uuid }}"
              },
              {
                "fieldId": "getsales_data",
                "fieldValue": "={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_data }}"
              },
              {
                "fieldId": "updated_at",
                "fieldValue": "={{ $now.toISO() }}"
              }
            ]
          }
        }
      },
      {
        "id": "e3a811b1-a04a-48d2-9a5e-bfd1a3a86425",
        "name": "Evaluate LinkedIn Health",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Evaluate LinkedIn Health",
        "description": "Evaluate LinkedIn Health",
        "position": [
          2197,
          195
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const account = $json;\nconst config = $('Get Outreach Config').first().json.config.linkedin;\n\nconst restricted = account.restriction_detected === true;\n\nconst red =\n  restricted ||\n  account.sent_today >= config.max_daily_requests ||\n  account.sent_this_week >= config.max_weekly_requests;\n\nconst yellow =\n  account.pending_invites >= config.max_pending_invites ||\n  account.acceptance_rate < config.min_acceptance_rate;\n\nlet health_state = 'green';\n\nif (red) health_state = 'red';\nelse if (yellow) health_state = 'yellow';\n\nreturn {\n  json: {\n    id: account.id,\n    account_name: account.account_name,\n    health_state,\n    restriction_detected: restricted,\n    updated_at: new Date().toISOString()\n  }\n};"
        }
      },
      {
        "id": "ef0a1fa5-3474-4fc9-9260-06304719cbeb",
        "name": "Update LinkedIn Health",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update LinkedIn Health",
        "position": [
          2499,
          195
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "linkedin_accounts",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "health_state",
                "fieldValue": "={{ $json.health_state }}"
              },
              {
                "fieldId": "restriction_detected",
                "fieldValue": "={{ $json.restriction_detected }}"
              },
              {
                "fieldId": "updated_at",
                "fieldValue": "={{ $json.updated_at }}"
              }
            ]
          }
        }
      }
    ],
    "connections": [
      {
        "from": "15d24aac-9db2-44ef-a81c-f3527967ff0d",
        "to": "883b40a2-23cd-48d4-9ef4-3d71d66fb412"
      },
      {
        "from": "e1ec02ea-9b7c-48b4-ad30-7ce7cf83438b",
        "to": "02f7ebf8-7dba-4f79-a343-be9dd9fc4bec"
      },
      {
        "from": "71681b78-9ac0-4dff-8af5-3cccc3a773f2",
        "to": "dae199a4-8c4d-43f9-a3e4-7d221e88a5a5",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "02f7ebf8-7dba-4f79-a343-be9dd9fc4bec",
        "to": "3eeada12-e873-45c7-9174-130e866e9c84"
      },
      {
        "from": "883b40a2-23cd-48d4-9ef4-3d71d66fb412",
        "to": "e1ec02ea-9b7c-48b4-ad30-7ce7cf83438b"
      },
      {
        "from": "3eeada12-e873-45c7-9174-130e866e9c84",
        "to": "18950116-bf7b-4d7d-9951-5ed38f70798b"
      },
      {
        "from": "18950116-bf7b-4d7d-9951-5ed38f70798b",
        "to": "00532aca-b0a9-4cc5-b399-caee00282fc3",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "18950116-bf7b-4d7d-9951-5ed38f70798b",
        "to": "861788ed-99be-4fcd-aca6-3b02744cfc94",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "00532aca-b0a9-4cc5-b399-caee00282fc3",
        "to": "e3a811b1-a04a-48d2-9a5e-bfd1a3a86425"
      },
      {
        "from": "e3a811b1-a04a-48d2-9a5e-bfd1a3a86425",
        "to": "ef0a1fa5-3474-4fc9-9260-06304719cbeb"
      },
      {
        "from": "861788ed-99be-4fcd-aca6-3b02744cfc94",
        "to": "e3a811b1-a04a-48d2-9a5e-bfd1a3a86425"
      },
      {
        "from": "ef0a1fa5-3474-4fc9-9260-06304719cbeb",
        "to": "71681b78-9ac0-4dff-8af5-3cccc3a773f2"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-03 - LinkedIn Health Monitor\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"rule\": {\n          \"interval\": [\n            {\n              \"field\": \"hours\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.scheduleTrigger\",\n      \"typeVersion\": 1.4,\n      \"position\": [\n        -16,\n        -160\n      ],\n      \"id\": \"15d24aac-9db2-44ef-a81c-f3527967ff0d\",\n      \"name\": \"Schedule Trigger\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_config\",\n        \"limit\": 1\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        432,\n        -160\n      ],\n      \"id\": \"e1ec02ea-9b7c-48b4-ad30-7ce7cf83438b\",\n      \"name\": \"Get Outreach Config\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"5496c0d8-ea13-4e86-a19d-fd5dd89fdc2a\",\n              \"leftValue\": \"={{ $json.health_state }}\",\n              \"rightValue\": \"red\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"equals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        2000,\n        -160\n      ],\n      \"id\": \"71681b78-9ac0-4dff-8af5-3cccc3a773f2\",\n      \"name\": \"LinkedIn Health Red?\"\n    },\n    {\n      \"parameters\": {\n        \"chatId\": \"-1003811814921\",\n        \"text\": \"=🚨 LINKEDIN ACCOUNT HEALTH ALERT  Account: {{ $json.account_name }} Health: RED  LinkedIn activity is paused. Please check the account for restrictions before resuming.\",\n        \"additionalFields\": {}\n      },\n      \"type\": \"n8n-nodes-base.telegram\",\n      \"typeVersion\": 1.2,\n      \"position\": [\n        2224,\n        -160\n      ],\n      \"id\": \"dae199a4-8c4d-43f9-a3e4-7d221e88a5a5\",\n      \"name\": \"Send Health Alert\",\n      \"webhookId\": \"4c5b2d56-c2bb-4a29-b509-f77139c1cf9a\",\n      \"credentials\": {\n        \"telegramApi\": {\n          \"id\": \"8NYHi7lgI6qzk4IP\",\n          \"name\": \"Telegram account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const response = $('Get GetSales LinkedIn Accounts').first().json;\\nconst accounts = response.data || [];\\n\\nconst config = $('Get Outreach Config').first().json.config.linkedin;\\n\\nreturn accounts.map(account => ({\\n  json: {\\n    getsales_account_uuid: account.uuid,\\n    account_name: account.nickname || 'Unknown Account',\\n    getsales_data: account,\\n    config\\n  }\\n}));\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        656,\n        -160\n      ],\n      \"id\": \"02f7ebf8-7dba-4f79-a343-be9dd9fc4bec\",\n      \"name\": \"Prepare & Match LinkedIn Accounts\"\n    },\n    {\n      \"parameters\": {\n        \"url\": \"https://amazing.getsales.io/flows/api/linkedin-accounts\",\n        \"sendQuery\": true,\n        \"queryParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"limit\",\n              \"value\": \"100\"\n            }\n          ]\n        },\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            }\n          ]\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        208,\n        -160\n      ],\n      \"id\": \"883b40a2-23cd-48d4-9ef4-3d71d66fb412\",\n      \"name\": \"Get GetSales LinkedIn Accounts\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"linkedin_accounts\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"getsales_account_uuid\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.getsales_account_uuid }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        880,\n        -160\n      ],\n      \"id\": \"3eeada12-e873-45c7-9174-130e866e9c84\",\n      \"name\": \"Find Existing LinkedIn Account\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"700a1df4-1c01-4f7c-95f2-8b74a8badd84\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1104,\n        -160\n      ],\n      \"id\": \"18950116-bf7b-4d7d-9951-5ed38f70798b\",\n      \"name\": \"Account Already Exists?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"linkedin_accounts\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"account_name\",\n              \"fieldValue\": \"={{ $('Prepare & Match LinkedIn Accounts').item.json.account_name }}\"\n            },\n            {\n              \"fieldId\": \"getsales_account_uuid\",\n              \"fieldValue\": \"={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_account_uuid }}\"\n            },\n            {\n              \"fieldId\": \"getsales_data\",\n              \"fieldValue\": \"={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_data }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1328,\n        -64\n      ],\n      \"id\": \"861788ed-99be-4fcd-aca6-3b02744cfc94\",\n      \"name\": \"Create New LinkedIn Account\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"linkedin_accounts\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('Find Existing LinkedIn Account').item.json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"account_name\",\n              \"fieldValue\": \"={{ $('Prepare & Match LinkedIn Accounts').item.json.account_name }}\"\n            },\n            {\n              \"fieldId\": \"getsales_account_uuid\",\n              \"fieldValue\": \"={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_account_uuid }}\"\n            },\n            {\n              \"fieldId\": \"getsales_data\",\n              \"fieldValue\": \"={{ $('Prepare & Match LinkedIn Accounts').item.json.getsales_data }}\"\n            },\n            {\n              \"fieldId\": \"updated_at\",\n              \"fieldValue\": \"={{ $now.toISO() }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1328,\n        -256\n      ],\n      \"id\": \"00532aca-b0a9-4cc5-b399-caee00282fc3\",\n      \"name\": \"Update Existing LinkedIn Account\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"const account = $json;\\nconst config = $('Get Outreach Config').first().json.config.linkedin;\\n\\nconst restricted = account.restriction_detected === true;\\n\\nconst red =\\n  restricted ||\\n  account.sent_today >= config.max_daily_requests ||\\n  account.sent_this_week >= config.max_weekly_requests;\\n\\nconst yellow =\\n  account.pending_invites >= config.max_pending_invites ||\\n  account.acceptance_rate < config.min_acceptance_rate;\\n\\nlet health_state = 'green';\\n\\nif (red) health_state = 'red';\\nelse if (yellow) health_state = 'yellow';\\n\\nreturn {\\n  json: {\\n    id: account.id,\\n    account_name: account.account_name,\\n    health_state,\\n    restriction_detected: restricted,\\n    updated_at: new Date().toISOString()\\n  }\\n};\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        1552,\n        -160\n      ],\n      \"id\": \"e3a811b1-a04a-48d2-9a5e-bfd1a3a86425\",\n      \"name\": \"Evaluate LinkedIn Health\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"linkedin_accounts\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"health_state\",\n              \"fieldValue\": \"={{ $json.health_state }}\"\n            },\n            {\n              \"fieldId\": \"restriction_detected\",\n              \"fieldValue\": \"={{ $json.restriction_detected }}\"\n            },\n            {\n              \"fieldId\": \"updated_at\",\n              \"fieldValue\": \"={{ $json.updated_at }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1776,\n        -160\n      ],\n      \"id\": \"ef0a1fa5-3474-4fc9-9260-06304719cbeb\",\n      \"name\": \"Update LinkedIn Health\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    }\n  ],\n  \"pinData\": {},\n  \"connections\": {\n    \"Schedule Trigger\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get GetSales LinkedIn Accounts\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Outreach Config\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prepare & Match LinkedIn Accounts\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn Health Red?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Send Health Alert\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare & Match LinkedIn Accounts\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Find Existing LinkedIn Account\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get GetSales LinkedIn Accounts\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Outreach Config\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Find Existing LinkedIn Account\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Account Already Exists?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Account Already Exists?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update Existing LinkedIn Account\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Create New LinkedIn Account\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Update Existing LinkedIn Account\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Evaluate LinkedIn Health\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Evaluate LinkedIn Health\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update LinkedIn Health\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Create New LinkedIn Account\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Evaluate LinkedIn Health\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Update LinkedIn Health\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"LinkedIn Health Red?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": false,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"c307fed4-6692-416b-85fc-4fa1ec653b80\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"TbPYDiSpLarJQmvJ\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-04",
    "code": "WF-04",
    "name": "Multi-Channel Sequence Dispatcher",
    "category": "Execution",
    "description": "Executes 5-step outreach sequence (Step 1-5). Evaluates LinkedIn health at send time; falls back to email automatically when unhealthy.",
    "nodeCount": 47,
    "connectionCount": 52,
    "nodes": [
      {
        "id": "93423ad3-c5c2-4da5-903f-e04c9aa6b7d7",
        "name": "When Executed by Another Workflow",
        "type": "n8n-nodes-base.executeWorkflowTrigger",
        "category": "trigger",
        "service": "Sub-Workflow",
        "operation": "When Executed by Another Workflow",
        "description": "When Executed by Another Workflow",
        "position": [
          80,
          560
        ],
        "parameters": {
          "inputSource": "passthrough"
        }
      },
      {
        "id": "a12c5cb5-fbbd-42dc-a543-16c879447a35",
        "name": "Get LinkedIn Account Health",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get LinkedIn Account Health",
        "position": [
          1592,
          790
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "linkedin_accounts",
          "limit": 1
        }
      },
      {
        "id": "b88e53f9-1fef-46d1-a3a7-4d40928c3f7f",
        "name": "LinkedIn URL Available?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn URL Available?",
        "description": "LinkedIn URL Available?",
        "position": [
          2672,
          714
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "e787dbfd-f3ee-4c7f-b605-054570a74b14",
                "leftValue": "={{ $('When Executed by Another Workflow').item.json.linkedin_url }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "975a1753-7ee1-4d67-b6ba-b51c22012649",
        "name": "LinkedIn Account Red?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn Account Red?",
        "description": "LinkedIn Account Red?",
        "position": [
          1916,
          790
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "5496c0d8-ea13-4e86-a19d-fd5dd89fdc2a",
                "leftValue": "={{ $json.health_state }}",
                "rightValue": "green",
                "operator": {
                  "type": "string",
                  "operation": "notEquals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "name": "Email Available?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Email Available?",
        "description": "Email Available?",
        "position": [
          2996,
          368
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "694eb292-9c71-4df8-ba4a-4b02b5316c8e",
                "leftValue": "={{ $('When Executed by Another Workflow').item.json.email }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "295f0742-25ba-4ff7-a9c8-76a707e24790",
        "name": "LinkedIn Already Connected?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn Already Connected?",
        "description": "LinkedIn Already Connected?",
        "position": [
          2996,
          886
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "92981f2e-c130-4a17-8f01-96a52f90fe03",
                "leftValue": "={{ $('When Executed by Another Workflow').item.json.linkedin_connected }}",
                "rightValue": "",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "name": "Route Outreach Step",
        "type": "n8n-nodes-base.switch",
        "category": "logic",
        "service": "switch",
        "operation": "Route Outreach Step",
        "description": "Route Outreach Step",
        "position": [
          2240,
          752
        ],
        "parameters": {
          "rules": {
            "values": [
              {
                "conditions": {
                  "options": {
                    "caseSensitive": true,
                    "leftValue": "",
                    "typeValidation": "strict",
                    "version": 4
                  },
                  "conditions": [
                    {
                      "leftValue": "={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}",
                      "rightValue": 1,
                      "operator": {
                        "type": "number",
                        "operation": "equals"
                      },
                      "id": "4062b169-2325-40a9-bfbd-0bd9cc6d6b60"
                    }
                  ],
                  "combinator": "and"
                },
                "renameOutput": true,
                "outputKey": "1"
              },
              {
                "conditions": {
                  "options": {
                    "caseSensitive": true,
                    "leftValue": "",
                    "typeValidation": "strict",
                    "version": 4
                  },
                  "conditions": [
                    {
                      "id": "840f89c0-af03-4787-9a70-b7c9be45fee6",
                      "leftValue": "={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}",
                      "rightValue": 2,
                      "operator": {
                        "type": "number",
                        "operation": "equals"
                      }
                    }
                  ],
                  "combinator": "and"
                },
                "renameOutput": true,
                "outputKey": "2"
              },
              {
                "conditions": {
                  "options": {
                    "caseSensitive": true,
                    "leftValue": "",
                    "typeValidation": "strict",
                    "version": 4
                  },
                  "conditions": [
                    {
                      "id": "e2fae26d-4f95-4a91-b81e-01105f6e7922",
                      "leftValue": "={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}",
                      "rightValue": 3,
                      "operator": {
                        "type": "number",
                        "operation": "equals"
                      }
                    }
                  ],
                  "combinator": "and"
                },
                "renameOutput": true,
                "outputKey": "3"
              },
              {
                "conditions": {
                  "options": {
                    "caseSensitive": true,
                    "leftValue": "",
                    "typeValidation": "strict",
                    "version": 4
                  },
                  "conditions": [
                    {
                      "id": "df2348f7-85bb-49fc-9a18-3d3e296930fd",
                      "leftValue": "={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}",
                      "rightValue": 4,
                      "operator": {
                        "type": "number",
                        "operation": "equals"
                      }
                    }
                  ],
                  "combinator": "and"
                },
                "renameOutput": true,
                "outputKey": "4"
              },
              {
                "conditions": {
                  "options": {
                    "caseSensitive": true,
                    "leftValue": "",
                    "typeValidation": "strict",
                    "version": 4
                  },
                  "conditions": [
                    {
                      "id": "007b030e-0c8e-4dc4-b660-6ba280a9eb03",
                      "leftValue": "={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}",
                      "operator": {
                        "type": "number",
                        "operation": "equals"
                      }
                    }
                  ],
                  "combinator": "and"
                },
                "renameOutput": true,
                "outputKey": "5"
              }
            ]
          },
          "options": {}
        }
      },
      {
        "id": "893de109-a69a-4de8-9df2-4dcdb8d37d53",
        "name": "LinkedIn Already Connected for Message Steps?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "LinkedIn Already Connected for Message Steps?",
        "description": "LinkedIn Already Connected for Message Steps?",
        "position": [
          2629,
          1002
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "e16d1f37-7439-4938-99bb-922d0f92ac17",
                "leftValue": "={{ $('When Executed by Another Workflow').item.json.linkedin_connected }}",
                "rightValue": "",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "ca3ba26e-c84b-4186-9e16-860ec517fe5b",
        "name": "Send a message",
        "type": "n8n-nodes-base.gmail",
        "category": "logic",
        "service": "gmail",
        "operation": "Send a message",
        "description": "Send a message",
        "position": [
          4184,
          349
        ],
        "parameters": {
          "sendTo": "={{ $json.email }}",
          "subject": "={{ $json.subject }}",
          "message": "={{ $json.message }}",
          "options": {
            "senderName": "={{ $json.sender_name }}"
          }
        }
      },
      {
        "id": "84e1917b-4bf7-4551-9e9c-73a556c23b1d",
        "name": "Prepare Email Content",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Prepare Email Content",
        "description": "Prepare Email Content",
        "position": [
          3925,
          349
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "\nconst prospect = $('When Executed by Another Workflow').item.json;\nconst settings = $input.item.json;\nconst linkedinHealth = $('Get LinkedIn Account Health').first().json.health_state;\n\nconst fallbackMetadata = ['yellow', 'red'].includes(linkedinHealth)\n  ? {\n      fallback_reason: 'linkedin_health',\n      linkedin_health: linkedinHealth,\n      original_channel: 'linkedin',\n      actual_channel: 'email'\n    }\n  : {};\n\nconst step = Number(prospect.current_step) + 1;\nconst firstName = prospect.first_name || 'there';\nconst company = prospect.company || 'your company';\n\nconst senderName = settings.sender_name || 'Outreach Team';\nconst businessName = settings.business_name || 'Your Company';\nconst senderEmail = settings.sender_email || 'your-business@email.com';\nconst unsubscribeUrl = settings.unsubscribe_url || 'https://your-domain.com/unsubscribe';\n\nconst scheduling = settings.config.scheduling;\nif (!scheduling) {\n  throw new Error('Scheduling configuration not found');\n}\n\nconst timezone = prospect.timezone || scheduling.default_timezone;\nconst minDays = Number(scheduling.delay_business_days_min);\nconst maxDays = Number(scheduling.delay_business_days_max);\nconst startHour = Number(scheduling.business_start_hour);\n\nif (!timezone || minDays < 1 || maxDays < minDays) {\n  throw new Error('Invalid scheduling configuration');\n}\n\nconst templates = {\n  1: {\n    subject: `Quick introduction for ${company}`,\n    message: `Hi ${firstName},<br><br>\nI wanted to connect and introduce myself. I came across ${company} and thought there might be an opportunity for us to connect.<br><br>\nWould you be open to a brief conversation?`\n  },\n  2: {\n    subject: `Exploring an opportunity with ${company}`,\n    message: `Hi ${firstName},<br><br>\nI wanted to follow up and explore whether our services could be relevant to ${company}.<br><br>\nWould you be available for a short conversation?`\n  },\n  3: {\n    subject: `Following up, ${firstName}`,\n    message: `Hi ${firstName},<br><br>\nI wanted to follow up on my previous email and see if this is something worth discussing.<br><br>\nI'd be happy to share more details.`\n  },\n  4: {\n    subject: `Any thoughts, ${firstName}?`,\n    message: `Hi ${firstName},<br><br>\nJust checking whether you had a chance to consider my previous message.<br><br>\nWould a brief discussion be useful?`\n  },\n  5: {\n    subject: `Closing the loop, ${firstName}`,\n    message: `Hi ${firstName},<br><br>\nI understand this may not be a priority right now. I'll close the loop here, but you're welcome to reach out if things change.`\n  }\n};\n\nconst template = templates[step];\nif (!template) throw new Error(`No email template found for step ${step}`);\n\nfunction getLocalParts(date, zone) {\n  const parts = new Intl.DateTimeFormat('en-US', {\n    timeZone: zone,\n    year: 'numeric',\n    month: 'numeric',\n    day: 'numeric'\n  }).formatToParts(date);\n\n  const result = {};\n  for (const part of parts) {\n    if (part.type !== 'literal') result[part.type] = Number(part.value);\n  }\n  return result;\n}\n\nfunction localTimeToUTC(year, month, day, hour, zone) {\n  const target = Date.UTC(year, month - 1, day, hour);\n  let guess = target;\n\n  for (let i = 0; i < 4; i++) {\n    const local = new Intl.DateTimeFormat('en-US', {\n      timeZone: zone,\n      year: 'numeric',\n      month: 'numeric',\n      day: 'numeric',\n      hour: 'numeric',\n      hourCycle: 'h23'\n    }).formatToParts(new Date(guess));\n\n    const p = {};\n    for (const part of local) {\n      if (part.type !== 'literal') p[part.type] = Number(part.value);\n    }\n\n    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour);\n    guess += target - represented;\n  }\n\n  return new Date(guess);\n}\n\nfunction calculateNextSend() {\n  const delay = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;\n  const now = new Date();\n  const local = getLocalParts(now, timezone);\n\n  const date = new Date(Date.UTC(local.year, local.month - 1, local.day));\n  let added = 0;\n\n  while (added < delay) {\n    date.setUTCDate(date.getUTCDate() + 1);\n    const day = date.getUTCDay();\n\n    if (day !== 0 && day !== 6) added++;\n  }\n\n  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {\n    date.setUTCDate(date.getUTCDate() + 1);\n  }\n\n  return localTimeToUTC(\n    date.getUTCFullYear(),\n    date.getUTCMonth() + 1,\n    date.getUTCDate(),\n    startHour,\n    timezone\n  ).toISOString();\n}\n\nconst footer = `\n<br><br>\nBest regards,<br>\n${senderName}<br>\n${businessName}<br>\n<a href=\"mailto:${senderEmail}\">${senderEmail}</a>\n<br><br>\n<a href=\"${unsubscribeUrl}\">Unsubscribe</a>\n`;\n\nreturn {\n  json: {\n    email: prospect.email,\n    subject: template.subject,\n    message: template.message + footer,\n    sender_name: senderName,\n    sender_email: senderEmail,\n    business_name: businessName,\n    prospect_id: prospect.id,\n    response: fallbackMetadata,\n    action: 'email_sent',\n    step,\n    next_send_at: step < 5 ? calculateNextSend() : null\n  }\n};\n"
        }
      },
      {
        "id": "9814b82d-93eb-4989-88d0-2940b201325e",
        "name": "Prepare Email Footer",
        "type": "n8n-nodes-base.set",
        "category": "logic",
        "service": "set",
        "operation": "Prepare Email Footer",
        "description": "Prepare Email Footer",
        "position": [
          3622,
          349
        ],
        "parameters": {
          "assignments": {
            "assignments": [
              {
                "id": "77f3ede1-0f46-403b-874a-797dce82b1f9",
                "name": "sender_name",
                "value": "Outreach Team",
                "type": "string"
              },
              {
                "id": "fa7b6c85-4caa-4b76-8726-878311c42c24",
                "name": "business_name",
                "value": "Your Company",
                "type": "string"
              },
              {
                "id": "f220c6e8-b6dd-4f90-8a51-9adefad86c9b",
                "name": "sender_email",
                "value": "your-business@email.com",
                "type": "string"
              },
              {
                "id": "f000856f-cb74-4020-8a2b-4e4725b93cd8",
                "name": "unsubscribe_url",
                "value": "https://your-domain.com/unsubscribe",
                "type": "string"
              }
            ]
          },
          "includeOtherFields": true,
          "options": {}
        }
      },
      {
        "id": "677f01be-9785-4a5a-aaea-dcfac15bca82",
        "name": "Log Email Event",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Log Email Event",
        "description": "Log Email Event",
        "position": [
          4486,
          349
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "prospect_id",
                "fieldValue": "={{ $('Prepare Email Content').item.json.prospect_id }}"
              },
              {
                "fieldId": "step",
                "fieldValue": "={{ $('Prepare Email Content').item.json.step }}"
              },
              {
                "fieldId": "channel",
                "fieldValue": "email"
              },
              {
                "fieldId": "message",
                "fieldValue": "={{ $('Prepare Email Content').item.json.message }}"
              },
              {
                "fieldId": "action",
                "fieldValue": "email_sent"
              },
              {
                "fieldId": "message_id",
                "fieldValue": "={{ $json.id }}"
              },
              {
                "fieldId": "response",
                "fieldValue": "={{ $('Prepare Email Content').first().json.response || {} }}"
              }
            ]
          }
        }
      },
      {
        "id": "96a5ba7a-3437-4e2f-89ed-1da28937f604",
        "name": "Update Prospect Progress",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update Prospect Progress",
        "position": [
          4789,
          349
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "current_step",
                "fieldValue": "={{ $('Prepare Email Content').item.json.step }}"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ $('Prepare Email Content').item.json.next_send_at }}"
              },
              {
                "fieldId": "status",
                "fieldValue": "={{ $('Prepare Email Content').item.json.step === 5 ? 'completed' : 'active' }}"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "36ea3262-11dd-4db1-9b37-2584a239c661",
        "name": "Get Scheduling Config",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get Scheduling Config",
        "position": [
          3298,
          349
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_config",
          "limit": 1
        }
      },
      {
        "id": "7e44eb7e-93d4-435d-85ae-7e8bb4860b8e",
        "name": "Check Suppression Before Send",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Check Suppression Before Send",
        "position": [
          382,
          560
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "suppression_list",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "email",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.email || '__NO_EMAIL__' }}"
              },
              {
                "keyName": "linkedin_url",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.linkedin_url || '__NO_LINKEDIN__' }}"
              }
            ]
          }
        }
      },
      {
        "id": "955d8665-190a-445a-8d7b-f5277fcd9328",
        "name": "Already Suppressed?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Already Suppressed?",
        "description": "Already Suppressed?",
        "position": [
          685,
          560
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "ef5d997d-111a-4cda-90a7-1c3d8daa77e8",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "exists",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "4e0cb6b6-86ec-45fc-b81f-a47b3f86aa9a",
        "name": "Log LinkedIn Event",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Log LinkedIn Event",
        "description": "Log LinkedIn Event",
        "position": [
          3946,
          2288
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "prospect_id",
                "fieldValue": "={{ $('When Executed by Another Workflow').item.json.id }}"
              },
              {
                "fieldId": "step",
                "fieldValue": "={{ Number($('When Executed by Another Workflow').item.json.current_step) + 1 }}"
              },
              {
                "fieldId": "channel",
                "fieldValue": "linkedin"
              },
              {
                "fieldId": "message",
                "fieldValue": "=Message sent"
              },
              {
                "fieldId": "action",
                "fieldValue": "=linkedin_message"
              }
            ]
          }
        }
      },
      {
        "id": "4a4a3e0c-2d12-4bb5-901b-780c1853b1d1",
        "name": "Get LinkedIn Scheduling Config",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get LinkedIn Scheduling Config",
        "position": [
          4227,
          2288
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_config",
          "limit": 1
        }
      },
      {
        "id": "a22d1243-9746-4704-9353-3f84735f0fde",
        "name": "Prepare LinkedIn Progress",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Prepare LinkedIn Progress",
        "description": "Prepare LinkedIn Progress",
        "position": [
          4530,
          2288
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "\nconst prospect = $('When Executed by Another Workflow').item.json;\nconst config = $input.item.json.config.scheduling;\n\nconst step = Number(prospect.current_step) + 1;\nconst timezone = prospect.timezone || config.default_timezone;\n\nconst minDays = Number(config.delay_business_days_min);\nconst maxDays = Number(config.delay_business_days_max);\nconst startHour = Number(config.business_start_hour);\n\nif (!timezone || minDays < 1 || maxDays < minDays) {\n  throw new Error('Invalid scheduling configuration');\n}\n\nfunction localParts(date) {\n  const parts = new Intl.DateTimeFormat('en-US', {\n    timeZone: timezone,\n    year: 'numeric',\n    month: 'numeric',\n    day: 'numeric'\n  }).formatToParts(date);\n\n  const result = {};\n  for (const p of parts) {\n    if (p.type !== 'literal') result[p.type] = Number(p.value);\n  }\n  return result;\n}\n\nfunction localToUTC(year, month, day, hour) {\n  const target = Date.UTC(year, month - 1, day, hour);\n  let guess = target;\n\n  for (let i = 0; i < 4; i++) {\n    const parts = new Intl.DateTimeFormat('en-US', {\n      timeZone: timezone,\n      year: 'numeric',\n      month: 'numeric',\n      day: 'numeric',\n      hour: 'numeric',\n      hourCycle: 'h23'\n    }).formatToParts(new Date(guess));\n\n    const p = {};\n    for (const part of parts) {\n      if (part.type !== 'literal') p[part.type] = Number(part.value);\n    }\n\n    guess += target - Date.UTC(p.year, p.month - 1, p.day, p.hour);\n  }\n\n  return new Date(guess);\n}\n\nfunction nextSendAt() {\n  const delay = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;\n  const now = localParts(new Date());\n  const date = new Date(Date.UTC(now.year, now.month - 1, now.day));\n\n  let added = 0;\n  while (added < delay) {\n    date.setUTCDate(date.getUTCDate() + 1);\n    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) added++;\n  }\n\n  return localToUTC(\n    date.getUTCFullYear(),\n    date.getUTCMonth() + 1,\n    date.getUTCDate(),\n    startHour\n  ).toISOString();\n}\n\nreturn {\n  json: {\n    prospect_id: prospect.id,\n    step,\n    next_send_at: step < 5 ? nextSendAt() : null,\n    status: step === 5 ? 'completed' : 'active'\n  }\n};\n"
        }
      },
      {
        "id": "efe636ae-6ec8-4cb1-8ccd-9ddf1581905b",
        "name": "Update LinkedIn Prospect Progress",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update LinkedIn Prospect Progress",
        "position": [
          4724,
          2288
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.prospect_id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "current_step",
                "fieldValue": "={{ $json.step }}"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ $json.next_send_at }}"
              },
              {
                "fieldId": "status",
                "fieldValue": "={{ $json.status }}"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "f052512b-64e4-43f0-b8fb-ca99c94ebaff",
        "name": "Check Existing Successful Send",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Check Existing Successful Send",
        "position": [
          987,
          771
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "limit": 1,
          "matchType": "allFilters",
          "filters": {
            "conditions": [
              {
                "keyName": "prospect_id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.id }}"
              },
              {
                "keyName": "step",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}"
              }
            ]
          }
        }
      },
      {
        "id": "6eb5baa7-6927-469b-bb87-fe2f5e4f0876",
        "name": "If",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "If",
        "description": "If",
        "position": [
          1290,
          771
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "b8dc1df0-f234-4197-8597-1a39c61e07cf",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "070bad25-fe11-4239-a8e8-cfc612405ff5",
        "name": "Update Prospect Progress1",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update Prospect Progress1",
        "position": [
          987,
          483
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').first().json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "8955d13e-c313-4914-99ba-fde828134156",
        "name": "Advance Already Sent Prospect",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Advance Already Sent Prospect",
        "position": [
          1614,
          483
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').first().json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              },
              {
                "fieldId": "current_step",
                "fieldValue": "={{ $('When Executed by Another Workflow').first().json.current_step + 1 }}"
              },
              {
                "fieldId": "status",
                "fieldValue": "={{ $('When Executed by Another Workflow').first().json.current_step + 1 >= 5 ? 'completed' : 'active' }}"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ $('When Executed by Another Workflow').first().json.current_step + 1 >= 5 ? null : $now.plus({ days: 1 }).toISO() }}"
              }
            ]
          }
        }
      },
      {
        "id": "14b6a9f8-8a70-4b71-bbce-f407ef23953b",
        "name": "Update Prospect Progress2",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update Prospect Progress2",
        "position": [
          3298,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').first().json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "92a1f882-4f36-412e-a086-49e662059f85",
        "name": "HTTP Request",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "HTTP Request",
        "description": "HTTP Request",
        "position": [
          3795,
          2614
        ],
        "parameters": {
          "method": "POST",
          "url": "https://amazing.getsales.io/flows/api/flows-leads/list",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "{\n  \"filter\": {\n    \"flow_uuid\": [\"56798720-1c12-44ab-a831-a8792f93dab4\"],\n    \"lead_uuid\": [\"f58a1bd1-e5b1-456b-bc4b-3878ebaa3e92\"]\n  },\n  \"limit\": 20\n}",
          "options": {}
        }
      },
      {
        "id": "321e31c2-f7ea-4c86-93e2-a4445a3f8919",
        "name": "GetSales - Create or Find Lead",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Create or Find Lead",
        "description": "GetSales - Create or Find Lead",
        "position": [
          3946,
          1482
        ],
        "parameters": {
          "method": "POST",
          "url": "https://amazing.getsales.io/leads/api/leads/upsert",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"lead\": {\n    \"first_name\": \"{{ $('When Executed by Another Workflow').item.json.first_name }}\",\n    \"last_name\": \"{{ $('When Executed by Another Workflow').item.json.last_name }}\",\n    \"company_name\": \"{{ $('When Executed by Another Workflow').item.json.company }}\",\n    \"linkedin_id\": \"{{ $('When Executed by Another Workflow').item.json.linkedin_url }}\",\n    \"work_email\": \"{{ $('When Executed by Another Workflow').item.json.email }}\"\n  },\n  \"list_uuid\": \"5f964031-f9dc-48e7-9ea2-b9463e3d60c6\"\n}",
          "options": {}
        }
      },
      {
        "id": "ca4f0dfc-6204-49a4-9230-94ff9a3fd74b",
        "name": "GetSales - Enroll Lead in Flow",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Enroll Lead in Flow",
        "description": "GetSales - Enroll Lead in Flow",
        "position": [
          5156,
          1578
        ],
        "parameters": {
          "method": "POST",
          "url": "={{ 'https://amazing.getsales.io/flows/api/flows/56798720-1c12-44ab-a831-a8792f93dab4/leads/' + $('GetSales - Create or Find Lead').item.json.lead.uuid }}",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              }
            ]
          },
          "options": {}
        }
      },
      {
        "id": "4e667f6e-d433-4447-8544-85bd406ec17f",
        "name": "Preserve Lead + Enrollment Data",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Preserve Lead + Enrollment Data",
        "description": "Preserve Lead + Enrollment Data",
        "position": [
          5761,
          1462
        ],
        "parameters": {
          "jsCode": "const original = $('When Executed by Another Workflow').first().json;\nconst verification = $input.first().json;\n\nreturn [{\n  json: {\n    ...original,\n    getsales_lead_uuid: verification.data?.[0]?.lead_uuid || null,\n    getsales_enrollment_uuid: verification.data?.[0]?.uuid || null,\n    getsales_enrollment_status: verification.data?.[0]?.status || null,\n    enrollment_verification: verification,\n    getsales_action_status: 'pending',\ngetsales_action_started_at: new Date().toISOString()\n  }\n}];"
        }
      },
      {
        "id": "ca8e449f-902b-4255-b60b-f51e5113987d",
        "name": "GetSales - Verify Enrollment",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Verify Enrollment",
        "description": "GetSales - Verify Enrollment",
        "position": [
          5458,
          1578
        ],
        "parameters": {
          "method": "POST",
          "url": "=https://amazing.getsales.io/flows/api/flows-leads/list",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"filter\": {\n    \"flow_uuid\": [\"56798720-1c12-44ab-a831-a8792f93dab4\"],\n    \"lead_uuid\": [\"{{ $('GetSales - Create or Find Lead').item.json.lead.uuid }}\"]\n  },\n  \"limit\": 20\n}",
          "options": {}
        }
      },
      {
        "id": "92845e7d-91d0-4b6f-83f5-6c6c14060c2a",
        "name": "GetSales - Get Recent Tasks",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Get Recent Tasks",
        "description": "GetSales - Get Recent Tasks",
        "position": [
          4249,
          2557
        ],
        "parameters": {
          "url": "https://amazing.getsales.io/flows/api/tasks",
          "sendQuery": true,
          "queryParameters": {
            "parameters": [
              {
                "name": "limit",
                "value": "20"
              },
              {
                "name": "order_field",
                "value": "created_at"
              },
              {
                "name": "order_type",
                "value": "desc"
              }
            ]
          },
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "options": {}
        }
      },
      {
        "id": "74159411-adaf-4fd3-89e3-3242a973374b",
        "name": "Save GetSales Lead ID",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Save GetSales Lead ID",
        "position": [
          6063,
          1462
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "getsales_lead_uuid",
                "fieldValue": "={{ $json.getsales_lead_uuid }}"
              },
              {
                "fieldId": "getsales_enrollment_uuid",
                "fieldValue": "={{ $json.getsales_enrollment_uuid }}"
              },
              {
                "fieldId": "getsales_enrollment_status",
                "fieldValue": "={{ $json.getsales_enrollment_status }}"
              },
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "={{ $json.getsales_action_status }}"
              },
              {
                "fieldId": "getsales_action_started_at",
                "fieldValue": "={{ $json.getsales_action_started_at }}"
              }
            ]
          }
        }
      },
      {
        "id": "d4c57536-a5f6-4832-a280-ba442729cb13",
        "name": "Already Enrolled?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Already Enrolled?",
        "description": "Already Enrolled?",
        "position": [
          4854,
          1482
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "e1a5aec6-e35a-4b4c-b0a6-5ddf7684e9a0",
                "leftValue": "={{ $json.data.length > 0 }}",
                "rightValue": "",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "a4cee475-8ea9-44ce-9b3f-270d20803166",
        "name": "Matching Lead Task Found?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Matching Lead Task Found?",
        "description": "Matching Lead Task Found?",
        "position": [
          4508,
          2557
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "4d8a6dbd-a8c9-4904-b050-42926ebe9eb1",
                "leftValue": "={{ ($json.data ?? []).some(task => task.lead_uuid === $('Preserve Lead + Enrollment Data').first().json.getsales_lead_uuid) }}",
                "rightValue": "",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "fa67fd1b-79af-43b2-a8ff-2621f9f29591",
        "name": "Mark LinkedIn Action Pending",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Mark LinkedIn Action Pending",
        "position": [
          6366,
          1462
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "=pending"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{null}}"
              }
            ]
          }
        }
      },
      {
        "id": "254ffae5-6764-437a-9fda-16718158bc26",
        "name": "GetSales - Enroll Lead in Flow1",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Enroll Lead in Flow1",
        "description": "GetSales - Enroll Lead in Flow1",
        "position": [
          4832,
          925
        ],
        "parameters": {
          "method": "POST",
          "url": "={{ 'https://amazing.getsales.io/flows/api/flows/11ae3ed8-e629-470c-942a-624aa61f18bf/leads/' + $('Get Prospect').first().json.getsales_lead_uuid }}",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              }
            ]
          },
          "options": {}
        }
      },
      {
        "id": "eeff2ad4-2b0b-4579-84f1-c25d20f25a21",
        "name": "GetSales - Create or Find Lead1",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Create or Find Lead1",
        "description": "GetSales - Create or Find Lead1",
        "position": [
          3644,
          848
        ],
        "parameters": {
          "method": "POST",
          "url": "https://amazing.getsales.io/leads/api/leads/upsert",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"lead\": {\n    \"first_name\": \"{{ $('When Executed by Another Workflow').item.json.first_name }}\",\n    \"last_name\": \"{{ $('When Executed by Another Workflow').item.json.last_name }}\",\n    \"company_name\": \"{{ $('When Executed by Another Workflow').item.json.company }}\",\n    \"linkedin_id\": \"{{ $('When Executed by Another Workflow').item.json.linkedin_url }}\",\n    \"work_email\": \"{{ $('When Executed by Another Workflow').item.json.email }}\"\n  },\n  \"list_uuid\": \"11ae3ed8-e629-470c-942a-624aa61f18bf\"\n}",
          "options": {}
        }
      },
      {
        "id": "0396d751-1a6d-4a98-8dad-d3c37dc10efc",
        "name": "GetSales - Verify Enrollment1",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Verify Enrollment1",
        "description": "GetSales - Verify Enrollment1",
        "position": [
          5134,
          925
        ],
        "parameters": {
          "method": "POST",
          "url": "=https://amazing.getsales.io/flows/api/flows-leads/list",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"filter\": {\n    \"flow_uuid\": [\"11ae3ed8-e629-470c-942a-624aa61f18bf\"],\n    \"lead_uuid\": [\"{{ $('Get Prospect').first().json.getsales_lead_uuid }}\"]\n  },\n  \"limit\": 20\n}",
          "options": {}
        }
      },
      {
        "id": "20ee5d9f-a858-470e-9492-f3e846778893",
        "name": "Get Prospect",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get Prospect",
        "position": [
          3925,
          848
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.id }}"
              }
            ]
          }
        }
      },
      {
        "id": "5c0af2e5-e287-4279-8f0c-35f28d23f8fb",
        "name": "Get Prospect1",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get Prospect1",
        "position": [
          4249,
          1482
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $('When Executed by Another Workflow').item.json.id }}"
              }
            ]
          }
        }
      },
      {
        "id": "ba54ef2f-132a-4c6f-b801-eae728994ac1",
        "name": "Check status",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Check status",
        "description": "Check status",
        "position": [
          3558,
          1290
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "d10a1629-ae1a-4609-b457-b03f6f9089a1",
                "leftValue": "={{ $json.getsales_action_status }}",
                "rightValue": "failed",
                "operator": {
                  "type": "string",
                  "operation": "equals",
                  "name": "filter.operator.equals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "0c8a2ef5-69bb-4d7f-83b4-9ac00ff33bca",
        "name": "Get Existing Connection Enrollment",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "Get Existing Connection Enrollment",
        "description": "Get Existing Connection Enrollment",
        "position": [
          4551,
          1482
        ],
        "parameters": {
          "method": "POST",
          "url": "=https://amazing.getsales.io/flows/api/flows-leads/list",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"filter\": {\n    \"flow_uuid\": [\"56798720-1c12-44ab-a831-a8792f93dab4\"],\n    \"lead_uuid\": [\"{{ $('GetSales - Create or Find Lead').first().json.lead.uuid }}\"]\n  },\n  \"limit\": 20\n}",
          "options": {}
        }
      },
      {
        "id": "3c541816-59f9-45f0-b8a7-ed64064c9444",
        "name": "Get Existing Message Enrollment",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "Get Existing Message Enrollment",
        "description": "Get Existing Message Enrollment",
        "position": [
          4227,
          848
        ],
        "parameters": {
          "method": "POST",
          "url": "=https://amazing.getsales.io/flows/api/flows-leads/list",
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "sendBody": true,
          "specifyBody": "json",
          "jsonBody": "={\n  \"filter\": {\n    \"flow_uuid\": [\"11ae3ed8-e629-470c-942a-624aa61f18bf\"],\n    \"lead_uuid\": [\"{{ $('Get Prospect').first().json.getsales_lead_uuid }}\"]\n  },\n  \"limit\": 20\n}",
          "options": {}
        }
      },
      {
        "id": "fdafdce2-02d5-48c3-a18a-b4b2e60ffb99",
        "name": "Message Enrollment Exists?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Message Enrollment Exists?",
        "description": "Message Enrollment Exists?",
        "position": [
          4530,
          848
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "e1a5aec6-e35a-4b4c-b0a6-5ddf7684e9a0",
                "leftValue": "={{ $json.data.length > 0 }}",
                "rightValue": "",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "897d855e-9ab8-48d0-a178-cc4c7fb46ad1",
        "name": "Mark LinkedIn Action Pending1",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Mark LinkedIn Action Pending1",
        "position": [
          6042,
          829
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "=pending"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{null}}"
              }
            ]
          }
        }
      },
      {
        "id": "1ac99d10-4fb1-4d43-8a55-ce12b0b2f7dd",
        "name": "Preserve Message Lead + Enrollment Data",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Preserve Message Lead + Enrollment Data",
        "description": "Preserve Message Lead + Enrollment Data",
        "position": [
          5437,
          829
        ],
        "parameters": {
          "jsCode": "const original = $('When Executed by Another Workflow').first().json;\nconst verification = $input.first().json;\n\nreturn [{\n  json: {\n    ...original,\n    getsales_lead_uuid: verification.data?.[0]?.lead_uuid || original.getsales_lead_uuid,\n    message_enrollment_uuid: verification.data?.[0]?.uuid || null,\n    message_enrollment_status: verification.data?.[0]?.status || null,\n    enrollment_verification: verification,\n    getsales_action_status: 'pending',\n    getsales_action_started_at: new Date().toISOString()\n  }\n}];"
        }
      },
      {
        "id": "8e3ea72d-aea5-4c98-a7ca-2c564de6c2da",
        "name": "Save Message Lead ID",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Save Message Lead ID",
        "position": [
          5739,
          829
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "getsales_lead_uuid",
                "fieldValue": "={{ $json.getsales_lead_uuid }}"
              }
            ]
          }
        }
      }
    ],
    "connections": [
      {
        "from": "93423ad3-c5c2-4da5-903f-e04c9aa6b7d7",
        "to": "7e44eb7e-93d4-435d-85ae-7e8bb4860b8e"
      },
      {
        "from": "a12c5cb5-fbbd-42dc-a543-16c879447a35",
        "to": "975a1753-7ee1-4d67-b6ba-b51c22012649"
      },
      {
        "from": "975a1753-7ee1-4d67-b6ba-b51c22012649",
        "to": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "975a1753-7ee1-4d67-b6ba-b51c22012649",
        "to": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "b88e53f9-1fef-46d1-a3a7-4d40928c3f7f",
        "to": "295f0742-25ba-4ff7-a9c8-76a707e24790",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "b88e53f9-1fef-46d1-a3a7-4d40928c3f7f",
        "to": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "to": "b88e53f9-1fef-46d1-a3a7-4d40928c3f7f",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "to": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "to": "893de109-a69a-4de8-9df2-4dcdb8d37d53",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "to": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "808c1864-49bb-4349-bece-bd1834a42c5a",
        "to": "893de109-a69a-4de8-9df2-4dcdb8d37d53",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "893de109-a69a-4de8-9df2-4dcdb8d37d53",
        "to": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "to": "36ea3262-11dd-4db1-9b37-2584a239c661",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "to": "14b6a9f8-8a70-4b71-bbce-f407ef23953b",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "84e1917b-4bf7-4551-9e9c-73a556c23b1d",
        "to": "ca3ba26e-c84b-4186-9e16-860ec517fe5b"
      },
      {
        "from": "9814b82d-93eb-4989-88d0-2940b201325e",
        "to": "84e1917b-4bf7-4551-9e9c-73a556c23b1d",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "ca3ba26e-c84b-4186-9e16-860ec517fe5b",
        "to": "677f01be-9785-4a5a-aaea-dcfac15bca82",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "677f01be-9785-4a5a-aaea-dcfac15bca82",
        "to": "96a5ba7a-3437-4e2f-89ed-1da28937f604"
      },
      {
        "from": "36ea3262-11dd-4db1-9b37-2584a239c661",
        "to": "9814b82d-93eb-4989-88d0-2940b201325e"
      },
      {
        "from": "7e44eb7e-93d4-435d-85ae-7e8bb4860b8e",
        "to": "955d8665-190a-445a-8d7b-f5277fcd9328"
      },
      {
        "from": "955d8665-190a-445a-8d7b-f5277fcd9328",
        "to": "070bad25-fe11-4239-a8e8-cfc612405ff5",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "955d8665-190a-445a-8d7b-f5277fcd9328",
        "to": "f052512b-64e4-43f0-b8fb-ca99c94ebaff",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "955d8665-190a-445a-8d7b-f5277fcd9328",
        "to": "a12c5cb5-fbbd-42dc-a543-16c879447a35",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "295f0742-25ba-4ff7-a9c8-76a707e24790",
        "to": "eeff2ad4-2b0b-4579-84f1-c25d20f25a21",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "295f0742-25ba-4ff7-a9c8-76a707e24790",
        "to": "ba54ef2f-132a-4c6f-b801-eae728994ac1",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "4e0cb6b6-86ec-45fc-b81f-a47b3f86aa9a",
        "to": "4a4a3e0c-2d12-4bb5-901b-780c1853b1d1"
      },
      {
        "from": "4a4a3e0c-2d12-4bb5-901b-780c1853b1d1",
        "to": "a22d1243-9746-4704-9353-3f84735f0fde"
      },
      {
        "from": "a22d1243-9746-4704-9353-3f84735f0fde",
        "to": "efe636ae-6ec8-4cb1-8ccd-9ddf1581905b"
      },
      {
        "from": "f052512b-64e4-43f0-b8fb-ca99c94ebaff",
        "to": "6eb5baa7-6927-469b-bb87-fe2f5e4f0876"
      },
      {
        "from": "6eb5baa7-6927-469b-bb87-fe2f5e4f0876",
        "to": "8955d13e-c313-4914-99ba-fde828134156",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "6eb5baa7-6927-469b-bb87-fe2f5e4f0876",
        "to": "a12c5cb5-fbbd-42dc-a543-16c879447a35",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "321e31c2-f7ea-4c86-93e2-a4445a3f8919",
        "to": "5c0af2e5-e287-4279-8f0c-35f28d23f8fb"
      },
      {
        "from": "ca4f0dfc-6204-49a4-9230-94ff9a3fd74b",
        "to": "ca8e449f-902b-4255-b60b-f51e5113987d"
      },
      {
        "from": "ca8e449f-902b-4255-b60b-f51e5113987d",
        "to": "4e667f6e-d433-4447-8544-85bd406ec17f"
      },
      {
        "from": "4e667f6e-d433-4447-8544-85bd406ec17f",
        "to": "74159411-adaf-4fd3-89e3-3242a973374b"
      },
      {
        "from": "74159411-adaf-4fd3-89e3-3242a973374b",
        "to": "fa67fd1b-79af-43b2-a8ff-2621f9f29591"
      },
      {
        "from": "d4c57536-a5f6-4832-a280-ba442729cb13",
        "to": "4e667f6e-d433-4447-8544-85bd406ec17f",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "d4c57536-a5f6-4832-a280-ba442729cb13",
        "to": "ca4f0dfc-6204-49a4-9230-94ff9a3fd74b",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "92845e7d-91d0-4b6f-83f5-6c6c14060c2a",
        "to": "a4cee475-8ea9-44ce-9b3f-270d20803166"
      },
      {
        "from": "254ffae5-6764-437a-9fda-16718158bc26",
        "to": "0396d751-1a6d-4a98-8dad-d3c37dc10efc"
      },
      {
        "from": "eeff2ad4-2b0b-4579-84f1-c25d20f25a21",
        "to": "20ee5d9f-a858-470e-9492-f3e846778893"
      },
      {
        "from": "20ee5d9f-a858-470e-9492-f3e846778893",
        "to": "3c541816-59f9-45f0-b8a7-ed64064c9444"
      },
      {
        "from": "5c0af2e5-e287-4279-8f0c-35f28d23f8fb",
        "to": "0c8a2ef5-69bb-4d7f-83b4-9ac00ff33bca"
      },
      {
        "from": "0396d751-1a6d-4a98-8dad-d3c37dc10efc",
        "to": "1ac99d10-4fb1-4d43-8a55-ce12b0b2f7dd"
      },
      {
        "from": "ba54ef2f-132a-4c6f-b801-eae728994ac1",
        "to": "8e699485-5e01-4c1e-b110-fab3df076dae",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "ba54ef2f-132a-4c6f-b801-eae728994ac1",
        "to": "321e31c2-f7ea-4c86-93e2-a4445a3f8919",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "0c8a2ef5-69bb-4d7f-83b4-9ac00ff33bca",
        "to": "d4c57536-a5f6-4832-a280-ba442729cb13"
      },
      {
        "from": "3c541816-59f9-45f0-b8a7-ed64064c9444",
        "to": "fdafdce2-02d5-48c3-a18a-b4b2e60ffb99"
      },
      {
        "from": "fdafdce2-02d5-48c3-a18a-b4b2e60ffb99",
        "to": "1ac99d10-4fb1-4d43-8a55-ce12b0b2f7dd",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "fdafdce2-02d5-48c3-a18a-b4b2e60ffb99",
        "to": "254ffae5-6764-437a-9fda-16718158bc26",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "1ac99d10-4fb1-4d43-8a55-ce12b0b2f7dd",
        "to": "8e3ea72d-aea5-4c98-a7ca-2c564de6c2da"
      },
      {
        "from": "8e3ea72d-aea5-4c98-a7ca-2c564de6c2da",
        "to": "897d855e-9ab8-48d0-a178-cc4c7fb46ad1"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-04 - Outreach Sender\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"inputSource\": \"passthrough\"\n      },\n      \"type\": \"n8n-nodes-base.executeWorkflowTrigger\",\n      \"typeVersion\": 1.3,\n      \"position\": [\n        -240,\n        -256\n      ],\n      \"id\": \"93423ad3-c5c2-4da5-903f-e04c9aa6b7d7\",\n      \"name\": \"When Executed by Another Workflow\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"linkedin_accounts\",\n        \"limit\": 1\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        880,\n        -64\n      ],\n      \"id\": \"a12c5cb5-fbbd-42dc-a543-16c879447a35\",\n      \"name\": \"Get LinkedIn Account Health\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"e787dbfd-f3ee-4c7f-b605-054570a74b14\",\n              \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.linkedin_url }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1680,\n        -128\n      ],\n      \"id\": \"b88e53f9-1fef-46d1-a3a7-4d40928c3f7f\",\n      \"name\": \"LinkedIn URL Available?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"5496c0d8-ea13-4e86-a19d-fd5dd89fdc2a\",\n              \"leftValue\": \"={{ $json.health_state }}\",\n              \"rightValue\": \"green\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEquals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1120,\n        -64\n      ],\n      \"id\": \"975a1753-7ee1-4d67-b6ba-b51c22012649\",\n      \"name\": \"LinkedIn Account Red?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"694eb292-9c71-4df8-ba4a-4b02b5316c8e\",\n              \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.email }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1920,\n        -416\n      ],\n      \"id\": \"8e699485-5e01-4c1e-b110-fab3df076dae\",\n      \"name\": \"Email Available?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"92981f2e-c130-4a17-8f01-96a52f90fe03\",\n              \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.linkedin_connected }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"boolean\",\n                \"operation\": \"true\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1920,\n        16\n      ],\n      \"id\": \"295f0742-25ba-4ff7-a9c8-76a707e24790\",\n      \"name\": \"LinkedIn Already Connected?\"\n    },\n    {\n      \"parameters\": {\n        \"rules\": {\n          \"values\": [\n            {\n              \"conditions\": {\n                \"options\": {\n                  \"caseSensitive\": true,\n                  \"leftValue\": \"\",\n                  \"typeValidation\": \"strict\",\n                  \"version\": 4\n                },\n                \"conditions\": [\n                  {\n                    \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}\",\n                    \"rightValue\": 1,\n                    \"operator\": {\n                      \"type\": \"number\",\n                      \"operation\": \"equals\"\n                    },\n                    \"id\": \"4062b169-2325-40a9-bfbd-0bd9cc6d6b60\"\n                  }\n                ],\n                \"combinator\": \"and\"\n              },\n              \"renameOutput\": true,\n              \"outputKey\": \"1\"\n            },\n            {\n              \"conditions\": {\n                \"options\": {\n                  \"caseSensitive\": true,\n                  \"leftValue\": \"\",\n                  \"typeValidation\": \"strict\",\n                  \"version\": 4\n                },\n                \"conditions\": [\n                  {\n                    \"id\": \"840f89c0-af03-4787-9a70-b7c9be45fee6\",\n                    \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}\",\n                    \"rightValue\": 2,\n                    \"operator\": {\n                      \"type\": \"number\",\n                      \"operation\": \"equals\"\n                    }\n                  }\n                ],\n                \"combinator\": \"and\"\n              },\n              \"renameOutput\": true,\n              \"outputKey\": \"2\"\n            },\n            {\n              \"conditions\": {\n                \"options\": {\n                  \"caseSensitive\": true,\n                  \"leftValue\": \"\",\n                  \"typeValidation\": \"strict\",\n                  \"version\": 4\n                },\n                \"conditions\": [\n                  {\n                    \"id\": \"e2fae26d-4f95-4a91-b81e-01105f6e7922\",\n                    \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}\",\n                    \"rightValue\": 3,\n                    \"operator\": {\n                      \"type\": \"number\",\n                      \"operation\": \"equals\"\n                    }\n                  }\n                ],\n                \"combinator\": \"and\"\n              },\n              \"renameOutput\": true,\n              \"outputKey\": \"3\"\n            },\n            {\n              \"conditions\": {\n                \"options\": {\n                  \"caseSensitive\": true,\n                  \"leftValue\": \"\",\n                  \"typeValidation\": \"strict\",\n                  \"version\": 4\n                },\n                \"conditions\": [\n                  {\n                    \"id\": \"df2348f7-85bb-49fc-9a18-3d3e296930fd\",\n                    \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}\",\n                    \"rightValue\": 4,\n                    \"operator\": {\n                      \"type\": \"number\",\n                      \"operation\": \"equals\"\n                    }\n                  }\n                ],\n                \"combinator\": \"and\"\n              },\n              \"renameOutput\": true,\n              \"outputKey\": \"4\"\n            },\n            {\n              \"conditions\": {\n                \"options\": {\n                  \"caseSensitive\": true,\n                  \"leftValue\": \"\",\n                  \"typeValidation\": \"strict\",\n                  \"version\": 4\n                },\n                \"conditions\": [\n                  {\n                    \"id\": \"007b030e-0c8e-4dc4-b660-6ba280a9eb03\",\n                    \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}\",\n                    \"operator\": {\n                      \"type\": \"number\",\n                      \"operation\": \"equals\"\n                    }\n                  }\n                ],\n                \"combinator\": \"and\"\n              },\n              \"renameOutput\": true,\n              \"outputKey\": \"5\"\n            }\n          ]\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.switch\",\n      \"typeVersion\": 3.5,\n      \"position\": [\n        1360,\n        -96\n      ],\n      \"id\": \"808c1864-49bb-4349-bece-bd1834a42c5a\",\n      \"name\": \"Route Outreach Step\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"e16d1f37-7439-4938-99bb-922d0f92ac17\",\n              \"leftValue\": \"={{ $('When Executed by Another Workflow').item.json.linkedin_connected }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"boolean\",\n                \"operation\": \"true\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1648,\n        112\n      ],\n      \"id\": \"893de109-a69a-4de8-9df2-4dcdb8d37d53\",\n      \"name\": \"LinkedIn Already Connected for Message Steps?\"\n    },\n    {\n      \"parameters\": {\n        \"sendTo\": \"={{ $json.email }}\",\n        \"subject\": \"={{ $json.subject }}\",\n        \"message\": \"={{ $json.message }}\",\n        \"options\": {\n          \"senderName\": \"={{ $json.sender_name }}\"\n        }\n      },\n      \"type\": \"n8n-nodes-base.gmail\",\n      \"typeVersion\": 2.2,\n      \"position\": [\n        2800,\n        -432\n      ],\n      \"id\": \"ca3ba26e-c84b-4186-9e16-860ec517fe5b\",\n      \"name\": \"Send a message\",\n      \"webhookId\": \"6af4a2e3-8a04-4686-890d-0650bd61b98b\",\n      \"credentials\": {\n        \"gmailOAuth2\": {\n          \"id\": \"hbL0ajjtYjwuU8EI\",\n          \"name\": \"Gmail account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"\\nconst prospect = $('When Executed by Another Workflow').item.json;\\nconst settings = $input.item.json;\\nconst linkedinHealth = $('Get LinkedIn Account Health').first().json.health_state;\\n\\nconst fallbackMetadata = ['yellow', 'red'].includes(linkedinHealth)\\n  ? {\\n      fallback_reason: 'linkedin_health',\\n      linkedin_health: linkedinHealth,\\n      original_channel: 'linkedin',\\n      actual_channel: 'email'\\n    }\\n  : {};\\n\\nconst step = Number(prospect.current_step) + 1;\\nconst firstName = prospect.first_name || 'there';\\nconst company = prospect.company || 'your company';\\n\\nconst senderName = settings.sender_name || 'Outreach Team';\\nconst businessName = settings.business_name || 'Your Company';\\nconst senderEmail = settings.sender_email || 'your-business@email.com';\\nconst unsubscribeUrl = settings.unsubscribe_url || 'https://your-domain.com/unsubscribe';\\n\\nconst scheduling = settings.config.scheduling;\\nif (!scheduling) {\\n  throw new Error('Scheduling configuration not found');\\n}\\n\\nconst timezone = prospect.timezone || scheduling.default_timezone;\\nconst minDays = Number(scheduling.delay_business_days_min);\\nconst maxDays = Number(scheduling.delay_business_days_max);\\nconst startHour = Number(scheduling.business_start_hour);\\n\\nif (!timezone || minDays < 1 || maxDays < minDays) {\\n  throw new Error('Invalid scheduling configuration');\\n}\\n\\nconst templates = {\\n  1: {\\n    subject: `Quick introduction for ${company}`,\\n    message: `Hi ${firstName},<br><br>\\nI wanted to connect and introduce myself. I came across ${company} and thought there might be an opportunity for us to connect.<br><br>\\nWould you be open to a brief conversation?`\\n  },\\n  2: {\\n    subject: `Exploring an opportunity with ${company}`,\\n    message: `Hi ${firstName},<br><br>\\nI wanted to follow up and explore whether our services could be relevant to ${company}.<br><br>\\nWould you be available for a short conversation?`\\n  },\\n  3: {\\n    subject: `Following up, ${firstName}`,\\n    message: `Hi ${firstName},<br><br>\\nI wanted to follow up on my previous email and see if this is something worth discussing.<br><br>\\nI'd be happy to share more details.`\\n  },\\n  4: {\\n    subject: `Any thoughts, ${firstName}?`,\\n    message: `Hi ${firstName},<br><br>\\nJust checking whether you had a chance to consider my previous message.<br><br>\\nWould a brief discussion be useful?`\\n  },\\n  5: {\\n    subject: `Closing the loop, ${firstName}`,\\n    message: `Hi ${firstName},<br><br>\\nI understand this may not be a priority right now. I'll close the loop here, but you're welcome to reach out if things change.`\\n  }\\n};\\n\\nconst template = templates[step];\\nif (!template) throw new Error(`No email template found for step ${step}`);\\n\\nfunction getLocalParts(date, zone) {\\n  const parts = new Intl.DateTimeFormat('en-US', {\\n    timeZone: zone,\\n    year: 'numeric',\\n    month: 'numeric',\\n    day: 'numeric'\\n  }).formatToParts(date);\\n\\n  const result = {};\\n  for (const part of parts) {\\n    if (part.type !== 'literal') result[part.type] = Number(part.value);\\n  }\\n  return result;\\n}\\n\\nfunction localTimeToUTC(year, month, day, hour, zone) {\\n  const target = Date.UTC(year, month - 1, day, hour);\\n  let guess = target;\\n\\n  for (let i = 0; i < 4; i++) {\\n    const local = new Intl.DateTimeFormat('en-US', {\\n      timeZone: zone,\\n      year: 'numeric',\\n      month: 'numeric',\\n      day: 'numeric',\\n      hour: 'numeric',\\n      hourCycle: 'h23'\\n    }).formatToParts(new Date(guess));\\n\\n    const p = {};\\n    for (const part of local) {\\n      if (part.type !== 'literal') p[part.type] = Number(part.value);\\n    }\\n\\n    const represented = Date.UTC(p.year, p.month - 1, p.day, p.hour);\\n    guess += target - represented;\\n  }\\n\\n  return new Date(guess);\\n}\\n\\nfunction calculateNextSend() {\\n  const delay = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;\\n  const now = new Date();\\n  const local = getLocalParts(now, timezone);\\n\\n  const date = new Date(Date.UTC(local.year, local.month - 1, local.day));\\n  let added = 0;\\n\\n  while (added < delay) {\\n    date.setUTCDate(date.getUTCDate() + 1);\\n    const day = date.getUTCDay();\\n\\n    if (day !== 0 && day !== 6) added++;\\n  }\\n\\n  while (date.getUTCDay() === 0 || date.getUTCDay() === 6) {\\n    date.setUTCDate(date.getUTCDate() + 1);\\n  }\\n\\n  return localTimeToUTC(\\n    date.getUTCFullYear(),\\n    date.getUTCMonth() + 1,\\n    date.getUTCDate(),\\n    startHour,\\n    timezone\\n  ).toISOString();\\n}\\n\\nconst footer = `\\n<br><br>\\nBest regards,<br>\\n${senderName}<br>\\n${businessName}<br>\\n<a href=\\\"mailto:${senderEmail}\\\">${senderEmail}</a>\\n<br><br>\\n<a href=\\\"${unsubscribeUrl}\\\">Unsubscribe</a>\\n`;\\n\\nreturn {\\n  json: {\\n    email: prospect.email,\\n    subject: template.subject,\\n    message: template.message + footer,\\n    sender_name: senderName,\\n    sender_email: senderEmail,\\n    business_name: businessName,\\n    prospect_id: prospect.id,\\n    response: fallbackMetadata,\\n    action: 'email_sent',\\n    step,\\n    next_send_at: step < 5 ? calculateNextSend() : null\\n  }\\n};\\n\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        2608,\n        -432\n      ],\n      \"id\": \"84e1917b-4bf7-4551-9e9c-73a556c23b1d\",\n      \"name\": \"Prepare Email Content\"\n    },\n    {\n      \"parameters\": {\n        \"assignments\": {\n          \"assignments\": [\n            {\n              \"id\": \"77f3ede1-0f46-403b-874a-797dce82b1f9\",\n              \"name\": \"sender_name\",\n              \"value\": \"Outreach Team\",\n              \"type\": \"string\"\n            },\n            {\n              \"id\": \"fa7b6c85-4caa-4b76-8726-878311c42c24\",\n              \"name\": \"business_name\",\n              \"value\": \"Your Company\",\n              \"type\": \"string\"\n            },\n            {\n              \"id\": \"f220c6e8-b6dd-4f90-8a51-9adefad86c9b\",\n              \"name\": \"sender_email\",\n              \"value\": \"your-business@email.com\",\n              \"type\": \"string\"\n            },\n            {\n              \"id\": \"f000856f-cb74-4020-8a2b-4e4725b93cd8\",\n              \"name\": \"unsubscribe_url\",\n              \"value\": \"https://your-domain.com/unsubscribe\",\n              \"type\": \"string\"\n            }\n          ]\n        },\n        \"includeOtherFields\": true,\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.set\",\n      \"typeVersion\": 3.5,\n      \"position\": [\n        2384,\n        -432\n      ],\n      \"id\": \"9814b82d-93eb-4989-88d0-2940b201325e\",\n      \"name\": \"Prepare Email Footer\",\n      \"alwaysOutputData\": true\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"prospect_id\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').item.json.prospect_id }}\"\n            },\n            {\n              \"fieldId\": \"step\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').item.json.step }}\"\n            },\n            {\n              \"fieldId\": \"channel\",\n              \"fieldValue\": \"email\"\n            },\n            {\n              \"fieldId\": \"message\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').item.json.message }}\"\n            },\n            {\n              \"fieldId\": \"action\",\n              \"fieldValue\": \"email_sent\"\n            },\n            {\n              \"fieldId\": \"message_id\",\n              \"fieldValue\": \"={{ $json.id }}\"\n            },\n            {\n              \"fieldId\": \"response\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').first().json.response || {} }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        3024,\n        -432\n      ],\n      \"id\": \"677f01be-9785-4a5a-aaea-dcfac15bca82\",\n      \"name\": \"Log Email Event\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"current_step\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').item.json.step }}\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').item.json.next_send_at }}\"\n            },\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"={{ $('Prepare Email Content').item.json.step === 5 ? 'completed' : 'active' }}\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        3248,\n        -432\n      ],\n      \"id\": \"96a5ba7a-3437-4e2f-89ed-1da28937f604\",\n      \"name\": \"Update Prospect Progress\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_config\",\n        \"limit\": 1\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2144,\n        -432\n      ],\n      \"id\": \"36ea3262-11dd-4db1-9b37-2584a239c661\",\n      \"name\": \"Get Scheduling Config\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"suppression_list\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"email\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.email || '__NO_EMAIL__' }}\"\n            },\n            {\n              \"keyName\": \"linkedin_url\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.linkedin_url || '__NO_LINKEDIN__' }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        -16,\n        -256\n      ],\n      \"id\": \"7e44eb7e-93d4-435d-85ae-7e8bb4860b8e\",\n      \"name\": \"Check Suppression Before Send\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"ef5d997d-111a-4cda-90a7-1c3d8daa77e8\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"exists\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        208,\n        -256\n      ],\n      \"id\": \"955d8665-190a-445a-8d7b-f5277fcd9328\",\n      \"name\": \"Already Suppressed?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"prospect_id\",\n              \"fieldValue\": \"={{ $('When Executed by Another Workflow').item.json.id }}\"\n            },\n            {\n              \"fieldId\": \"step\",\n              \"fieldValue\": \"={{ Number($('When Executed by Another Workflow').item.json.current_step) + 1 }}\"\n            },\n            {\n              \"fieldId\": \"channel\",\n              \"fieldValue\": \"linkedin\"\n            },\n            {\n              \"fieldId\": \"message\",\n              \"fieldValue\": \"=Message sent\"\n            },\n            {\n              \"fieldId\": \"action\",\n              \"fieldValue\": \"=linkedin_message\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2624,\n        1184\n      ],\n      \"id\": \"4e0cb6b6-86ec-45fc-b81f-a47b3f86aa9a\",\n      \"name\": \"Log LinkedIn Event\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      },\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_config\",\n        \"limit\": 1\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2832,\n        1184\n      ],\n      \"id\": \"4a4a3e0c-2d12-4bb5-901b-780c1853b1d1\",\n      \"name\": \"Get LinkedIn Scheduling Config\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      },\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"\\nconst prospect = $('When Executed by Another Workflow').item.json;\\nconst config = $input.item.json.config.scheduling;\\n\\nconst step = Number(prospect.current_step) + 1;\\nconst timezone = prospect.timezone || config.default_timezone;\\n\\nconst minDays = Number(config.delay_business_days_min);\\nconst maxDays = Number(config.delay_business_days_max);\\nconst startHour = Number(config.business_start_hour);\\n\\nif (!timezone || minDays < 1 || maxDays < minDays) {\\n  throw new Error('Invalid scheduling configuration');\\n}\\n\\nfunction localParts(date) {\\n  const parts = new Intl.DateTimeFormat('en-US', {\\n    timeZone: timezone,\\n    year: 'numeric',\\n    month: 'numeric',\\n    day: 'numeric'\\n  }).formatToParts(date);\\n\\n  const result = {};\\n  for (const p of parts) {\\n    if (p.type !== 'literal') result[p.type] = Number(p.value);\\n  }\\n  return result;\\n}\\n\\nfunction localToUTC(year, month, day, hour) {\\n  const target = Date.UTC(year, month - 1, day, hour);\\n  let guess = target;\\n\\n  for (let i = 0; i < 4; i++) {\\n    const parts = new Intl.DateTimeFormat('en-US', {\\n      timeZone: timezone,\\n      year: 'numeric',\\n      month: 'numeric',\\n      day: 'numeric',\\n      hour: 'numeric',\\n      hourCycle: 'h23'\\n    }).formatToParts(new Date(guess));\\n\\n    const p = {};\\n    for (const part of parts) {\\n      if (part.type !== 'literal') p[part.type] = Number(part.value);\\n    }\\n\\n    guess += target - Date.UTC(p.year, p.month - 1, p.day, p.hour);\\n  }\\n\\n  return new Date(guess);\\n}\\n\\nfunction nextSendAt() {\\n  const delay = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;\\n  const now = localParts(new Date());\\n  const date = new Date(Date.UTC(now.year, now.month - 1, now.day));\\n\\n  let added = 0;\\n  while (added < delay) {\\n    date.setUTCDate(date.getUTCDate() + 1);\\n    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) added++;\\n  }\\n\\n  return localToUTC(\\n    date.getUTCFullYear(),\\n    date.getUTCMonth() + 1,\\n    date.getUTCDate(),\\n    startHour\\n  ).toISOString();\\n}\\n\\nreturn {\\n  json: {\\n    prospect_id: prospect.id,\\n    step,\\n    next_send_at: step < 5 ? nextSendAt() : null,\\n    status: step === 5 ? 'completed' : 'active'\\n  }\\n};\\n\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        3056,\n        1184\n      ],\n      \"id\": \"a22d1243-9746-4704-9353-3f84735f0fde\",\n      \"name\": \"Prepare LinkedIn Progress\",\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.prospect_id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"current_step\",\n              \"fieldValue\": \"={{ $json.step }}\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ $json.next_send_at }}\"\n            },\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"={{ $json.status }}\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        3200,\n        1184\n      ],\n      \"id\": \"efe636ae-6ec8-4cb1-8ccd-9ddf1581905b\",\n      \"name\": \"Update LinkedIn Prospect Progress\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      },\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"limit\": 1,\n        \"matchType\": \"allFilters\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"prospect_id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.id }}\"\n            },\n            {\n              \"keyName\": \"step\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.current_step + 1 }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        432,\n        -80\n      ],\n      \"id\": \"f052512b-64e4-43f0-b8fb-ca99c94ebaff\",\n      \"name\": \"Check Existing Successful Send\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      },\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"b8dc1df0-f234-4197-8597-1a39c61e07cf\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        656,\n        -80\n      ],\n      \"id\": \"6eb5baa7-6927-469b-bb87-fe2f5e4f0876\",\n      \"name\": \"If\",\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').first().json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        432,\n        -320\n      ],\n      \"id\": \"070bad25-fe11-4239-a8e8-cfc612405ff5\",\n      \"name\": \"Update Prospect Progress1\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').first().json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            },\n            {\n              \"fieldId\": \"current_step\",\n              \"fieldValue\": \"={{ $('When Executed by Another Workflow').first().json.current_step + 1 }}\"\n            },\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"={{ $('When Executed by Another Workflow').first().json.current_step + 1 >= 5 ? 'completed' : 'active' }}\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ $('When Executed by Another Workflow').first().json.current_step + 1 >= 5 ? null : $now.plus({ days: 1 }).toISO() }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        896,\n        -320\n      ],\n      \"id\": \"8955d13e-c313-4914-99ba-fde828134156\",\n      \"name\": \"Advance Already Sent Prospect\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      },\n      \"disabled\": true\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').first().json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2144,\n        -656\n      ],\n      \"id\": \"14b6a9f8-8a70-4b71-bbce-f407ef23953b\",\n      \"name\": \"Update Prospect Progress2\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"https://amazing.getsales.io/flows/api/flows-leads/list\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"{\\n  \\\"filter\\\": {\\n    \\\"flow_uuid\\\": [\\\"56798720-1c12-44ab-a831-a8792f93dab4\\\"],\\n    \\\"lead_uuid\\\": [\\\"f58a1bd1-e5b1-456b-bc4b-3878ebaa3e92\\\"]\\n  },\\n  \\\"limit\\\": 20\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        2512,\n        1456\n      ],\n      \"id\": \"92a1f882-4f36-412e-a086-49e662059f85\",\n      \"name\": \"HTTP Request\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"https://amazing.getsales.io/leads/api/leads/upsert\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"={\\n  \\\"lead\\\": {\\n    \\\"first_name\\\": \\\"{{ $('When Executed by Another Workflow').item.json.first_name }}\\\",\\n    \\\"last_name\\\": \\\"{{ $('When Executed by Another Workflow').item.json.last_name }}\\\",\\n    \\\"company_name\\\": \\\"{{ $('When Executed by Another Workflow').item.json.company }}\\\",\\n    \\\"linkedin_id\\\": \\\"{{ $('When Executed by Another Workflow').item.json.linkedin_url }}\\\",\\n    \\\"work_email\\\": \\\"{{ $('When Executed by Another Workflow').item.json.email }}\\\"\\n  },\\n  \\\"list_uuid\\\": \\\"5f964031-f9dc-48e7-9ea2-b9463e3d60c6\\\"\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        2624,\n        512\n      ],\n      \"id\": \"321e31c2-f7ea-4c86-93e2-a4445a3f8919\",\n      \"name\": \"GetSales - Create or Find Lead\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"={{ 'https://amazing.getsales.io/flows/api/flows/56798720-1c12-44ab-a831-a8792f93dab4/leads/' + $('GetSales - Create or Find Lead').item.json.lead.uuid }}\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            }\n          ]\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        3520,\n        592\n      ],\n      \"id\": \"ca4f0dfc-6204-49a4-9230-94ff9a3fd74b\",\n      \"name\": \"GetSales - Enroll Lead in Flow\"\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const original = $('When Executed by Another Workflow').first().json;\\nconst verification = $input.first().json;\\n\\nreturn [{\\n  json: {\\n    ...original,\\n    getsales_lead_uuid: verification.data?.[0]?.lead_uuid || null,\\n    getsales_enrollment_uuid: verification.data?.[0]?.uuid || null,\\n    getsales_enrollment_status: verification.data?.[0]?.status || null,\\n    enrollment_verification: verification,\\n    getsales_action_status: 'pending',\\ngetsales_action_started_at: new Date().toISOString()\\n  }\\n}];\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        3968,\n        496\n      ],\n      \"id\": \"4e667f6e-d433-4447-8544-85bd406ec17f\",\n      \"name\": \"Preserve Lead + Enrollment Data\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"=https://amazing.getsales.io/flows/api/flows-leads/list\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"={\\n  \\\"filter\\\": {\\n    \\\"flow_uuid\\\": [\\\"56798720-1c12-44ab-a831-a8792f93dab4\\\"],\\n    \\\"lead_uuid\\\": [\\\"{{ $('GetSales - Create or Find Lead').item.json.lead.uuid }}\\\"]\\n  },\\n  \\\"limit\\\": 20\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        3744,\n        592\n      ],\n      \"id\": \"ca8e449f-902b-4255-b60b-f51e5113987d\",\n      \"name\": \"GetSales - Verify Enrollment\"\n    },\n    {\n      \"parameters\": {\n        \"url\": \"https://amazing.getsales.io/flows/api/tasks\",\n        \"sendQuery\": true,\n        \"queryParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"limit\",\n              \"value\": \"20\"\n            },\n            {\n              \"name\": \"order_field\",\n              \"value\": \"created_at\"\n            },\n            {\n              \"name\": \"order_type\",\n              \"value\": \"desc\"\n            }\n          ]\n        },\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        2848,\n        1408\n      ],\n      \"id\": \"92845e7d-91d0-4b6f-83f5-6c6c14060c2a\",\n      \"name\": \"GetSales - Get Recent Tasks\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"getsales_lead_uuid\",\n              \"fieldValue\": \"={{ $json.getsales_lead_uuid }}\"\n            },\n            {\n              \"fieldId\": \"getsales_enrollment_uuid\",\n              \"fieldValue\": \"={{ $json.getsales_enrollment_uuid }}\"\n            },\n            {\n              \"fieldId\": \"getsales_enrollment_status\",\n              \"fieldValue\": \"={{ $json.getsales_enrollment_status }}\"\n            },\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"={{ $json.getsales_action_status }}\"\n            },\n            {\n              \"fieldId\": \"getsales_action_started_at\",\n              \"fieldValue\": \"={{ $json.getsales_action_started_at }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        4192,\n        496\n      ],\n      \"id\": \"74159411-adaf-4fd3-89e3-3242a973374b\",\n      \"name\": \"Save GetSales Lead ID\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"e1a5aec6-e35a-4b4c-b0a6-5ddf7684e9a0\",\n              \"leftValue\": \"={{ $json.data.length > 0 }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"boolean\",\n                \"operation\": \"true\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        3296,\n        512\n      ],\n      \"id\": \"d4c57536-a5f6-4832-a280-ba442729cb13\",\n      \"name\": \"Already Enrolled?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"4d8a6dbd-a8c9-4904-b050-42926ebe9eb1\",\n              \"leftValue\": \"={{ ($json.data ?? []).some(task => task.lead_uuid === $('Preserve Lead + Enrollment Data').first().json.getsales_lead_uuid) }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"boolean\",\n                \"operation\": \"true\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        3040,\n        1408\n      ],\n      \"id\": \"a4cee475-8ea9-44ce-9b3f-270d20803166\",\n      \"name\": \"Matching Lead Task Found?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"=pending\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{null}}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        4416,\n        496\n      ],\n      \"id\": \"fa67fd1b-79af-43b2-a8ff-2621f9f29591\",\n      \"name\": \"Mark LinkedIn Action Pending\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"={{ 'https://amazing.getsales.io/flows/api/flows/11ae3ed8-e629-470c-942a-624aa61f18bf/leads/' + $('Get Prospect').first().json.getsales_lead_uuid }}\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            }\n          ]\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        3280,\n        48\n      ],\n      \"id\": \"254ffae5-6764-437a-9fda-16718158bc26\",\n      \"name\": \"GetSales - Enroll Lead in Flow1\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"https://amazing.getsales.io/leads/api/leads/upsert\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"={\\n  \\\"lead\\\": {\\n    \\\"first_name\\\": \\\"{{ $('When Executed by Another Workflow').item.json.first_name }}\\\",\\n    \\\"last_name\\\": \\\"{{ $('When Executed by Another Workflow').item.json.last_name }}\\\",\\n    \\\"company_name\\\": \\\"{{ $('When Executed by Another Workflow').item.json.company }}\\\",\\n    \\\"linkedin_id\\\": \\\"{{ $('When Executed by Another Workflow').item.json.linkedin_url }}\\\",\\n    \\\"work_email\\\": \\\"{{ $('When Executed by Another Workflow').item.json.email }}\\\"\\n  },\\n  \\\"list_uuid\\\": \\\"11ae3ed8-e629-470c-942a-624aa61f18bf\\\"\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        2400,\n        -16\n      ],\n      \"id\": \"eeff2ad4-2b0b-4579-84f1-c25d20f25a21\",\n      \"name\": \"GetSales - Create or Find Lead1\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"=https://amazing.getsales.io/flows/api/flows-leads/list\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"={\\n  \\\"filter\\\": {\\n    \\\"flow_uuid\\\": [\\\"11ae3ed8-e629-470c-942a-624aa61f18bf\\\"],\\n    \\\"lead_uuid\\\": [\\\"{{ $('Get Prospect').first().json.getsales_lead_uuid }}\\\"]\\n  },\\n  \\\"limit\\\": 20\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        3504,\n        48\n      ],\n      \"id\": \"0396d751-1a6d-4a98-8dad-d3c37dc10efc\",\n      \"name\": \"GetSales - Verify Enrollment1\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.id }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2608,\n        -16\n      ],\n      \"id\": \"20ee5d9f-a858-470e-9492-f3e846778893\",\n      \"name\": \"Get Prospect\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $('When Executed by Another Workflow').item.json.id }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        2848,\n        512\n      ],\n      \"id\": \"5c0af2e5-e287-4279-8f0c-35f28d23f8fb\",\n      \"name\": \"Get Prospect1\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"d10a1629-ae1a-4609-b457-b03f6f9089a1\",\n              \"leftValue\": \"={{ $json.getsales_action_status }}\",\n              \"rightValue\": \"failed\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"equals\",\n                \"name\": \"filter.operator.equals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        2336,\n        352\n      ],\n      \"id\": \"ba54ef2f-132a-4c6f-b801-eae728994ac1\",\n      \"name\": \"Check status\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"=https://amazing.getsales.io/flows/api/flows-leads/list\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"={\\n  \\\"filter\\\": {\\n    \\\"flow_uuid\\\": [\\\"56798720-1c12-44ab-a831-a8792f93dab4\\\"],\\n    \\\"lead_uuid\\\": [\\\"{{ $('GetSales - Create or Find Lead').first().json.lead.uuid }}\\\"]\\n  },\\n  \\\"limit\\\": 20\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        3072,\n        512\n      ],\n      \"id\": \"0c8a2ef5-69bb-4d7f-83b4-9ac00ff33bca\",\n      \"name\": \"Get Existing Connection Enrollment\"\n    },\n    {\n      \"parameters\": {\n        \"method\": \"POST\",\n        \"url\": \"=https://amazing.getsales.io/flows/api/flows-leads/list\",\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"sendBody\": true,\n        \"specifyBody\": \"json\",\n        \"jsonBody\": \"={\\n  \\\"filter\\\": {\\n    \\\"flow_uuid\\\": [\\\"11ae3ed8-e629-470c-942a-624aa61f18bf\\\"],\\n    \\\"lead_uuid\\\": [\\\"{{ $('Get Prospect').first().json.getsales_lead_uuid }}\\\"]\\n  },\\n  \\\"limit\\\": 20\\n}\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        2832,\n        -16\n      ],\n      \"id\": \"3c541816-59f9-45f0-b8a7-ed64064c9444\",\n      \"name\": \"Get Existing Message Enrollment\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"e1a5aec6-e35a-4b4c-b0a6-5ddf7684e9a0\",\n              \"leftValue\": \"={{ $json.data.length > 0 }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"boolean\",\n                \"operation\": \"true\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        3056,\n        -16\n      ],\n      \"id\": \"fdafdce2-02d5-48c3-a18a-b4b2e60ffb99\",\n      \"name\": \"Message Enrollment Exists?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"=pending\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{null}}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        4176,\n        -32\n      ],\n      \"id\": \"897d855e-9ab8-48d0-a178-cc4c7fb46ad1\",\n      \"name\": \"Mark LinkedIn Action Pending1\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const original = $('When Executed by Another Workflow').first().json;\\nconst verification = $input.first().json;\\n\\nreturn [{\\n  json: {\\n    ...original,\\n    getsales_lead_uuid: verification.data?.[0]?.lead_uuid || original.getsales_lead_uuid,\\n    message_enrollment_uuid: verification.data?.[0]?.uuid || null,\\n    message_enrollment_status: verification.data?.[0]?.status || null,\\n    enrollment_verification: verification,\\n    getsales_action_status: 'pending',\\n    getsales_action_started_at: new Date().toISOString()\\n  }\\n}];\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        3728,\n        -32\n      ],\n      \"id\": \"1ac99d10-4fb1-4d43-8a55-ce12b0b2f7dd\",\n      \"name\": \"Preserve Message Lead + Enrollment Data\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"getsales_lead_uuid\",\n              \"fieldValue\": \"={{ $json.getsales_lead_uuid }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        3952,\n        -32\n      ],\n      \"id\": \"8e3ea72d-aea5-4c98-a7ca-2c564de6c2da\",\n      \"name\": \"Save Message Lead ID\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    }\n  ],\n  \"pinData\": {\n    \"When Executed by Another Workflow\": [\n      {\n        \"json\": {\n          \"id\": \"95ed81f5-a01f-45a2-862a-45f0b88d35a8\",\n          \"first_name\": \"Mannan\",\n          \"last_name\": \"Test\",\n          \"company\": \"Automation Test Company\",\n          \"job_title\": \"Marketing Manager\",\n          \"linkedin_url\": \"https://www.linkedin.com/in/your-real-test-profile/\",\n          \"email\": \"mannan.test@example.com\",\n          \"country\": \"Pakistan\",\n          \"timezone\": \"Asia/Karachi\",\n          \"current_step\": 0,\n          \"status\": \"active\",\n          \"linkedin_connected\": false,\n          \"processing\": true,\n          \"getsales_lead_uuid\": null,\n          \"getsales_enrollment_uuid\": null,\n          \"getsales_enrollment_status\": null,\n          \"getsales_action_status\": null\n        }\n      }\n    ],\n    \"Get LinkedIn Account Health\": [\n      {\n        \"json\": {\n          \"id\": \"f3b97a1c-2b96-4ad2-bb3d-62c7b6d0f94a\",\n          \"account_name\": \"Test LinkedIn Account\",\n          \"health_state\": \"green\",\n          \"sent_today\": 4,\n          \"sent_this_week\": 20,\n          \"pending_invites\": 10,\n          \"acceptance_rate\": 35,\n          \"restriction_detected\": false,\n          \"updated_at\": \"2026-11-18T12:57:58.026+00:00\"\n        }\n      }\n    ]\n  },\n  \"connections\": {\n    \"When Executed by Another Workflow\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Check Suppression Before Send\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get LinkedIn Account Health\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"LinkedIn Account Red?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn Account Red?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Route Outreach Step\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn URL Available?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"LinkedIn Already Connected?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Route Outreach Step\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"LinkedIn URL Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"LinkedIn Already Connected for Message Steps?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"LinkedIn Already Connected for Message Steps?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn Already Connected for Message Steps?\": {\n      \"main\": [\n        [],\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Email Available?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Scheduling Config\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Update Prospect Progress2\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare Email Content\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Send a message\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare Email Footer\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prepare Email Content\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Send a message\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Log Email Event\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Log Email Event\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update Prospect Progress\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Scheduling Config\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prepare Email Footer\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Check Suppression Before Send\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Already Suppressed?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Already Suppressed?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update Prospect Progress1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Check Existing Successful Send\",\n            \"type\": \"main\",\n            \"index\": 0\n          },\n          {\n            \"node\": \"Get LinkedIn Account Health\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"LinkedIn Already Connected?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"GetSales - Create or Find Lead1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Check status\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Log LinkedIn Event\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get LinkedIn Scheduling Config\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get LinkedIn Scheduling Config\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prepare LinkedIn Progress\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare LinkedIn Progress\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update LinkedIn Prospect Progress\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Check Existing Successful Send\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"If\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"If\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Advance Already Sent Prospect\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Get LinkedIn Account Health\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Update Prospect Progress2\": {\n      \"main\": [\n        []\n      ]\n    },\n    \"GetSales - Create or Find Lead\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Prospect1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"GetSales - Enroll Lead in Flow\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"GetSales - Verify Enrollment\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"GetSales - Verify Enrollment\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Preserve Lead + Enrollment Data\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Preserve Lead + Enrollment Data\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Save GetSales Lead ID\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Save GetSales Lead ID\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Mark LinkedIn Action Pending\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Already Enrolled?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Preserve Lead + Enrollment Data\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"GetSales - Enroll Lead in Flow\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"GetSales - Get Recent Tasks\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Matching Lead Task Found?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"GetSales - Enroll Lead in Flow1\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"GetSales - Verify Enrollment1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"GetSales - Create or Find Lead1\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Prospect\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Prospect\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Existing Message Enrollment\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Prospect1\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Existing Connection Enrollment\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"GetSales - Verify Enrollment1\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Preserve Message Lead + Enrollment Data\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Check status\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Email Available?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"GetSales - Create or Find Lead\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Existing Connection Enrollment\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Already Enrolled?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Existing Message Enrollment\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Message Enrollment Exists?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Message Enrollment Exists?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Preserve Message Lead + Enrollment Data\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"GetSales - Enroll Lead in Flow1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Preserve Message Lead + Enrollment Data\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Save Message Lead ID\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Save Message Lead ID\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Mark LinkedIn Action Pending1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": true,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"660725ac-13b2-4103-8146-1b04e8a0df57\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [\n    {\n      \"id\": \"cfb02ed9-12f9-40c4-a132-bd057da06316\",\n      \"nodeIds\": [\n        \"321e31c2-f7ea-4c86-93e2-a4445a3f8919\",\n        \"ca4f0dfc-6204-49a4-9230-94ff9a3fd74b\",\n        \"4e667f6e-d433-4447-8544-85bd406ec17f\",\n        \"ca8e449f-902b-4255-b60b-f51e5113987d\",\n        \"74159411-adaf-4fd3-89e3-3242a973374b\",\n        \"d4c57536-a5f6-4832-a280-ba442729cb13\",\n        \"fa67fd1b-79af-43b2-a8ff-2621f9f29591\",\n        \"5c0af2e5-e287-4279-8f0c-35f28d23f8fb\",\n        \"0c8a2ef5-69bb-4d7f-83b4-9ac00ff33bca\"\n      ],\n      \"name\": \"Connection request\"\n    },\n    {\n      \"id\": \"840bfcc1-8722-4e12-a37c-27d190b6317d\",\n      \"nodeIds\": [\n        \"254ffae5-6764-437a-9fda-16718158bc26\",\n        \"eeff2ad4-2b0b-4579-84f1-c25d20f25a21\",\n        \"0396d751-1a6d-4a98-8dad-d3c37dc10efc\",\n        \"20ee5d9f-a858-470e-9492-f3e846778893\",\n        \"3c541816-59f9-45f0-b8a7-ed64064c9444\",\n        \"fdafdce2-02d5-48c3-a18a-b4b2e60ffb99\",\n        \"8e3ea72d-aea5-4c98-a7ca-2c564de6c2da\",\n        \"897d855e-9ab8-48d0-a178-cc4c7fb46ad1\",\n        \"1ac99d10-4fb1-4d43-8a55-ce12b0b2f7dd\"\n      ],\n      \"name\": \"Message sending\"\n    }\n  ],\n  \"id\": \"1TlecjdgfEqqsqQC\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-05",
    "code": "WF-05",
    "name": "Reply Detection & Sentiment Router",
    "category": "Inbound",
    "description": "Listens for inbound replies from GetSales and email webhooks, immediately stops further sequence touches, classifies sentiment, and handles opt-outs.",
    "nodeCount": 13,
    "connectionCount": 11,
    "nodes": [
      {
        "id": "a14e7bd8-9f55-463b-a350-80065f6f18e9",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "category": "trigger",
        "service": "Webhook",
        "operation": "Webhook",
        "description": "Webhook",
        "position": [
          80,
          349
        ],
        "parameters": {
          "httpMethod": "POST",
          "path": "outreach-reply",
          "options": {}
        }
      },
      {
        "id": "7b82ca43-1af8-4745-a49e-3efd6e2a4952",
        "name": "Find Reply Prospect",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Find Reply Prospect",
        "position": [
          987,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "email",
                "condition": "eq",
                "keyValue": "={{ $json.email }}"
              }
            ]
          }
        }
      },
      {
        "id": "8634346c-cd6c-4c82-81b8-f70ea8b9be64",
        "name": "Prospect Found?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Prospect Found?",
        "description": "Prospect Found?",
        "position": [
          1290,
          80
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "4c6c0d0f-b87b-4cbd-add4-be98edab517f",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "5f6bc4ee-816e-42a4-9ebe-e384ac2faa02",
        "name": "Stop Prospect Sequence",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Stop Prospect Sequence",
        "position": [
          1592,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "status",
                "fieldValue": "replied"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ null }}"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "3083b901-3258-4010-a2e0-3f649a00ea22",
        "name": "Log Reply Event",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Log Reply Event",
        "description": "Log Reply Event",
        "position": [
          1894,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "prospect_id",
                "fieldValue": "={{ $('Find Reply Prospect').item.json.id }}"
              },
              {
                "fieldId": "step",
                "fieldValue": "={{ $('Find Reply Prospect').item.json.current_step }}"
              },
              {
                "fieldId": "channel",
                "fieldValue": "={{ $('Clean & Prepare Email Reply').item.json.source }}"
              },
              {
                "fieldId": "action",
                "fieldValue": "reply_received"
              },
              {
                "fieldId": "message",
                "fieldValue": "={{ $('Clean & Prepare Email Reply').item.json.message }}"
              },
              {
                "fieldId": "message_id",
                "fieldValue": "={{ $('Clean & Prepare Email Reply').item.json.message_id }}"
              }
            ]
          }
        }
      },
      {
        "id": "31d765d4-4f98-41aa-9902-7d63201c1bd2",
        "name": "Gmail Trigger",
        "type": "n8n-nodes-base.gmailTrigger",
        "category": "trigger",
        "service": "gmailTrigger",
        "operation": "Gmail Trigger",
        "description": "Gmail Trigger",
        "position": [
          80,
          80
        ],
        "parameters": {
          "pollTimes": {
            "item": [
              {
                "mode": "everyMinute"
              }
            ]
          },
          "filters": {}
        }
      },
      {
        "id": "94e66749-e2c9-4be1-941d-d27cfac08365",
        "name": "Get Message",
        "type": "n8n-nodes-base.gmail",
        "category": "logic",
        "service": "gmail",
        "operation": "get",
        "description": "Get Message",
        "position": [
          382,
          80
        ],
        "parameters": {
          "operation": "get",
          "messageId": "={{ $json.id }}",
          "simple": false,
          "options": {}
        }
      },
      {
        "id": "3e063c3d-45a1-4359-8361-a0c7686923a2",
        "name": "Clean & Prepare Email Reply",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Clean & Prepare Email Reply",
        "description": "Clean & Prepare Email Reply",
        "position": [
          685,
          80
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const email = $json;\n\nconst sender = email.from?.value?.[0]?.address\n  ?.trim()\n  .toLowerCase();\n\nconst rawMessage = email.text || '';\n\nconst message = rawMessage\n  .split(/\\nOn .+wrote:\\s*\\n/i)[0]\n  .replace(/^>.*$/gm, '')\n  .trim();\n\nconst subject = email.subject || '';\nconst messageId = email.messageId || email.id;\n\nif (!sender) {\n  throw new Error('Sender email is missing');\n}\n\nif (!message) {\n  throw new Error('Email reply body is empty');\n}\n\nreturn {\n  json: {\n    email: sender,\n    message,\n    message_id: messageId,\n    thread_id: email.threadId || null,\n    subject,\n    received_at: email.date || null,\n    source: 'gmail',\n    is_reply: Boolean(email.inReplyTo)\n  }\n};"
        }
      },
      {
        "id": "1b1d4ed4-0d01-4325-ba75-b31f0ab6bfa3",
        "name": "Code in JavaScript",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Code in JavaScript",
        "description": "Code in JavaScript",
        "position": [
          382,
          349
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const data = $json.body;\n\nif (data.event_name !== 'contact_replied_linkedin_message') {\n  throw new Error('Not a LinkedIn reply event');\n}\n\nconst contact = data.contact || {};\nconst linkedinMessage = data.linkedin_message || {};\n\nreturn {\n  json: {\n    source: 'linkedin',\n    event: data.event_name,\n    getsales_lead_uuid: contact.uuid,\n    linkedin_url: contact.linkedin || contact.linkedin_url || null,\n    first_name: contact.first_name || null,\n    last_name: contact.last_name || null,\n    message: linkedinMessage.text || '',\n    message_type: linkedinMessage.type || null,\n    message_status: linkedinMessage.status || null,\n    conversation: data.latest_linkedin_conversation_thread?.messaging_thread || '',\n    received_at: contact.last_messaging_activity_at || null\n  }\n};"
        }
      },
      {
        "id": "6d340051-9af6-484e-9961-7e07fe10f8bb",
        "name": "Find Reply Prospect1",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Find Reply Prospect1",
        "position": [
          685,
          349
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "getsales_lead_uuid",
                "condition": "eq",
                "keyValue": "={{ $json.getsales_lead_uuid }}"
              }
            ]
          }
        }
      },
      {
        "id": "90bfcd12-bfd2-4f43-be0f-e89ff1e08662",
        "name": "Prospect Found?1",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Prospect Found?1",
        "description": "Prospect Found?1",
        "position": [
          987,
          349
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "4c6c0d0f-b87b-4cbd-add4-be98edab517f",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "f2f065ee-2881-42ac-b432-ed5538199922",
        "name": "Update LinkedIn Reply Status",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update LinkedIn Reply Status",
        "position": [
          1290,
          349
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "status",
                "fieldValue": "replied"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ null }}"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "9d47e3a7-f34e-4ed2-9de2-1b38a39eb2f6",
        "name": "Log LinkedIn Reply Event",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Log LinkedIn Reply Event",
        "description": "Log LinkedIn Reply Event",
        "position": [
          1592,
          349
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "prospect_id",
                "fieldValue": "={{ $('Update LinkedIn Reply Status').item.json.id }}"
              },
              {
                "fieldId": "step",
                "fieldValue": "={{ $('Update LinkedIn Reply Status').item.json.current_step }}"
              },
              {
                "fieldId": "channel",
                "fieldValue": "=linkedIn"
              },
              {
                "fieldId": "action",
                "fieldValue": "linkedin_reply"
              },
              {
                "fieldId": "message",
                "fieldValue": "={{ $('Code in JavaScript').item.json.message }}"
              },
              {
                "fieldId": "sent_at",
                "fieldValue": "={{ $('Code in JavaScript').item.json.received_at || $now.toISO() }}"
              }
            ]
          }
        }
      }
    ],
    "connections": [
      {
        "from": "a14e7bd8-9f55-463b-a350-80065f6f18e9",
        "to": "1b1d4ed4-0d01-4325-ba75-b31f0ab6bfa3"
      },
      {
        "from": "7b82ca43-1af8-4745-a49e-3efd6e2a4952",
        "to": "8634346c-cd6c-4c82-81b8-f70ea8b9be64"
      },
      {
        "from": "8634346c-cd6c-4c82-81b8-f70ea8b9be64",
        "to": "5f6bc4ee-816e-42a4-9ebe-e384ac2faa02",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "5f6bc4ee-816e-42a4-9ebe-e384ac2faa02",
        "to": "3083b901-3258-4010-a2e0-3f649a00ea22"
      },
      {
        "from": "31d765d4-4f98-41aa-9902-7d63201c1bd2",
        "to": "94e66749-e2c9-4be1-941d-d27cfac08365"
      },
      {
        "from": "94e66749-e2c9-4be1-941d-d27cfac08365",
        "to": "3e063c3d-45a1-4359-8361-a0c7686923a2",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "3e063c3d-45a1-4359-8361-a0c7686923a2",
        "to": "7b82ca43-1af8-4745-a49e-3efd6e2a4952"
      },
      {
        "from": "1b1d4ed4-0d01-4325-ba75-b31f0ab6bfa3",
        "to": "6d340051-9af6-484e-9961-7e07fe10f8bb"
      },
      {
        "from": "90bfcd12-bfd2-4f43-be0f-e89ff1e08662",
        "to": "f2f065ee-2881-42ac-b432-ed5538199922",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "6d340051-9af6-484e-9961-7e07fe10f8bb",
        "to": "90bfcd12-bfd2-4f43-be0f-e89ff1e08662"
      },
      {
        "from": "f2f065ee-2881-42ac-b432-ed5538199922",
        "to": "9d47e3a7-f34e-4ed2-9de2-1b38a39eb2f6"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-05 - Reply Handler\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"httpMethod\": \"POST\",\n        \"path\": \"outreach-reply\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.webhook\",\n      \"typeVersion\": 2.2,\n      \"position\": [\n        -64,\n        -336\n      ],\n      \"id\": \"a14e7bd8-9f55-463b-a350-80065f6f18e9\",\n      \"name\": \"Webhook\",\n      \"webhookId\": \"49b9a3aa-9e22-4ace-9157-45d66392dcb2\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"email\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.email }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        608,\n        -560\n      ],\n      \"id\": \"7b82ca43-1af8-4745-a49e-3efd6e2a4952\",\n      \"name\": \"Find Reply Prospect\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"4c6c0d0f-b87b-4cbd-add4-be98edab517f\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        832,\n        -560\n      ],\n      \"id\": \"8634346c-cd6c-4c82-81b8-f70ea8b9be64\",\n      \"name\": \"Prospect Found?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"replied\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ null }}\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1056,\n        -560\n      ],\n      \"id\": \"5f6bc4ee-816e-42a4-9ebe-e384ac2faa02\",\n      \"name\": \"Stop Prospect Sequence\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"prospect_id\",\n              \"fieldValue\": \"={{ $('Find Reply Prospect').item.json.id }}\"\n            },\n            {\n              \"fieldId\": \"step\",\n              \"fieldValue\": \"={{ $('Find Reply Prospect').item.json.current_step }}\"\n            },\n            {\n              \"fieldId\": \"channel\",\n              \"fieldValue\": \"={{ $('Clean & Prepare Email Reply').item.json.source }}\"\n            },\n            {\n              \"fieldId\": \"action\",\n              \"fieldValue\": \"reply_received\"\n            },\n            {\n              \"fieldId\": \"message\",\n              \"fieldValue\": \"={{ $('Clean & Prepare Email Reply').item.json.message }}\"\n            },\n            {\n              \"fieldId\": \"message_id\",\n              \"fieldValue\": \"={{ $('Clean & Prepare Email Reply').item.json.message_id }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1280,\n        -560\n      ],\n      \"id\": \"3083b901-3258-4010-a2e0-3f649a00ea22\",\n      \"name\": \"Log Reply Event\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"pollTimes\": {\n          \"item\": [\n            {\n              \"mode\": \"everyMinute\"\n            }\n          ]\n        },\n        \"filters\": {}\n      },\n      \"type\": \"n8n-nodes-base.gmailTrigger\",\n      \"typeVersion\": 1.4,\n      \"position\": [\n        -64,\n        -560\n      ],\n      \"id\": \"31d765d4-4f98-41aa-9902-7d63201c1bd2\",\n      \"name\": \"Gmail Trigger\",\n      \"credentials\": {\n        \"gmailOAuth2\": {\n          \"id\": \"hbL0ajjtYjwuU8EI\",\n          \"name\": \"Gmail account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"operation\": \"get\",\n        \"messageId\": \"={{ $json.id }}\",\n        \"simple\": false,\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.gmail\",\n      \"typeVersion\": 2.2,\n      \"position\": [\n        160,\n        -560\n      ],\n      \"id\": \"94e66749-e2c9-4be1-941d-d27cfac08365\",\n      \"name\": \"Get Message\",\n      \"webhookId\": \"9b74f600-98b3-4078-8aed-874443c15e3a\",\n      \"credentials\": {\n        \"gmailOAuth2\": {\n          \"id\": \"hbL0ajjtYjwuU8EI\",\n          \"name\": \"Gmail account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"const email = $json;\\n\\nconst sender = email.from?.value?.[0]?.address\\n  ?.trim()\\n  .toLowerCase();\\n\\nconst rawMessage = email.text || '';\\n\\nconst message = rawMessage\\n  .split(/\\\\nOn .+wrote:\\\\s*\\\\n/i)[0]\\n  .replace(/^>.*$/gm, '')\\n  .trim();\\n\\nconst subject = email.subject || '';\\nconst messageId = email.messageId || email.id;\\n\\nif (!sender) {\\n  throw new Error('Sender email is missing');\\n}\\n\\nif (!message) {\\n  throw new Error('Email reply body is empty');\\n}\\n\\nreturn {\\n  json: {\\n    email: sender,\\n    message,\\n    message_id: messageId,\\n    thread_id: email.threadId || null,\\n    subject,\\n    received_at: email.date || null,\\n    source: 'gmail',\\n    is_reply: Boolean(email.inReplyTo)\\n  }\\n};\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        384,\n        -560\n      ],\n      \"id\": \"3e063c3d-45a1-4359-8361-a0c7686923a2\",\n      \"name\": \"Clean & Prepare Email Reply\"\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"const data = $json.body;\\n\\nif (data.event_name !== 'contact_replied_linkedin_message') {\\n  throw new Error('Not a LinkedIn reply event');\\n}\\n\\nconst contact = data.contact || {};\\nconst linkedinMessage = data.linkedin_message || {};\\n\\nreturn {\\n  json: {\\n    source: 'linkedin',\\n    event: data.event_name,\\n    getsales_lead_uuid: contact.uuid,\\n    linkedin_url: contact.linkedin || contact.linkedin_url || null,\\n    first_name: contact.first_name || null,\\n    last_name: contact.last_name || null,\\n    message: linkedinMessage.text || '',\\n    message_type: linkedinMessage.type || null,\\n    message_status: linkedinMessage.status || null,\\n    conversation: data.latest_linkedin_conversation_thread?.messaging_thread || '',\\n    received_at: contact.last_messaging_activity_at || null\\n  }\\n};\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        160,\n        -336\n      ],\n      \"id\": \"1b1d4ed4-0d01-4325-ba75-b31f0ab6bfa3\",\n      \"name\": \"Code in JavaScript\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"getsales_lead_uuid\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.getsales_lead_uuid }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        384,\n        -336\n      ],\n      \"id\": \"6d340051-9af6-484e-9961-7e07fe10f8bb\",\n      \"name\": \"Find Reply Prospect1\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"4c6c0d0f-b87b-4cbd-add4-be98edab517f\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        608,\n        -336\n      ],\n      \"id\": \"90bfcd12-bfd2-4f43-be0f-e89ff1e08662\",\n      \"name\": \"Prospect Found?1\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"replied\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ null }}\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        832,\n        -336\n      ],\n      \"id\": \"f2f065ee-2881-42ac-b432-ed5538199922\",\n      \"name\": \"Update LinkedIn Reply Status\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"prospect_id\",\n              \"fieldValue\": \"={{ $('Update LinkedIn Reply Status').item.json.id }}\"\n            },\n            {\n              \"fieldId\": \"step\",\n              \"fieldValue\": \"={{ $('Update LinkedIn Reply Status').item.json.current_step }}\"\n            },\n            {\n              \"fieldId\": \"channel\",\n              \"fieldValue\": \"=linkedIn\"\n            },\n            {\n              \"fieldId\": \"action\",\n              \"fieldValue\": \"linkedin_reply\"\n            },\n            {\n              \"fieldId\": \"message\",\n              \"fieldValue\": \"={{ $('Code in JavaScript').item.json.message }}\"\n            },\n            {\n              \"fieldId\": \"sent_at\",\n              \"fieldValue\": \"={{ $('Code in JavaScript').item.json.received_at || $now.toISO() }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1056,\n        -336\n      ],\n      \"id\": \"9d47e3a7-f34e-4ed2-9de2-1b38a39eb2f6\",\n      \"name\": \"Log LinkedIn Reply Event\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    }\n  ],\n  \"pinData\": {},\n  \"connections\": {\n    \"Webhook\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Code in JavaScript\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Find Reply Prospect\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prospect Found?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prospect Found?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Stop Prospect Sequence\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Stop Prospect Sequence\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Log Reply Event\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Gmail Trigger\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Message\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Message\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Clean & Prepare Email Reply\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Clean & Prepare Email Reply\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Find Reply Prospect\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Code in JavaScript\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Find Reply Prospect1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prospect Found?1\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update LinkedIn Reply Status\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Find Reply Prospect1\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prospect Found?1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Update LinkedIn Reply Status\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Log LinkedIn Reply Event\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": true,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"a818ad50-35ec-48e7-b599-0768572f986f\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"kDfA9Rt6kG0hvwwn\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-06",
    "code": "WF-06",
    "name": "Daily Reports & Alerts Engine",
    "category": "Observability",
    "description": "Aggregates daily outreach metrics, sent counts, replies, and channel breakdown, transmitting summary digests to Telegram.",
    "nodeCount": 4,
    "connectionCount": 3,
    "nodes": [
      {
        "id": "1c7dd53c-cb91-4690-9064-3dee89608d02",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "category": "trigger",
        "service": "Schedule",
        "operation": "Schedule Trigger",
        "description": "Schedule Trigger",
        "position": [
          80,
          80
        ],
        "parameters": {
          "rule": {
            "interval": [
              {
                "triggerAtHour": 9
              }
            ]
          }
        }
      },
      {
        "id": "7571a3b1-d12d-4fb8-9445-49e99518021b",
        "name": "Get Outreach Events",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get Outreach Events",
        "position": [
          382,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "returnAll": true,
          "filters": {
            "conditions": [
              {
                "keyName": "sent_at",
                "condition": "gte",
                "keyValue": "={{ $now.minus({ days: 1 }).toISO() }}"
              }
            ]
          }
        }
      },
      {
        "id": "5395ad25-754a-4faa-915b-30bec5c790d0",
        "name": "Prepare Daily Report",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Prepare Daily Report",
        "description": "Prepare Daily Report",
        "position": [
          685,
          80
        ],
        "parameters": {
          "jsCode": "const events = $('Get Outreach Events')\n  .all()\n  .map(item => item.json)\n  .filter(event => event.id);\n\nconst count = action =>\n  events.filter(event => event.action === action).length;\n\nconst emailSent = events.filter(\n  event => event.channel === 'email' && event.action === 'email_sent'\n).length;\n\nconst linkedinActions = events.filter(\n  event => event.channel === 'linkedin'\n).length;\n\nconst replies = count('reply_received');\n\nconst report = [\n  '📊 DAILY OUTREACH REPORT',\n  '',\n  `Total Events: ${events.length}`,\n  `Emails Sent: ${emailSent}`,\n  `LinkedIn Actions: ${linkedinActions}`,\n  `Replies Received: ${replies}`,\n  '',\n  `Report Date: ${new Date().toISOString().slice(0, 10)}`\n].join('\\n');\n\nreturn [{ json: { report } }];\n"
        }
      },
      {
        "id": "0a021a89-300b-4b16-a7c0-38f7ac21131d",
        "name": "Send Daily Report",
        "type": "n8n-nodes-base.telegram",
        "category": "alert",
        "service": "Telegram",
        "operation": "Send Daily Report",
        "description": "Send Daily Report",
        "position": [
          987,
          80
        ],
        "parameters": {
          "chatId": "-1003811814921",
          "text": "={{ $json.report }}",
          "additionalFields": {}
        }
      }
    ],
    "connections": [
      {
        "from": "1c7dd53c-cb91-4690-9064-3dee89608d02",
        "to": "7571a3b1-d12d-4fb8-9445-49e99518021b"
      },
      {
        "from": "7571a3b1-d12d-4fb8-9445-49e99518021b",
        "to": "5395ad25-754a-4faa-915b-30bec5c790d0"
      },
      {
        "from": "5395ad25-754a-4faa-915b-30bec5c790d0",
        "to": "0a021a89-300b-4b16-a7c0-38f7ac21131d"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-06 - Reports & Alerts\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"rule\": {\n          \"interval\": [\n            {\n              \"triggerAtHour\": 9\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.scheduleTrigger\",\n      \"typeVersion\": 1.4,\n      \"position\": [\n        0,\n        0\n      ],\n      \"id\": \"1c7dd53c-cb91-4690-9064-3dee89608d02\",\n      \"name\": \"Schedule Trigger\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"returnAll\": true,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"sent_at\",\n              \"condition\": \"gte\",\n              \"keyValue\": \"={{ $now.minus({ days: 1 }).toISO() }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        224,\n        0\n      ],\n      \"id\": \"7571a3b1-d12d-4fb8-9445-49e99518021b\",\n      \"name\": \"Get Outreach Events\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const events = $('Get Outreach Events')\\n  .all()\\n  .map(item => item.json)\\n  .filter(event => event.id);\\n\\nconst count = action =>\\n  events.filter(event => event.action === action).length;\\n\\nconst emailSent = events.filter(\\n  event => event.channel === 'email' && event.action === 'email_sent'\\n).length;\\n\\nconst linkedinActions = events.filter(\\n  event => event.channel === 'linkedin'\\n).length;\\n\\nconst replies = count('reply_received');\\n\\nconst report = [\\n  '📊 DAILY OUTREACH REPORT',\\n  '',\\n  `Total Events: ${events.length}`,\\n  `Emails Sent: ${emailSent}`,\\n  `LinkedIn Actions: ${linkedinActions}`,\\n  `Replies Received: ${replies}`,\\n  '',\\n  `Report Date: ${new Date().toISOString().slice(0, 10)}`\\n].join('\\\\n');\\n\\nreturn [{ json: { report } }];\\n\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        448,\n        0\n      ],\n      \"id\": \"5395ad25-754a-4faa-915b-30bec5c790d0\",\n      \"name\": \"Prepare Daily Report\"\n    },\n    {\n      \"parameters\": {\n        \"chatId\": \"-1003811814921\",\n        \"text\": \"={{ $json.report }}\",\n        \"additionalFields\": {}\n      },\n      \"type\": \"n8n-nodes-base.telegram\",\n      \"typeVersion\": 1.2,\n      \"position\": [\n        672,\n        0\n      ],\n      \"id\": \"0a021a89-300b-4b16-a7c0-38f7ac21131d\",\n      \"name\": \"Send Daily Report\",\n      \"webhookId\": \"c2cb06a8-74d9-4306-a21b-746df89a5df5\",\n      \"credentials\": {\n        \"telegramApi\": {\n          \"id\": \"8NYHi7lgI6qzk4IP\",\n          \"name\": \"Telegram account\"\n        }\n      }\n    }\n  ],\n  \"pinData\": {},\n  \"connections\": {\n    \"Schedule Trigger\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get Outreach Events\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get Outreach Events\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prepare Daily Report\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare Daily Report\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Send Daily Report\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": false,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"570bff71-75c7-4d44-9ce7-e7f3363b50c3\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"OJOISDCvxQOC9PtJ\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-07",
    "code": "WF-07",
    "name": "Outreach Error Recovery & Incident Logger",
    "category": "Resilience",
    "description": "Catches unexpected n8n execution failures, writes error telemetry to automation_errors table, and broadcasts emergency alerts to Telegram.",
    "nodeCount": 4,
    "connectionCount": 3,
    "nodes": [
      {
        "id": "afef0228-d780-4b59-9002-6a578cd7db86",
        "name": "Error Trigger",
        "type": "n8n-nodes-base.errorTrigger",
        "category": "trigger",
        "service": "Error Trigger",
        "operation": "Error Trigger",
        "description": "Error Trigger",
        "position": [
          80,
          80
        ],
        "parameters": {}
      },
      {
        "id": "fedce43a-c94c-4db8-b93a-7ef2a5be9eff",
        "name": "Format Error Details",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Format Error Details",
        "description": "Format Error Details",
        "position": [
          382,
          80
        ],
        "parameters": {
          "jsCode": "const errorData = $input.first().json;\n\nconst workflowName = errorData.workflow?.name || 'Unknown Workflow';\nconst executionId = errorData.execution?.id || 'Unavailable';\nconst executionUrl = errorData.execution?.url || 'Unavailable';\nconst failedNode = errorData.execution?.lastNodeExecuted || 'Unknown Node';\nconst errorMessage =\n  errorData.execution?.error?.message || 'No error message available';\n\nreturn [{\n  json: {\n    workflow_name: workflowName,\n    execution_id: executionId,\n    failed_node: failedNode,\n    error_message: errorMessage,\n    execution_url: executionUrl,\n    telegram_message:\n`🚨 WORKFLOW ERROR ALERT\n\nWorkflow: ${workflowName}\nFailed Node: ${failedNode}\n\nError:\n${errorMessage}\n\nExecution ID: ${executionId}\nExecution: ${executionUrl}`\n  }\n}];"
        }
      },
      {
        "id": "3325b205-63d1-441d-b395-00b161301c7b",
        "name": "Create a row",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Create a row",
        "description": "Create a row",
        "position": [
          685,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "automation_errors",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "workflow_name",
                "fieldValue": "={{ $json.workflow_name }}"
              },
              {
                "fieldId": "execution_id",
                "fieldValue": "={{ $json.execution_id }}"
              },
              {
                "fieldId": "failed_node",
                "fieldValue": "={{ $json.failed_node }}"
              },
              {
                "fieldId": "error_message",
                "fieldValue": "={{ $json.error_message }}"
              },
              {
                "fieldId": "execution_url",
                "fieldValue": "={{ $json.execution_url }}"
              },
              {
                "fieldId": "status",
                "fieldValue": "open"
              },
              {
                "fieldId": "created_at",
                "fieldValue": "={{ $now }}"
              },
              {
                "fieldId": "telegram_message",
                "fieldValue": "={{ $json.telegram_message }}"
              }
            ]
          }
        }
      },
      {
        "id": "59059b50-4380-4654-8c33-375dccd14129",
        "name": "Send Alert",
        "type": "n8n-nodes-base.telegram",
        "category": "alert",
        "service": "Telegram",
        "operation": "Send Alert",
        "description": "Send Alert",
        "position": [
          987,
          80
        ],
        "parameters": {
          "chatId": "-1003811814921",
          "text": "={{ $json.telegram_message }}",
          "additionalFields": {}
        }
      }
    ],
    "connections": [
      {
        "from": "afef0228-d780-4b59-9002-6a578cd7db86",
        "to": "fedce43a-c94c-4db8-b93a-7ef2a5be9eff"
      },
      {
        "from": "fedce43a-c94c-4db8-b93a-7ef2a5be9eff",
        "to": "3325b205-63d1-441d-b395-00b161301c7b"
      },
      {
        "from": "3325b205-63d1-441d-b395-00b161301c7b",
        "to": "59059b50-4380-4654-8c33-375dccd14129"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-07 — Outreach Error Recovery\",\n  \"nodes\": [\n    {\n      \"parameters\": {},\n      \"type\": \"n8n-nodes-base.errorTrigger\",\n      \"typeVersion\": 1,\n      \"position\": [\n        0,\n        -48\n      ],\n      \"id\": \"afef0228-d780-4b59-9002-6a578cd7db86\",\n      \"name\": \"Error Trigger\"\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const errorData = $input.first().json;\\n\\nconst workflowName = errorData.workflow?.name || 'Unknown Workflow';\\nconst executionId = errorData.execution?.id || 'Unavailable';\\nconst executionUrl = errorData.execution?.url || 'Unavailable';\\nconst failedNode = errorData.execution?.lastNodeExecuted || 'Unknown Node';\\nconst errorMessage =\\n  errorData.execution?.error?.message || 'No error message available';\\n\\nreturn [{\\n  json: {\\n    workflow_name: workflowName,\\n    execution_id: executionId,\\n    failed_node: failedNode,\\n    error_message: errorMessage,\\n    execution_url: executionUrl,\\n    telegram_message:\\n`🚨 WORKFLOW ERROR ALERT\\n\\nWorkflow: ${workflowName}\\nFailed Node: ${failedNode}\\n\\nError:\\n${errorMessage}\\n\\nExecution ID: ${executionId}\\nExecution: ${executionUrl}`\\n  }\\n}];\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        224,\n        -48\n      ],\n      \"id\": \"fedce43a-c94c-4db8-b93a-7ef2a5be9eff\",\n      \"name\": \"Format Error Details\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"automation_errors\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"workflow_name\",\n              \"fieldValue\": \"={{ $json.workflow_name }}\"\n            },\n            {\n              \"fieldId\": \"execution_id\",\n              \"fieldValue\": \"={{ $json.execution_id }}\"\n            },\n            {\n              \"fieldId\": \"failed_node\",\n              \"fieldValue\": \"={{ $json.failed_node }}\"\n            },\n            {\n              \"fieldId\": \"error_message\",\n              \"fieldValue\": \"={{ $json.error_message }}\"\n            },\n            {\n              \"fieldId\": \"execution_url\",\n              \"fieldValue\": \"={{ $json.execution_url }}\"\n            },\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"open\"\n            },\n            {\n              \"fieldId\": \"created_at\",\n              \"fieldValue\": \"={{ $now }}\"\n            },\n            {\n              \"fieldId\": \"telegram_message\",\n              \"fieldValue\": \"={{ $json.telegram_message }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        448,\n        -48\n      ],\n      \"id\": \"3325b205-63d1-441d-b395-00b161301c7b\",\n      \"name\": \"Create a row\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"chatId\": \"-1003811814921\",\n        \"text\": \"={{ $json.telegram_message }}\",\n        \"additionalFields\": {}\n      },\n      \"type\": \"n8n-nodes-base.telegram\",\n      \"typeVersion\": 1.2,\n      \"position\": [\n        672,\n        -48\n      ],\n      \"id\": \"59059b50-4380-4654-8c33-375dccd14129\",\n      \"name\": \"Send Alert\",\n      \"webhookId\": \"c2cb06a8-74d9-4306-a21b-746df89a5df5\",\n      \"credentials\": {\n        \"telegramApi\": {\n          \"id\": \"8NYHi7lgI6qzk4IP\",\n          \"name\": \"Telegram account\"\n        }\n      }\n    }\n  ],\n  \"pinData\": {},\n  \"connections\": {\n    \"Error Trigger\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Format Error Details\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Format Error Details\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Create a row\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Create a row\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Send Alert\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": true,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\"\n  },\n  \"versionId\": \"405c00b1-306f-4886-81cc-20f81ba1801f\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"HYOqwn4rscn2EqOT\",\n  \"tags\": []\n}"
  },
  {
    "id": "WF-08",
    "code": "WF-08",
    "name": "GetSales Task Monitor & Bi-Directional Sync",
    "category": "Sync Engine",
    "description": "Polls GetSales.io task statuses, monitors connection acceptances and message delivery confirmations, and synchronizes state with Supabase.",
    "nodeCount": 21,
    "connectionCount": 18,
    "nodes": [
      {
        "id": "07430eac-5acc-4a13-8fe5-95520dbeeaac",
        "name": "Schedule Trigger",
        "type": "n8n-nodes-base.scheduleTrigger",
        "category": "trigger",
        "service": "Schedule",
        "operation": "Schedule Trigger",
        "description": "Schedule Trigger",
        "position": [
          80,
          195
        ],
        "parameters": {
          "rule": {
            "interval": [
              {
                "field": "minutes"
              }
            ]
          }
        }
      },
      {
        "id": "0924b705-5724-4b6d-bcbd-67b26c074231",
        "name": "GetSales - Get Recent Tasks",
        "type": "n8n-nodes-base.httpRequest",
        "category": "channel",
        "service": "HTTP Request",
        "operation": "GetSales - Get Recent Tasks",
        "description": "GetSales - Get Recent Tasks",
        "position": [
          382,
          195
        ],
        "parameters": {
          "url": "https://amazing.getsales.io/flows/api/tasks",
          "sendQuery": true,
          "queryParameters": {
            "parameters": [
              {
                "name": "limit",
                "value": "100"
              },
              {
                "name": "order_field",
                "value": "created_at"
              },
              {
                "name": "order_type",
                "value": "desc"
              }
            ]
          },
          "sendHeaders": true,
          "headerParameters": {
            "parameters": [
              {
                "name": "Authorization",
                "value": "Bearer YOUR_GETSALES_API_TOKEN"
              },
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ]
          },
          "options": {}
        }
      },
      {
        "id": "c69ae042-7e3e-4676-9e99-cd2db8fac374",
        "name": "Matching Lead Task Found?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Matching Lead Task Found?",
        "description": "Matching Lead Task Found?",
        "position": [
          1246,
          1904
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "4d8a6dbd-a8c9-4904-b050-42926ebe9eb1",
                "leftValue": "={{ ($json.data ?? []).some(task => task.lead_uuid === $('Preserve Lead + Enrollment Data').first().json.getsales_lead_uuid) }}",
                "rightValue": "",
                "operator": {
                  "type": "boolean",
                  "operation": "true",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "7c6b0326-d949-4f7a-86ba-8fb9d33c6e03",
        "name": "Extract GetSales Tasks",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Extract GetSales Tasks",
        "description": "Extract GetSales Tasks",
        "position": [
          685,
          195
        ],
        "parameters": {
          "jsCode": "const response = $input.first().json;\nconst tasks = response.data ?? [];\n\nreturn tasks.map(task => ({\n  json: {\n    task_uuid: task.uuid,\n    lead_uuid: task.lead_uuid,\n    enrollment_uuid: task.flow_lead_uuid,\n    task_type: task.type,\n    task_status: task.status,\n    error_msg: task.error_msg,\n    executed_at: task.executed_at,\n    created_at: task.created_at\n  }\n}));"
        }
      },
      {
        "id": "73366094-96e1-42e8-84d0-be6af5493bca",
        "name": "Find Prospect by GetSales Lead ID",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Find Prospect by GetSales Lead ID",
        "position": [
          987,
          195
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "getsales_lead_uuid",
                "condition": "eq",
                "keyValue": "={{ $json.lead_uuid }}"
              }
            ]
          }
        }
      },
      {
        "id": "0683e107-6b5a-44de-9175-5a2759eea095",
        "name": "Is Prospect Found?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Is Prospect Found?",
        "description": "Is Prospect Found?",
        "position": [
          1290,
          195
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "046016f2-3aa4-403d-9502-303a108f5f2e",
                "leftValue": "={{ $json.id }}",
                "rightValue": "",
                "operator": {
                  "type": "string",
                  "operation": "notEmpty",
                  "singleValue": true
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "0f043c24-6875-4b02-97ef-3ab0e93c026c",
        "name": "Is GetSales Task Done?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Is GetSales Task Done?",
        "description": "Is GetSales Task Done?",
        "position": [
          1592,
          195
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "9f768022-370d-432d-9242-3eafa4429bbf",
                "leftValue": "={{ $('Extract GetSales Tasks').item.json.task_status.toLowerCase() }}",
                "rightValue": "done",
                "operator": {
                  "type": "string",
                  "operation": "equals",
                  "name": "filter.operator.equals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "00706900-a9a7-4c52-92b0-7ccc34196450",
        "name": "Is GetSales Task Failed?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Is GetSales Task Failed?",
        "description": "Is GetSales Task Failed?",
        "position": [
          1894,
          310
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "07f98837-abff-4d28-aeb1-b80286283622",
                "leftValue": "={{ $('Extract GetSales Tasks').item.json.task_status.toLowerCase() }}",
                "rightValue": "failed",
                "operator": {
                  "type": "string",
                  "operation": "equals",
                  "name": "filter.operator.equals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "07b80b2c-c7a1-4ae9-809e-9f88612e69f8",
        "name": "Mark GetSales Action Sent",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Mark GetSales Action Sent",
        "position": [
          1894,
          80
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "request_sent"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "{{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "6107d8a0-5d82-49fa-b954-4ce71cb0317a",
        "name": "Mark GetSales Action Failed",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Mark GetSales Action Failed",
        "position": [
          2197,
          195
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "failed"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "{{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "76b1a58f-d6a6-4fce-9818-584809857722",
        "name": "Mark GetSales Action Failed1",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Mark GetSales Action Failed1",
        "position": [
          2197,
          426
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "{{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "88a62c24-3c9d-4284-b065-0751c6fb4027",
        "name": "Webhook",
        "type": "n8n-nodes-base.webhook",
        "category": "trigger",
        "service": "Webhook",
        "operation": "Webhook",
        "description": "Webhook",
        "position": [
          80,
          1078
        ],
        "parameters": {
          "httpMethod": "POST",
          "path": "getsales-connection-status",
          "authentication": "headerAuth",
          "options": {}
        }
      },
      {
        "id": "a64581fe-9a18-4d08-a432-77a01d74fbdf",
        "name": "Update Prospect — Connected",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update Prospect — Connected",
        "position": [
          1311,
          1098
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "linkedin_connected",
                "fieldValue": "=true"
              },
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "null"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "3175292d-7d50-4f0f-b8c4-7353d29a3ae9",
        "name": "Was LinkedIn Connection Accepted?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Was LinkedIn Connection Accepted?",
        "description": "Was LinkedIn Connection Accepted?",
        "position": [
          1009,
          1213
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "e500cca7-1273-4f15-8967-ffcc4e16ed3e",
                "leftValue": "={{ $('Webhook').first().json.body.connection_result }}",
                "rightValue": "connected",
                "operator": {
                  "type": "string",
                  "operation": "equals",
                  "name": "filter.operator.equals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "17b46866-3122-4ff5-b5dd-a00d129042a7",
        "name": "Find Prospect by GetSales Lead UUID",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Find Prospect by GetSales Lead UUID",
        "position": [
          382,
          1078
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "limit": 1,
          "filters": {
            "conditions": [
              {
                "keyName": "getsales_lead_uuid",
                "condition": "eq",
                "keyValue": "={{ $json.body.getsales_lead_uuid }}"
              }
            ]
          }
        }
      },
      {
        "id": "7c8e5dac-ab33-424b-8676-933812d6514e",
        "name": "Update Prospect — Not Connected",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update Prospect — Not Connected",
        "position": [
          1311,
          1328
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "linkedin_connected",
                "fieldValue": "=false"
              },
              {
                "fieldId": "getsales_action_status",
                "fieldValue": "failed"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      },
      {
        "id": "c85060e8-7e5e-440e-8d07-f0cb392637da",
        "name": "Is LinkedIn Message Sent?",
        "type": "n8n-nodes-base.if",
        "category": "logic",
        "service": "if",
        "operation": "Is LinkedIn Message Sent?",
        "description": "Is LinkedIn Message Sent?",
        "position": [
          685,
          1078
        ],
        "parameters": {
          "conditions": {
            "options": {
              "caseSensitive": true,
              "leftValue": "",
              "typeValidation": "strict",
              "version": 4
            },
            "conditions": [
              {
                "id": "e959486b-c13e-464c-a808-00f51c743299",
                "leftValue": "={{ $('Webhook').first().json.body.connection_result }}",
                "rightValue": "message_sent",
                "operator": {
                  "type": "string",
                  "operation": "equals",
                  "name": "filter.operator.equals"
                }
              }
            ],
            "combinator": "and"
          },
          "options": {}
        }
      },
      {
        "id": "e389385f-2fd8-4512-862f-8580515c1dec",
        "name": "Log Successful LinkedIn Message",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "Log Successful LinkedIn Message",
        "description": "Log Successful LinkedIn Message",
        "position": [
          1009,
          848
        ],
        "parameters": {
          "authentication": "oAuth2",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_events",
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "prospect_id",
                "fieldValue": "={{ $('Find Prospect by GetSales Lead UUID').first().json.id }}"
              },
              {
                "fieldId": "step",
                "fieldValue": "={{ Number($('Find Prospect by GetSales Lead UUID').first().json.current_step) + 1 }}"
              },
              {
                "fieldId": "channel",
                "fieldValue": "linkedin"
              },
              {
                "fieldId": "action",
                "fieldValue": "linkedin_message"
              },
              {
                "fieldId": "message",
                "fieldValue": "={{ $('Webhook').first().json.body.message }}"
              }
            ]
          }
        }
      },
      {
        "id": "5c0f5a9d-ddc5-4c61-a34d-14df1b59efdd",
        "name": "Get LinkedIn Scheduling Config",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "getAll",
        "description": "Get LinkedIn Scheduling Config",
        "position": [
          1354,
          848
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "getAll",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "outreach_config",
          "limit": 1
        }
      },
      {
        "id": "8c1772e3-54d2-41f5-94c6-f5a30bf718fd",
        "name": "Prepare LinkedIn Progress",
        "type": "n8n-nodes-base.code",
        "category": "code",
        "service": "Code",
        "operation": "Prepare LinkedIn Progress",
        "description": "Prepare LinkedIn Progress",
        "position": [
          1657,
          848
        ],
        "parameters": {
          "mode": "runOnceForEachItem",
          "jsCode": "const prospect = $('Find Prospect by GetSales Lead UUID').first().json;\nconst config = $input.item.json.config.scheduling;\n\nconst step = Number(prospect.current_step) + 1;\nconst timezone = prospect.timezone || config.default_timezone;\n\nconst minDays = Number(config.delay_business_days_min);\nconst maxDays = Number(config.delay_business_days_max);\nconst startHour = Number(config.business_start_hour);\n\nif (!timezone || minDays < 1 || maxDays < minDays) {\n  throw new Error('Invalid scheduling configuration');\n}\n\nfunction localParts(date) {\n  const parts = new Intl.DateTimeFormat('en-US', {\n    timeZone: timezone,\n    year: 'numeric',\n    month: 'numeric',\n    day: 'numeric'\n  }).formatToParts(date);\n\n  const result = {};\n  for (const p of parts) {\n    if (p.type !== 'literal') result[p.type] = Number(p.value);\n  }\n  return result;\n}\n\nfunction localToUTC(year, month, day, hour) {\n  const target = Date.UTC(year, month - 1, day, hour);\n  let guess = target;\n\n  for (let i = 0; i < 4; i++) {\n    const parts = new Intl.DateTimeFormat('en-US', {\n      timeZone: timezone,\n      year: 'numeric',\n      month: 'numeric',\n      day: 'numeric',\n      hour: 'numeric',\n      hourCycle: 'h23'\n    }).formatToParts(new Date(guess));\n\n    const p = {};\n    for (const part of parts) {\n      if (part.type !== 'literal') p[part.type] = Number(part.value);\n    }\n\n    guess += target - Date.UTC(p.year, p.month - 1, p.day, p.hour);\n  }\n\n  return new Date(guess);\n}\n\nfunction nextSendAt() {\n  const delay = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;\n  const now = localParts(new Date());\n  const date = new Date(Date.UTC(now.year, now.month - 1, now.day));\n\n  let added = 0;\n  while (added < delay) {\n    date.setUTCDate(date.getUTCDate() + 1);\n    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) added++;\n  }\n\n  return localToUTC(\n    date.getUTCFullYear(),\n    date.getUTCMonth() + 1,\n    date.getUTCDate(),\n    startHour\n  ).toISOString();\n}\n\nreturn {\n  json: {\n    prospect_id: prospect.id,\n    step,\n    next_send_at: step < 5 ? nextSendAt() : null,\n    status: step === 5 ? 'completed' : 'active'\n  }\n};\n"
        }
      },
      {
        "id": "67f1c959-9aac-4b84-958e-566b45ee15ca",
        "name": "Update LinkedIn Prospect Progress",
        "type": "n8n-nodes-base.supabase",
        "category": "database",
        "service": "Supabase",
        "operation": "update",
        "description": "Update LinkedIn Prospect Progress",
        "position": [
          2002,
          848
        ],
        "parameters": {
          "authentication": "oAuth2",
          "operation": "update",
          "projectRef": "wwimtwtynhssvpasbdjg",
          "tableId": "prospects",
          "filters": {
            "conditions": [
              {
                "keyName": "id",
                "condition": "eq",
                "keyValue": "={{ $json.prospect_id }}"
              }
            ]
          },
          "fieldsUi": {
            "fieldValues": [
              {
                "fieldId": "current_step",
                "fieldValue": "={{ $json.step }}"
              },
              {
                "fieldId": "next_send_at",
                "fieldValue": "={{ $json.next_send_at }}"
              },
              {
                "fieldId": "status",
                "fieldValue": "={{ $json.status }}"
              },
              {
                "fieldId": "processing",
                "fieldValue": "false"
              },
              {
                "fieldId": "processing_started_at",
                "fieldValue": "={{ null }}"
              }
            ]
          }
        }
      }
    ],
    "connections": [
      {
        "from": "0924b705-5724-4b6d-bcbd-67b26c074231",
        "to": "7c6b0326-d949-4f7a-86ba-8fb9d33c6e03"
      },
      {
        "from": "07430eac-5acc-4a13-8fe5-95520dbeeaac",
        "to": "0924b705-5724-4b6d-bcbd-67b26c074231"
      },
      {
        "from": "7c6b0326-d949-4f7a-86ba-8fb9d33c6e03",
        "to": "73366094-96e1-42e8-84d0-be6af5493bca"
      },
      {
        "from": "73366094-96e1-42e8-84d0-be6af5493bca",
        "to": "0683e107-6b5a-44de-9175-5a2759eea095"
      },
      {
        "from": "0683e107-6b5a-44de-9175-5a2759eea095",
        "to": "0f043c24-6875-4b02-97ef-3ab0e93c026c",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "0f043c24-6875-4b02-97ef-3ab0e93c026c",
        "to": "07b80b2c-c7a1-4ae9-809e-9f88612e69f8",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "0f043c24-6875-4b02-97ef-3ab0e93c026c",
        "to": "00706900-a9a7-4c52-92b0-7ccc34196450",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "00706900-a9a7-4c52-92b0-7ccc34196450",
        "to": "6107d8a0-5d82-49fa-b954-4ce71cb0317a",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "00706900-a9a7-4c52-92b0-7ccc34196450",
        "to": "76b1a58f-d6a6-4fce-9818-584809857722",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "88a62c24-3c9d-4284-b065-0751c6fb4027",
        "to": "17b46866-3122-4ff5-b5dd-a00d129042a7"
      },
      {
        "from": "3175292d-7d50-4f0f-b8c4-7353d29a3ae9",
        "to": "a64581fe-9a18-4d08-a432-77a01d74fbdf",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "3175292d-7d50-4f0f-b8c4-7353d29a3ae9",
        "to": "7c8e5dac-ab33-424b-8676-933812d6514e",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "17b46866-3122-4ff5-b5dd-a00d129042a7",
        "to": "c85060e8-7e5e-440e-8d07-f0cb392637da"
      },
      {
        "from": "c85060e8-7e5e-440e-8d07-f0cb392637da",
        "to": "e389385f-2fd8-4512-862f-8580515c1dec",
        "label": "True / Match",
        "sourceHandle": "output-true"
      },
      {
        "from": "c85060e8-7e5e-440e-8d07-f0cb392637da",
        "to": "3175292d-7d50-4f0f-b8c4-7353d29a3ae9",
        "label": "False / No Match",
        "sourceHandle": "output-false"
      },
      {
        "from": "5c0f5a9d-ddc5-4c61-a34d-14df1b59efdd",
        "to": "8c1772e3-54d2-41f5-94c6-f5a30bf718fd"
      },
      {
        "from": "8c1772e3-54d2-41f5-94c6-f5a30bf718fd",
        "to": "67f1c959-9aac-4b84-958e-566b45ee15ca"
      },
      {
        "from": "e389385f-2fd8-4512-862f-8580515c1dec",
        "to": "5c0f5a9d-ddc5-4c61-a34d-14df1b59efdd"
      }
    ],
    "rawJson": "{\n  \"name\": \"WF-08 — GetSales Task Monitor\",\n  \"nodes\": [\n    {\n      \"parameters\": {\n        \"rule\": {\n          \"interval\": [\n            {\n              \"field\": \"minutes\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.scheduleTrigger\",\n      \"typeVersion\": 1.4,\n      \"position\": [\n        -80,\n        0\n      ],\n      \"id\": \"07430eac-5acc-4a13-8fe5-95520dbeeaac\",\n      \"name\": \"Schedule Trigger\"\n    },\n    {\n      \"parameters\": {\n        \"url\": \"https://amazing.getsales.io/flows/api/tasks\",\n        \"sendQuery\": true,\n        \"queryParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"limit\",\n              \"value\": \"100\"\n            },\n            {\n              \"name\": \"order_field\",\n              \"value\": \"created_at\"\n            },\n            {\n              \"name\": \"order_type\",\n              \"value\": \"desc\"\n            }\n          ]\n        },\n        \"sendHeaders\": true,\n        \"headerParameters\": {\n          \"parameters\": [\n            {\n              \"name\": \"Authorization\",\n              \"value\": \"Bearer YOUR_GETSALES_API_TOKEN\"\n            },\n            {\n              \"name\": \"Content-Type\",\n              \"value\": \"application/json\"\n            }\n          ]\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.httpRequest\",\n      \"typeVersion\": 4.5,\n      \"position\": [\n        144,\n        0\n      ],\n      \"id\": \"0924b705-5724-4b6d-bcbd-67b26c074231\",\n      \"name\": \"GetSales - Get Recent Tasks\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"4d8a6dbd-a8c9-4904-b050-42926ebe9eb1\",\n              \"leftValue\": \"={{ ($json.data ?? []).some(task => task.lead_uuid === $('Preserve Lead + Enrollment Data').first().json.getsales_lead_uuid) }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"boolean\",\n                \"operation\": \"true\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        784,\n        1424\n      ],\n      \"id\": \"c69ae042-7e3e-4676-9e99-cd2db8fac374\",\n      \"name\": \"Matching Lead Task Found?\"\n    },\n    {\n      \"parameters\": {\n        \"jsCode\": \"const response = $input.first().json;\\nconst tasks = response.data ?? [];\\n\\nreturn tasks.map(task => ({\\n  json: {\\n    task_uuid: task.uuid,\\n    lead_uuid: task.lead_uuid,\\n    enrollment_uuid: task.flow_lead_uuid,\\n    task_type: task.type,\\n    task_status: task.status,\\n    error_msg: task.error_msg,\\n    executed_at: task.executed_at,\\n    created_at: task.created_at\\n  }\\n}));\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        368,\n        0\n      ],\n      \"id\": \"7c6b0326-d949-4f7a-86ba-8fb9d33c6e03\",\n      \"name\": \"Extract GetSales Tasks\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"getsales_lead_uuid\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.lead_uuid }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        592,\n        0\n      ],\n      \"id\": \"73366094-96e1-42e8-84d0-be6af5493bca\",\n      \"name\": \"Find Prospect by GetSales Lead ID\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"046016f2-3aa4-403d-9502-303a108f5f2e\",\n              \"leftValue\": \"={{ $json.id }}\",\n              \"rightValue\": \"\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"notEmpty\",\n                \"singleValue\": true\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        816,\n        0\n      ],\n      \"id\": \"0683e107-6b5a-44de-9175-5a2759eea095\",\n      \"name\": \"Is Prospect Found?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"9f768022-370d-432d-9242-3eafa4429bbf\",\n              \"leftValue\": \"={{ $('Extract GetSales Tasks').item.json.task_status.toLowerCase() }}\",\n              \"rightValue\": \"done\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"equals\",\n                \"name\": \"filter.operator.equals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1040,\n        0\n      ],\n      \"id\": \"0f043c24-6875-4b02-97ef-3ab0e93c026c\",\n      \"name\": \"Is GetSales Task Done?\"\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"07f98837-abff-4d28-aeb1-b80286283622\",\n              \"leftValue\": \"={{ $('Extract GetSales Tasks').item.json.task_status.toLowerCase() }}\",\n              \"rightValue\": \"failed\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"equals\",\n                \"name\": \"filter.operator.equals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        1264,\n        96\n      ],\n      \"id\": \"00706900-a9a7-4c52-92b0-7ccc34196450\",\n      \"name\": \"Is GetSales Task Failed?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"request_sent\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"{{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1264,\n        -96\n      ],\n      \"id\": \"07b80b2c-c7a1-4ae9-809e-9f88612e69f8\",\n      \"name\": \"Mark GetSales Action Sent\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"failed\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"{{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1488,\n        0\n      ],\n      \"id\": \"6107d8a0-5d82-49fa-b954-4ce71cb0317a\",\n      \"name\": \"Mark GetSales Action Failed\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"{{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1488,\n        192\n      ],\n      \"id\": \"76b1a58f-d6a6-4fce-9818-584809857722\",\n      \"name\": \"Mark GetSales Action Failed1\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"httpMethod\": \"POST\",\n        \"path\": \"getsales-connection-status\",\n        \"authentication\": \"headerAuth\",\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.webhook\",\n      \"typeVersion\": 2.2,\n      \"position\": [\n        -80,\n        736\n      ],\n      \"id\": \"88a62c24-3c9d-4284-b065-0751c6fb4027\",\n      \"name\": \"Webhook\",\n      \"webhookId\": \"e6d90ea8-6c5e-4f58-bc32-db8cb7ad85e8\",\n      \"credentials\": {\n        \"httpHeaderAuth\": {\n          \"id\": \"Rfu8xhks11DziXHT\",\n          \"name\": \"Header Auth account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"linkedin_connected\",\n              \"fieldValue\": \"=true\"\n            },\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"null\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        832,\n        752\n      ],\n      \"id\": \"a64581fe-9a18-4d08-a432-77a01d74fbdf\",\n      \"name\": \"Update Prospect — Connected\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"e500cca7-1273-4f15-8967-ffcc4e16ed3e\",\n              \"leftValue\": \"={{ $('Webhook').first().json.body.connection_result }}\",\n              \"rightValue\": \"connected\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"equals\",\n                \"name\": \"filter.operator.equals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        608,\n        848\n      ],\n      \"id\": \"3175292d-7d50-4f0f-b8c4-7353d29a3ae9\",\n      \"name\": \"Was LinkedIn Connection Accepted?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"limit\": 1,\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"getsales_lead_uuid\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.body.getsales_lead_uuid }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        144,\n        736\n      ],\n      \"id\": \"17b46866-3122-4ff5-b5dd-a00d129042a7\",\n      \"name\": \"Find Prospect by GetSales Lead UUID\",\n      \"alwaysOutputData\": true,\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"linkedin_connected\",\n              \"fieldValue\": \"=false\"\n            },\n            {\n              \"fieldId\": \"getsales_action_status\",\n              \"fieldValue\": \"failed\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        832,\n        944\n      ],\n      \"id\": \"7c8e5dac-ab33-424b-8676-933812d6514e\",\n      \"name\": \"Update Prospect — Not Connected\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"conditions\": {\n          \"options\": {\n            \"caseSensitive\": true,\n            \"leftValue\": \"\",\n            \"typeValidation\": \"strict\",\n            \"version\": 4\n          },\n          \"conditions\": [\n            {\n              \"id\": \"e959486b-c13e-464c-a808-00f51c743299\",\n              \"leftValue\": \"={{ $('Webhook').first().json.body.connection_result }}\",\n              \"rightValue\": \"message_sent\",\n              \"operator\": {\n                \"type\": \"string\",\n                \"operation\": \"equals\",\n                \"name\": \"filter.operator.equals\"\n              }\n            }\n          ],\n          \"combinator\": \"and\"\n        },\n        \"options\": {}\n      },\n      \"type\": \"n8n-nodes-base.if\",\n      \"typeVersion\": 2.4,\n      \"position\": [\n        368,\n        736\n      ],\n      \"id\": \"c85060e8-7e5e-440e-8d07-f0cb392637da\",\n      \"name\": \"Is LinkedIn Message Sent?\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_events\",\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"prospect_id\",\n              \"fieldValue\": \"={{ $('Find Prospect by GetSales Lead UUID').first().json.id }}\"\n            },\n            {\n              \"fieldId\": \"step\",\n              \"fieldValue\": \"={{ Number($('Find Prospect by GetSales Lead UUID').first().json.current_step) + 1 }}\"\n            },\n            {\n              \"fieldId\": \"channel\",\n              \"fieldValue\": \"linkedin\"\n            },\n            {\n              \"fieldId\": \"action\",\n              \"fieldValue\": \"linkedin_message\"\n            },\n            {\n              \"fieldId\": \"message\",\n              \"fieldValue\": \"={{ $('Webhook').first().json.body.message }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        608,\n        544\n      ],\n      \"id\": \"e389385f-2fd8-4512-862f-8580515c1dec\",\n      \"name\": \"Log Successful LinkedIn Message\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"getAll\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"outreach_config\",\n        \"limit\": 1\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        864,\n        544\n      ],\n      \"id\": \"5c0f5a9d-ddc5-4c61-a34d-14df1b59efdd\",\n      \"name\": \"Get LinkedIn Scheduling Config\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    },\n    {\n      \"parameters\": {\n        \"mode\": \"runOnceForEachItem\",\n        \"jsCode\": \"const prospect = $('Find Prospect by GetSales Lead UUID').first().json;\\nconst config = $input.item.json.config.scheduling;\\n\\nconst step = Number(prospect.current_step) + 1;\\nconst timezone = prospect.timezone || config.default_timezone;\\n\\nconst minDays = Number(config.delay_business_days_min);\\nconst maxDays = Number(config.delay_business_days_max);\\nconst startHour = Number(config.business_start_hour);\\n\\nif (!timezone || minDays < 1 || maxDays < minDays) {\\n  throw new Error('Invalid scheduling configuration');\\n}\\n\\nfunction localParts(date) {\\n  const parts = new Intl.DateTimeFormat('en-US', {\\n    timeZone: timezone,\\n    year: 'numeric',\\n    month: 'numeric',\\n    day: 'numeric'\\n  }).formatToParts(date);\\n\\n  const result = {};\\n  for (const p of parts) {\\n    if (p.type !== 'literal') result[p.type] = Number(p.value);\\n  }\\n  return result;\\n}\\n\\nfunction localToUTC(year, month, day, hour) {\\n  const target = Date.UTC(year, month - 1, day, hour);\\n  let guess = target;\\n\\n  for (let i = 0; i < 4; i++) {\\n    const parts = new Intl.DateTimeFormat('en-US', {\\n      timeZone: timezone,\\n      year: 'numeric',\\n      month: 'numeric',\\n      day: 'numeric',\\n      hour: 'numeric',\\n      hourCycle: 'h23'\\n    }).formatToParts(new Date(guess));\\n\\n    const p = {};\\n    for (const part of parts) {\\n      if (part.type !== 'literal') p[part.type] = Number(part.value);\\n    }\\n\\n    guess += target - Date.UTC(p.year, p.month - 1, p.day, p.hour);\\n  }\\n\\n  return new Date(guess);\\n}\\n\\nfunction nextSendAt() {\\n  const delay = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;\\n  const now = localParts(new Date());\\n  const date = new Date(Date.UTC(now.year, now.month - 1, now.day));\\n\\n  let added = 0;\\n  while (added < delay) {\\n    date.setUTCDate(date.getUTCDate() + 1);\\n    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) added++;\\n  }\\n\\n  return localToUTC(\\n    date.getUTCFullYear(),\\n    date.getUTCMonth() + 1,\\n    date.getUTCDate(),\\n    startHour\\n  ).toISOString();\\n}\\n\\nreturn {\\n  json: {\\n    prospect_id: prospect.id,\\n    step,\\n    next_send_at: step < 5 ? nextSendAt() : null,\\n    status: step === 5 ? 'completed' : 'active'\\n  }\\n};\\n\"\n      },\n      \"type\": \"n8n-nodes-base.code\",\n      \"typeVersion\": 2,\n      \"position\": [\n        1088,\n        544\n      ],\n      \"id\": \"8c1772e3-54d2-41f5-94c6-f5a30bf718fd\",\n      \"name\": \"Prepare LinkedIn Progress\"\n    },\n    {\n      \"parameters\": {\n        \"authentication\": \"oAuth2\",\n        \"operation\": \"update\",\n        \"projectRef\": \"wwimtwtynhssvpasbdjg\",\n        \"tableId\": \"prospects\",\n        \"filters\": {\n          \"conditions\": [\n            {\n              \"keyName\": \"id\",\n              \"condition\": \"eq\",\n              \"keyValue\": \"={{ $json.prospect_id }}\"\n            }\n          ]\n        },\n        \"fieldsUi\": {\n          \"fieldValues\": [\n            {\n              \"fieldId\": \"current_step\",\n              \"fieldValue\": \"={{ $json.step }}\"\n            },\n            {\n              \"fieldId\": \"next_send_at\",\n              \"fieldValue\": \"={{ $json.next_send_at }}\"\n            },\n            {\n              \"fieldId\": \"status\",\n              \"fieldValue\": \"={{ $json.status }}\"\n            },\n            {\n              \"fieldId\": \"processing\",\n              \"fieldValue\": \"false\"\n            },\n            {\n              \"fieldId\": \"processing_started_at\",\n              \"fieldValue\": \"={{ null }}\"\n            }\n          ]\n        }\n      },\n      \"type\": \"n8n-nodes-base.supabase\",\n      \"typeVersion\": 1,\n      \"position\": [\n        1344,\n        544\n      ],\n      \"id\": \"67f1c959-9aac-4b84-958e-566b45ee15ca\",\n      \"name\": \"Update LinkedIn Prospect Progress\",\n      \"credentials\": {\n        \"supabaseOAuth2Api\": {\n          \"id\": \"WfDeisyjmiEZ0037\",\n          \"name\": \"Supabase account\"\n        }\n      }\n    }\n  ],\n  \"pinData\": {\n    \"GetSales - Get Recent Tasks\": [\n      {\n        \"json\": {\n          \"data\": [\n            {\n              \"uuid\": \"9e9530f0-f582-4264-89ee-b12faeaf8fd0\",\n              \"parent_task_pipeline_uuid\": null,\n              \"team_id\": 14466,\n              \"assigned_to\": 16777,\n              \"flow_lead_uuid\": \"e60368e3-80ea-4dd6-80a0-d40f4967a537\",\n              \"flow_uuid\": \"56798720-1c12-44ab-a831-a8792f93dab4\",\n              \"flow_origin\": \"automation\",\n              \"flow_node_id\": 2,\n              \"sender_profile_uuid\": \"b29a23ad-f401-405f-b81d-762a1d6a08bb\",\n              \"mailbox_uuid\": null,\n              \"lead_uuid\": \"21c9d326-bda7-47dd-b090-4a6aa5abd39f\",\n              \"company_uuid\": \"0fad8189-92e4-41c2-b149-a2c003624c5b\",\n              \"type\": \"linkedin_send_connection_request\",\n              \"automation\": \"auto\",\n              \"automation_error_code\": null,\n              \"status\": \"failed\",\n              \"fork_result\": null,\n              \"payload\": [],\n              \"attempts\": 0,\n              \"error_msg\": \"Contact does not have a valid LinkedIn\",\n              \"timezone\": null,\n              \"number_in_line\": null,\n              \"priority\": 1,\n              \"schedule_at\": \"2026-11-22T17:32:32.000000Z\",\n              \"executed_at\": null,\n              \"taken_to_execute_at\": null,\n              \"user_id\": 0,\n              \"created_at\": \"2026-11-22T17:32:32.000000Z\",\n              \"updated_at\": \"2026-11-22T17:32:32.000000Z\"\n            },\n            {\n              \"uuid\": \"29f3f1b8-77b3-406b-a77e-ae638df512ad\",\n              \"parent_task_pipeline_uuid\": null,\n              \"team_id\": 14466,\n              \"assigned_to\": 16777,\n              \"flow_lead_uuid\": \"97a6026d-37ee-43cf-88ab-1aebc09e16e6\",\n              \"flow_uuid\": \"56798720-1c12-44ab-a831-a8792f93dab4\",\n              \"flow_origin\": \"automation\",\n              \"flow_node_id\": 2,\n              \"sender_profile_uuid\": \"b29a23ad-f401-405f-b81d-762a1d6a08bb\",\n              \"mailbox_uuid\": null,\n              \"lead_uuid\": \"e744104f-a55e-4e23-bc9d-3cdf91cc56eb\",\n              \"company_uuid\": \"4f8bac48-b35b-4209-aa1f-5458059e8efd\",\n              \"type\": \"linkedin_send_connection_request\",\n              \"automation\": \"auto\",\n              \"automation_error_code\": null,\n              \"status\": \"failed\",\n              \"fork_result\": null,\n              \"payload\": [],\n              \"attempts\": 0,\n              \"error_msg\": \"Contact does not have a valid LinkedIn\",\n              \"timezone\": null,\n              \"number_in_line\": null,\n              \"priority\": 1,\n              \"schedule_at\": \"2026-11-22T17:32:32.000000Z\",\n              \"executed_at\": null,\n              \"taken_to_execute_at\": null,\n              \"user_id\": 0,\n              \"created_at\": \"2026-11-22T17:32:32.000000Z\",\n              \"updated_at\": \"2026-11-22T17:32:32.000000Z\"\n            },\n            {\n              \"uuid\": \"972b508c-8691-466c-8a52-ac1cd0242f3f\",\n              \"parent_task_pipeline_uuid\": null,\n              \"team_id\": 14466,\n              \"assigned_to\": 16777,\n              \"flow_lead_uuid\": \"4c05670c-e5cc-42e1-9da2-08f73d2a6636\",\n              \"flow_uuid\": \"56798720-1c12-44ab-a831-a8792f93dab4\",\n              \"flow_origin\": \"automation\",\n              \"flow_node_id\": 2,\n              \"sender_profile_uuid\": \"b29a23ad-f401-405f-b81d-762a1d6a08bb\",\n              \"mailbox_uuid\": null,\n              \"lead_uuid\": \"f58a1bd1-e5b1-456b-bc4b-3878ebaa3e92\",\n              \"company_uuid\": \"4f8bac48-b35b-4209-aa1f-5458059e8efd\",\n              \"type\": \"linkedin_send_connection_request\",\n              \"automation\": \"auto\",\n              \"automation_error_code\": null,\n              \"status\": \"failed\",\n              \"fork_result\": null,\n              \"payload\": [],\n              \"attempts\": 0,\n              \"error_msg\": \"Contact does not have a valid LinkedIn\",\n              \"timezone\": null,\n              \"number_in_line\": null,\n              \"priority\": 1,\n              \"schedule_at\": \"2026-11-22T17:32:32.000000Z\",\n              \"executed_at\": null,\n              \"taken_to_execute_at\": null,\n              \"user_id\": 0,\n              \"created_at\": \"2026-11-22T17:32:32.000000Z\",\n              \"updated_at\": \"2026-11-22T17:32:32.000000Z\"\n            }\n          ],\n          \"limit\": 100,\n          \"offset\": 0,\n          \"total\": 3,\n          \"has_more\": false\n        },\n        \"pairedItem\": {\n          \"item\": 0\n        }\n      }\n    ]\n  },\n  \"connections\": {\n    \"GetSales - Get Recent Tasks\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Extract GetSales Tasks\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Schedule Trigger\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"GetSales - Get Recent Tasks\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Extract GetSales Tasks\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Find Prospect by GetSales Lead ID\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Find Prospect by GetSales Lead ID\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Is Prospect Found?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Is Prospect Found?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Is GetSales Task Done?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Is GetSales Task Done?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Mark GetSales Action Sent\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Is GetSales Task Failed?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Is GetSales Task Failed?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Mark GetSales Action Failed\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Mark GetSales Action Failed1\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Webhook\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Find Prospect by GetSales Lead UUID\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Was LinkedIn Connection Accepted?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update Prospect — Connected\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Update Prospect — Not Connected\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Find Prospect by GetSales Lead UUID\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Is LinkedIn Message Sent?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Is LinkedIn Message Sent?\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Log Successful LinkedIn Message\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ],\n        [\n          {\n            \"node\": \"Was LinkedIn Connection Accepted?\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Get LinkedIn Scheduling Config\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Prepare LinkedIn Progress\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Prepare LinkedIn Progress\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Update LinkedIn Prospect Progress\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    },\n    \"Log Successful LinkedIn Message\": {\n      \"main\": [\n        [\n          {\n            \"node\": \"Get LinkedIn Scheduling Config\",\n            \"type\": \"main\",\n            \"index\": 0\n          }\n        ]\n      ]\n    }\n  },\n  \"active\": false,\n  \"settings\": {\n    \"executionOrder\": \"v1\",\n    \"binaryMode\": \"separate\",\n    \"timeSavedMode\": \"fixed\",\n    \"errorWorkflow\": \"HYOqwn4rscn2EqOT\",\n    \"callerPolicy\": \"workflowsFromSameOwner\",\n    \"availableInMCP\": false\n  },\n  \"versionId\": \"8e57a535-437b-44c1-abde-b4a32b162aa1\",\n  \"meta\": {\n    \"templateCredsSetupCompleted\": true,\n    \"instanceId\": \"3e3e732aa16e576d1252ec13ce23fa018e15169d29d4fa8733541947ec8fd0af\"\n  },\n  \"nodeGroups\": [],\n  \"id\": \"9Zie3rnYTB0ULNTD\",\n  \"tags\": []\n}"
  }
];

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
      else if (typeStr.includes("email")) service = "Email";
      else if (typeStr.includes("code")) service = "Code";
      else if (typeStr.includes("httpRequest")) service = "HTTP Request";
      else if (typeStr.includes("webhook")) service = "Webhook";
      else if (typeStr.includes("scheduleTrigger")) service = "Schedule";
      else if (typeStr.includes("errorTrigger")) service = "Error Trigger";
      else if (typeStr.includes("executeWorkflow")) service = "Sub-Workflow";

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
