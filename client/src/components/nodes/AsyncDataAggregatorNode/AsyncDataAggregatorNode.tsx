/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {type NodeProps, useReactFlow} from "@xyflow/react";
import {assertIsAsyncDataAggregatorNodeData} from "./types/workflow";
import {useState, useCallback, useEffect, useRef} from "react";
import {BaseNode} from "../BaseNode";
import {LogsDialog} from "../../LogsDialog";
import {Icon, NODE_TYPE} from "./constants";
import {getNodeColor} from "../nodeColors";
import {AppNode} from "../workflow.gen";
import {assertIsEnhancedNodeData} from "../../../types/workflow";
import {runTask} from "../BaseNode/utils";

const AGGREGATION_DEBOUNCE_MS = 100;

export function AsyncDataAggregatorNode ({data, id}: NodeProps<AppNode>) {
    assertIsEnhancedNodeData(data);
    assertIsAsyncDataAggregatorNodeData(data);

    const [error] = useState<string | null>(null);
    const [openLogs, setOpenLogs] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const {title, input, onConfigChange, onResultUpdate} = data;
    const {getEdges} = useReactFlow();

    const collectedInputsRef = useRef<Record<string, any>>(input ?? {});
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastProcessedRef = useRef<string>("");
    const isAggregatingRef = useRef(false);

    useEffect(() => {
        collectedInputsRef.current = input ?? {};
    }, [input]);

    const getConnectedSourceIds = useCallback(() => {
        return getEdges()
            .filter(e => e.target === id)
            .map(e => e.source);
    }, [getEdges, id]);

    const allArrived = useCallback(() => {
        const connectedSourceIds = getConnectedSourceIds();

        if (connectedSourceIds.length === 0) return false;

        return connectedSourceIds.every(srcId => srcId in collectedInputsRef.current);
    }, [getConnectedSourceIds]);

    const performAggregation = useCallback(() => {
        const connectedSourceIds = getConnectedSourceIds();

        if (connectedSourceIds.length === 0) return;

        if (!allArrived()) return;

        const currentInputs = connectedSourceIds.map(srcId => collectedInputsRef.current[srcId]);
        const inputsKey = JSON.stringify(currentInputs);

        if (inputsKey === lastProcessedRef.current) return;

        lastProcessedRef.current = inputsKey;
        isAggregatingRef.current = true;

        runTask(async () => {
            onResultUpdate(id, currentInputs);
            collectedInputsRef.current = {};
            lastProcessedRef.current = "";
            isAggregatingRef.current = false;
            onConfigChange(id, {input: {}});
        }, setIsRunning);
    }, [id, getConnectedSourceIds, allArrived, onResultUpdate, onConfigChange]);

    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            performAggregation();
        }, AGGREGATION_DEBOUNCE_MS);

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [input, performAggregation]);

    return (
        <>
            <BaseNode
                color={getNodeColor(NODE_TYPE)}
                id={id}
                nodeType={NODE_TYPE}
                nodeIcon={Icon}
                ports={{
                    input: true,
                    output: true
                }}
                running={isRunning}
                title={title}
                logs={{callback: () => setOpenLogs(true), highlight: false}}
            />

            <LogsDialog
                open={openLogs}
                onClose={() => setOpenLogs(false)}
                title={title}
                error={error}
            />
        </>
    );
}
