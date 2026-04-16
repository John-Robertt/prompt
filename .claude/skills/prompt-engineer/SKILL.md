---
name: prompt-engineer
description: >-
  Generate or optimize prompts. Use when the user asks to
  "write a prompt", "create a system prompt", "optimize this prompt",
  "improve this prompt", or discusses prompt engineering strategy.
version: 1.0.0
---

## Core Philosophy

Prompt engineering is translation — converting human needs and expectations into instructions that models process with maximum fidelity and efficiency, achieving the user's actual goals.

This defines the problem structure:
- **Source language**: The user's real needs, expectations, and success criteria
- **Target language**: The model's cognitive processing mechanisms
- **Translation quality** = Fidelity (faithful to user intent) × Efficiency (minimal loss in transmission)

A good translator preserves everything the original contains, adds nothing the original lacks, and understands both languages deeply. These three properties drive every decision below.

The translation metaphor is the single root framework. Backward induction, encoding layers, quality checks, and anti-patterns below are all derived implementations of this metaphor — a single unified framework.

## Goal

When this skill activates, produce a prompt (generation mode) or a revised prompt with change rationale (optimization mode) that maximizes translation fidelity and efficiency. The output is complete when it passes all three Quality Verification checks at the end of this document.

**Reference files** (load when indicated in the workflow):
- `references/anti-patterns.md` — error taxonomy for diagnosis in optimization mode
- `references/cognitive-mechanisms.md` — three cognitive mechanisms that explain *why* translation strategies work (forward propagation advantage, attention position effect, induction head generalization). Load when diagnosing why an existing prompt underperforms, facing an edge case not covered by the anti-pattern table, or the user asks *why* a particular strategy is recommended

---

## Understanding the Source: Goal Backward Induction

Most prompt failures trace back to misunderstanding the source — the gap between what users say and what they actually need.

### The Backward Induction Chain

Derive prompts backwards from the end goal. Each level is derived from the one above it:

- **Ultimate goal & success criteria** — What outcome does the user actually need? Define what "done" looks like in concrete, verifiable terms.
  - **Core idea** — What is the first principle of this task? This is the single insight that, if understood, makes every subsequent decision self-evident. Example: A contract generation task's core idea is "protect the party's interests at minimum legal cost when breach occurs" — this reframes every downstream choice.
    - **Behavioral motivation** — Why is each constraint necessary? Each motivation traces directly to the core idea via a "because..." link.
      - **Behavioral rules** — The specific requirements and constraints. Each rule traces to a motivation, which traces to the core idea, which traces to the user's goal.

When the user's goal is ambiguous or underspecified, present a goal hypothesis for confirmation before proceeding ("Based on X, I understand the goal as Y — is this correct?"), because a translation built on a misunderstood source will be faithfully wrong.

### Traceability Test

Every rule in the generated prompt must survive this test: trace it back through motivation → core idea → user goal. Retain only rules whose chain is complete — an unauthorized addition (rule without traceable motivation) or hollow decoration (motivation without a concrete rule) indicates a translation error to be corrected.

When two rules each pass the traceability test individually but produce contradictory directives, resolve at the motivation level: trace both back to the core idea, determine which motivation is more central to the user's goal, and retain that rule — because contradictions left unresolved force the model to make an arbitrary choice the user did not authorize.

---

## Translation Workflow

### Generation Mode (new prompt)

Derive the prompt backwards from the user's end goal through the backward induction chain, encode using the Encoding Framework, and verify against Quality Verification checks before presenting — because working forward from the first idea that comes to mind typically encodes the translator's assumptions rather than the user's actual needs.

### Optimization Mode (existing prompt)

Diagnose translation errors in the existing prompt using `references/anti-patterns.md`, trace each error to its cognitive root cause via `references/cognitive-mechanisms.md`, and apply targeted corrections — because fixing symptoms without diagnosing root causes produces patches that break elsewhere. Re-verify the revised prompt against Quality Verification checks. Output the revised prompt with change rationale for each modification.

---

## Encoding Framework

Encode the understood user needs into a structure the model processes efficiently. Four flexible layers, combined as needed — use only the layers the task requires, because every unused layer dilutes attention from the layers that matter.

**Encoding principles**:
- **Context** at the head — because head position carries the highest cumulative attention weight
- **Intent** immediately after — because an explicit goal prevents the model from inferring a divergent one
- **Behavior** in positive form with "because..." motivations — because positive framing aligns with forward generation (~3% vs. ~12% violation rate) and motivations activate deeper generalization
- **Verification** at the tail — because tail position carries the strongest position encoding signal

Adapt encoding to the receiver's capabilities (context window size, tool-calling support, reasoning depth), because the target language's grammar varies with the receiver. For smaller context windows, compress aggressively and prioritize head/tail placement; for tool-calling models, encode actionable steps as tool invocations rather than prose instructions.

### Layer Structure

**Context Architecture** — Static reference content, domain knowledge, environmental constraints.
- Place at the very beginning of the prompt, because head position carries the highest cumulative attention weight across all subsequent layers.
- Wrap different content types in structural tags (XML or Markdown sections), because physical isolation prevents cross-contamination of attention between unrelated content blocks.
- Include only when the task depends on external information (per the principle above).

**Intent Declaration** — Goal, success criteria, scope boundaries.
- Always required, because without an explicit goal the model infers one — and inferred goals diverge from user intent. Use action verbs ("refactor", "analyze", "generate") rather than vague descriptions ("help me improve", "look at this"), because specific verbs constrain the output space more tightly, reducing interpretation divergence.
- Define what is in scope and what is out — because unstated boundaries allow the model to explore beyond the user's intended scope, degrading translation fidelity.
- State completion criteria explicitly: what does "done" look like? — because explicit endpoints enable the model to converge on the user's intended scope, preserving translation fidelity.

**Behavioral Specification** — Format requirements, style parameters, positive behavioral directives.
- Express all constraints in positive form first. Because positive instructions align with the model's forward generation path and achieve ~3% violation rate versus ~12% for negative constraints.
- When safety constraints require negative form, isolate them in dedicated sections with clear delimiters, and repeat at both the beginning and end of the prompt (bookend strategy), because U-shaped attention decay would otherwise mute constraints buried in the middle.
- Define expertise scope and output constraints directly, because parameterized capability boundaries focus attention on task logic rather than persona maintenance.

**Verification & Iteration** — Self-check instructions, validation criteria.
- Place at the very end of the prompt, because tail position carries the strongest position encoding signal — the last instruction the model reads has outsized influence on generation behavior.
- Define verification as completion conditions ("Before submitting, verify each claim has source support"), because completion conditions let the model verify using its own reasoning path rather than forcing it to translate internal reasoning into a prescribed format, wasting reasoning tokens.
- Include only when the task requires high reliability, because unnecessary verification layers dilute attention from the core task.

### Physical Ordering

The ordering follows attention mechanics:

```
[Context Architecture]     ← Head position: longest cumulative path, highest weight
[Intent Declaration]       ← Core goal in the high-attention zone
[Behavioral Specification] ← Constraints and format
[Verification & Iteration] ← Tail position: position encoding advantage
```

### Thought-Motivation-Behavior Chain Construction

For each rule in the generated prompt, construct the complete derivation:

```
Core idea (the prompt's first principle)
  ↓ Because...
Behavioral motivation (why this rule is necessary)
  ↓ Therefore...
Behavioral rule (the specific requirement)
```

Embed the motivation directly in the prompt using "because..." links. This activates deeper generalization — the model can then extrapolate the principle to scenarios the rules did not explicitly cover, rather than treating each rule as an isolated constraint.

---

## Quality Verification

Before presenting the output, verify it against these three principles. Each targets a distinct failure mode of the translation process.

### Fidelity — every element traces bidirectionally between user goal and prompt rule

Fidelity failures mean the translation changed the message — adding what was not there, or losing what was. Verify: every rule traces back through motivation → core idea → user goal (untraceable rules are unauthorized additions); every piece of content traces to a user request (unrequested content dilutes attention); all critical user requirements are represented (omitted requirements are silent translation losses).

### Efficiency — every encoding choice aligns with the cognitive mechanism it leverages

Efficiency failures mean the translation is faithful but lossy — the right message delivered through a noisy channel. Scan against `references/anti-patterns.md` for known translation errors. Verify: constraints use positive framing (forward propagation advantage); critical information occupies head or tail position (attention position effect); rules are expressed as principles with motivations (induction head generalization); only necessary layers are included (attention budget).

### Structural Integrity — physical structure reinforces logical structure

Structural failures mean the encoding is internally inconsistent — the parts do not compose into a coherent whole. Verify: physical ordering follows the attention-optimized sequence (Context → Intent → Behavior → Verification); different content types are physically isolated with structural tags; the thought-motivation-behavior chain is complete and unbroken for each rule, because broken chains produce rules the model follows literally but cannot generalize.

Verify the output passes all three checks before presenting it.

---

## Empirical Verification

Quality Verification checks the encoding's internal consistency. Empirical verification confirms the translation produces the intended behavior in practice — because a structurally sound prompt can still encode the wrong meaning. Apply when the prompt's success criteria are observable in model output and the cost of translation error is high.

### Test Design

Create 2–5 representative test inputs that exercise the prompt's behavioral rules. Prioritize three categories: core path inputs that test the primary intent, edge cases where rules might conflict or underspecify, and adversarial inputs that pressure the prompt's constraints. Derive expected outputs from the backward induction chain's success criteria, because test expectations disconnected from the user's actual goal will validate the wrong behavior.

### Baseline Comparison

Run both the new prompt and a baseline (the previous version, or no prompt) against the same inputs, because isolated results cannot distinguish prompt effect from model default behavior. When the baseline already produces satisfactory output, the prompt adds no value — this signals either an unnecessary translation or success criteria that need sharpening.

### Failure Diagnosis

When a test reveals unexpected output, diagnose using the anti-pattern taxonomy (`references/anti-patterns.md`) before making changes, because the symptom (wrong output) and the root cause (encoding error) are often in different locations. Trace from the output failure back through the encoding to identify which translation strategy was misapplied. If a specific root cause recurs across multiple tests, the issue is likely in the core idea or motivation rather than in individual rules.

### Iteration

Each diagnosis suggests a targeted correction. Apply the correction, re-verify structurally (Quality Verification), then re-test empirically. Generalize from test failures to principles rather than adding narrow rules that fix only the observed case — because overfitting to test cases produces a prompt that works for the examples but fails in deployment. Converge when outputs consistently meet success criteria across all test inputs, and remove any prompt content that tests reveal to be inert.

---

Physical encoding order: Context (head) → Intent → Behavior → Verification (tail).
