/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import type {Edge} from '@xyflow/react';

export interface TopologicalSortResult {
    sortedIds: string[];
    hasCycle: boolean;
    cycleNodes: string[];
}

export function detectCycle (edges: Edge[]): {hasCycle: boolean; cycleNodes: string[]} {
    const adjacency = new Map<string, string[]>();
    const allNodes = new Set<string>();

    edges.forEach((edge) => {
        allNodes.add(edge.source);
        allNodes.add(edge.target);

        if (!adjacency.has(edge.source)) {
            adjacency.set(edge.source, []);
        }

        adjacency.get(edge.source)!.push(edge.target);
    });

    const WHITE = 0;
    const GRAY = 1;
    const BLACK = 2;
    const color = new Map<string, number>();
    const parent = new Map<string, string | null>();

    allNodes.forEach((node) => color.set(node, WHITE));
    parent.forEach((_, node) => parent.set(node, null));

    let cycleStart: string | null = null;
    const cyclePath: string[] = [];

    function dfs (node: string): boolean {
        color.set(node, GRAY);

        const neighbors = adjacency.get(node) || [];

        for (const neighbor of neighbors) {
            if (color.get(neighbor) === GRAY) {
                cycleStart = neighbor;
                cyclePath.push(neighbor);
                cyclePath.push(node);

                return true;
            }

            if (color.get(neighbor) === WHITE) {
                parent.set(neighbor, node);

                if (dfs(neighbor)) {
                    if (cycleStart && cyclePath[cyclePath.length - 1] !== cycleStart) {
                        cyclePath.push(node);
                    }

                    return true;
                }
            }
        }

        color.set(node, BLACK);

        return false;
    }

    for (const node of allNodes) {
        if (color.get(node) === WHITE) {
            if (dfs(node)) {
                return {
                    hasCycle: true,
                    cycleNodes: cyclePath.reverse()
                };
            }
        }
    }

    return {hasCycle: false, cycleNodes: []};
}

export function topologicalSort (edges: Edge[], triggerNodeId?: string): TopologicalSortResult {
    const {hasCycle, cycleNodes} = detectCycle(edges);

    if (hasCycle) {
        return {sortedIds: [], hasCycle: true, cycleNodes};
    }

    const adjacency = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    const allNodes = new Set<string>();

    edges.forEach((edge) => {
        allNodes.add(edge.source);
        allNodes.add(edge.target);

        if (!adjacency.has(edge.source)) {
            adjacency.set(edge.source, []);
        }

        adjacency.get(edge.source)!.push(edge.target);
        inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);

        if (!inDegree.has(edge.source)) {
            inDegree.set(edge.source, 0);
        }
    });

    const sortedIds: string[] = [];
    const queue: string[] = [];

    inDegree.forEach((degree, node) => {
        if (degree === 0) {
            queue.push(node);
        }
    });

    while (queue.length > 0) {
        const node = queue.shift()!;

        sortedIds.push(node);

        const neighbors = adjacency.get(node) || [];

        for (const neighbor of neighbors) {
            const newDegree = (inDegree.get(neighbor) || 0) - 1;

            inDegree.set(neighbor, newDegree);

            if (newDegree === 0) {
                queue.push(neighbor);
            }
        }
    }

    if (triggerNodeId) {
        const triggerIndex = sortedIds.indexOf(triggerNodeId);

        if (triggerIndex > -1) {
            return {
                sortedIds: sortedIds.slice(triggerIndex),
                hasCycle: false,
                cycleNodes: []
            };
        }
    }

    return {sortedIds, hasCycle: false, cycleNodes: []};
}

export function getExecutionOrder (edges: Edge[], sourceNodeId: string): string[] {
    const relevantEdges = edges.filter(
        (edge) => edge.source === sourceNodeId || isDescendant(edges, edge.source, sourceNodeId)
    );

    const {sortedIds} = topologicalSort(relevantEdges);

    return sortedIds;
}

function isDescendant (edges: Edge[], node: string, ancestor: string): boolean {
    const visited = new Set<string>();
    const queue = [ancestor];

    while (queue.length > 0) {
        const current = queue.shift()!;

        if (current === node) return true;

        if (visited.has(current)) continue;

        visited.add(current);

        edges
            .filter((e) => e.source === current)
            .forEach((e) => queue.push(e.target));
    }

    return false;
}

export function getDownstreamNodes (edges: Edge[], startNodeId: string): string[] {
    const visited = new Set<string>();
    const queue = [startNodeId];
    const downstream: string[] = [];

    while (queue.length > 0) {
        const node = queue.shift()!;

        if (visited.has(node)) continue;

        visited.add(node);

        edges
            .filter((e) => e.source === node)
            .forEach((e) => {
                if (!visited.has(e.target)) {
                    downstream.push(e.target);
                    queue.push(e.target);
                }
            });
    }

    return downstream;
}

export function getUpstreamNodes (edges: Edge[], startNodeId: string): string[] {
    const visited = new Set<string>();
    const queue = [startNodeId];
    const upstream: string[] = [];

    while (queue.length > 0) {
        const node = queue.shift()!;

        if (visited.has(node)) continue;

        visited.add(node);

        edges
            .filter((e) => e.target === node)
            .forEach((e) => {
                if (!visited.has(e.source)) {
                    upstream.push(e.source);
                    queue.push(e.source);
                }
            });
    }

    return upstream;
}