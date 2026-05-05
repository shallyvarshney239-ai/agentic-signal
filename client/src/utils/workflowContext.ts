/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import type {Edge} from '@xyflow/react';
import type {AppNode} from '../components/nodes/workflow.gen';

const SENSITIVE_FIELDS = [
    'apikey', 'api_key', 'password', 'secret', 'token',
    'bearer', 'authtoken', 'privatekey', 'credential',
    'auth', 'key', 'secretkey', 'access_token'
];

const EXCLUDED_FIELDS = [
    'onConfigChange', 'onResultUpdate', 'onFeedbackSend',
    'handler', 'toSanitize', 'input', 'timerTrigger',
    'feedback', 'conversationHistory', '_retryTrigger'
];

const INJECTION_PATTERNS: [RegExp, string][] = [
    [/<\|start_header_id\|>/gi, '[FILTERED]'],
    [/<\|end_header_id\|>/gi, '[FILTERED]'],
    [/<\|eot_id\|>/gi, '[FILTERED]'],
    [/<\|begin_of_text\|>/gi, '[FILTERED]'],
    [/ignore previous instructions/gi, '[FILTERED]'],
    [/ignore all previous/gi, '[FILTERED]'],
    [/\bsystem:\s*$/gim, '[FILTERED]'],
    [/\[INST\]/gi, '[FILTERED]'],
    [/\[\/INST\]/gi, '[FILTERED]'],
];

function stripPromptInjection (text: string): string {
    let result = text;

    for (const [pattern, replacement] of INJECTION_PATTERNS) {
        result = result.replace(pattern, replacement);
    }

    return result;
}

function isSensitiveField (key: string): boolean {
    const lowerKey = key.toLowerCase();

    return SENSITIVE_FIELDS.some(field => lowerKey.includes(field));
}

function sanitizeValue (value: any): any {
    if (value === null || value === undefined) {
        return null;
    }

    if (typeof value === 'string') {
        const sanitized = stripPromptInjection(value);

        if (sanitized.length > 200) {
            return `${sanitized.slice(0, 200)}... [truncated]`;
        }

        return sanitized;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
        return value;
    }

    if (Array.isArray(value)) {
        return value.slice(0, 50).map(sanitizeValue);
    }

    if (typeof value === 'object') {
        const result: Record<string, any> = {};

        for (const [k, v] of Object.entries(value)) {
            if (EXCLUDED_FIELDS.includes(k)) {
                continue;
            }

            if (isSensitiveField(k)) {
                result[k] = '[REDACTED]';
            } else {
                result[k] = sanitizeValue(v);
            }
        }

        return result;
    }

    return '[unknown]';
}

export interface SanitizedNode {
    id: string;
    type: string;
    title: string;
    position: {x: number; y: number};
    data: Record<string, any>;
}

export function sanitizeNodeForAI (node: AppNode): SanitizedNode {
    const sanitizedData: Record<string, any> = {};

    for (const [key, value] of Object.entries(node.data)) {
        if (EXCLUDED_FIELDS.includes(key)) {
            continue;
        }

        if (isSensitiveField(key)) {
            sanitizedData[key] = '[REDACTED - sensitive]';
            continue;
        }

        if (value !== undefined && value !== null) {
            sanitizedData[key] = sanitizeValue(value);
        }
    }

    return {
        id: node.id,
        type: node.type,
        title: (node.data as any).title || node.type,
        position: {x: Math.round(node.position.x), y: Math.round(node.position.y)},
        data: sanitizedData
    };
}

export interface WorkflowConnection {
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
}

export function generateWorkflowContext (nodes: AppNode[], edges: Edge[]): string {
    if (nodes.length === 0) {
        return `
═══════════════════════════════════════════════════
CURRENT WORKFLOW STATE
═══════════════════════════════════════════════════
The canvas is empty. No nodes or connections exist.
You can start building a new workflow from scratch.

Available node types you can add:
• data-source: Static data input (JSON or Markdown)
• get-data: HTTP GET requests to external APIs
• http-data: Fetch rendered web pages (headless browser)
• timer: Trigger workflow at intervals
• llm-process: AI text processing with Ollama
• tool: External functions (search, weather, etc.)
• json-reformatter: Transform and filter data
• data-validation: Validate data against JSON schemas
• stock-analysis: Stock market data with indicators
• async-data-aggregator: Combine multiple data sources
• chart: Visualize data as charts
• data-flow-spy: Debug workflow data flow

═══════════════════════════════════════════════════
`;
    }

    const sanitizedNodes = nodes.map(sanitizeNodeForAI);

    const nodeList = sanitizedNodes.map(node => {
        const dataEntries = Object.entries(node.data);
        const dataSummary = dataEntries.length > 0
            ? dataEntries
                .map(([k, v]) => `    ${k}: ${formatValue(v)}`)
                .join('\n')
            : '    (no configuration)';

        return `
┌─ ${node.title} (${node.type})
│  ID: ${node.id}
│  Position: (${node.position.x}, ${node.position.y})
│  Config:
${dataSummary}
└─`;
    }).join('\n');

    const edgeList = edges.length > 0
        ? edges.map(edge => {
            const sourceNode = sanitizedNodes.find(n => n.id === edge.source);
            const targetNode = sanitizedNodes.find(n => n.id === edge.target);
            const sourceName = sourceNode?.title || edge.source;
            const targetName = targetNode?.title || edge.target;
            const portInfo = edge.targetHandle ? ` (${edge.targetHandle})` : '';

            return `    ${sourceName} → ${targetName}${portInfo}`;
        }).join('\n')
        : '    No connections';

    return `
═══════════════════════════════════════════════════
CURRENT WORKFLOW STATE
═══════════════════════════════════════════════════
Canvas: ${nodes.length} node(s), ${edges.length} connection(s)

NODES:
${nodeList}

CONNECTIONS:
${edgeList}
═══════════════════════════════════════════════════

IMPORTANT CONTEXT:
• This shows the user's current workflow setup
• You can suggest modifications that integrate with existing nodes
• Changes require user permission before being applied
• Sensitive data (API keys, tokens) is automatically masked

═══════════════════════════════════════════════════
`;
}

function formatValue (value: any): string {
    if (value === null) return 'null';

    if (value === undefined) return 'undefined';

    if (typeof value === 'string') {
        if (value.length > 80) return `"${value.slice(0, 80)}..."`;

        if (value === '') return '(empty string)';

        return `"${value}"`;
    }

    if (typeof value === 'number') return String(value);

    if (typeof value === 'boolean') return value ? 'true' : 'false';

    if (Array.isArray(value)) {
        if (value.length === 0) return '[]';

        if (value.length <= 3) return JSON.stringify(value);

        return `[${value.length} items]`;
    }

    if (typeof value === 'object') {
        const keys = Object.keys(value);

        if (keys.length === 0) return '{}';

        if (keys.length <= 3) return JSON.stringify(value);

        return `{${keys.length} keys}`;
    }

    return String(value);
}

export function generateModificationPreview (plan: {
    explanation: string;
    changes: {
        addNodes?: any[];
        removeNodeIds?: string[];
        addEdges?: WorkflowConnection[];
        removeEdgeIds?: string[];
    };
}, nodes: AppNode[]): string {
    const lines: string[] = [];

    lines.push('📋 Proposed Changes:');
    lines.push('');
    lines.push(plan.explanation);
    lines.push('');
    lines.push('Changes:');

    if (plan.changes.addNodes?.length) {
        lines.push(`  + ${plan.changes.addNodes.length} new node(s):`);
        plan.changes.addNodes.forEach(node => {
            const typeName = node.type || 'unknown';
            const pos = node.position ? `at (${node.position.x}, ${node.position.y})` : '';

            lines.push(`      • ${typeName} ${pos}`);
        });
    }

    if (plan.changes.removeNodeIds?.length) {
        lines.push(`  - ${plan.changes.removeNodeIds.length} node(s) to remove:`);
        plan.changes.removeNodeIds.forEach(id => {
            const node = nodes.find(n => n.id === id);
            const name = node?.data?.title || id;

            lines.push(`      • ${name} (${id})`);
        });
    }

    if (plan.changes.addEdges?.length) {
        lines.push(`  + ${plan.changes.addEdges.length} new connection(s):`);
        plan.changes.addEdges.forEach(edge => {
            lines.push(`      • ${edge.source} → ${edge.target}`);
        });
    }

    if (plan.changes.removeEdgeIds?.length) {
        lines.push(`  - ${plan.changes.removeEdgeIds.length} connection(s) to remove`);
    }

    return lines.join('\n');
}