/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import React from 'react';
import './NodesDock.scss';
import {ThemeProvider} from '@mui/material';
import {
    ArrowUnion,
    BadgeCheck,
    Binocular,
    Brain,
    CodeBracketsSquare,
    Database,
    DataTransferDown,
    GraphUp,
    StatsUpSquare,
    Timer,
    Tools,
    Www,
} from 'iconoir-react';
import {darkTheme} from '../../../../utils';
import {nodeRegistry} from '../../../nodes/nodeRegistry.gen';
import {AppNodeType} from '../../../nodes/workflow.gen';
import {getNodeColor} from '../../../nodes/nodeColors';
import {NodeDockTooltip} from '../NodeDockTooltip';


type DockIconVariant =
    | 'aggregate'
    | 'chart'
    | 'spy'
    | 'source'
    | 'validation'
    | 'download'
    | 'http'
    | 'json'
    | 'llm'
    | 'stocks'
    | 'timer'
    | 'tools';

type NodeConfig = {
    type: AppNodeType;
    label: string;
    shortLabel: string;
    icon: React.ReactElement<{className?: string}>;
    color: string;
    variant: DockIconVariant;
};

/** Short labels for display in the dock */
const SHORT_LABELS: Partial<Record<AppNodeType, string>> = {
    'async-data-aggregator': 'Aggregate',
    'chart':                 'Chart',
    'data-flow-spy':         'Flow Spy',
    'data-source':           'Data',
    'data-validation':       'Validate',
    'get-data':              'GET Data',
    'http-data':             'Fetch Web',
    'json-reformatter':      'JSON',
    'llm-process':           'AI LLM',
    'stock-analysis':        'Stocks',
    'timer':                 'Timer',
    'ai-tool':               'AI Tool',
};

const SIDEBAR_ICONS: Record<AppNodeType, {icon: React.ReactElement<{className?: string}>; variant: DockIconVariant}> = {
    'async-data-aggregator': {icon: <ArrowUnion />, variant: 'aggregate'},
    'chart':                 {icon: <GraphUp />, variant: 'chart'},
    'data-flow-spy':         {icon: <Binocular />, variant: 'spy'},
    'data-source':           {icon: <Database />, variant: 'source'},
    'data-validation':       {icon: <BadgeCheck />, variant: 'validation'},
    'get-data':              {icon: <DataTransferDown />, variant: 'download'},
    'http-data':             {icon: <Www />, variant: 'http'},
    'json-reformatter':      {icon: <CodeBracketsSquare />, variant: 'json'},
    'llm-process':           {icon: <Brain />, variant: 'llm'},
    'stock-analysis':        {icon: <StatsUpSquare />, variant: 'stocks'},
    'timer':                 {icon: <Timer />, variant: 'timer'},
    'ai-tool':               {icon: <Tools />, variant: 'tools'},
};

const nodeConfigs: NodeConfig[] = nodeRegistry.map((desc) => ({
    ...SIDEBAR_ICONS[desc.type],
    type: desc.type,
    label: desc.title,
    shortLabel: SHORT_LABELS[desc.type] ?? desc.title,
    color: getNodeColor(desc.type),
}));


export function NodesDock () {
    const onDragStart = (event: React.DragEvent, nodeType: AppNodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const onDragEnd = (event: React.DragEvent) => {
        event.currentTarget.classList.remove('dragging');
    };

    const onDragStartVisual = (event: React.DragEvent) => {
        event.currentTarget.classList.add('dragging');
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="nodes-dock">
                <div className="dock-items">
                    {nodeConfigs.map((config) => (
                        <NodeDockTooltip
                            key={config.type}
                            nodeType={config.type}
                            label={config.label}
                        >
                            <div
                                className={`dock-item dock-item--${config.variant}`}
                                draggable
                                style={{'--item-color': config.color} as React.CSSProperties}
                                onDragStart={(event) => {
                                    onDragStart(event, config.type);
                                    onDragStartVisual(event);
                                }}
                                onDragEnd={onDragEnd}
                            >
                                <div className="dock-item-icon-wrapper">
                                    {React.cloneElement(config.icon, {
                                        className: `${config.icon.props.className ?? ""} dock-item-icon`.trim()
                                    })}
                                </div>
                                <span className="dock-item-label">{config.shortLabel}</span>
                            </div>
                        </NodeDockTooltip>
                    ))}
                </div>
            </div>
        </ThemeProvider>
    );
}
