/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import React, {useRef, useState} from 'react';
import {Tooltip} from '@mui/material';
import {ThemeProvider} from '@mui/material';
import {
    CloudSync,
    Folder,
    Trash,
    Settings,
    BookStack,
    Play,
    Spark,
    NavArrowDown,
} from 'iconoir-react';
import {darkTheme} from '../../utils';
import {BaseDialog} from '../BaseDialog';
import {TemplatesGallery} from '../TemplatesGallery';
import './Topbar.scss';

// Lazily import Settings to avoid circular deps
import {Settings as SettingsPanel} from '../Dock/components/ActionsDock/components/Settings';
import {isTauri} from '../../utils';
import {formatShortcutHint} from '../KeyboardShortcuts/KeyboardShortcuts';

type TopbarProps = {
    onSave: () => void;
    onClear: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUseTemplate?: (template: {nodes: any[], edges: any[]}, merge: boolean) => void;
    hasExistingWorkflow?: boolean;
};

export function Topbar ({onSave, onClear, onLoad, onUseTemplate, hasExistingWorkflow = false}: TopbarProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openSettings, setOpenSettings] = useState(false);
    const [openTemplates, setOpenTemplates] = useState(false);
    const [workflowName, setWorkflowName] = useState('Untitled Workflow');
    const [editingName, setEditingName] = useState(false);

    const handleOpenDocs = async () => {
        const url = 'https://agentic-signal.com';

        if (isTauri()) {
            try {
                const shell = await import('@tauri-apps/plugin-shell');

                await shell.open(url);
            } catch (error) {
                console.error('Failed to open URL with Tauri:', error);
            }
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <header className="topbar">
                {/* Left: Logo + Project */}
                <div className="topbar-left">
                    <div className="topbar-logo">
                        <div className="topbar-logo-icon">
                            <Spark width={20} height={20} />
                        </div>
                        <span className="topbar-logo-text">AgentFlow</span>
                    </div>
                    <div className="topbar-divider" />
                    <button className="topbar-project-btn">
                        My Project
                        <NavArrowDown width={14} height={14} />
                    </button>
                </div>

                {/* Center: Editable workflow name */}
                <div className="topbar-center">
                    {editingName ? (
                        <input
                            className="topbar-workflow-input"
                            value={workflowName}
                            autoFocus
                            onChange={e => setWorkflowName(e.target.value)}
                            onBlur={() => setEditingName(false)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === 'Escape') setEditingName(false);
                            }}
                        />
                    ) : (
                        <button
                            className="topbar-workflow-name"
                            onClick={() => setEditingName(true)}
                            title="Click to rename workflow"
                        >
                            {workflowName}
                            <span className="topbar-edit-hint">✏</span>
                        </button>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="topbar-right">
                    <Tooltip title="Open Documentation" placement="bottom" arrow>
                        <button className="topbar-btn topbar-btn--ghost" onClick={handleOpenDocs} aria-label="Docs">
                            <BookStack width={16} height={16} />
                            <span>Docs</span>
                        </button>
                    </Tooltip>

                    <Tooltip title="Start from Template" placement="bottom" arrow>
                        <button className="topbar-btn topbar-btn--ghost" onClick={() => setOpenTemplates(true)} aria-label="Templates">
                            Templates
                        </button>
                    </Tooltip>

                    <div className="topbar-divider" />

                    <Tooltip title={`Load Workflow`} placement="bottom" arrow>
                        <button
                            className="topbar-btn topbar-btn--ghost topbar-btn--icon"
                            onClick={() => fileInputRef.current?.click()}
                            aria-label="Load workflow"
                        >
                            <Folder width={16} height={16} />
                        </button>
                    </Tooltip>

                    <Tooltip title="Clear Canvas" placement="bottom" arrow>
                        <button
                            className="topbar-btn topbar-btn--ghost topbar-btn--icon topbar-btn--danger"
                            onClick={onClear}
                            aria-label="Clear canvas"
                        >
                            <Trash width={16} height={16} />
                        </button>
                    </Tooltip>

                    <Tooltip title="Settings" placement="bottom" arrow>
                        <button
                            className="topbar-btn topbar-btn--ghost topbar-btn--icon"
                            onClick={() => setOpenSettings(true)}
                            aria-label="Settings"
                        >
                            <Settings width={16} height={16} />
                        </button>
                    </Tooltip>

                    <Tooltip title={`Save Workflow  ${formatShortcutHint(['mod', 's'])}`} placement="bottom" arrow>
                        <button
                            className="topbar-btn topbar-btn--outline"
                            onClick={onSave}
                            aria-label="Save workflow"
                        >
                            <CloudSync width={16} height={16} />
                            <span>Save</span>
                        </button>
                    </Tooltip>

                    <button className="topbar-btn topbar-btn--run" aria-label="Run workflow">
                        <Play width={15} height={15} />
                        <span>Run</span>
                    </button>
                </div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    style={{display: 'none'}}
                    onChange={onLoad}
                />

                {/* Settings Dialog */}
                <BaseDialog
                    open={openSettings}
                    onClose={() => setOpenSettings(false)}
                    title="Application Settings"
                >
                    <SettingsPanel />
                </BaseDialog>

                {/* Templates Gallery */}
                <TemplatesGallery
                    open={openTemplates}
                    onClose={() => setOpenTemplates(false)}
                    onUseTemplate={onUseTemplate ?? (() => {})}
                    hasExistingWorkflow={hasExistingWorkflow}
                />
            </header>
        </ThemeProvider>
    );
}
