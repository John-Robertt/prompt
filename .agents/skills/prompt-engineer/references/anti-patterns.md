# Translation Patterns and Common Deviations

Each pattern below represents the correct translation strategy for a specific challenge. The common deviation shows the systematic error that occurs when the strategy is not applied. Each deviation identifies its failure basis; some bases are cognitive mechanisms, while others are logical or encoding failures.

## Contents

- [Pattern Taxonomy](#pattern-taxonomy)
- [Positive Constraint Framing](#1-positive-constraint-framing)
- [Information Position Optimization](#2-information-position-optimization)
- [Principles Over Rule Lists](#3-principles-over-rule-lists)
- [Minimum Sufficient Rule Refinement](#4-minimum-sufficient-rule-refinement)
- [Outcomes by Default, Procedures When Consequential](#5-outcomes-by-default-procedures-when-consequential)
- [Parameterized Capability Boundaries](#6-parameterized-capability-boundaries)
- [Single Strategy Per Concern](#7-single-strategy-per-concern)

---

## Pattern Taxonomy

| Translation Pattern | Common Deviation | Failure Basis | Fix |
|---|---|---|---|
| Positive targets with preserved prohibitions | Negative-only constraints omit the desired path; non-equivalent positive rewrites weaken the original boundary | Heuristic ① + translation fidelity | Lead with the desired behavior while retaining material prohibitions |
| Information positioned by dependency and evidence | Important instructions lose influence in a reference-heavy prompt, or bookending is applied mechanically | Heuristic ② + attention budget | Put evidence before the task request; reinforce only material rules with demonstrated position risk |
| Principles with motivations | Exhaustive rule lists create low-compression encoding; model follows listed rules but cannot extrapolate | Heuristic ③: principle-based generalization | Distill into principles with motivations |
| Minimum sufficient rule refinement | Principles leave material behavior unstated, rules fix immaterial form, or apparent completion invents unauthorized contract semantics | Translation fidelity + attention budget | Close every material gap without constraining or inventing beyond the authorized invariant |
| Outcomes by default, procedures when consequential | Procedures are prescribed without material effect, or omitted when sequence itself carries risk or contract value | Receiver and task boundary mismatch | Fix procedures only when their order or method is content |
| Parameterized capability boundaries | Verbose role descriptions consume attention on persona maintenance rather than task logic | Core philosophy (translation fidelity) | Replace with capability boundaries and output constraints |
| One clear strategy per concern | Technique stacking scatters attention across competing dimensions | Attention dispersion | Use one clear strategy per concern |

---

## Detailed Pattern Profiles

### 1. Positive Constraint Framing

**Pattern** (correct):
```
Use module-scoped constants or dependency injection for shared state; do not introduce mutable process-wide globals.
Wrap errors in a standardized envelope with safe user-facing messages; never expose raw internal error details.
Use async/await or Promise chains, and extract named functions when callback nesting obscures control flow.
```

**Common deviation**:
```
Do not use global variables.
Never return raw error messages to the user.
Avoid deeply nested callbacks.
```

**Why the pattern works**: The correct version gives the model a desired forward path while preserving the original prohibitions. A positive alternative must not silently narrow or change the boundary: "use dependency injection" alone is not equivalent to "do not use mutable globals," and a fidelity-preserving prompt may need both.

**When negative form carries meaning**: Keep it for safety, authorization, scope, contractual, or other explicit forbidden states. Pair it with the desired alternative when useful. Use a dedicated section or bookend repetition only when the prohibition is critical enough to justify the attention cost.

---

### 2. Information Position Optimization

**Pattern** (correct):
```
IMPORTANT: All generated code must be backward-compatible with v2 API.

Here is the codebase documentation: [5000 tokens of docs]

Here are the specific files to modify: [3000 tokens of code]

Refactor the authentication module. Verify backward compatibility with v2 API before finalizing.
```

**Common deviation**:
```
Here is the codebase documentation: [5000 tokens of docs]

IMPORTANT: All generated code must be backward-compatible with v2 API.

Here are the specific files to modify: [3000 tokens of code]
Please refactor the authentication module.
```

**Why the pattern works**: Backward compatibility is a machine-consumed contract whose omission would materially change success, and the long reference blocks create a plausible attention risk; head/tail reinforcement is therefore justified. For a short prompt or non-material preference, state the concern once rather than mechanically bookending it.

---

### 3. Principles Over Rule Lists

**Pattern** (correct):
```
Naming convention principle: Every name should make its scope and type immediately obvious to a reader who has never seen this codebase. Because code is read far more often than written, each comprehension barrier multiplies across the team.

Existing project conventions: camelCase for variables, PascalCase for classes, UPPER_SNAKE_CASE for constants, kebab-case for file names.
```

**Common deviation**:
```
- Use camelCase for variables
- Use PascalCase for classes
- Use UPPER_SNAKE_CASE for constants
- Use kebab-case for file names
- Use snake_case for database columns
- Prefix interfaces with I
- Suffix enums with Enum
- ...
```

**Why the pattern works**: The principle ("make scope and type obvious; reading frequency >> writing frequency") provides a semantic activation vector that enables the model to make correct naming decisions for unlisted cases (test fixtures, generated types, configuration keys) without needing an exhaustive rulebook.

---

### 4. Minimum Sufficient Rule Refinement

**Pattern** (correct):
```
Motivation: Users need to see the model's direction before autonomous work continues, because tool execution alone does not expose the model's current judgment.

Action principle: Synchronize the current situation and next action before continuing work.

Interface contract: The client and acceptance check recognize the literal headings "Situation" and "Action Plan".

Concrete rules:
- Trigger: before a user-visible response will be followed by one or more tool calls.
- Action: first send a message containing both "Situation" and "Action Plan".
- Ordering: send that message before the first tool call in the batch.
- Boundary: consecutive tool calls with an unchanged direction form one batch; start a new batch when evidence changes the direction.
- Check: before emitting a tool call, verify the preceding user-visible message satisfies the action and ordering rules.
```

**Common deviation**:
```
Whenever the task has a next action, keep the user informed of the current situation and what will happen next.

Before every tool call, output exactly five bullets of at least two sentences each describing progress.
```

**Why the pattern works**: The first deviation is under-specified: the receiver must infer whether a tool call counts as an action, when synchronization occurs, and what proves compliance. The second is mechanically over-specified: bullet count and sentence length do not improve synchronization, while the repeated per-tool requirement destroys useful batching. The correct pattern fixes the pre-action order because timing carries user value, and fixes the headings only because an explicit interface contract consumes them. Without that contract, require two distinguishable semantic fields and allow equivalent labels.

**Minimum-sufficiency test**: For every fixed form or procedure, name the material difference its variation would cause. Remove the constraint if only surface form changes, and do not replace it with a different mandatory template unless that template independently passes the same test. Rewrite the rule if literal compliance can still violate the principle. When exceptions accumulate, return to the principle and constrain the narrower invariant.

**Contract authority**: Completing a rule does not authorize inventing field meanings, types, enumerations, thresholds, defaults, or public behavior. Derive them from the goal or an existing contract; otherwise expose the unresolved decision instead of encoding a plausible-looking choice.

---

### 5. Outcomes by Default, Procedures When Consequential

**Pattern** (correct):
```
Validate the input against the specification schema. The output must be in JSON format. Before finalizing, verify that all edge cases (null values, type mismatches, missing required fields) are handled.
```

**Common deviation**:
```
Let's think step by step.
Step 1: First, read the input and identify the data types.
Step 2: Then, check for null values in each field.
Step 3: Next, validate the schema against the specification.
Step 4: Finally, generate the output in the required format.
```

**Why the pattern works**: The reasoning model can choose its own internal method, so visible step prescriptions usually consume attention without improving the result. Preserve that freedom unless the sequence itself changes a material outcome.

**When procedure is content**: Specify the relevant steps and order when an external protocol consumes them, authorization must precede action, reordering changes safety or irreversible consequences, or reproducibility depends on the method. Constrain only the consequential boundary; do not expose or script unrelated hidden reasoning.

---

### 6. Parameterized Capability Boundaries

**Pattern** (correct):
```
Expertise scope: Python distributed systems, microservices, cloud-native patterns. Prioritize solutions that maintain horizontal scalability. Flag any recommendation that trades long-term maintainability for short-term convenience.
```

**Common deviation**:
```
You are a senior Python architect with 20 years of experience in distributed systems, microservices, and cloud-native development. You have deep expertise in performance optimization and have led teams at top-tier tech companies. You approach every problem with rigorous analytical thinking and always consider scalability implications.
```

**Why the pattern works**: The correct version defines capability boundaries and behavioral constraints without requiring the model to maintain a fictional persona. Persona claims do not add capability by themselves and consume attention unless they change a material decision or output; treat any claimed benefit as receiver- and task-dependent.

**Boundary test**: Add an expertise boundary only when the task depends on domain knowledge, a priority, or a trade-off not already implied by the goal. Remove status claims and generic competence descriptions that do not change an observable decision or output.

---

### 7. Single Strategy Per Concern

**Pattern** (correct):
```
Audit this code for security vulnerabilities.

Project severity contract:
- Critical: arbitrary code execution (eval, exec, unsanitized deserialization)
- High: injection vectors (SQL, XSS, command injection)
- Medium: information disclosure, missing rate limiting

For each finding: state the vulnerability, its location, and a fix that preserves backward compatibility.
```

**Common deviation**:
```
You are an expert security auditor. Let's think step by step about this code.
Here are 3 examples of how to audit code: [examples]
If the code uses eval(), flag it as critical. If it uses exec(), flag as high.
Never suggest fixes that break backward compatibility.
Always explain your reasoning in detail.
```

**Why the pattern works**: A single, coherent encoding strategy (structured severity framework + output format) gives the model a clear attention target. The deviation demands simultaneous attention to persona, reasoning display, examples, conditional logic, negative constraints, and verbosity requirements — each consuming reasoning tokens that compete rather than reinforce.

**Strategy test**: Two techniques address the same concern when removing either one leaves the same failure exposed; keep the more direct or better-evidenced technique. They are complementary when each protects a distinct material failure. Retain each technique only if its removal creates a unique, observable loss.
