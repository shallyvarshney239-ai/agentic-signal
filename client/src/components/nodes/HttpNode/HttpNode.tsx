/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {type NodeProps} from "@xyflow/react";
import {useCallback, useState} from "react";
import {assertIsHttpNodeData} from "./types/workflow";
import {BaseNode} from "../BaseNode";
import {runTask} from "../BaseNode/utils";
import {BaseDialog} from "../../BaseDialog";
import {LogsDialog} from "../../LogsDialog";
import {parseUrl} from "../../../utils";
import {html as beautifyHtml} from 'js-beautify';
import {GraphQLService} from "./services/graphqlService";
import {DebouncedTextField} from "../../DebouncedTextField";
import {useTimerTrigger} from "../../../hooks/useTimerTrigger";
import {TimerTriggerPort} from "../TimerNode/TimerTriggerPort";
import {useSettings} from "../../../hooks/useSettings";
import {Icon, NODE_TYPE} from "./constants";
import {getNodeColor} from "../nodeColors";
import {AppNode} from "../workflow.gen";
import {assertIsEnhancedNodeData} from "../../../types/workflow";
import {useNodeValidation} from "../../../hooks/useNodeValidation";


export function HttpNode ({data, id}: NodeProps<AppNode>) {
    assertIsEnhancedNodeData(data);
    assertIsHttpNodeData(data);

    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [openSettings, setOpenSettings] = useState(false);
    const [openLogs, setOpenLogs] = useState(false);
    const {title, url, input, onResultUpdate, onConfigChange} = data;
    const {settings} = useSettings();

    const validation = useNodeValidation('HttpNode', data);

    const handleRun = useCallback(() => {
        setError(null);
        onResultUpdate(id);

        runTask(async () => {
            try {
                if (!url) {
                    throw new Error("URL is required");
                }

                const parsedUrl = parseUrl(url);
                const html = await GraphQLService.renderHtml(parsedUrl, settings.browserPath);

                onResultUpdate(id, beautifyHtml(html));
            } catch (error) {
                setError(`Error fetching rendered page: ${error instanceof Error ? error.message : 'Unknown error'}`);

                onResultUpdate(id);
            }
        }, setIsRunning);
    }, [id, onResultUpdate, settings.browserPath, url]);

    useTimerTrigger(input?.timerTrigger, handleRun);

    const hasMissingConfig = !url;

    return (
        <>
            <BaseNode
                color={getNodeColor(NODE_TYPE)}
                id={id}
                nodeType={NODE_TYPE}
                nodeIcon={Icon}
                ports={{
                    output: true
                }}
                extraPorts = {
                    <TimerTriggerPort />
                }
                title={title}
                settings={{callback: () => setOpenSettings(true), highlight: hasMissingConfig}}
                run={handleRun}
                running={isRunning}
                logs={{callback: () => setOpenLogs(true), highlight: error !== null}}
                validation={validation}
            />

            <LogsDialog
                open={openLogs}
                onClose={() => setOpenLogs(false)}
                title={title}
                error={error}
            />

            <BaseDialog
                open={openSettings}
                onClose={() => setOpenSettings(false)}
                title={title}
            >
                <DebouncedTextField
                    label="URL"
                    variant="outlined"
                    fullWidth
                    value={url}
                    onChange={(value) => onConfigChange(id, {url: value})}
                    helperText="Enter URL to fetch and render as HTML (uses headless browser)"
                    sx={{mb: 2}}
                />
            </BaseDialog>
        </>
    );
}