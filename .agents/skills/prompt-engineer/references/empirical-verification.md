# Empirical Verification

Quality Verification (in SKILL.md) checks the encoding's internal consistency. Empirical verification confirms the translation produces the intended behavior in practice — because a structurally sound prompt can still encode the wrong meaning. Apply when the prompt's success criteria are observable in model output and the cost of translation error is high.

## Test Design

Derive test cases from distinct material behavior branches rather than a fixed case count. Cover the core path, each rule boundary where a different action is expected, and edge or adversarial cases only when they exercise a stated risk. Before running, define:

- the observable event or output unit;
- the expected behavior derived from Goal → Motivation → Action Principles → Concrete Rules;
- a rubric such as pass, partial, fail, and unavailable, with mechanically distinguishable criteria;
- the target receivers, tool permissions, prompt sources, and other environment variables that could affect the result.

Repeat cases when stochastic variation could change the conclusion. Define the required receiver coverage and repetition acceptance rule before testing. If no reliability target or repetition plan is available, label the result as diagnostic evidence and do not claim stable behavior from one run or one model.

## Experimental Controls

Keep task input, workspace, tool permissions, model parameters, and grading constant between candidates. Isolate system, global, project, and user prompt sources so the tested instruction is the intended variable. Save the effective request or its prompt hash after middleware processing, not only the source configuration. Record timeouts, provider restrictions, tool failures, and environment errors separately from behavioral failures; retry only infrastructure failures under the same conditions.

### Evidence Gate

Collect evidence at the layers relevant to the claim: effective prompt delivery, receiver capability, raw model events, SDK normalization, orchestration or tool dispatch, user-visible rendering, and evaluator output. Before assigning a behavioral failure, verify that the prompt reached the receiver, the required capability was available, and deterministic positive and negative fixtures prove that the event collector and evaluator classify order and content correctly. Attribute loss or reordering after the raw model event to the adapter, runtime, or presentation layer rather than to the prompt-model pair.

## Baseline Comparison

Run the candidate and a meaningful baseline—usually the previous prompt or an isolated no-prompt condition—against the same cases and receivers. A satisfactory baseline on one case does not prove the prompt is inert; compare reliability across every material behavior and target receiver. Remove prompt content only when controlled results show no unique improvement or protection.

## Failure Diagnosis

When output differs from the rubric, apply the Evidence Gate and classify the failing layer before diagnosing the prompt. Only raw receiver behavior with valid prompt delivery, capability, collection, and evaluation can count as a prompt-model behavioral failure. For such failures, trace upward through concrete rule → action principle → motivation → goal and use `anti-patterns.md`: variation in a material trigger, timing, format, or boundary indicates incomplete rules; literal compliance with goal failure indicates a mechanical or misdirected rule; consistent optimization of the wrong outcome points to the principle, motivation, or goal.

## Iteration

Correct the first causal break, re-derive only its descendants, and re-run structural and empirical checks. When the principle is sound but material behavior varies, complete the shared rule boundary rather than encoding the individual test case; when new rules exclude equivalent successful behavior, relax them to the invariant.

Stop behavioral acceptance when every material behavior meets its rubric across the required receivers and planned repetitions, while unavailable receivers and infrastructure failures are reported separately. Claim that the prompt caused an improvement only when the candidate also shows a pre-registered difference or unique protection relative to baseline. If candidate and baseline both pass because of a ceiling effect, report compatibility and state that causal contribution is not identifiable. If failures remain, state the unsupported receiver or unresolved rule boundary rather than declaring general convergence. Remove content only when controlled ablation shows no unique protection under the material and pressure cases.
