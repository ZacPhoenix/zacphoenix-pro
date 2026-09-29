# Inbox v1: parallel build plan

Spec: docs/specs/inbox-v1.md · Tasks: tasks/inbox-01 to tasks/inbox-06 · Merges: you, and only you

## Lanes
| Lane | Harness | Worktree and branch | Tasks | Owns |
|---|---|---|---|---|
| Main | You with Claude Code | main checkout | T1, T5 | apps/inbox/shared/**, package.json, scripts/screens.ts |
| UI | Claude Code | `claude -w inbox-ui`, branch worktree-inbox-ui | T3, T4 | apps/inbox/src/**, apps/inbox/index.html, apps/inbox/vite.config.ts |
| API | Codex | `codex --worktree`, under ~/.codex/worktrees | T2 | apps/inbox/server.ts, apps/inbox/lib/**, tests/inbox-api.test.ts |

## Merge points
| Point | What merges | Gate, run on main after the merge |
|---|---|---|
| M1 | T1: contract, fixtures, dependencies, scripts | `npm run typecheck && npx vitest run tests/contract.test.ts` |
| M2a | T2: the API (you commit Codex's diff first) | `npm run typecheck && npx vitest run` |
| M2b | T3 and T4: the UI, rebased on main | `npm run typecheck && npm run inbox:build` |
| M2c | T5: UI wired to the real API | `npm run screens`, then list, open, approve one, reload, still approved |

## Rules for both agents
- Touch only files your lane owns. Stop and report if you need another lane's file.
- The contract changes only on main, through T1. Rebase your lane after any contract change.
- Report with the block from your task file. Paste summary lines, never full logs.
- Codex does not commit: its sandbox keeps .git read-only. Claude Code may commit on its own branch.

## Prep, before either lane starts
- [ ] M1 merged, and both worktrees created from main after it
- [ ] data/ copied into each worktree if it is gitignored (Claude Code can use .worktreeinclude)
- [ ] `npm ci` run by you in the Codex worktree (its sandbox has no network)
- [ ] Ports agreed: API 8787, UI 5173. A second UI instance uses `--port 5174`

## Status
| Task | Lane | State | Evidence |
|---|---|---|---|
| T1 | Main | | |
| T2 | API | | |
| T3 | UI | | |
| T4 | UI | | |
| T5 | Main | | |

## Unresolved risks at M2c
- 
