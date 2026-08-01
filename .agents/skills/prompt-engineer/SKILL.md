---
name: prompt-engineer
description: >-
  Generate, optimize, review, or audit prompts. Use when the user asks to
  "write a prompt", "create a system prompt", "optimize this prompt",
  "improve this prompt", "review this prompt", "audit this prompt",
  "diagnose this prompt", "审查/评审/诊断/优化/改进/改写 提示词 / prompt /
  system prompt", or discusses prompt engineering strategy.
---

## Core Philosophy

Prompt engineering is translation — converting human needs and expectations into instructions that models process with maximum fidelity and efficiency, achieving the user's actual goals.

This defines the problem structure:
- **Source language**: The user's real needs, expectations, and success criteria
- **Target language**: The receiver's observable processing behavior, capabilities, and interface contracts
- **Translation quality** = Fidelity (faithful to user intent) × Efficiency (minimal loss in transmission)

A good translator preserves everything the original contains, adds nothing the original lacks, and understands both languages deeply. These three properties drive every decision below.

The translation metaphor is the single root framework. Four-level derivation, encoding layers, quality checks, and anti-patterns below are all derived implementations of this metaphor — a single unified framework.

## Goal

When this skill activates, select the mode authorized by the user's request:

- **Generation**: produce a new prompt.
- **Optimization**: revise an existing prompt and explain material changes.
- **Audit or diagnosis**: report evidence-backed translation failures and executable recommendations without rewriting the prompt unless the user also authorizes revision.

In every mode, maximize translation fidelity and efficiency. The output is complete when it satisfies the requested mode and passes all three Quality Verification checks at the end of this document.

**Reference files** (load when indicated in the workflow):
- `references/anti-patterns.md` — error taxonomy for diagnosis in optimization and audit modes
- `references/cognitive-mechanisms.md` — three model-processing heuristics that suggest *why* translation strategies may work. Load when diagnosing why an existing prompt underperforms, facing an edge case not covered by the anti-pattern table, or the user asks *why* a strategy is recommended; treat the heuristics as receiver-dependent hypotheses rather than universal laws
- `references/empirical-verification.md` — test-based verification workflow (design, baseline, diagnose, iterate). Load when the prompt will be deployed in a setting where output quality is directly observable and translation errors carry material cost

---

## Understanding the Source: Four-Level Derivation

Most prompt failures trace back to misunderstanding the source — the gap between what users say and what they actually need.

### The Derivation Chain

Derive prompts from the user's core goal through four logical levels. Each lower level translates its parent into a more actionable form:

1. **Goal & success criteria** — What outcome does the user actually need, and what observable result means it is achieved? The goal contains the task's core value rather than introducing a separate "core idea" layer.
2. **Motivation** — Why is a class of behavior necessary to achieve that goal? Motivations expose the causal reasons that the action principles must preserve.
3. **Action principles** — What general direction should behavior follow because of that motivation? Principles are high-compression guidance that supports correct decisions in situations the prompt does not enumerate.
4. **Concrete rules** — What specific requirements and constraints fully refine each action principle wherever consistent execution matters? Rules remove critical interpretation gaps while retaining the principle's ability to generalize.

This is a derivation hierarchy, not a list of prompt sections. Conditions, actions, ordering, boundaries, exceptions, and self-checks are possible contents of concrete rules, not additional levels. Include only the components necessary to make the parent principle executable and verifiable in the target setting.

### Rule Completeness

A rule set completely refines an action principle when the intended behavior no longer depends on the model supplying critical unstated semantics. For every behavior whose consistency affects success, determine whether its rules make the applicable items explicit:

- **Trigger or condition** — when the rule applies.
- **Observable action or constraint** — what the model must produce, decide, or preserve.
- **Timing or ordering** — where the action sits relative to other observable events, when sequence matters.
- **Boundary or exception** — where the rule stops or yields to higher-priority requirements, when ambiguity would change behavior.
- **Verification** — how the model or evaluator can tell from accessible evidence whether the rule was satisfied, when reliability requires a check. Verify emitted actions or available state rather than inaccessible user state such as whether the user has seen or understood a message.

Completeness does not mean exhaustive procedure. Specify externally meaningful behavior and decision boundaries; do not prescribe hidden reasoning steps merely to make the prompt look concrete. A concise rule is complete when it closes the interpretation gaps that matter, and an exhaustive list is still incomplete when the model must infer a critical trigger, action, or boundary.

### Rule Necessity and Minimality

A rule becomes mechanical overconstraint when it fixes a form, sequence, or implementation whose variation would not materially change its parent principle or the user goal. Throughout this skill, a difference is **material** when it changes a success criterion, user-visible meaning, external or machine-consumed contract, safety or authorization boundary, irreversible consequence, verifiability, or demonstrated reliability. Style variation is not material unless the user or a downstream consumer requires that style.

For every candidate concrete rule, apply these tests:

- **Protected value** — identify the exact success condition, contract, risk boundary, or reliability failure the rule protects. Remove a rule with no such effect.
- **Counterfactual removal** — state what materially different behavior becomes possible if the rule is removed. If only surface form changes, keep the form flexible.
- **Equivalent substitution** — ask whether another form or method could fully satisfy the parent principle. If yes, constrain the invariant rather than the chosen implementation; do not replace one arbitrary mandatory template with a smaller arbitrary template.
- **Form or procedure as content** — fix exact tokens, schemas, event order, or procedure only when that exactness produces the protected value; otherwise treat it as a replaceable carrier.
- **Contract authority** — do not invent field semantics, types, enumerations, thresholds, defaults, or public behavior merely to make an incomplete contract look executable. Derive them from an authorized higher layer or preserve them as an explicit unresolved decision.
- **Hollow compliance** — test whether the model could satisfy the rule literally while violating the parent principle. If yes, rewrite the rule around the missing outcome or boundary.
- **Exception pressure** — when a rule accumulates exceptions, return to the parent principle and identify the narrower invariant instead of extending the rule list.

The target is a **minimum sufficient rule set**: complete enough that no material behavior depends on unstated inference, and minimal enough that no immaterial degree of freedom is constrained.

When the user's goal is ambiguous or underspecified, first inspect the available context and compare the plausible interpretations. Proceed with the least-assumptive reversible interpretation when the alternatives do not materially change the goal, scope, contract, or success criteria. Ask the user to confirm a goal hypothesis only when an unresolved difference would materially change one of those outcomes, because routine clarification for immaterial variation adds friction without improving fidelity.

### Bidirectional Traceability Test

Test the chain in both directions:

- **Upward legitimacy**: every concrete rule traces to an action principle, every principle to a motivation, and every motivation to the user goal. Remove a rule that cannot complete this chain, because it adds behavior the user did not authorize.
- **Downward completeness**: the motivations collectively express why the goal requires action; the principles collectively express those motivations as behavioral direction; and the concrete rules fully refine each principle wherever execution must be consistent. Add or clarify the missing child when a parent depends on an inference the target model cannot be expected to share.
- **Constraint proportionality**: every constrained behavior passes Rule Necessity and Minimality. Remove or relax any constraint whose extra rigidity does not protect a material difference.

This test exposes five distinct failures: a goal without supporting motivations is not causally translated; a motivation without principles is explanatory but non-directive; a principle without sufficient concrete rules creates the illusion of specificity while leaving behavior to model-dependent inference; a rule without an upward chain is an unauthorized addition; and a traceable but disproportionate rule is mechanical overconstraint.

When individually valid rules conflict, trace them upward to the action principles and motivations they serve. Resolve the conflict at the highest shared level, prioritizing the branch more central to the user goal, because unresolved contradictions force the model to make a choice the user did not authorize.

---

## Translation Workflow

### Generation Mode (new prompt)

Derive the prompt through goal → motivation → action principles → concrete rules. Apply bidirectional traceability, Rule Completeness, and Rule Necessity and Minimality; encode the resulting minimum sufficient rule set using the Encoding Framework; then run Quality Verification before presenting.

### Optimization Mode (existing prompt)

Trace the observed failure upward and identify the first node that no longer expresses its parent correctly: goal, motivation, action principle, or concrete rule. Correct that causal break, re-derive only its descendants, and preserve unaffected branches and contract semantics; when the principle is sound but receivers implement it inconsistently, correct the concrete rules rather than rewriting higher layers. Treat a material contract gap that cannot be derived as an unresolved user-owned decision, not permission to invent a value. Use `references/anti-patterns.md` to identify the failure basis and `references/cognitive-mechanisms.md` when a receiver-dependent processing heuristic may explain it; empirical evidence from the target receiver overrides the heuristic. Re-run traceability, completeness, necessity and minimality, and Quality Verification. Output the revised prompt with rationale for each material modification.

### Audit or Diagnosis Mode (read-only)

Inspect the prompt using the four-level diagnosis, minimum-sufficient-rule tests, anti-pattern taxonomy, and Quality Verification, but preserve the prompt unchanged. Report each finding with its evidence, affected behavior, failing derivation or encoding layer, and an executable recommendation. Separate verified defects from model- or deployment-dependent hypotheses. A diagnosis identifies how to fix the prompt; it does not itself authorize rewriting it.

---

## Encoding Framework

Encode the understood user needs into a structure the model processes efficiently. The four layers below describe content responsibilities; they are distinct from the logical derivation chain of goal → motivation → action principles → concrete rules and do not impose one universal physical order. Before applying the framework, calibrate to the receiver's capabilities (context window size, tool-calling support, reasoning depth), because the target language's grammar varies with the receiver — smaller context windows demand aggressive compression with head/tail priority; tool-calling models need observable tool-event rules rather than an assumption that they will infer the interaction protocol.

### Receiver Calibration

- Identify the actual deployment receivers and their observable capabilities; do not assume unsupported context, reasoning, or tool behavior.
- Encode user-visible or machine-consumed contracts, safety and authorization boundaries, and irreversible ordering explicitly for every receiver that must obey them.
- Leave internal reasoning and interchangeable implementation choices flexible unless observed variance materially changes success.
- For multi-model deployment, use the least rigid wording that preserves every material behavior across the target receivers. When a critical behavior varies by model, strengthen only that behavior and verify it empirically rather than expanding the whole prompt.
- When the receiver is unknown, keep principles for generalization and make external contracts explicit; treat additional receiver-specific rigidity as a hypothesis to validate, not a default.

Include a content layer only when removing it would omit information, intent, behavior, or verification needed for a material success condition.

### Layer Structure

**Context Architecture** — Static reference content, domain knowledge, environmental constraints.
- For reference-dependent prompts, place context before the task-specific intent and instructions so the final instructions can operate over the supplied evidence.
- Wrap sources or content types in structural tags when their boundaries could otherwise be confused; keep a single unambiguous block unwrapped.
- Include only when the task depends on external information (per the principle above).

**Intent Declaration** — Goal, success criteria, scope boundaries.
- Always required, because without an explicit goal the model infers one — and inferred goals diverge from user intent. Use action verbs ("refactor", "analyze", "generate") rather than vague descriptions ("help me improve", "look at this"), because specific verbs constrain the output space more tightly, reducing interpretation divergence.
- Define scope boundaries when an omitted boundary would permit a materially different task.
- State completion criteria when the endpoint is not already self-evident or when premature completion is a demonstrated risk.

**Behavioral Specification** — Format requirements, style parameters, positive behavioral directives.
- Lead with the desired behavior when doing so preserves the user's meaning. Retain explicit prohibitions when the forbidden state is itself part of a safety, authorization, scope, or contract boundary; pair them with the desired alternative where useful, but never replace them with a narrower or non-equivalent positive instruction.
- Keep each motivation adjacent to the action principle it supports, and group shared rules only when that grouping makes their derivation clearer than separate statements.
- Use principles to carry generalization and the minimum sufficient rules to guarantee material consistency; do not ask the model to reconstruct an interaction protocol from motivation alone.
- Constrain observable outputs and decision boundaries rather than hidden reasoning. Fix literal tokens, formats, event order, or procedures only when Rule Necessity and Minimality establishes that the form or sequence is content; otherwise specify the required information or outcome, preserve equivalent implementations, and label any sample layout as non-binding.
- When a material prohibition requires negative form, isolate it with clear delimiters and use head/tail repetition only when the cost of attention loss justifies the extra tokens.
- Define expertise scope only when the task depends on domain-specific capabilities or priorities; express those boundaries directly instead of maintaining a fictional persona.

**Verification & Iteration** — Self-check instructions, validation criteria.
- Place final completion checks at the prompt tail; place checks for behavior that must precede an action at that action's decision boundary.
- Define verification as completion conditions ("Before submitting, verify each claim has source support"), because completion conditions let the model verify using its own reasoning path rather than forcing it to translate internal reasoning into a prescribed format, wasting reasoning tokens.
- Treat each self-check as a concrete rule that verifies a parent action principle, not as a separate derivation level. For behavior that must occur before an action, place the check at that decision boundary; a final-output check cannot retroactively correct an omitted earlier action.
- Include verification when failure would be material or target-receiver behavior is demonstrably unstable; omit checks that cannot detect or correct a material failure.

### Positioning Strategies

Choose one layout based on the information dependency rather than stacking multiple ordering strategies:

```
Self-contained prompt (no substantial external evidence required):
[Intent Declaration] → [Behavioral Specification] → [Verification if needed]

Reference-dependent prompt (the task must reason over supplied evidence):
[Critical invariant summary, only if needed]
→ [Context Architecture]
→ [Intent Declaration]
→ [Behavioral Specification]
→ [Verification and any justified invariant restatement]
```

The reference-dependent layout places evidence before the task-specific request and keeps final instructions near the generation boundary. Bookend an invariant only when one omission would be material and prompt length or target-receiver tests provide a reason to expect attention loss; otherwise state each concern once.

---

## Quality Verification

Before presenting the output, verify it against these three principles. Each targets a distinct failure mode of the translation process.

### Fidelity — every element traces bidirectionally between user goal and prompt rule

Fidelity failures mean the translation changed the message — adding what was not there, losing what was, or leaving material meaning for the model to invent. Verify that every rule traces upward, every material goal requirement is represented downward, no action principle is presented as if it were already a complete rule, and no unresolved contract semantics were silently invented.

### Efficiency — every encoding choice earns its attention and rigidity cost

Efficiency failures mean the translation is faithful but lossy — the right message delivered through a noisy channel. Scan against `references/anti-patterns.md`. Verify that each constrained degree of freedom protects a material difference, each content layer and positioning technique addresses a distinct need, and removing any repeated or procedural instruction would cause a detectable loss rather than a cosmetic change.

### Structural Integrity — physical structure reinforces logical structure

Structural failures mean the encoding is internally inconsistent. Verify that logical derivation follows Goal → Motivation → Action Principles → Concrete Rules, physical placement follows one strategy justified by information dependency, and each branch is upwardly legitimate, downwardly complete, and minimally constrained. If literal compliance can still violate the parent principle, repair that branch before presenting.

Verify the output passes all three checks before presenting it.

---

Before output: verify Fidelity (bidirectional traceability and no invented contract), Efficiency (minimum sufficient rules and justified attention cost), and Structural Integrity (logical derivation, receiver calibration, and physical placement agree). For every exact format or procedure, confirm that changing it would materially change success; otherwise relax it. For high-stakes or receiver-sensitive deployments, follow `references/empirical-verification.md`.
