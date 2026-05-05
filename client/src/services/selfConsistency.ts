/************************************************************************
 *    Copyright (C) 2025 shally                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

import {Message, FetchAiResponse} from "../types/ollama.types";
import {OllamaService} from "./ollamaService";

export interface ConsistencyConfig {
    runs: number;
    temperature: number;
    scoring: "json_schema_pass" | "majority_text" | "shortest_valid";
}

function textOverlap (a: string, b: string): number {
    const wordsA = new Set(a.toLowerCase().split(/\s+/));
    const wordsB = new Set(b.toLowerCase().split(/\s+/));
    let overlap = 0;

    for (const w of wordsA) {
        if (wordsB.has(w)) overlap++;
    }

    return overlap / Math.max(wordsA.size, 1);
}

function consensusPick (outputs: string[]): {
    best: string;
    confidence: number;
} {
    if (outputs.length === 0) return {best: "", confidence: 0};

    if (outputs.length === 1)
        return {best: outputs[0], confidence: 0.5};

    const scores = outputs.map((o, i) => {
        let total = 0;

        for (let j = 0; j < outputs.length; j++) {
            if (i !== j) total += textOverlap(o, outputs[j]);
        }

        return total / (outputs.length - 1);
    });

    const bestIdx = scores.indexOf(Math.max(...scores));

    return {best: outputs[bestIdx], confidence: scores[bestIdx]};
}

function jsonSchemaPick (
    outputs: string[]
): string | null {
    for (const o of outputs) {
        try {
            JSON.parse(o);

            return o;
        } catch {
            continue;
        }
    }

    return outputs[0] || null;
}

export async function runSelfConsistency (
    messages: Message[],
    model: string,
    config: ConsistencyConfig,
    format?: object,
    tools?: any,
    maxToolRetries?: number
): Promise<{
    best: string;
    confidence: number;
    outputs: string[];
}> {
    const parallelCalls = Array.from({length: config.runs}, () =>
        OllamaService.getInstance().fetchAIResponse({
            messages: messages.map((m) => ({...m})),
            model,
            format,
            tools,
            maxToolRetries: maxToolRetries ?? 3,
        })
    );

    const results = await Promise.all(parallelCalls);
    const validOutputs = results
        .filter(
            (r): r is Extract<FetchAiResponse, { success: true }> =>
                r.success
        )
        .map((r) => r.reply);

    if (validOutputs.length === 0) {
        throw new Error("All consistency runs failed");
    }

    let best: string;

    if (config.scoring === "json_schema_pass") {
        best = jsonSchemaPick(validOutputs) || validOutputs[0];
    } else {
        const {best: consensus} = consensusPick(validOutputs);

        best = consensus;
    }

    return {
        best,
        confidence: validOutputs.length / config.runs,
        outputs: validOutputs,
    };
}