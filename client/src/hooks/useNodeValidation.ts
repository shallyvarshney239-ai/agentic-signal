/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useMemo} from "react";
import {DATA_SOURCE_TYPES} from "../components/nodes/DataSourceNode/types/workflow";
import {TIMER_NODE_MODES} from "../components/nodes/TimerNode/types/workflow";
import {toolRegistry} from "../components/nodes/ToolNode/tools/toolRegistry.gen";


export type ValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
    hasOutput: boolean;
};

export type NodeValidationContext = {
    errors: string[];
    warnings: string[];
    status: 'error' | 'warning' | 'success' | 'neutral';
    hasOutput: boolean;
};

function isValidUrl (url: string): boolean {
    if (!url || typeof url !== 'string') return false;

    try {
        new URL(url);

        return true;
    } catch {
        return false;
    }
}

function getDataSourceValidation (data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.dataSource) {
        errors.push("Data source configuration is missing");

        return {valid: false, errors, warnings, hasOutput: false};
    }

    if (data.dataSource.type === DATA_SOURCE_TYPES.JSON) {
        if (!data.dataSource.value || data.dataSource.value.trim() === "") {
            errors.push("JSON data field is empty");
        } else {
            try {
                JSON.parse(data.dataSource.value);
            } catch {
                errors.push("Invalid JSON format");
            }
        }
    } else if (data.dataSource.type === DATA_SOURCE_TYPES.MARKDOWN) {
        const hasContent = data.dataSource.value?.text?.trim() || data.dataSource.value?.files?.length > 0;

        if (!hasContent) {
            warnings.push("Markdown source has no content — add text or upload files in settings");
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        hasOutput: false
    };
}

function getGetDataValidation (data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.url || data.url.trim() === "") {
        errors.push("URL is required");
    } else if (!isValidUrl(data.url)) {
        errors.push("Invalid URL format");
    }

    if (!data.dataType) {
        errors.push("Data type must be selected");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        hasOutput: false
    };
}

function getHttpValidation (data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.url || data.url.trim() === "") {
        errors.push("URL is required");
    } else if (!isValidUrl(data.url)) {
        errors.push("Invalid URL format");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        hasOutput: false
    };
}

function getLlmValidation (data: any, models: string[] = []): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.model) {
        errors.push("LLM model must be selected");
    } else if (models.length > 0 && !models.includes(data.model)) {
        errors.push(`Selected model "${data.model}" is not available`);
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        hasOutput: false
    };
}

function getToolValidation (data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!data.toolSubtype) {
        errors.push("No tool selected");

        return {valid: false, errors, warnings, hasOutput: false};
    }

    const selectedTool = toolRegistry.find(t => t.toolSubtype === data.toolSubtype);

    if (!selectedTool) {
        errors.push("Selected tool not found");

        return {valid: false, errors, warnings, hasOutput: false};
    }

    if (selectedTool.userConfigSchema) {
        const requiredKeys = Object.keys(selectedTool.userConfigSchema).filter(key => {
            const schema = (selectedTool.userConfigSchema as any)?.[key];

            return schema?.required;
        });

        const missingKeys = requiredKeys.filter(key => !data.userConfig?.[key]);

        if (missingKeys.length > 0) {
            missingKeys.forEach(key => {
                const schema = (selectedTool.userConfigSchema as any)?.[key];
                const label = schema?.description || key;

                errors.push(`Missing required config: ${label}`);
            });
        }
    }

    if (!data.handler) {
        errors.push("Tool handler not initialized");
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        hasOutput: false
    };
}

function getTimerValidation (data: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    const isManualMode = data.mode === TIMER_NODE_MODES.INTERVAL && data.runOnce && data.interval === 0;

    if (isManualMode) {
        return {valid: true, errors, warnings, hasOutput: false};
    }

    if (data.mode === TIMER_NODE_MODES.INTERVAL) {
        if (data.interval === undefined || data.interval === null) {
            errors.push("Interval value is required");
        } else if (data.interval <= 0 && !data.runOnce) {
            errors.push("Interval must be greater than 0 for automatic triggering");
        }
    } else if (data.mode === TIMER_NODE_MODES.SCHEDULED) {
        if (!data.scheduledDateTime) {
            errors.push("Scheduled date/time is required");
        } else {
            const scheduledTime = new Date(data.scheduledDateTime);

            if (scheduledTime <= new Date()) {
                warnings.push("Scheduled time is in the past");
            }
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
        hasOutput: false
    };
}

export type NodeType =
    | 'DataSourceNode'
    | 'GetDataNode'
    | 'HttpNode'
    | 'LlmProcessNode'
    | 'ToolNode'
    | 'TimerNode';

export function getNodeValidation (nodeType: NodeType, data: any, context?: {models?: string[], hasOutput?: boolean}): ValidationResult {
    let result: ValidationResult;

    switch (nodeType) {
        case 'DataSourceNode':
            result = getDataSourceValidation(data);
            break;
        case 'GetDataNode':
            result = getGetDataValidation(data);
            break;
        case 'HttpNode':
            result = getHttpValidation(data);
            break;
        case 'LlmProcessNode':
            result = getLlmValidation(data, context?.models);
            break;
        case 'ToolNode':
            result = getToolValidation(data);
            break;
        case 'TimerNode':
            result = getTimerValidation(data);
            break;
        default:
            result = {valid: true, errors: [], warnings: [], hasOutput: false};
    }

    if (context?.hasOutput !== undefined) {
        result.hasOutput = context.hasOutput;
    }

    return result;
}

export function useNodeValidation (
    nodeType: NodeType,
    data: any,
    context?: {models?: string[], hasOutput?: boolean}
): NodeValidationContext {
    return useMemo(() => {
        const result = getNodeValidation(nodeType, data, context);

        let status: NodeValidationContext['status'];

        if (result.errors.length > 0) {
            status = 'error';
        } else if (result.warnings.length > 0) {
            status = 'warning';
        } else if (result.hasOutput) {
            status = 'success';
        } else {
            status = 'neutral';
        }

        return {
            errors: result.errors,
            warnings: result.warnings,
            status,
            hasOutput: result.hasOutput
        };
    }, [nodeType, data, context?.models, context?.hasOutput]);
}