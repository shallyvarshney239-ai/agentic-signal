/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {ActionsDock} from "./components/ActionsDock";
import {NodesDock} from "./components/NodesDock";
import './Dock.scss';

type DockProps = {
    onSave: () => void;
    onClear: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUseTemplate?: (template: {nodes: any[], edges: any[]}, merge: boolean) => void;
    onFitView?: () => void;
    hasExistingWorkflow?: boolean;
};

export const Dock = ({onSave, onLoad, onClear, onUseTemplate, onFitView, hasExistingWorkflow}: DockProps) => {
    return (
        <div className="dock">
            <ActionsDock
                onSave={onSave}
                onLoad={onLoad}
                onClear={onClear}
                onUseTemplate={onUseTemplate}
                onFitView={onFitView}
                hasExistingWorkflow={hasExistingWorkflow}
            />
            <NodesDock />
        </div>
    );
}
