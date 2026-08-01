# Model-Processing Heuristics

These heuristics explain why some translation strategies often help, but they are not universal architectural laws. Their effect varies by receiver, task, context, and decoding setup. Use them to form testable encoding hypotheses; target-receiver evidence overrides them.

---

## Heuristic 1: Desired-Path Salience

### Working Hypothesis

Autoregressive models generate continuations from preceding tokens. An instruction that names the desired behavior supplies a direct continuation pattern; a prohibition alone identifies an excluded state without necessarily supplying the preferred alternative. This makes positive targets a useful default when they preserve the user's meaning.

### Limits

This heuristic does not imply that models universally misparse negation or that a positive rewrite is semantically equivalent. Safety, authorization, scope, and contractual prohibitions retain their literal meaning and must remain explicit.

### Translation Implication

**Lead with "do X" without deleting a meaningful "do not Y."** Positive framing gives generation a desired forward path, but translation fidelity takes priority: when a prohibition defines safety, authorization, scope, or a contract boundary, preserve it explicitly and pair it with the desired alternative where useful. Isolate or bookend the prohibition only when its risk and attention sensitivity justify the extra tokens.

---

## Heuristic 2: Position Sensitivity in Long Contexts

### Working Hypothesis

Models can use information unevenly across long inputs. Reference material placed before a task-specific query lets the final instruction operate over the supplied evidence, while instructions near the generation boundary may receive stronger practical influence.

### Limits

The shape and magnitude of position effects vary by receiver, task, formatting, and context length. Do not infer a universal U-shaped curve or duplicate every important sentence. Use controlled tests when placement affects a material behavior.

### Translation Implication

**Information position = its "volume" in the target language.** In reference-dependent prompts, place source material before the task-specific query and keep final instructions near the generation boundary. Bookend a constraint only when omitting it would be material and prompt length or target-receiver evidence makes attention loss plausible; otherwise repetition spends attention without adding fidelity.

---

## Heuristic 3: Principle-Based Generalization

### Working Hypothesis

Goals, motivations, and action principles provide compressed relationships that a model can project onto cases not explicitly listed. Surface rules provide stronger local convergence but usually generalize less beyond their stated form.

### Limits

Principles do not guarantee that receivers infer the same trigger, event boundary, order, or literal contract. Concrete rules remain necessary wherever observed variance would materially change success.

### Translation Implication

**Translate both "why" and the material parts of "what."** Motivations and action principles provide high-compression generalization; concrete rules provide convergence where behavioral variance would materially change success. Use minimum sufficient rigidity: fix the invariant when alternative forms are equivalent, and fix the form or procedure only when that exactness is consumed by a user or system, creates verifiability, or protects a safety, authorization, irreversible, or demonstrated reliability boundary. This preserves generalization without outsourcing critical protocol design to the receiver.
