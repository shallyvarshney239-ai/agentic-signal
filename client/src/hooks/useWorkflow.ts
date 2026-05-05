/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useCallback, useEffect, useRef, useState} from 'react';
import {
    addEdge,
    useNodesState,
    useEdgesState,
    type OnConnect,
    type Connection,
    Edge,
    OnEdgesDelete,
    OnNodesDelete,
} from '@xyflow/react';
import {initialEdges, initialNodes} from '../components/nodes';
import {nodeRegistry} from '../components/nodes/nodeRegistry.gen';
import {AppNode, AppNodeType} from '../components/nodes/workflow.gen';
import {NODE_TYPE as LLM_NODE_TYPE} from '../components/nodes/LlmProcessNode/constants';
import {NODE_TYPE as ASYNC_DATA_AGGREGATOR_NODE_TYPE} from '../components/nodes/AsyncDataAggregatorNode/constants';
import {detectCycle} from '../utils/workflowExecution';
import {getEdgeTypeFromHandles} from '../types/edgeTypes';
import type {ConnectionPreviewData} from '../components/ConnectionPreview/ConnectionPreview';


const nodeAssertions = Object.fromEntries(
    nodeRegistry.map(nodeDescriptor => [nodeDescriptor.type, nodeDescriptor.assertion])
) as Record<AppNodeType, (data: unknown) => void>;

function updateNodeData<T extends AppNode> (
    node: T,
    newData: Partial<T['data']>,
    assertions: Record<AppNodeType, (data: unknown) => void>
): T {
    const updatedData = {...node.data, ...newData};
    const assert = assertions[node.type];

    if (assert) assert(updatedData);

    return {...node, data: updatedData};
}

export interface ConnectionValidation {
    isValid: boolean;
    reason: string;
}

export function useWorkflow () {
    const [nodes, setNodes, onNodesChange] = useNodesState<AppNode>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
    const [results, setResults] = useState<Map<string, any>>(new Map());
    const [cycleWarning, setCycleWarning] = useState<{hasCycle: boolean; cycleNodes: string[]}>({hasCycle: false, cycleNodes: []});
    const [connectionPreview, setConnectionPreview] = useState<ConnectionPreviewData | null>(null);
    const [connectionDrag, setConnectionDrag] = useState<{
        isDragging: boolean;
        sourceNodeId: string | null;
        sourceHandleId: string | null;
    }>({isDragging: false, sourceNodeId: null, sourceHandleId: null});
    const edgeConnectionsRef = useRef<Pick<Edge, 'source' | 'target'>[]>([]);
    const previousInputRef = useRef<Map<string, any>>(new Map());
    const runningNodesRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        edgeConnectionsRef.current = edges.map(({source, target}) => ({source, target}));

        const cycleResult = detectCycle(edges);

        setCycleWarning(cycleResult);
    }, [edges]);

    const markNodeRunning = useCallback((nodeId: string) => {
        runningNodesRef.current.add(nodeId);
    }, []);

    const markNodeStopped = useCallback((nodeId: string) => {
        runningNodesRef.current.delete(nodeId);
    }, []);

    const validateConnection = useCallback((connection: Connection): ConnectionValidation => {
        const sourceNode = nodes.find(n => n.id === connection.source);
        const targetNode = nodes.find(n => n.id === connection.target);

        if (!sourceNode || !targetNode) {
            return {isValid: false, reason: 'Invalid nodes'};
        }

        const existingEdge = edges.find(
            e => e.target === connection.target && e.targetHandle === connection.targetHandle
        );

        if (existingEdge) {
            return {
                isValid: false,
                reason: `${targetNode.data.title} already has an input`
            };
        }

        if (targetNode.type === ASYNC_DATA_AGGREGATOR_NODE_TYPE) {
            return {isValid: true, reason: ''};
        }

        const existingInput = edges.some(
            e => e.target === connection.target && e.targetHandle === 'left-target'
        );

        if (existingInput) {
            return {
                isValid: false,
                reason: `${targetNode.data.title} only accepts one input`
            };
        }

        const tempEdges = [...edges, {
            source: connection.source,
            sourceHandle: connection.sourceHandle ?? '',
            target: connection.target,
            targetHandle: connection.targetHandle ?? '',
            id: `temp-${connection.source}-${connection.target}`,
        } as Edge];

        const cycleResult = detectCycle(tempEdges);

        if (cycleResult.hasCycle) {
            return {
                isValid: false,
                reason: `Cannot connect: this would create a loop in the workflow`
            };
        }

        return {isValid: true, reason: ''};
    }, [nodes, edges]);

    const onConnectStart = useCallback(
        (_event: MouseEvent | TouchEvent, params: { nodeId: string | null; handleId: string | null }) => {
            const sourceNode = nodes.find(n => n.id === params.nodeId);

            setConnectionDrag({
                isDragging: true,
                sourceNodeId: params.nodeId,
                sourceHandleId: params.handleId,
            });

            setConnectionPreview({
                sourceNodeId: params.nodeId,
                sourceNodeTitle: sourceNode?.data.title || 'Unknown',
                targetNodeId: null,
                targetNodeTitle: null,
                targetHandleId: params.handleId,
                isValid: false,
                reason: ''
            });
        },
        [nodes]
    );

    const onConnectEnd = useCallback(() => {
        setConnectionDrag({
            isDragging: false,
            sourceNodeId: null,
            sourceHandleId: null,
        });
        setConnectionPreview(null);
    }, []);

    const onConnect: OnConnect = useCallback(
        (connection: Connection) => {
            const sourceNode = nodes.find(n => n.id === connection.source);
            const targetNode = nodes.find(n => n.id === connection.target);
            const validation = validateConnection(connection);

            if (!validation.isValid) {
                return;
            }

            const edgeType = getEdgeTypeFromHandles(connection.sourceHandle, connection.targetHandle);

            const newEdge: Edge = {
                ...connection,
                id: `edge-${connection.source}-${connection.sourceHandle || ''}-${connection.target}-${connection.targetHandle || ''}`,
                className: `edge-type-${edgeType}`,
                data: {
                    edgeType,
                    sourceTitle: sourceNode?.data.title,
                    targetTitle: targetNode?.data.title
                }
            };

            setEdges((eds) => addEdge(newEdge, eds));
        },
        [setEdges, nodes, validateConnection]
    );

    const onEdgesDelete: OnEdgesDelete = useCallback(
        (deletedEdges) => {
            deletedEdges.forEach((edge) => {
                setNodes((nds) =>
                    nds.map((node) => {
                        if (node.id === edge.target) {
                            if (node.type === ASYNC_DATA_AGGREGATOR_NODE_TYPE) {
                                const rest = Object.fromEntries(
                                    Object.entries((node.data as any).input ?? {}).filter(([k]) => k !== edge.source)
                                );

                                return updateNodeData(node, {input: rest}, nodeAssertions);
                            }

                            return updateNodeData(node, {input: undefined}, nodeAssertions);
                        }

                        return node;
                    })
                );

                setResults((prev) => {
                    const newResults = new Map(prev);

                    newResults.delete(edge.target);

                    return newResults;
                });
            });
        },
        [setNodes]
    );

    const onNodesDelete: OnNodesDelete = useCallback(
        (deletedNodes) => {
            deletedNodes.forEach((deletedNode) => {
                runningNodesRef.current.delete(deletedNode.id);

                setResults((prev) => {
                    const newResults = new Map(prev);

                    newResults.delete(deletedNode.id);

                    return newResults;
                });

                setNodes((existingNodes) =>
                    existingNodes.map((node) => {
                        const wasReceivingFromDeleted = edgeConnectionsRef.current.some(
                            (edge) => edge.source === deletedNode.id && edge.target === node.id
                        );

                        if (wasReceivingFromDeleted) {
                            if (node.type === ASYNC_DATA_AGGREGATOR_NODE_TYPE) {
                                const rest = Object.fromEntries(
                                    Object.entries((node.data as any).input ?? {}).filter(([k]) => k !== deletedNode.id)
                                );

                                return updateNodeData(node, {input: rest}, nodeAssertions);
                            }

                            return updateNodeData(node, {input: undefined}, nodeAssertions);
                        }

                        return node;
                    })
                );
            });
        },
        [setNodes]
    );

    const handleNodeConfigChange = useCallback((nodeId: string, newPartialData: Record<string, any>) => {
        setNodes((currentNodes) =>
            currentNodes.map((node) =>
                node.id === nodeId
                    ? updateNodeData(node, newPartialData, nodeAssertions)
                    : node
            )
        );
    }, [setNodes]);

    const handleNodeResultUpdate = useCallback((nodeId: string, input: any) => {
        const prevResult = previousInputRef.current.get(nodeId);

        if (prevResult !== undefined && JSON.stringify(prevResult) === JSON.stringify(input)) {
            return;
        }

        previousInputRef.current.set(nodeId, input);

        setResults((prev) => new Map(prev.set(nodeId, input)));

        setNodes((existingNodes) =>
            existingNodes.map((node) => {
                const hasIncoming = edgeConnectionsRef.current.some(
                    (edge) => edge.source === nodeId && edge.target === node.id
                );

                if (!hasIncoming) return node;

                if (node.type === ASYNC_DATA_AGGREGATOR_NODE_TYPE) {
                    const currentInputs = node.data.input ?? {};

                    if (input === undefined) {
                        const rest = Object.fromEntries(
                            Object.entries(currentInputs).filter(([k]) => k !== nodeId)
                        );

                        return updateNodeData(node, {input: rest}, nodeAssertions);
                    }

                    const currentVal = currentInputs[nodeId];

                    if (currentVal !== undefined && JSON.stringify(currentVal) === JSON.stringify(input)) {
                        return node;
                    }

                    return updateNodeData(node, {input: {...currentInputs, [nodeId]: input}}, nodeAssertions);
                }

                const currentInput = node.data.input;

                if (currentInput !== undefined && JSON.stringify(currentInput) === JSON.stringify(input)) {
                    return node;
                }

                return updateNodeData(node, {input, feedback: undefined}, nodeAssertions);
            })
        );
    }, [setNodes]);

    const handleFeedbackSend = useCallback((fromNodeId: string, feedback: string) => {
        setNodes((existingNodes) =>
            existingNodes.map((node) => {
                const hasIncomingFromSource = edgeConnectionsRef.current.some(
                    (edge) => edge.target === fromNodeId && edge.source === node.id
                );

                if (!hasIncomingFromSource) return node;

                if (node.type === LLM_NODE_TYPE) {
                    return updateNodeData(node, {feedback}, nodeAssertions);
                }

                if ((node.data as any).retryOnFeedback) {
                    return updateNodeData(node, {feedback, _retryTrigger: Date.now()} as any, nodeAssertions);
                }

                return node;
            })
        );
    }, [setNodes]);

    const enhancedNodes: AppNode[] = nodes.map((node) =>
        updateNodeData(node, {
            onConfigChange: handleNodeConfigChange,
            onResultUpdate: handleNodeResultUpdate,
            onFeedbackSend: handleFeedbackSend,
        }, nodeAssertions)
    );

    const addNode = useCallback(
        (node: AppNode) => setNodes((existingNodes) => [...existingNodes, node]),
        [setNodes],
    );

    return {
        nodes: enhancedNodes,
        edges,
        onNodesChange,
        onEdgesChange,
        onEdgesDelete,
        onNodesDelete,
        onConnect,
        onConnectStart,
        onConnectEnd,
        connectionPreview,
        connectionDrag,
        addNode,
        results,
        setNodes,
        setEdges,
        cycleWarning,
        markNodeRunning,
        markNodeStopped,
        previousInputRef,
        validateConnection
    };
}