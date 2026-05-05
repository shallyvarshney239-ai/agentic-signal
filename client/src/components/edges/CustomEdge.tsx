import {getBezierPath, type Position} from '@xyflow/react';
import {getEdgeTypeFromHandles, type EdgeStyleType} from '../../types/edgeTypes';

interface CustomEdgeProps {
    id: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
    sourcePosition: Position;
    targetPosition: Position;
    data?: {
        edgeType?: EdgeStyleType;
        label?: string;
        sourceTitle?: string;
        targetTitle?: string;
    };
    selected?: boolean;
    markerEnd?: string;
    className?: string;
}

export function CustomEdge ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    markerEnd,
    className
}: CustomEdgeProps) {
    const [edgePath] = getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition
    });

    const edgeType = data?.edgeType || getEdgeTypeFromHandles(undefined, undefined);
    const edgeTypeClass = `edge-type-${edgeType}`;
    const combinedClassName = [edgeTypeClass, className, selected ? 'selected' : ''].filter(Boolean).join(' ');

    return (
        <>
            <path
                id={id}
                className={`react-flow__edge-path ${combinedClassName}`}
                d={edgePath}
                fill="none"
            />
            {markerEnd && (
                <path
                    className="react-flow__edge-marker"
                    d={edgePath}
                    fill="none"
                    markerEnd={markerEnd}
                />
            )}
        </>
    );
}

export function getEdgeStyleFromConnection (connection: { sourceHandle?: string | null; targetHandle?: string | null }) {
    const edgeType = getEdgeTypeFromHandles(connection.sourceHandle, connection.targetHandle);

    return {edgeType, className: `edge-type-${edgeType}`};
}