/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

export type NodeRole = 'source' | 'processor' | 'sink';

export const NODE_ROLES: Record<string, NodeRole> = {
    'data-source':               'source',
    'http-data':                 'source',
    'get-data':                  'source',
    'timer':                     'source',
    'llm-process':               'processor',
    'json-reformatter':          'processor',
    'data-validation':           'processor',
    'stock-analysis':            'processor',
    'async-data-aggregator':     'processor',
    'chart':                     'sink',
    'data-flow-spy':             'sink',
    'ai-tool':                   'sink',
};

export const ROLE_LABELS: Record<NodeRole, string> = {
    source:    'SRC',
    processor: 'PROC',
    sink:      'OUT',
};

export const ROLE_COLORS: Record<NodeRole, string> = {
    source:    '#22c55e',
    processor: '#3b82f6',
    sink:      '#f59e0b',
};