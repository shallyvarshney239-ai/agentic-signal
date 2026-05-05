/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

/* eslint-disable max-len */

export interface WorkflowTemplate {
    id: string;
    name: string;
    description: string;
    nodeCount: number;
    nodes: any[];
    edges: any[];
}

// Node dimensions for layout calculations
const NODE_WIDTH = 240;
const NODE_HEIGHT = 72;
const H_GAP = 100; // horizontal gap between nodes
const H_STEP = NODE_WIDTH + H_GAP; // 340px per step
const V_GAP = 80; // vertical gap between nodes
const V_STEP = NODE_HEIGHT + V_GAP; // 152px per step
const START_X = 80;
const START_Y = 120;

const measured = {width: NODE_WIDTH, height: NODE_HEIGHT};

export const templates: WorkflowTemplate[] = [
    {
        id: "stock-price-tracker",
        name: "Stock Price Tracker",
        description: "Fetch real-time stock prices and visualize them in a chart",
        nodeCount: 3,
        nodes: [
            {
                id: "node-1",
                type: "data-source",
                position: {x: START_X, y: START_Y},
                data: {
                    title: "Stock Symbols",
                    dataSource: {
                        value: {text: "AAPL,GOOGL,MSFT", files: []},
                        type: "markdown"
                    }
                },
                measured
            },
            {
                id: "node-2",
                type: "http-data",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {
                    title: "Stock API",
                    url: "https://api.example.com/stocks",
                    method: "GET",
                    headers: {},
                    body: "",
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            },
            {
                id: "node-3",
                type: "chart",
                position: {x: START_X + H_STEP * 2, y: START_Y},
                data: {title: "Price Chart", chartType: "line"},
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    },
    {
        id: "ai-email-summarizer",
        name: "AI Email Summarizer",
        description: "Process email content through AI to generate concise summaries",
        nodeCount: 3,
        nodes: [
            {
                id: "node-1",
                type: "data-source",
                position: {x: START_X, y: START_Y},
                data: {
                    title: "Email Content",
                    dataSource: {
                        value: {text: "Paste your email text here...", files: []},
                        type: "markdown"
                    }
                },
                measured
            },
            {
                id: "node-2",
                type: "llm-process",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {
                    title: "Summarize with AI",
                    prompt: "Summarize the following email content in 2-3 sentences:\n\n{input}",
                    model: "",
                    maxFeedbackLoops: 0
                },
                measured
            },
            {
                id: "node-3",
                type: "data-flow-spy",
                position: {x: START_X + H_STEP * 2, y: START_Y},
                data: {title: "Summary Output"},
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    },
    {
        id: "weather-alert-bot",
        name: "Weather Alert Bot",
        description: "Schedule weather checks and send alerts via webhook when conditions are met",
        nodeCount: 4,
        nodes: [
            {
                id: "node-1",
                type: "timer",
                position: {x: START_X, y: START_Y},
                data: {title: "Weather Check Timer", timerTrigger: 3600},
                measured
            },
            {
                id: "node-2",
                type: "ai-tool",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {
                    title: "Weather Tool",
                    toolSubtype: "fetch-weather-data",
                    userConfig: {requireToolUse: true},
                    userConfigSchema: {
                        requireToolUse: {type: "boolean", description: "Require tool use", default: true}
                    }
                },
                measured
            },
            {
                id: "node-3",
                type: "data-validation",
                position: {x: START_X + H_STEP * 2, y: START_Y},
                data: {
                    title: "Condition Check",
                    validationRules: [{field: "temperature", operator: "gt", value: 30}]
                },
                measured
            },
            {
                id: "node-4",
                type: "http-data",
                position: {x: START_X + H_STEP * 3, y: START_Y},
                data: {
                    title: "Send Alert",
                    url: "https://hooks.example.com/alerts",
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: '{"alert": "High temperature detected"}',
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-3", source: "node-3", target: "node-4", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    },
    {
        id: "multi-source-dashboard",
        name: "Multi-Source Data Dashboard",
        description: "Aggregate data from multiple APIs and display in a unified dashboard",
        nodeCount: 5,
        nodes: [
            {
                id: "node-1",
                type: "async-data-aggregator",
                position: {x: START_X, y: START_Y + V_STEP},
                data: {title: "Data Aggregator"},
                measured
            },
            {
                id: "node-2",
                type: "http-data",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {title: "API Source 1", url: "https://api.example.com/data1", method: "GET", headers: {}, body: "", userConfig: {}, userConfigSchema: {}},
                measured
            },
            {
                id: "node-3",
                type: "http-data",
                position: {x: START_X + H_STEP, y: START_Y + V_STEP},
                data: {title: "API Source 2", url: "https://api.example.com/data2", method: "GET", headers: {}, body: "", userConfig: {}, userConfigSchema: {}},
                measured
            },
            {
                id: "node-4",
                type: "http-data",
                position: {x: START_X + H_STEP, y: START_Y + V_STEP * 2},
                data: {title: "API Source 3", url: "https://api.example.com/data3", method: "GET", headers: {}, body: "", userConfig: {}, userConfigSchema: {}},
                measured
            },
            {
                id: "node-5",
                type: "chart",
                position: {x: START_X + H_STEP * 2, y: START_Y + V_STEP},
                data: {title: "Dashboard", chartType: "mixed"},
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-1", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-3", source: "node-1", target: "node-4", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-4", source: "node-2", target: "node-5", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-5", source: "node-3", target: "node-5", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-6", source: "node-4", target: "node-5", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    },
    {
        id: "ai-web-search-assistant",
        name: "AI Web Search Assistant",
        description: "Search the web, process results with AI, and format into clean JSON",
        nodeCount: 4,
        nodes: [
            {
                id: "node-1",
                type: "data-source",
                position: {x: START_X, y: START_Y},
                data: {
                    title: "Search Query",
                    dataSource: {
                        value: {text: "Enter your search query here...", files: []},
                        type: "markdown"
                    }
                },
                measured
            },
            {
                id: "node-2",
                type: "ai-tool",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {
                    title: "Web Search",
                    toolSubtype: "web-search",
                    userConfig: {requireToolUse: true},
                    userConfigSchema: {requireToolUse: {type: "boolean", description: "Require tool use", default: true}}
                },
                measured
            },
            {
                id: "node-3",
                type: "llm-process",
                position: {x: START_X + H_STEP * 2, y: START_Y},
                data: {
                    title: "AI Analysis",
                    prompt: "Analyze the search results and provide key insights:\n\n{input}",
                    model: "",
                    maxFeedbackLoops: 0
                },
                measured
            },
            {
                id: "node-4",
                type: "json-reformatter",
                position: {x: START_X + H_STEP * 3, y: START_Y},
                data: {
                    title: "Format Output",
                    outputFormat: {
                        type: "object",
                        properties: {
                            query: {type: "string"},
                            results: {type: "array"},
                            summary: {type: "string"}
                        }
                    }
                },
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-3", source: "node-3", target: "node-4", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    },
    {
        id: "simple-scheduled-report",
        name: "Simple Scheduled Report",
        description: "Periodically fetch data, generate charts, and send reports via email",
        nodeCount: 5,
        nodes: [
            {
                id: "node-1",
                type: "timer",
                position: {x: START_X, y: START_Y},
                data: {title: "Daily Schedule", timerTrigger: 86400},
                measured
            },
            {
                id: "node-2",
                type: "data-source",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {
                    title: "Report Data",
                    dataSource: {
                        value: {text: "Enter report data or description here...", files: []},
                        type: "markdown"
                    }
                },
                measured
            },
            {
                id: "node-3",
                type: "http-data",
                position: {x: START_X + H_STEP * 2, y: START_Y},
                data: {
                    title: "Fetch Metrics",
                    url: "https://api.example.com/metrics",
                    method: "GET",
                    headers: {},
                    body: "",
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            },
            {
                id: "node-4",
                type: "chart",
                position: {x: START_X + H_STEP * 3, y: START_Y},
                data: {title: "Report Chart", chartType: "bar"},
                measured
            },
            {
                id: "node-5",
                type: "http-data",
                position: {x: START_X + H_STEP * 4, y: START_Y},
                data: {
                    title: "Send Report",
                    url: "https://api.example.com/send-email",
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: '{"subject": "Daily Report", "body": "See attached chart"}',
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-3", source: "node-3", target: "node-4", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-4", source: "node-4", target: "node-5", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    },
    {
        id: "garage-inference-demo",
        name: "Garage Inference Demo",
        description: "Demonstrates every technique: weak model + strong engineering = usable output. 4-pass pipeline, consistency voting, fallback, validation.",
        nodeCount: 5,
        nodes: [
            {
                id: "node-1",
                type: "data-source",
                position: {x: START_X, y: START_Y},
                data: {
                    title: "Input Data",
                    dataSource: {
                        value: {text: "Company: CodeForge AI\nRevenue Q1: $12.4M\nRevenue Q2: $18.7M\nRevenue Q3: $15.2M\nCustomers: 3400\nLaunch: Jan 2024\n\nSource: internal-report-2025.pdf\n\nContact: hello@codeforge.ai\nWebsite: https://codeforge.ai\n\nWe are seeing strong growth in Q2 due to the new enterprise tier launch. Customer satisfaction is at 94%. Key risk: competition from large cloud providers.", files: []},
                        type: "markdown"
                    }
                },
                measured
            },
            {
                id: "node-2",
                type: "llm-process",
                position: {x: START_X + H_STEP, y: START_Y},
                data: {
                    title: "Llama 3.2 3B (Tier 1)",
                    model: "",
                    prompt: "Analyze the provided company data. Extract all financial metrics, key facts, and provide a structured summary. Be factual and concise.",
                    message: {preffix: "Extract structured data from the following company report:\n\n", suffix: "\n\nOutput ONLY valid JSON - no other text."},
                    format: {
                        onSuccess: `{
  "type": "object",
  "properties": {
    "company_name": {"type": "string"},
    "quarterly_revenue": {"type": "object"},
    "total_customers": {"type": "number"},
    "founded": {"type": "string"},
    "contact_email": {"type": "string"},
    "website": {"type": "string"},
    "key_insights": {"type": "array", "items": {"type": "string"}}
  },
  "required": ["company_name", "quarterly_revenue", "key_insights"]
}`,
                        onError: `{
  "type": "object",
  "properties": {
    "error": {"type": "string"},
    "reason": {"type": "string"}
  },
  "required": ["error"]
}`
                    },
                    maxFeedbackLoops: 3,
                    maxToolRetries: 3,
                    pipelineMode: {enabled: true, stages: ["classifier", "extractor", "generator", "validator"]},
                    consistencyMode: {enabled: true, runs: 3},
                    fallbackMode: {enabled: true}
                },
                measured
            },
            {
                id: "node-3",
                type: "json-reformatter",
                position: {x: START_X + 2 * H_STEP, y: START_Y},
                data: {
                    title: "Format Output",
                    expression: "{\"company\": company_name, \"revenue_total_M\": $sum(quarterly_revenue.*), \"customer_count\": total_customers, \"contact\": contact_email, \"insights\": key_insights}",
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            },
            {
                id: "node-4",
                type: "data-validation",
                position: {x: START_X + 3 * H_STEP, y: START_Y},
                data: {
                    title: "Validate Structure",
                    jsonSchema: `{
  "type": "object",
  "properties": {
    "company": {"type": "string", "minLength": 2},
    "revenue_total_M": {"type": "number", "minimum": 0},
    "customer_count": {"type": "number", "minimum": 0},
    "insights": {"type": "array", "minItems": 1}
  },
  "required": ["company", "revenue_total_M", "insights"]
}`,
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            },
            {
                id: "node-5",
                type: "chart",
                position: {x: START_X + 4 * H_STEP, y: START_Y},
                data: {
                    title: "Revenue Chart",
                    chartType: "bar",
                    chartConfig: {labelKey: "quarter", dataKey: "value"},
                    chartData: {
                        value: [{quarter: "Q1", value: 12.4}, {quarter: "Q2", value: 18.7}, {quarter: "Q3", value: 15.2}]
                    },
                    userConfig: {},
                    userConfigSchema: {}
                },
                measured
            }
        ],
        edges: [
            {id: "edge-1", source: "node-1", target: "node-2", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-2", source: "node-2", target: "node-3", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-3", source: "node-3", target: "node-4", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false},
            {id: "edge-4", source: "node-4", target: "node-5", sourceHandle: "right-source", targetHandle: "left-target", type: "smoothstep", animated: false}
        ]
    }
];