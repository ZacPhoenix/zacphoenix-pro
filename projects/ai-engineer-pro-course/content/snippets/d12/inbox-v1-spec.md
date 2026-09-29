# Spec: Forge Inbox v1

Status: draft | agreed | shipped · Version: 1.0 · Owner: @you
Brief: docs/product/inbox-brief.md · Criteria: docs/specs/inbox-v1.feature · Tasks: tasks/inbox-*.md
Level: spec-anchored. Change this file first, then the code.

## 1. Intent
- User impact: a reviewer decides each Triage proposal without opening raw files.
- Existing behavior: proposals sit in data/triage/results.jsonl, decisions are hand edits, and nothing records who decided what.
- Desired outcome: every proposal ends approved, edited, or rejected, with exactly one decision record.
- Definition of done: every @AC in the feature file has a passing test (Day 14), the system diff is written, and the brief's success metric can be computed from data/decisions.jsonl.

## 2. Context pack
| Need | Source |
|---|---|
| Product | docs/product/inbox-brief.md, docs/product/inbox-prototypes.md |
| Codebase map | docs/map.md |
| Data contracts | src/schema.ts (FeedbackItem, TriageResult) |
| Conventions | AGENTS.md |
| Prior decisions | docs/decisions/ (Triage output is append-only evidence) |
| Market | LangChain's Agent Inbox offered accept, edit, respond, ignore. We keep approve, edit, reject. We skip respond, because Triage cannot take guidance mid-run |

## 3. Behavior
- Status is derived, never stored: pending when a proposal has no decision, otherwise approved, edited, or rejected.
- Decisions are appended to data/decisions.jsonl, one JSON object per line. Nothing rewrites results.jsonl.
- An edit may change category, severity, area, labels, suggestedTitle, or summary. Each change is recorded as { field, from, to }.
- A reject needs a reason of 3 to 280 characters.
- A proposal is the latest data/triage/results.jsonl line for its id (the Day 6 rule). Its id is the FeedbackItem id, which joins it to the raw feedback text.

API, typed by apps/inbox/shared/contract.ts:

| Method | Path | Responses |
|---|---|---|
| GET | /api/proposals?status=pending | 200 Proposal[] including feedback text |
| GET | /api/proposals/:id | 200 Proposal, 404 unknown id |
| POST | /api/proposals/:id/decision | 201 Decision, 400 invalid input, 404 unknown id, 409 already decided |
| GET | /api/health | 200 { ok, proposals, decisions, skippedLines } |

## 4. Acceptance criteria (Gherkin)
The scenarios in docs/specs/inbox-v1.feature are part of this spec. Ids are stable.
- AC-1 list with feedback · AC-2 approve · AC-3 decided at most once · AC-4 edit records changes
- AC-5 reject needs a reason · AC-6 needs-human first · AC-7 keyboard decisions
- AC-8 never writes to GitHub · AC-9 malformed lines skipped and counted

## 5. Negative examples
- Approving twice must not append a second decision (AC-3).
- The Inbox must not call api.github.com or the create_issue tool (AC-8).
- An edit must not rewrite data/triage/results.jsonl (AC-4).
- The default view must not hide low-confidence proposals behind a filter (AC-6).

## 6. Boundaries
- May touch: apps/inbox/**, package.json scripts, tests/inbox-*.test.ts, docs/specs/inbox-v1.*, tasks/inbox-*.md.
- Must not touch: src/**, evals/**, data/triage/results.jsonl, tests written by another task.
- Ask before: any dependency beyond vite, @vitejs/plugin-react, react, react-dom, and their types. Any change to src/schema.ts.
- Runtime: the API binds to 127.0.0.1, port INBOX_PORT (default 8787), and reads files under FORGE_DATA_DIR (default data).

## 7. Quality bar and evidence
- `npm run typecheck` and `npm test` pass with no new warnings.
- Every AC names the test that proves it.
- Every task report lists criteria met, criteria skipped, commands run, files changed, and assumptions made.
- UI work includes screenshots of the list, a detail view, and one error state.

## 8. Assumptions
| ID | Assumption | Status | Default if unanswered |
|---|---|---|---|
| A1 | One reviewer at a time | open | The 409 in AC-3 guards double decisions |
| A6 | Malformed JSONL lines are rare | unverified | Skip, count, and show the count (AC-9) |

## 9. Questions log
| ID | Question | Raised by | Answer | Date |
|---|---|---|---|---|
| Q1 | Can a rejected proposal be reopened? | Codex | No in v1. A new Triage run creates a new proposal | |

## 10. Change log
- 1.0 Initial spec from the Day 11 brief and prototype decision.
