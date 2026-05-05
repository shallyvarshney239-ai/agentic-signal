export type EdgeStyleType = 'data' | 'trigger' | 'tool' | 'default';

export interface EdgeStyleConfig {
    type: EdgeStyleType;
    color: string;
    label: string;
    dashArray?: string;
}

export const EDGE_STYLES: Record<EdgeStyleType, EdgeStyleConfig> = {
    default: {type: 'default', color: '#4b5563', label: 'Data Flow'},
    data: {type: 'data', color: '#14b8a6', label: 'Data'},
    trigger: {type: 'trigger', color: '#0bb6e1', label: 'Trigger'},
    tool: {type: 'tool', color: '#9c27b0', label: 'Tool'}
};

export const PORT_TYPE_TO_EDGE_TYPE: Record<string, EdgeStyleType> = {
    'timer-trigger': 'trigger',
    'tools-target': 'tool',
    'left-target': 'data',
    'right-source': 'data'
};

export function getEdgeTypeFromHandles (
    sourceHandle: string | null | undefined,
    targetHandle: string | null | undefined
): EdgeStyleType {
    if (targetHandle === 'timer-trigger') return 'trigger';

    if (targetHandle === 'tools-target') return 'tool';

    if (targetHandle === 'left-target' || targetHandle === 'right-source') return 'data';

    return 'default';
}