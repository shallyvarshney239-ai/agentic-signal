# Threat Model - Agentic Signal

## Threat 1: Prompt Injection via User Input

**Risk:** User-provided input contains `system:` or role-switch tokens that override instructions.

**Mitigation:** Input sanitization strips `<|start_header_id|>`, `<|end_header_id|>`, `<|eot_id|>`, and blocks role-switching patterns. Anti-injection regex patterns applied to all user text before LLM context.

**Residual risk:** Obfuscated injection may still pass via Unicode homoglyphs or creative formatting.

## Threat 2: Small Model Jailbreak

**Risk:** 3B models offer minimal resistance to crafted jailbreak prompts.

**Mitigation:** System prompt wrapped with explicit constraint layer. Model output never reaches shell, file system, or database. All actions are routed through validated node execution rather than raw model output.

**Residual risk:** Inherent to small model architecture - minimal guardrail capability.

## Threat 3: Hallucinated Executable Code

**Risk:** LLM generates code-like content in output that downstream nodes act on.

**Mitigation:** LLM output never touches shell, file system, or database directly. All node execution happens through pre-defined sandboxed handlers. JSON Schema validation on all outputs before propagation.

**Residual risk:** None - this is an architectural constraint, not model-dependent.

## Threat 4: Sensitive Data Leakage in AI Context

**Risk:** API keys, tokens, passwords visible in conversation context sent to the model.

**Mitigation:** 14-field redaction system (api_key, token, password, secret, bearer, etc.). Automatic truncation of values over 200 characters. OAuth2 least-privilege scopes for Google integrations. Conversation history excluded from export/save.

**Residual risk:** Non-standard or custom field names may not be caught by the pattern matcher.

## Threat 5: Model Output as Downstream Configuration

**Risk:** LLM output is consumed as node configuration by subsequent workflow nodes.

**Mitigation:** All LLM outputs pass through JSON Schema validation before propagation. Data Validation Node provides explicit guard. Feedback loops catch inconsistencies.

**Residual risk:** Valid JSON can still contain semantically incorrect data.

## Threat 6: Search Tool Result Injection

**Risk:** Web search results contain malicious content that enters LLM context.

**Mitigation:** Search results truncated to 2000 characters per source. Results pass through sanitization pipeline alongside user input.

**Residual risk:** Truncation may not catch all malicious content in search snippets.

## Design Principle

All model output is treated as untrusted input. No raw model output reaches execution surfaces. Every action path passes through pre-defined, validated handlers. This is not an AI security model - it's a systems security model that happens to contain an AI component.