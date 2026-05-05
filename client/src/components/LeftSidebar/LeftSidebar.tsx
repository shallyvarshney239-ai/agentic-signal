/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import React, {useState, useMemo} from 'react';
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
    NavArrowDown,
    NavArrowRight,
    Search,
} from 'iconoir-react';
import {AppNodeType} from '../nodes/workflow.gen';
import './LeftSidebar.scss';

// ── Node definitions grouped by section ──────────────────────────────────────

type NodeItem = {
    type: AppNodeType;
    label: string;
    description: string;
    icon: React.ReactElement;
    color: string;
};

type SectionDef = {
    key: string;
    label: string;
    accentColor: string;
    nodes: NodeItem[];
};

const SECTIONS: SectionDef[] = [
    {
        key: 'core',
        label: 'Core',
        accentColor: '#14B8A6',
        nodes: [
            {type: 'data-source', label: 'Data Source', description: 'Static text or JSON input', icon: <Database />, color: '#059669'},
            {type: 'get-data', label: 'GET Request', description: 'HTTP GET from any URL', icon: <DataTransferDown />, color: '#2563eb'},
            {type: 'http-data', label: 'HTTP Fetch', description: 'Full HTTP request node', icon: <Www />, color: '#0d9488'},
            {type: 'timer', label: 'Timer', description: 'Schedule or trigger on interval', icon: <Timer />, color: '#ea580c'},
        ],
    },
    {
        key: 'ai',
        label: 'AI',
        accentColor: '#8B5CF6',
        nodes: [
            {type: 'llm-process', label: 'LLM Process', description: 'Send text to AI models', icon: <Brain />, color: '#9333ea'},
            {type: 'ai-tool', label: 'AI Tool', description: 'Give AI callable tools', icon: <Tools />, color: '#db2777'},
        ],
    },
    {
        key: 'integrations',
        label: 'Integrations',
        accentColor: '#22C55E',
        nodes: [
            {type: 'stock-analysis', label: 'Stock Analysis', description: 'Real-time market data', icon: <StatsUpSquare />, color: '#16a34a'},
            {type: 'json-reformatter', label: 'JSON Transform', description: 'Reshape JSON structure', icon: <CodeBracketsSquare />, color: '#6366f1'},
        ],
    },
    {
        key: 'utilities',
        label: 'Utilities',
        accentColor: '#F59E0B',
        nodes: [
            {type: 'async-data-aggregator', label: 'Aggregator', description: 'Merge multiple data inputs', icon: <ArrowUnion />, color: '#7c3aed'},
            {type: 'data-validation', label: 'Validator', description: 'Validate data schema', icon: <BadgeCheck />, color: '#dc2626'},
            {type: 'chart', label: 'Chart', description: 'Visualize data as charts', icon: <GraphUp />, color: '#0891b2'},
            {type: 'data-flow-spy', label: 'Flow Spy', description: 'Debug intermediate data', icon: <Binocular />, color: '#d97706'},
        ],
    },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function LeftSidebar () {
    const [search, setSearch] = useState('');
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const toggleSection = (key: string) =>
        setCollapsed(prev => ({...prev, [key]: !prev[key]}));

    const filteredSections = useMemo(() => {
        if (!search.trim()) return SECTIONS;

        const q = search.toLowerCase();

        return SECTIONS.map(section => ({
            ...section,
            nodes: section.nodes.filter(
                n =>
                    n.label.toLowerCase().includes(q) ||
                    n.description.toLowerCase().includes(q)
            ),
        })).filter(s => s.nodes.length > 0);
    }, [search]);

    const onDragStart = (event: React.DragEvent, nodeType: AppNodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="left-sidebar">
            {/* Header */}
            <div className="left-sidebar-header">
                <span className="left-sidebar-title">Nodes</span>
            </div>

            {/* Search */}
            <div className="left-sidebar-search">
                <Search width={14} height={14} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search nodes..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="search-input"
                    spellCheck={false}
                />
            </div>

            {/* Sections */}
            <div className="left-sidebar-sections">
                {filteredSections.map(section => {
                    const isCollapsed = collapsed[section.key] ?? false;

                    return (
                        <div key={section.key} className="sidebar-section">
                            <button
                                className="section-header"
                                onClick={() => toggleSection(section.key)}
                                aria-expanded={!isCollapsed}
                            >
                                <span
                                    className="section-dot"
                                    style={{background: section.accentColor}}
                                />
                                <span className="section-label">{section.label}</span>
                                <span className="section-count">{section.nodes.length}</span>
                                <span className="section-chevron">
                                    {isCollapsed
                                        ? <NavArrowRight width={11} height={11} />
                                        : <NavArrowDown width={11} height={11} />
                                    }
                                </span>
                            </button>

                            {!isCollapsed && (
                                <div className="section-nodes">
                                    {section.nodes.map(node => (
                                        <div
                                            key={node.type}
                                            className="node-item"
                                            draggable
                                            onDragStart={e => onDragStart(e, node.type)}
                                            title={`${node.label} — ${node.description}\nDrag to canvas to use`}
                                            style={{'--node-color': node.color} as React.CSSProperties}
                                        >
                                            <div className="node-item-icon">
                                                {React.cloneElement(node.icon, {
                                                    width: 15,
                                                    height: 15,
                                                } as any)}
                                            </div>
                                            <div className="node-item-info">
                                                <span className="node-item-label">{node.label}</span>
                                                <span className="node-item-desc">{node.description}</span>
                                            </div>
                                            <div className="node-item-drag-handle">⠿</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {filteredSections.length === 0 && (
                    <div className="sidebar-empty">
                        <Search width={24} height={24} style={{opacity: 0.3, marginBottom: 8}} />
                        <span>No nodes match "<strong>{search}</strong>"</span>
                    </div>
                )}
            </div>

            {/* Footer hint */}
            <div className="left-sidebar-footer">
                <span>⠿ Drag onto canvas to add</span>
            </div>
        </aside>
    );
}
