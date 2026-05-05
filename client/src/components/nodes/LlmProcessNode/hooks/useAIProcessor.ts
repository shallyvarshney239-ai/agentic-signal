/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {useState, useCallback} from 'react';
import {OllamaService} from '../../../../services/ollamaService';
import {GenericNodeData} from '../../../../types/workflow';
import {Message, MessageRole, SystemUserConfigValues, ToolSchema} from '../../../../types/ollama.types';
import Ajv from "ajv";
import {LlmProcessNodeData} from '../types/workflow';
import {runMultiPassPipeline} from '../../../../services/multiPassPipeline';
import {runSelfConsistency} from '../../../../services/selfConsistency';
import {deterministicPass, heuristicPass} from '../../../../services/progressiveFallback';
import {metricsStore} from '../../../../services/metricsStore';

export interface UseAIProcessorOptions {
    onSuccess?: (result: any) => void;
    onError?: (error: string) => void;
}

function getExpectedOutputType (format: any): string {
    try {
        const schema = typeof format === "string" ? JSON.parse(format) : format;

        if (!schema || typeof schema !== "object") return "unknown";

        if (schema.type) {
            return schema.type;
        }

        for (const key of ["oneOf", "anyOf", "allOf"]) {
            if (Array.isArray(schema[key])) {
                for (const subschema of schema[key]) {
                    const type = getExpectedOutputType(subschema);

                    if (type !== "unknown") return type;
                }
            }
        }
    } catch (e) {
        throw new Error(`Invalid format schema: ${e instanceof Error ? e.message : String(e)}`);
    }

    return "unknown";
}

const serializeInput = (inputData: any): string | undefined => {
    if (inputData == undefined) {
        return undefined;
    }

    if (typeof inputData === 'string') {
        return inputData;
    }

    if (typeof inputData === 'object') {
        return JSON.stringify(inputData, null, 4);
    }

    return String(inputData);
};

function assertIsSerializedInput (input: any): asserts input is string {
    if (typeof input !== 'string') {
        throw new Error(`Expected serialized input to be a string, but got ${typeof input}`);
    }
}

const buildUnifiedFormat = (format: {onSuccess?: string; onError?: string;}): string | undefined => {
    if (!format) return undefined;

    const {onSuccess, onError} = format;

    if (onSuccess && onError) {
        return JSON.stringify({
            oneOf: [
                JSON.parse(onSuccess),
                JSON.parse(onError)
            ]
        });
    }

    if (onSuccess) return onSuccess;

    return undefined;
};

const computeUserContent = (input: any, message?: {preffix?: string; suffix?: string}): string | null => {
    if (input !== undefined || message) {
        const serializedInput = input != undefined ? serializeInput(input) : "";

        assertIsSerializedInput(serializedInput);

        return message
            ? `${message.preffix || ''}${serializedInput}${message.suffix || ''}`
            : serializedInput;
    }

    return null;
};

const buildMessagesForRequest = (
    conversationHistory: {value: Message[]; onChange: (history: Message[]) => void},
    prompt: string | undefined,
    userContent: string | null,
    feedback: string | undefined
): Message[] => {
    let messages: Message[] = [];

    if (conversationHistory.value.length === 0) {
        if (prompt) {
            messages.push({
                role: MessageRole.SYSTEM,
                content: prompt
            });
        }

        if (userContent) {
            messages.push({
                role: MessageRole.USER,
                content: userContent
            });
        }
    } else {
        messages = [...conversationHistory.value];

        if (feedback) {
            messages.push({
                role: MessageRole.USER,
                content:
                    `The previous response caused an error in downstream processing. ` +
                    `Here's the feedback: ${feedback}\n\n` +
                    `Please provide a corrected response that addresses this issue.`
            });
        } else {
            const systemMsg = messages.find(m => m.role === MessageRole.SYSTEM);

            messages = systemMsg ? [systemMsg] : [];

            if (userContent) {
                messages.push({
                    role: MessageRole.USER,
                    content: userContent
                });
            }
        }
    }

    return messages;
};

interface ParseFormatResult {
    parsedFormat: object | undefined;
    onErrorSchema: object | undefined;
    onErrorValidator: ((data: any) => boolean) | undefined;
}

const parseFormatForRequest = (
    format: {onSuccess?: string; onError?: string;} | undefined,
    setError: (msg: string | null) => void,
    onError?: (msg: string) => void
): ParseFormatResult | null => {
    if (!format) return {parsedFormat: undefined, onErrorSchema: undefined, onErrorValidator: undefined};

    try {
        let unifiedFormat: string | undefined;

        if (typeof format === "object" && (format.onSuccess || format.onError)) {
            unifiedFormat = buildUnifiedFormat(format);

            let onErrorSchema: object | undefined;
            let onErrorValidator: ((data: any) => boolean) | undefined;

            if (format.onError) {
                onErrorSchema = JSON.parse(format.onError);

                const ajv = new Ajv();

                onErrorValidator = ajv.compile(onErrorSchema);
            }

            if (unifiedFormat) {
                return {
                    parsedFormat: JSON.parse(unifiedFormat),
                    onErrorSchema,
                    onErrorValidator
                };
            }

            return {parsedFormat: undefined, onErrorSchema, onErrorValidator};
        } else if (typeof format === "string") {
            return {parsedFormat: JSON.parse(format), onErrorSchema: undefined, onErrorValidator: undefined};
        }
    } catch (parseError) {
        const errorMsg = `Invalid format JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`;

        setError(errorMsg);
        onError?.(errorMsg);

        return null;
    }

    return {parsedFormat: undefined, onErrorSchema: undefined, onErrorValidator: undefined};
};

function postProcessResult (
    result: string,
    parsedFormat: object | undefined,
    onErrorValidator: ((data: any) => boolean) | undefined,
    setError: (msg: string | null) => void,
    onError?: (msg: string) => void
): any | null {
    try {
        const expectedOutputType = getExpectedOutputType(parsedFormat);

        if (expectedOutputType === "object" || expectedOutputType === "array") {
            let parsed;

            try {
                const cleaned = result.trim().replace(/^```(?:json)?\s*|```$/gi, '').trim();

                parsed = JSON.parse(cleaned);
            } catch {
                parsed = JSON.parse(result);
            }

            if (expectedOutputType === "array" && !Array.isArray(parsed)) {
                const errorMsg = `Expected array output but got ${typeof parsed}`;

                setError(errorMsg);
                onError?.(errorMsg);

                return null;
            }

            if (onErrorValidator && onErrorValidator(parsed)) {
                const errorMsg = `LLM returned an error response matching onError schema:\n${JSON.stringify(parsed, null, 4)}`;

                setError(errorMsg);
                onError?.(errorMsg);

                return null;
            }

            return parsed;
        }

        return result;
    } catch (parseError) {
        const errorMsg = `Failed to parse AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`;

        setError(errorMsg);
        onError?.(errorMsg);

        return null;
    }
}

const buildUpdatedHistory = (
    prompt: string | undefined,
    userContent: string | null,
    result: any
): Message[] => {
    const history: Message[] = [];

    if (prompt) {
        history.push({role: MessageRole.SYSTEM, content: prompt});
    }

    if (userContent) {
        history.push({role: MessageRole.USER, content: userContent});
    }

    history.push({
        role: MessageRole.ASSISTANT,
        content: typeof result === 'string' ? result : JSON.stringify(result)
    });

    return history;
};

type ProcessAIRequestParams = Pick<GenericNodeData & LlmProcessNodeData, 'input' | 'prompt' | 'message' | 'model' | 'format'> & {
    tools?: {
        schema: ToolSchema,
        systemUserConfigValues: SystemUserConfigValues,
        handler: (params: any) => Promise<any>
    }[];
    feedback?: string;
    maxToolRetries: number;
    conversationHistory: {
        value: Message[];
        onChange: (history: Message[]) => void;
    };
};

export function useAIProcessor (options: UseAIProcessorOptions = {}) {
    const {onSuccess, onError} = options;
    const [error, setError] = useState<string | null>(null);
    const [models, setModels] = useState<string[]>([]);
    const [isFetchingModels, setIsFetchingModels] = useState(false);

    const fetchModels = useCallback(async () => {
        setIsFetchingModels(true);

        try {
            const fetchResponse = await OllamaService.getInstance().fetchModels();

            if (fetchResponse.success) {
                const modelNames = fetchResponse.models.map(model => model.name);

                setModels(modelNames);

                return modelNames;
            } else {
                const errorMsg = `Failed to fetch models: ${fetchResponse.error}`;

                setError(errorMsg);
                onError?.(errorMsg);

                return [];
            }
        } catch (error) {
            const errorMsg = `Failed to fetch models: ${error instanceof Error ? error.message : String(error)}`;

            setError(errorMsg);
            onError?.(errorMsg);

            return [];
        } finally {
            setIsFetchingModels(false);
        }
    }, [onError]);

    const processAIRequest = useCallback(async (params: ProcessAIRequestParams): Promise<any> => {
        const {
            input,
            prompt,
            message,
            model,
            format,
            tools,
            feedback,
            maxToolRetries,
            conversationHistory
        } = params;

        if (!model) {
            const errorMsg = "Please select a model first.";

            setError(errorMsg);
            onError?.(errorMsg);

            return null;
        }

        if (!prompt && !message && !input) {
            const errorMsg = "Please provide a prompt, message, or input data.";

            setError(errorMsg);
            onError?.(errorMsg);

            return null;
        }

        setError(null);

        try {
            const userContent = computeUserContent(input, message);

            const pipelineMode = (params as ProcessAIRequestParams & Pick<LlmProcessNodeData, 'pipelineMode'>).pipelineMode;
            const consistencyMode = (params as ProcessAIRequestParams & Pick<LlmProcessNodeData, 'consistencyMode'>).consistencyMode;
            const fallbackMode = (params as ProcessAIRequestParams & Pick<LlmProcessNodeData, 'fallbackMode'>).fallbackMode;

            if (pipelineMode?.enabled && pipelineMode.stages.length > 0) {
                const t0 = performance.now();
                const pipelineInput = feedback ? {feedback, data: input} : input;

                const pipelineResult = await runMultiPassPipeline({
                    enabled: true,
                    stages: pipelineMode.stages,
                    input: pipelineInput,
                    prompt: prompt || "",
                    model
                });
                const totalDurationMs = performance.now() - t0;

                let result: any = pipelineResult.finalOutput;

                if (format) {
                    try {
                        const cleaned = result.trim().replace(/^```(?:json)?\s*|```$/gi, '').trim();
                        const parsed = JSON.parse(cleaned);

                        result = parsed;
                    } catch {
                        // Keep raw string if JSON parse fails
                    }
                }

                const updatedHistory = buildUpdatedHistory(prompt, userContent, result);

                conversationHistory.onChange(updatedHistory);

                const allPassed = pipelineResult.stages.every(s => s.passed);

                metricsStore.recordPipelineRun({
                    timestamp: Date.now(),
                    totalDurationMs,
                    llmCalls: pipelineResult.stages.length,
                    pipelineStages: pipelineResult.stages.length,
                    consistencyRuns: 0,
                    fallbackHits: 0,
                    fallbackLevel: "none",
                    success: allPassed
                });

                if (allPassed) {
                    onSuccess?.(result);
                } else {
                    const warnMsg = `Pipeline completed with warnings: ${pipelineResult.stages.filter(s => !s.passed).map(s => `${s.stage}: ${s.output}`).join('; ')}`;

                    setError(warnMsg);
                    onError?.(warnMsg);
                }

                return result;
            }

            if (fallbackMode?.enabled) {
                const fallbackText = userContent || (typeof input === 'string' ? input : JSON.stringify(input || ""));

                const detResult = deterministicPass(fallbackText, prompt || "");

                if (detResult.matched) {
                    const updatedHistory = buildUpdatedHistory(prompt, userContent, detResult.output);

                    conversationHistory.onChange(updatedHistory);

                    metricsStore.recordPipelineRun({
                        timestamp: Date.now(),
                        totalDurationMs: 0,
                        llmCalls: 0,
                        pipelineStages: 0,
                        consistencyRuns: 0,
                        fallbackHits: 1,
                        fallbackLevel: "deterministic",
                        success: true
                    });

                    onSuccess?.(detResult.output);

                    return detResult.output;
                }

                const heurResult = heuristicPass(fallbackText, prompt || "");

                if (heurResult.matched) {
                    const updatedHistory = buildUpdatedHistory(prompt, userContent, heurResult.output);

                    conversationHistory.onChange(updatedHistory);

                    metricsStore.recordPipelineRun({
                        timestamp: Date.now(),
                        totalDurationMs: 0,
                        llmCalls: 0,
                        pipelineStages: 0,
                        consistencyRuns: 0,
                        fallbackHits: 1,
                        fallbackLevel: "heuristic",
                        success: true
                    });

                    onSuccess?.(heurResult.output);

                    return heurResult.output;
                }
            }

            const messages = buildMessagesForRequest(conversationHistory, prompt, userContent, feedback);

            const formatResult = parseFormatForRequest(format, setError, onError);

            if (!formatResult) return null;

            const {parsedFormat, onErrorValidator} = formatResult;

            if (consistencyMode?.enabled && consistencyMode.runs >= 2) {
                const consConfig = {
                    runs: Math.min(consistencyMode.runs, 10),
                    temperature: 0.1,
                    scoring: "majority_text" as const
                };

                try {
                    const t0 = performance.now();
                    const consResult = await runSelfConsistency(
                        messages,
                        model,
                        consConfig,
                        parsedFormat,
                        tools,
                        maxToolRetries
                    );
                    const totalDurationMs = performance.now() - t0;

                    let result: any = consResult.best;

                    try {
                        const cleaned = result.trim().replace(/^```(?:json)?\s*|```$/gi, '').trim();
                        const parsed = JSON.parse(cleaned);

                        result = parsed;
                    } catch {
                        // Keep raw string
                    }

                    const processed = postProcessResult(
                        typeof result === 'string' ? result : JSON.stringify(result),
                        parsedFormat,
                        onErrorValidator,
                        setError,
                        onError
                    );

                    if (processed === null) return null;

                    const updatedHistory = messages.map(m => ({...m}));

                    updatedHistory.push({
                        role: MessageRole.ASSISTANT,
                        content: typeof processed === 'string' ? processed : JSON.stringify(processed)
                    });
                    conversationHistory.onChange(updatedHistory);

                    metricsStore.recordPipelineRun({
                        timestamp: Date.now(),
                        totalDurationMs,
                        llmCalls: consConfig.runs,
                        pipelineStages: 0,
                        consistencyRuns: consConfig.runs,
                        fallbackHits: 0,
                        fallbackLevel: "none",
                        success: true
                    });

                    onSuccess?.(processed);

                    return processed;
                } catch (consError) {
                    const errorMsg = `Self-consistency failed: ${consError instanceof Error ? consError.message : String(consError)}`;

                    setError(errorMsg);
                    onError?.(errorMsg);

                    metricsStore.recordRawFailure();

                    return null;
                }
            }

            const response = await OllamaService.getInstance().fetchAIResponse({
                messages,
                model,
                ...(parsedFormat ? {format: parsedFormat} : {}),
                tools,
                maxToolRetries
            });

            if (!response.success) {
                const errorMsg = `Failed to fetch AI response: ${response.error}`;

                setError(errorMsg);
                onError?.(errorMsg);

                metricsStore.recordRawFailure();

                return null;
            }

            const processed = postProcessResult(
                response.reply,
                parsedFormat,
                onErrorValidator,
                setError,
                onError
            );

            if (processed === null) {
                metricsStore.recordRawFailure();

                return null;
            }

            const updatedHistory = [...messages, {
                role: MessageRole.ASSISTANT,
                content: response.reply
            }];

            conversationHistory.onChange(updatedHistory);

            metricsStore.recordPipelineRun({
                timestamp: Date.now(),
                totalDurationMs: 0,
                llmCalls: 1,
                pipelineStages: 0,
                consistencyRuns: 0,
                fallbackHits: 0,
                fallbackLevel: "none",
                success: true
            });

            metricsStore.recordScaffoldedFix();

            onSuccess?.(processed);

            return processed;
        } catch (error) {
            const errorMsg = `Unexpected error: ${error instanceof Error ? error.message : String(error)}`;

            setError(errorMsg);
            onError?.(errorMsg);

            metricsStore.recordRawFailure();

            return null;
        }
    }, [onSuccess, onError]);

    return {
        processAIRequest,
        fetchModels,
        models,
        isFetchingModels,
        error,
        clearError: () => setError(null),
    };
}