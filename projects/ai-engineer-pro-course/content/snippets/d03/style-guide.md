# Style guide for agents

Read this before you write or edit code or docs in agent-forge. AGENTS.md holds the rules
for every task. This file holds the detail. It is written for agents first and people second.

## Levels of depth
| Tier | Files | Loaded |
|---|---|---|
| Summary | AGENTS.md | Every session, both harnesses |
| Detail | this file, docs/map.md, skills | When a task points to them |
| Reference | docs/specs/, docs/decisions/, research/, lab/ | When the detail points to them |

Put a rule in the lowest tier where it is still found in time. Link every file directly
from AGENTS.md or from this file, never through a chain of links.

## Code
- TypeScript, ESM, Node 22. No semicolons, single quotes, two-space indent.
- Named exports. One module per concern: `src/schema.ts` holds types, not logic.
- Validate at the edges with Zod: parse data where it enters (files, CLI args, model output),
  then trust the types inside.
- Relative imports end in `.js`.
- Keep functions small and pure. Put side effects (file writes, network, process exit) at the edges.
- Throw `Error` with a message that says what failed and what to do next. Never swallow errors.
- Tests live in `tests/<module>.test.ts`. Each test name states a behavior, such as
  `rejects an item with no id`.

## Writing docs that agents read
- Purpose in the first line, then the rules, then the detail.
- One topic per file, under 200 lines. Give files over 100 lines a table of contents.
- Rules must be checkable: "Run `npm test` before committing", not "Test your changes".
- Give the reason for any rule whose reason is not obvious. A reason lets the model handle
  cases the rule does not list.
- No emphasis words in capitals. Plain statements work better with current models.
- Absolute dates only (2026-10-28), never "last week" or "after the refactor".

## Editing rules
- Change files with targeted edits. Do not rewrite a file longer than 150 lines, because
  whole-file rewrites change lines nobody asked about.
- `tasks/progress.md` and `lab/*.md` are append-only. Never edit earlier entries.
- In task files, change only the `Status:` line and the checkboxes.
- A spec changes in the same commit as the code that changes its behavior.
- When a rule goes out of date, move it under "Old patterns" with the date instead of deleting it.

## Names
- Files: kebab-case (`gen-feedback.ts`). Types and schemas: PascalCase (`TriageResult`).
  Functions and variables: camelCase.
- Agent tools: snake_case verbs (`list_feedback`, `save_triage`).
- Task files: `tasks/NNN-short-name.md`, numbered in creation order.
- Decisions: `docs/decisions/NNNN-short-name.md`, never renumbered.

## Old patterns
None yet. Superseded rules move here with the date they changed.
