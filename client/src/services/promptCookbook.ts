/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

/* eslint-disable max-len */

export interface ModelCookbook {
    modelName: string;
    tier: number;
    paramCount: string;
    quantization: string;
    systemWrapper: (rawSystemPrompt: string) => string;
    userWrapper: (rawUserPrompt: string) => string;
    jsonEnforcementSuffix: string;
    antiHallucinationWrapper: string;
    bestTemperature: number;
    maxEffectiveContext: number;
    knownWeaknesses: string[];
    fallbackPrompts: Record<string, string>;
}

export const COOKBOOK_LLAMA3_2_3B: ModelCookbook = {
    modelName: "llama3.2:3b-q4_K_M",
    tier: 1,
    paramCount: "3B",
    quantization: "Q4_K_M",

    systemWrapper: (raw: string) => `
<|begin_of_text|><|start_header_id|>system<|end_header_id|>

${raw}

IMPORTANT CONSTRAINTS:
- You are a 3B parameter model with limited reasoning.
- Output ONLY the requested format. No explanations unless asked.
- If unsure, respond with "UNCERTAIN:" followed by your best estimate.
- Never invent URLs, phone numbers, or specific statistics.
- If analysis requires counting items, output items individually.

<|eot_id|>`,

    userWrapper: (raw: string) => `
<|start_header_id|>user<|end_header_id|>

${raw}

<|eot_id|>
<|start_header_id|>assistant<|end_header_id|>`,

    jsonEnforcementSuffix:
        "\n\nCRITICAL: Your ENTIRE response must be valid JSON starting with '{' and ending with '}'. No other text. No markdown. No explanations. Just the JSON object.",

    antiHallucinationWrapper:
        "SELF-CHECK: If you are about to state a specific fact, date, number, or URL not explicitly provided in the input, preface it with ESTIMATE: or UNCERTAIN:. Do not fabricate data.",

    bestTemperature: 0.1,
    maxEffectiveContext: 4096,

    knownWeaknesses: [
        "format_adherence: Ignores JSON schema ~40% of raw calls",
        "hallucination: Invents specific numbers, URLs, names",
        "counting: Cannot accurately count items in a list",
        "instruction_following: Produces preamble when told not to",
        "tool_calling: Selects wrong tool or hallucinates parameter values",
    ],

    fallbackPrompts: {
        summarize:
            "In exactly three sentences, summarize the key points from the input:",
        extract:
            "From the input above, extract ONLY the following fields as JSON. Output nothing else:",
        classify:
            "Classify the input as ONE of [spam, urgent, normal, promotional]. Output only the classification word:",
    },
};

export const COOKBOOK_PHI4_MINI: ModelCookbook = {
    modelName: "phi4-mini",
    tier: 1,
    paramCount: "3.8B",
    quantization: "Q4_K_M",

    systemWrapper: (raw: string) =>
        `<|system|>\n${raw}\n<|end|>`,

    userWrapper: (raw: string) =>
        `<|user|>\n${raw}\n<|end|>\n<|assistant|>`,

    jsonEnforcementSuffix:
        "\n\nCRITICAL: Your ENTIRE response must be valid JSON starting with '{' and ending with '}'. No other text. No markdown. No explanations. Just the JSON object.",

    antiHallucinationWrapper:
        "SELF-CHECK: If you are about to state a specific fact, date, number, or URL not explicitly provided in the input, preface it with ESTIMATE: or UNCERTAIN:. Do not fabricate data.",

    bestTemperature: 0.1,
    maxEffectiveContext: 4096,

    knownWeaknesses: [
        "format_adherence: May add markdown wrappers to JSON under high pressure",
        "hallucination: Occasionally confabulates when input is ambiguous",
        "instruction_following: Adds preamble when strict output format is requested",
        "tool_calling: Parameter values may drift under complex nested tool calls",
    ],

    fallbackPrompts: {
        summarize:
            "In exactly three sentences, summarize the key points from the input:",
        extract:
            "From the input above, extract ONLY the following fields as JSON. Output nothing else:",
        classify:
            "Classify the input as ONE of [spam, urgent, normal, promotional]. Output only the classification word:",
    },
};

export const COOKBOOK_GEMMA4_E4B: ModelCookbook = {
    modelName: "gemma4:e4b-q4_K_M",
    tier: 1,
    paramCount: "4B",
    quantization: "Q4_K_M",

    systemWrapper: (raw: string) => `
${raw}

CRITICAL: Return ONLY the exact format requested. Keep responses under 500 tokens. No creative embellishment.`,

    userWrapper: (raw: string) => raw,

    jsonEnforcementSuffix:
        "\n\nOUTPUT ONLY VALID JSON. No markdown. No backticks. Pure JSON starting with '{' or '['.",

    antiHallucinationWrapper:
        "If you don't know something, say 'I don't have that information.' Do not guess.",

    bestTemperature: 0.0,
    maxEffectiveContext: 8192,

    knownWeaknesses: [
        "creativity_bias: Over-generates when asked for structured data",
        "format_adherence: Adds markdown wrappers to JSON",
        "instruction_following: Sometimes adds unsolicited commentary",
    ],

    fallbackPrompts: {
        summarize: "Summarize the input in exactly three concise points:",
        extract:
            "Extract these specific fields as JSON and ONLY those fields:",
        classify: "Classify as exactly one word - no other text:",
    },
};

export function getCookbook (modelName: string): ModelCookbook {
    const lower = modelName.toLowerCase();

    if (
        lower.includes("phi4") ||
        lower.includes("phi-4") ||
        lower.includes("phi 4")
    ) {
        return COOKBOOK_PHI4_MINI;
    }

    if (lower.includes("llama3.2") && lower.includes("3b")) {
        return COOKBOOK_LLAMA3_2_3B;
    }

    if (
        lower.includes("gemma4") ||
        lower.includes("gemma 4") ||
        lower.includes("e4b")
    ) {
        return COOKBOOK_GEMMA4_E4B;
    }

    return {
        ...COOKBOOK_PHI4_MINI,
        modelName,
        systemWrapper: (raw: string) =>
            `${raw}\n\nBe concise. Output only the requested format.`,
        userWrapper: (raw: string) => raw,
    };
}