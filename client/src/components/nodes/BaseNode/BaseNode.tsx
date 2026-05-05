/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {Handle, IsValidConnection, Position, useReactFlow, useStore} from "@xyflow/react";
import "./BaseNode.scss";
import {AppWindow, Play, Settings, EyeSolid, PlaySolid} from "iconoir-react";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import {ThemeProvider, Tooltip, Popover, Typography, Box} from "@mui/material";
import {darkTheme} from "../../../utils";
import {NODE_TYPE as ASYNC_DATA_AGGREGATOR_NODE_TYPE} from "../AsyncDataAggregatorNode/constants";
import {NodeValidationContext} from "../../../hooks/useNodeValidation";
import {useConnectionDrag} from "../../App/App";
import {NODE_ROLES, ROLE_LABELS, ROLE_COLORS, NodeRole} from "../nodeRoles";


const DEFAULT_PORT_COLOR = "#00685f"; // fallback teal; overridden by node color prop

const ISVALID_CONNECTION_FUNCTION_NAME = "isValidConnection";

const PORT_IDS = {
    input: "left-target",
    output: "right-source",
};

type OnClick = (() => void) | {callback: () => void; highlight: boolean};

type BaseNodeProps = {
    id: string;
    nodeIcon: React.ReactElement<{className?: string; color?: string}>;
    title: string;
    /** Accent color for this node type - drives all visual accents */
    color?: string;
    /** Node type string for role lookup */
    nodeType?: string;
    run?: OnClick;
    running?: boolean;
    stoppable?: boolean;
    ports: {
        input?: boolean | {isValidConnection?: IsValidConnection, color?: string};
        output?: boolean | {isValidConnection?: IsValidConnection, color?: string};
    };
    settings?: OnClick;
    logs?: OnClick;
    output?: OnClick;
    extraPorts?: React.ReactNode;
    validation?: NodeValidationContext;
};

function buttonsPropsFactory (buttonProp: OnClick): React.SVGProps<SVGSVGElement>{
    return {
        width: 24,
        height: 24,
        onClick: "callback" in buttonProp ? buttonProp.callback : buttonProp,
        className: "highlight" in buttonProp && buttonProp.highlight ? "highlight" : "",
        pointerEvents: "all",
    }
}

export const BaseNode = ({id, nodeIcon, title, color, running, ports, settings, run, stoppable, logs, output, extraPorts, validation, nodeType}: BaseNodeProps) => {
    const selected = useStore((state) => state.nodes.find((n) => n.id === id)?.selected ?? false);
    const {setEdges, getEdges, getNode} = useReactFlow();
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const connectionDrag = useConnectionDrag();
    const {isDragging, sourceNodeId, sourceHandleId} = connectionDrag;

    const role: NodeRole = nodeType ? (NODE_ROLES[nodeType] ?? 'processor') : 'processor';

    const getCompatibilityState = useCallback((): 'compatible' | 'incompatible' | 'neutral' => {
        if (!isDragging || !sourceNodeId) return 'neutral';
        if (sourceNodeId === id) return 'neutral';

        if (sourceHandleId === 'timer-trigger') {
            return role === 'source' || nodeType === 'llm-process' ? 'compatible' : 'incompatible';
        }

        const isToolSource = getNode(sourceNodeId)?.type === 'ai-tool';
        if (isToolSource) {
            return nodeType === 'llm-process' ? 'compatible' : 'incompatible';
        }

        if (!ports.input) return 'incompatible';

        if (sourceHandleId && sourceHandleId !== 'right-source') return 'incompatible';

        if (nodeType === ASYNC_DATA_AGGREGATOR_NODE_TYPE) return 'compatible';

        const edges = getEdges();
        const incoming = edges.filter(e => e.target === id && e.targetHandle === PORT_IDS.input);
        if (incoming.length >= 1) return 'incompatible';

        return 'compatible';
    }, [isDragging, sourceNodeId, sourceHandleId, id, role, nodeType, ports.input, getNode, getEdges]);

    const compatState = useMemo(() => getCompatibilityState(), [getCompatibilityState]);

    const getRejectionReason = useCallback((): string | null => {
        if (!isDragging || !sourceNodeId || sourceNodeId === id) return null;

        const sourceNode = getNode(sourceNodeId);
        const isToolSource = sourceNode?.type === 'ai-tool';
        const isTimerSource = sourceHandleId === 'timer-trigger';

        if (isToolSource && nodeType !== 'llm-process') {
            return 'Tool outputs can only connect to AI LLM nodes';
        }

        if (isTimerSource && nodeType !== 'llm-process' && role !== 'source') {
            return 'Timer triggers only connect to data sources and AI LLM nodes';
        }

        if (isTimerSource && !ports.input && nodeType !== 'llm-process') {
            return 'This node cannot receive timer triggers';
        }

        if (!ports.input && !isTimerSource && !isToolSource) {
            return 'This node cannot receive data';
        }

        if (sourceHandleId && sourceHandleId !== 'right-source' && !isTimerSource && !isToolSource) {
            return 'Only data outputs can connect here';
        }

        if (nodeType !== ASYNC_DATA_AGGREGATOR_NODE_TYPE) {
            const edges = getEdges();
            const incoming = edges.filter(e => e.target === id && e.targetHandle === PORT_IDS.input);
            if (incoming.length >= 1) {
                return 'Already has an input — only Aggregator accepts multiple';
            }
        }

        return null;
    }, [isDragging, sourceNodeId, sourceHandleId, id, nodeType, role, ports.input, getNode, getEdges]);

    const rejectionReasonResult = getRejectionReason();
    const showRejectionTooltip = compatState === 'incompatible' && !!rejectionReasonResult;

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        if (validation && (validation.errors.length > 0 || validation.warnings.length > 0)) {
            setAnchorEl(event.currentTarget);
        }
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const badgeColor = validation?.status === 'error' ? '#f44336' : validation?.status === 'warning' ? '#ff9800' : validation?.status === 'success' ? '#4caf50' : null;

    useEffect(() => {
        const updateSourceEdges = (running: boolean) => {
            setEdges((edges) =>
                edges.map((edge) => {
                    if (edge.source === id) {
                        return {
                            ...edge,
                            animated: running,
                        };
                    }

                    return edge;
                })
            );
        };

        if (running !== undefined) {
            updateSourceEdges(running);
        }
    }, [id, running, setEdges]);

    const nodeColor = color ?? DEFAULT_PORT_COLOR;

    const handleStyleInput = {
        backgroundColor: typeof ports.input === "object" && "color" in ports.input
            ? ports.input.color
            : nodeColor
    };

    const handleStyleOutput = {
        backgroundColor: typeof ports.output === "object" && "color" in ports.output
            ? ports.output.color
            : nodeColor
    };

    const inputIsValidConnection = (params: Parameters<IsValidConnection>[0]) => {
        if (typeof ports.input === "object" && ISVALID_CONNECTION_FUNCTION_NAME in ports.input && ports.input.isValidConnection) {
            return ports.input.isValidConnection(params);
        }

        if (params.sourceHandle !== PORT_IDS.output) return false;

        const node = getNode(id);

        if (node && node.type === ASYNC_DATA_AGGREGATOR_NODE_TYPE) return true;

        const edges = getEdges();
        const incoming = edges.filter(e => e.target === id && e.targetHandle === PORT_IDS.input);

        return incoming.length < 1;
    };

    const outputIsValidConnection = (params: Parameters<IsValidConnection>[0]) => {
        if (typeof ports.output === "object" && ISVALID_CONNECTION_FUNCTION_NAME in ports.output && ports.output.isValidConnection) {
            return ports.output.isValidConnection(params);
        }

        if (params.targetHandle !== PORT_IDS.input) return false;

        const targetNode = getNode(params.target);

        if (targetNode && targetNode.type === ASYNC_DATA_AGGREGATOR_NODE_TYPE) return true;

        if (!targetNode) return true;

        const edges = getEdges();
        const incoming = edges.filter(e => e.target === params.target && e.targetHandle === PORT_IDS.input);

        return incoming.length < 1;
    };

    return (
        <div
            className={"base-node" + (selected ? " selected" : "") + (compatState === "compatible" ? " compatible-target" : "") + (compatState === "incompatible" ? " incompatible-target" : "")}
            style={{'--node-color': nodeColor} as React.CSSProperties}
        >
            {badgeColor && (
                <div
                    className="validation-badge"
                    style={{backgroundColor: badgeColor}}
                    aria-label={"Validation status: " + (validation?.status ?? "")}
                    onClick={handlePopoverOpen}
                />
            )}
            {nodeType && (
                <div
                    className="node-role-badge"
                    style={{backgroundColor: ROLE_COLORS[role]}}
                    title={role + " node"}
                >
                    {ROLE_LABELS[role]}
                </div>
            )}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handlePopoverClose}
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                sx={{
                    '& .MuiPopover-paper': {
                        maxWidth: 280,
                        borderRadius: 2,
                        p: 1.5,
                        pointerEvents: 'none',
                    }
                }}
            >
                {validation && validation.errors.length > 0 && (
                    <Box sx={{mb: (validation.warnings?.length ?? 0) > 0 ? 1 : 0}}>
                        <Typography variant="caption" sx={{fontWeight: 700, color: '#f44336', display: 'block', mb: 0.5}}>
                            Errors
                        </Typography>
                        {validation.errors.map((error, idx) => (
                            <Typography key={idx} variant="body2" sx={{color: '#f44336', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: 0.5}}>
                                <span>•</span>
                                <span>{error}</span>
                            </Typography>
                        ))}
                    </Box>
                )}
                {validation && validation.warnings.length > 0 && (
                    <Box>
                        <Typography variant="caption" sx={{fontWeight: 700, color: '#ff9800', display: 'block', mb: 0.5}}>
                            Warnings
                        </Typography>
                        {validation.warnings.map((warning, idx) => (
                            <Typography key={idx} variant="body2" sx={{color: '#ff9800', fontSize: '0.8rem', display: 'flex', alignItems: 'flex-start', gap: 0.5}}>
                                <span>•</span>
                                <span>{warning}</span>
                            </Typography>
                        ))}
                    </Box>
                )}
            </Popover>
            {/* Left colored icon panel */}
            <div className="node-icon-wrapper">
                {React.cloneElement(nodeIcon, {
                    className: (nodeIcon.props.className ?? "") + " node-icon"
                } as React.HTMLAttributes<HTMLElement>)}
                <div className="node-title-label">
                    {/* Show first 2 words max as a compact panel label */}
                    {title.split(' ').slice(0, 2).join(' ')}
                </div>
            </div>
            {/* Inline title - full title */}
            <span className="node-inline-title">{title}</span>
            {/* Action buttons */}
            <ThemeProvider theme={darkTheme}>
                {settings ? (
                    <Tooltip title={"Settings"} placement="top" arrow enterDelay={600}>
                        <Settings {...buttonsPropsFactory(settings)} />
                    </Tooltip>
                ) : null}
                {logs ? (
                    <Tooltip title={"Logs"} placement="top" arrow enterDelay={600}>
                        <AppWindow {...buttonsPropsFactory(logs)} />
                    </Tooltip>
                ) : null}
                {output ? (
                    <Tooltip title={"Output"} placement="top" arrow enterDelay={600}>
                        <EyeSolid {...buttonsPropsFactory(output)} />
                    </Tooltip>
                ) : null}
                {run && running && !stoppable ? <PlaySolid width={24} height={24} className="highlight running" /> : null}
                {run && running && stoppable ? <PlaySolid {...buttonsPropsFactory(run)} className="highlight running" /> : null}
                {run && !running ? (
                    <Tooltip title={"Run"} placement="top" arrow enterDelay={600}>
                        <Play {...buttonsPropsFactory(run)} />
                    </Tooltip>
                ) : null}
            </ThemeProvider>
            {ports.input ? (
                <Handle
                    type="target"
                    id={PORT_IDS.input}
                    position={Position.Left}
                    style={handleStyleInput}
                    isValidConnection={inputIsValidConnection}
                >
                    {showRejectionTooltip && (
                        <div className="handle-rejection-tooltip">{rejectionReasonResult}</div>
                    )}
                </Handle>
            ) : null}
            {ports.output ? (
                <Handle
                    type="source"
                    id={PORT_IDS.output}
                    position={Position.Right}
                    style={handleStyleOutput}
                    isValidConnection={outputIsValidConnection}
                />
            ) : null}
            {extraPorts}
        </div>
    );
}