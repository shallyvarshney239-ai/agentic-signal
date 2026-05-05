/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {BaseDialog} from "../BaseDialog";
import {MarkdownRenderer} from "../MarkdownRenderer";

interface LogsDialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    error: string | string[] | null;
    hasRun?: boolean;
}

const NO_LOGS_AVAILABLE = "No logs available. Run the node first to see output or errors.";
const NO_ERRORS = "Node executed successfully. No errors.";

export function LogsDialog ({open, onClose, title, error, hasRun}: LogsDialogProps) {
    const errorContent = Array.isArray(error)
        ? (error.length > 0 ? error.join('\n\n---\n\n') : (hasRun ? NO_ERRORS : NO_LOGS_AVAILABLE))
        : (error ? error : (hasRun ? NO_ERRORS : NO_LOGS_AVAILABLE));

    return (
        <BaseDialog
            open={open}
            onClose={onClose}
            title={title}
        >
            <MarkdownRenderer content={errorContent} />
        </BaseDialog>
    );
}