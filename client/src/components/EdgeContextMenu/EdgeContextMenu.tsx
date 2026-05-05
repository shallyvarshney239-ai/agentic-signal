import {useState} from 'react';
import {Trash, ArrowRight, ArrowLeft} from 'iconoir-react';
import {useReactFlow} from '@xyflow/react';
import type {Edge} from '@xyflow/react';
import {EDGE_STYLES, type EdgeStyleType} from '../../types/edgeTypes';
import './EdgeContextMenu.scss';

interface EdgeContextMenuProps {
    edge: Edge;
    position: { x: number; y: number };
    onClose: () => void;
}

export function EdgeContextMenu ({edge, position, onClose}: EdgeContextMenuProps) {
    const {setEdges} = useReactFlow();
    const [label, setLabel] = useState((edge.data as any)?.label || '');
    const [showLabelInput, setShowLabelInput] = useState(false);

    const handleDelete = () => {
        setEdges((edges) => edges.filter(e => e.id !== edge.id));
        onClose();
    };

    const handleDisconnectTarget = () => {
        setEdges((edges) =>
            edges.map(e =>
                e.id === edge.id
                    ? {...e, target: undefined, targetHandle: undefined} as unknown as Edge
                    : e
            )
        );
        onClose();
    };

    const handleDisconnectSource = () => {
        setEdges((edges) =>
            edges.map(e =>
                e.id === edge.id
                    ? {...e, source: undefined, sourceHandle: undefined} as unknown as Edge
                    : e
            )
        );
        onClose();
    };

    const handleSetType = (type: EdgeStyleType) => {
        setEdges((edges) =>
            edges.map(e =>
                e.id === edge.id
                    ? {...e, data: {...e.data, edgeType: type}}
                    : e
            )
        );
        onClose();
    };

    const handleSetLabel = () => {
        setEdges((edges) =>
            edges.map(e =>
                e.id === edge.id
                    ? {...e, data: {...e.data, label: label || undefined}}
                    : e
            )
        );
        setShowLabelInput(false);
    };

    const handleClearLabel = () => {
        setEdges((edges) =>
            edges.map(e =>
                e.id === edge.id
                    ? {...e, data: {...e.data, label: undefined}}
                    : e
            )
        );
        setLabel('');
        setShowLabelInput(false);
    };

    const currentType = (edge.data as any)?.edgeType || 'default';

    return (
        <div
            className="edge-context-menu"
            style={{left: position.x, top: position.y}}
            onClick={(e) => e.stopPropagation()}
        >
            <div className="menu-header">
                <span className="menu-title">Edge Options</span>
            </div>

            {showLabelInput ? (
                <div className="menu-section label-input-section">
                    <input
                        type="text"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                        placeholder="Enter edge label..."
                        className="label-input"
                        autoFocus
                    />
                    <div className="label-actions">
                        <button className="btn-primary" onClick={handleSetLabel}>
                            Save
                        </button>
                        <button className="btn-secondary" onClick={() => setShowLabelInput(false)}>
                            Cancel
                        </button>
                        {(edge.data as any)?.label && (
                            <button className="btn-danger" onClick={handleClearLabel}>
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <button className="menu-item" onClick={() => setShowLabelInput(true)}>
                    <span>{(edge.data as any)?.label ? 'Edit Label' : 'Add Label'}</span>
                </button>
            )}

            <div className="menu-section">
                <span className="section-label">Edge Type</span>
                <div className="type-options">
                    {(Object.keys(EDGE_STYLES) as EdgeStyleType[]).map((type) => (
                        <button
                            key={type}
                            className={`type-option ${currentType === type ? 'active' : ''}`}
                            onClick={() => handleSetType(type)}
                        >
                            <span
                                className="type-color"
                                style={{backgroundColor: EDGE_STYLES[type].color}}
                            />
                            <span>{EDGE_STYLES[type].label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="menu-divider" />

            <div className="menu-section">
                <span className="section-label">Disconnect</span>
                <button className="menu-item disconnect" onClick={handleDisconnectTarget}>
                    <ArrowRight />
                    <span>From Target</span>
                </button>
                <button className="menu-item disconnect" onClick={handleDisconnectSource}>
                    <ArrowLeft />
                    <span>From Source</span>
                </button>
            </div>

            <div className="menu-divider" />

            <button className="menu-item danger" onClick={handleDelete}>
                <Trash />
                <span>Delete Edge</span>
            </button>
        </div>
    );
}