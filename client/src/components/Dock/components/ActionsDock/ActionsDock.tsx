/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import React, {useRef, useState} from "react";
import "./ActionsDock.scss";
import {ThemeProvider} from "@mui/material";
import {darkTheme} from "../../../../utils";
import {Trash, CloudSync, Folder, Settings as SettingsIcon, BookStack as Docs, LogOut, PageStar as Page, Expand} from "iconoir-react";
import {BaseDialog} from "../../../BaseDialog";
import {DockItem} from "../DockItem";
import {Settings} from "./components/Settings";
import {isTauri} from "../../../../utils";
import {TemplatesGallery} from "../../../TemplatesGallery";
import {formatShortcutHint} from "../../../KeyboardShortcuts/KeyboardShortcuts";


type WorkflowActionsProps = {
    onSave: () => void;
    onClear: () => void;
    onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onUseTemplate?: (template: {nodes: any[], edges: any[]}, merge: boolean) => void;
    onFitView?: () => void;
    hasExistingWorkflow?: boolean;
};

export function ActionsDock ({onSave, onLoad, onClear, onUseTemplate, onFitView, hasExistingWorkflow = false}: WorkflowActionsProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [openSettings, setOpenSettings] = useState(false);
    const [openTemplates, setOpenTemplates] = useState(false);

    const handleOpenDocs = async () => {
        const url = "https://agentic-signal.com";

        if (isTauri()) {
            try {
                const shell = await import("@tauri-apps/plugin-shell");

                await shell.open(url);
            } catch (error) {
                console.error("Failed to open URL with Tauri:", error);
            }
        } else {
            window.open(url, "_blank", "noopener,noreferrer");
        }
    };

    const handleCloseApp = async () => {
        if (isTauri()) {
            try {
                const {invoke} = await import('@tauri-apps/api/core');

                await invoke('kill_backend_process');

                const {Window} = await import('@tauri-apps/api/window');

                await Window.getCurrent().close();
            } catch { /* empty */ }
        }
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div className="actions-dock">
                <div className="dock-items">
                    <DockItem
                        title="Zoom to Fit"
                        label="Fit View"
                        icon={<Expand />}
                        onClick={onFitView ?? (() => {})}
                    />
                    <DockItem title="Settings" label="Settings" icon={<SettingsIcon />} onClick={() => setOpenSettings(true)} />
                    <BaseDialog
                        open={openSettings}
                        onClose={() => setOpenSettings(false)}
                        title="Application Settings"
                    >
                        <Settings />
                    </BaseDialog>
                    {isTauri() && <DockItem title="Close App" label="Close" icon={<LogOut />} onClick={handleCloseApp} />}
                    <DockItem title="Open Documentation" label="Docs" icon={<Docs />} onClick={handleOpenDocs} />
                    <DockItem title="Start from Template" label="Templates" icon={<Page />} onClick={() => setOpenTemplates(true)} />
                    <DockItem
                        title="Save workflow"
                        label="Save"
                        shortcutHint={formatShortcutHint(['mod', 's'])}
                        icon={<CloudSync />}
                        onClick={onSave}
                    />
                    <DockItem title="Clear workflow" label="Clear" icon={<Trash />} onClick={onClear} />
                    <DockItem
                        title="Load workflow"
                        label="Load"
                        shortcutHint={formatShortcutHint(['mod', 'o'])}
                        icon={<Folder />}
                        onClick={() => fileInputRef.current?.click()}
                    />
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        style={{display: "none"}}
                        onChange={onLoad}
                    />
                    <TemplatesGallery
                        open={openTemplates}
                        onClose={() => setOpenTemplates(false)}
                        onUseTemplate={onUseTemplate ?? (() => {})}
                        hasExistingWorkflow={hasExistingWorkflow}
                    />
                </div>
            </div>
        </ThemeProvider>
    );
}
