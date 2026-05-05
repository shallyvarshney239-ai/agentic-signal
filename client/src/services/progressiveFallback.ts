/************************************************************************
 *    Copyright (C) 2025 Code Forge Temple                              *
 *    This file is part of agentic-signal project                       *
 *    See the LICENSE file in the project root for license details.     *
 ************************************************************************/

export type FallbackLevel =
    | "deterministic"
    | "heuristic"
    | "llm_simple"
    | "llm_full"
    | "safe_default";

export interface FallbackResult {
    output: any;
    level: FallbackLevel;
    llmCalls: number;
}

export function deterministicPass (
    input: any,
    prompt: string
): { output: any | null; matched: boolean } {
    const text =
        typeof input === "string" ? input : JSON.stringify(input);

    if (
        prompt.toLowerCase().includes("count") &&
        text.match(/[\w]+/g)
    ) {
        const words = text.match(/[\w]+/g) || [];

        return {
            output: {
                count: words.filter((w) => w.length > 2).length,
                items: words.slice(0, 50),
            },
            matched: true,
        };
    }

    if (
        prompt.toLowerCase().includes("extract email") ||
        prompt.toLowerCase().includes("email")
    ) {
        const emails =
            text.match(
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
            ) || [];

        if (emails.length > 0) {
            return {output: {emails}, matched: true};
        }
    }

    if (
        prompt.toLowerCase().includes("url") ||
        prompt.toLowerCase().includes("link")
    ) {
        const urls = text.match(/https?:\/\/[^\s)]+/g) || [];

        if (urls.length > 0) {
            return {output: {urls}, matched: true};
        }
    }

    if (prompt.toLowerCase().includes("date")) {
        const dates =
            text.match(
                /\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}/g
            ) || [];

        if (dates.length > 0) {
            return {output: {dates}, matched: true};
        }
    }

    if (
        prompt.toLowerCase().includes("phone") ||
        prompt.toLowerCase().includes("number")
    ) {
        const phones =
            text.match(
                /\+?[\d]{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g
            ) || [];

        if (phones.length > 0) {
            return {output: {phone_numbers: phones}, matched: true};
        }
    }

    return {output: null, matched: false};
}

export function heuristicPass (
    input: any,
    prompt: string
): { output: any | null; matched: boolean } {
    const text =
        typeof input === "string" ? input : JSON.stringify(input);

    if (
        prompt.toLowerCase().includes("sentiment") ||
        prompt.toLowerCase().includes("tone")
    ) {
        const positive = (
            text.match(
                /good|great|excellent|amazing|love|happy|best|wonderful|fantastic/gi
            ) || []
        ).length;
        const negative = (
            text.match(
                /bad|terrible|awful|hate|worst|horrible|poor|fail|disaster/gi
            ) || []
        ).length;

        if (positive + negative > 0) {
            const sentiment =
                positive > negative
                    ? "positive"
                    : negative > positive
                        ? "negative"
                        : "neutral";

            return {
                output: {
                    sentiment,
                    positive_words: positive,
                    negative_words: negative,
                },
                matched: true,
            };
        }
    }

    if (
        prompt.toLowerCase().includes("classify") ||
        prompt.toLowerCase().includes("category")
    ) {
        const categories: Record<string, RegExp> = {
            technical:
                /code|api|server|database|function|bug|deploy|algorithm|programming/gi,
            business:
                /revenue|profit|customer|sales|market|growth|strategy|funding/gi,
            personal:
                /family|friend|home|health|travel|hobby|vacation|life/gi,
            news: /breaking|report|announce|update|launch|release|official/gi,
        };
        let bestCat = "general";
        let bestScore = 0;

        for (const [cat, regex] of Object.entries(categories)) {
            const score = (text.match(regex) || []).length;

            if (score > bestScore) {
                bestScore = score;
                bestCat = cat;
            }
        }

        if (bestScore > 0) {
            return {
                output: {
                    category: bestCat,
                    confidence: Math.min(bestScore / 5, 1),
                },
                matched: true,
            };
        }
    }

    if (
        prompt.toLowerCase().includes("summarize") ||
        prompt.toLowerCase().includes("summary")
    ) {
        const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10);

        if (sentences.length > 2) {
            const first = sentences[0].trim();
            const last = sentences[sentences.length - 1].trim();

            return {
                output: {
                    summary: `${first.slice(0, 200)}... [${sentences.length - 2} sentences omitted] ...${last.slice(-200)}`,
                    total_sentences: sentences.length,
                },
                matched: true,
            };
        }
    }

    return {output: null, matched: false};
}

export const SAFE_DEFAULT_OUTPUT = {
    error: "Automated processing failed to produce a reliable result.",
    suggestion: "Try simplifying the input or selecting a different model.",
    note: "This is a safe default response from the deterministic fallback layer — no LLM hallucination risk.",
};