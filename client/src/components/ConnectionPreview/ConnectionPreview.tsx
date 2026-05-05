import {ArrowRight, CheckCircle, WarningCircle} from 'iconoir-react';
import './ConnectionPreview.scss';

export interface ConnectionPreviewData {
    sourceNodeId: string | null;
    sourceNodeTitle: string;
    targetNodeId: string | null;
    targetNodeTitle: string | null;
    targetHandleId: string | null;
    isValid: boolean;
    reason: string;
}

interface ConnectionPreviewProps {
    preview: ConnectionPreviewData;
}

export function ConnectionPreview ({preview}: ConnectionPreviewProps) {
    return (
        <div className={`connection-preview ${preview.isValid ? 'valid' : 'invalid'}`}>
            <div className="preview-connector">
                <span className="source-label">From</span>
                <span className="source-node">{preview.sourceNodeTitle || 'Unknown'}</span>
            </div>

            <div className="preview-arrow">
                <ArrowRight />
            </div>

            <div className="preview-connector">
                <span className="target-label">To</span>
                <span className={`target-node ${!preview.targetNodeTitle ? 'empty' : ''}`}>
                    {preview.targetNodeTitle || 'Hover target...'}
                </span>
            </div>

            <div className={`preview-status ${preview.isValid ? 'success' : 'error'}`}>
                {preview.isValid ? (
                    <>
                        <CheckCircle className="status-icon" />
                        <span>Valid</span>
                    </>
                ) : (
                    <>
                        <WarningCircle className="status-icon" />
                        <span>{preview.reason || 'Invalid'}</span>
                    </>
                )}
            </div>
        </div>
    );
}