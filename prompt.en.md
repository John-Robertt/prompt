# Efficient Tool Selection and Use Guidelines

This guide provides recommendations for tool selection, call ordering, result reuse, and context control.

## 1. Select Tools

Identify the current information gap and make the smallest sufficient tool call that directly fills it. Stop searching once the result is sufficient; do not repeat the same work with another tool. The table gives efficiency recommendations; interface constraints appear in the relevant sections.

| Current need | Preferred tool |
|---|---|
| Understand an unknown implementation, call relationships, or impact scope | `codegraph_explore` (when the repository is indexed) |
| Locate by file name, directory, or path | `fffind` |
| Locate by identifier, text, error message, or configuration item | `ffgrep` |
| Locate by syntax structure or call pattern | `ast-grep` |
| Inspect a known file or obtain edit anchors | `read` |
| Make a localized edit to an existing file | `replace` |
| Undo an incorrect replacement | `undo_last_replace` |
| Create or completely rewrite a file | `write` |
| Run a command | `bash` (RTK compresses output automatically) |
| Query current third-party technical documentation | Context7 |
| Isolate a broad investigation or parallel independent work | subagent |

Common call paths:

```text
Unknown implementation       → codegraph_explore → use a locator or read only if needed
Known path                   → read
Text or identifier lookup    → ffgrep → read if needed
Syntax structure lookup      → ast-grep → read if needed
Localized edit               → read → replace → inspect the returned diff
Create or completely rewrite → write → inspect the actual file content or change
```

## 2. Understand and Locate

When the repository contains `.codegraph/` and the current need involves code locations, implementation mechanisms, call relationships, impact scope, or symbols you are about to modify, prefer `codegraph_explore`.

- Queries should include the functional question, key symbols, or file names rather than broad keywords.
- Treat returned source code as already read; do not immediately call `read` on it again.
- Once CodeGraph has covered the target source, call `read` again only to obtain hash anchors for editing or inspect an exact section it did not cover.
- If `.codegraph/` is absent, use `read` or a locator directly according to the current information gap.

Location guidance:

- If the target path is known and you only need its contents, use `read` directly.
- Use `fffind` only for paths, not file contents.
- Prefer bare identifiers with `ffgrep`, narrow the search scope where possible, and exclude noise.
- Stop when search results satisfy the current information need; call `read` only when you need the target contents. If ambiguity remains, refine the query using the existing results instead of repeating or broadening searches without evidence.
- When text matching is prone to false positives, use the full `ast-grep` command through `bash`; do not use `sg`.
- Do not fall back to Bash `find`, `grep`, or `rg` for routine searches unless the tools above cannot express the query.

## 3. Read and Modify Files

### Modify Existing Files

Follow this sequence:

```text
read → replace → inspect the returned diff → next replace
```

- Use `read` to retrieve only the section needed for understanding or modification.
- Keep the `replace` range as small as possible and include only the lines that actually change.
- Do not run multiple `replace` operations on the same file in parallel.
- Inspect the diff after each modification before continuing.
- If anchors become stale, call `read` again instead of guessing the new anchors.
- If a replacement mistakenly deletes or damages content, call `undo_last_replace` immediately.

### Create or Completely Rewrite Files

- Use `write` for new files.
- Overwrite an existing file with `write` only when a complete rewrite is genuinely necessary.
- Do not replace a localized edit to an existing file with a full-file overwrite.
- After using `write`, inspect the actual file content or final change to confirm that the write produced the expected result.

## 4. Run Commands and Control Output

Run normal commands directly through `bash`. RTK transparently compresses supported Git, search, test, and build output; do not add the `rtk` prefix manually by default.

- Limit commands to the relevant file, directory, test target, or output scope whenever possible.
- When verification commands are needed, run the smallest and most relevant target first, then expand only as needed.
- When you need complete raw diagnostic output or suspect that compression is hiding critical information, use:

```bash
RTK_DISABLED=1 <command>
```

- When processing JSON, prefer `jq` to extract only the required fields rather than reading or printing an entire large file.
- Avoid using Bash to print large sections of source code; use `read` for source inspection.

## 5. External Documentation and Online Information

- Use Context7 when querying the current usage of libraries, frameworks, SDKs, APIs, CLI tools, or cloud services.
- Resolve the library ID first, then query documentation one topic at a time; use separate queries for distinct topics.
- Use web search for general external facts, recent information, or content not covered by Context7.
- Prefer official or first-party sources, and distinguish verified facts from inferences.

## 6. Subagents

Consider using subagents primarily in the following situations:

- The search scope is broad and one direct exploration is insufficient to answer the question.
- Multiple independent questions can be investigated in parallel.
- The investigation will generate substantial intermediate information that should be isolated from the main context.
- A complex cross-module task requires an independent implementation plan.

Use the current session's tools directly for known files, known symbols, or isolated modifications. After delegating, do not repeat the same search in the main session; if a subagent modifies files, inspect the actual diff and verification results.
