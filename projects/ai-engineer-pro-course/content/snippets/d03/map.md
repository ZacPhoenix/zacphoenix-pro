# Map of agent-forge

Read this before searching the repo. Update it in the same commit whenever you add a
top-level folder, a script, or a data file.

## Start here
1. AGENTS.md: rules for every task.
2. tasks/progress.md: what happened last and what is next.
3. docs/specs/triage.md: what Triage must do.

## Current tree
| Path | What it holds | Source of truth for |
|---|---|---|
| AGENTS.md | Shared rules for Claude Code and Codex | Conventions and commands |
| CLAUDE.md | `@AGENTS.md` plus Claude-only notes | Claude Code behavior |
| .claude/ | settings.json, agents/researcher.md, skills/ (symlinks) | Claude permissions and helpers |
| .codex/config.toml | Approval policy and sandbox for this repo | Codex permissions |
| .agents/skills/ | Shared skills: explain-diff | Procedures both harnesses run |
| docs/ | style-guide.md, map.md, specs/, decisions/ | Intent and decisions |
| tasks/ | _template.md, NNN-*.md, progress.md | Work in flight |
| library/prompts/ | Reusable prompts | Prompts that worked |
| research/ | Sourced briefs | External facts |
| lab/ | Experiment logs | Observations |

## Planned
| Path | Arrives | Purpose |
|---|---|---|
| src/schema.ts, tests/ | Day 4 | Zod contract for FeedbackItem and TriageResult |
| scripts/ask.ts | Day 4 | One prompt through `claude -p` and `codex exec` |
| .github/ | Days 4 and 5 | Issue templates and CI |
| scripts/gen-feedback.ts, data/inbox/ | Day 5 | Synthetic feedback as JSONL |
| src/loop.ts, src/tools/ | Day 6 | The raw agent loop and its tools |

## Entry points
- `npm run typecheck`, `npm test` (Day 4), `npm run gen:feedback` (Day 5)
- `npx tsx scripts/<name>.ts`

## Do not edit by hand
- Earlier entries in `lab/` and `tasks/progress.md` (append only).
- `.claude/skills/*`: these are symlinks. Edit `.agents/skills/` instead.

## Data flow (target)
feedback files -> Triage agent -> proposals -> human review -> GitHub issues
