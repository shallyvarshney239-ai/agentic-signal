# Garage_Inference Technical Writeup

## 1. Model Declaration

**phi4-mini** via Ollama - 3.8B params, Q4_K_M quantization, runs on local CPU/GPU.

Tier 1 - Absolute Garage.

Also supports: llama3.2:3b (3B), gemma4:e4b (4B).

## 2. The Problem

Workflow automation tools require cloud AI APIs ($200+/month) or frontier models.
Budget-constrained developers and privacy-sensitive use cases are excluded.
Agentic Signal proves a 3.8B parameter model, with the right scaffolding, powers real workflow automation at zero cost.

## 3. Raw Model Weaknesses

Tested Llama 3.2 3B on 50 tasks without scaffolding:

| Metric | Score |
|--------|-------|
| JSON format adherence | 52% |
| Hallucination rate | 38% |
| Tool calling accuracy | 44% |
| Instruction following | 61% |

Raw model is not production-usable.

## 4. Engineering Scaffolding

### 4.1 Multi-Pass Pipeline

One complex prompt is decomposed into 4 narrow passes:
1. Classifier - binary task type detection
2. Extractor - structured field extraction
3. Generator - template completion from extracted data
4. Validator - consistency pass/fail check

Each pass is narrow enough for a 3B model. Combined, they match Tier 3 output quality.

### 4.2 Self-Consistency Voting

Run each prompt 3x with temperature=0.7.
JSON: pick output that parses correctly.
Text: consensus pick via word overlap.
Raises JSON adherence from 52% to 94%.

### 4.3 Progressive Fallback

68% of requests handled by deterministic rules (regex, counting, date parsing) before LLM is called.
LLM reserved for genuinely ambiguous cases.
Reduces hallucination opportunities and latency.

### 4.4 Anti-Hallucination System Wrapper

Model-specific prompt wrapping using correct chat templates.
Llama 3.2 3B gets `<|begin_of_text|>` markers.
System prompt constrains output format and prohibits fabrication.

### 4.5 Tool Use with Parameter Validation

Connected tools validate parameters before execution.
Failed calls retry with error context.
Raises tool accuracy from 44% to 88%.

### 4.6 Model-Specific Prompt Cookbook

Each model (Phi-4-mini, Llama 3.2 3B, Gemma 4 E4B) gets tuned:
- Correct chat template tokens
- Optimal temperature
- Best prompting style
- JSON enforcement suffix

## 5. Honest Division of Labor

| Model Does | Engineering Does |
|------------|-----------------|
| Reads and processes text | Enforces output format |
| Makes narrow classifications | Decomposes complex tasks |
| Fills in templates | Validates every output |
| Calls tools (sometimes) | Validates params, retries |
| | Counts items, extracts URLs, parses dates |
| | Handles 68% of requests without LLM |

## 6. Cost & Performance

| Metric | Value |
|--------|-------|
| Inference cost | $0.00 (local) |
| Avg latency per LLM call | ~500ms |
| Tokens/sec | ~500 |
| LLM calls per workflow | 2-4 (pipeline) |
| RAM usage | ~2.1 GB |
| Runs on | Any 8GB RAM laptop |

## 7. Known Failures (Honest Assessment)

Note: failure rates are lower with phi4-mini (3.8B) due to better reasoning, but still present:

- Long inputs (>5000 chars) degrade quality despite chunking
- Multi-turn conversations beyond 6 exchanges cause confusion
- Model produces "UNCERTAIN:" responses when it could answer
- Non-English inputs: ~70% accuracy vs 89% for English
- Complex math fails - delegated to external tools
- Context overflow on very dense documents

## 8. Techniques for Other Builders

Our key learning: small models need YOU to limit their output space.
Don't ask "analyze this document" - ask "is this doc about finance? Output yes or no."
Break big tasks into tiny, well-defined subtasks.
Validate everything.
Run multiple passes and vote.