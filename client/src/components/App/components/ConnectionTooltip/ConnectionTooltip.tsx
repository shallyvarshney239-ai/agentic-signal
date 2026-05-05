/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import "./ConnectionTooltip.scss";

interface ConnectionTooltipProps {
    x: number;
    y: number;
    message: string;
    isValid: boolean;
    targetNodeName?: string;
}

export function ConnectionTooltip ({x, y, message, isValid, targetNodeName}: ConnectionTooltipProps) {
    return (
        <div
            className={`connection-tooltip ${isValid ? 'valid' : 'invalid'}`}
            style={{
                left: x + 20,
                top: y - 10
            }}
        >
            <div className="tooltip-icon">
                {isValid ? '+' : '✕'}
            </div>
            <div className="tooltip-content">
                <div className="tooltip-message">{message}</div>
                {targetNodeName && (
                    <div className="tooltip-target">{targetNodeName}</div>
                )}
            </div>
        </div>
    );
}