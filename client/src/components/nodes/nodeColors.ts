/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

/**
 * Central color registry for all node types.
 * Maps node type string → accent hex color.
 * Used by individual node components to pass their accent color to BaseNode.
 */
export const NODE_COLORS: Record<string, string> = {
    'async-data-aggregator': '#7c3aed', // Violet   — aggregation/merge
    'chart':                 '#0891b2', // Cyan     — visualization
    'data-flow-spy':         '#d97706', // Amber    — monitoring/observing
    'data-source':           '#059669', // Emerald  — source data
    'data-validation':       '#dc2626', // Red      — validation/errors
    'get-data':              '#2563eb', // Blue     — fetch/download
    'http':                  '#0d9488', // Teal     — web/HTTP
    'json-reformatter':      '#6366f1', // Indigo   — transform/code
    'llm-process':           '#9333ea', // Purple   — AI/LLM
    'stock-analysis':        '#16a34a', // Green    — finance/markets
    'timer':                 '#ea580c', // Orange   — clock/time
    'tool':                  '#db2777', // Pink     — AI tools
};

/** Get the accent color for a given node type, falling back to default teal. */
export const getNodeColor = (nodeType: string): string =>
    NODE_COLORS[nodeType] ?? '#00685f';
