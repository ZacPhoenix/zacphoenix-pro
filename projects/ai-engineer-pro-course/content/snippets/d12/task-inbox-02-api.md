# T2: Inbox API and data layer

Spec: docs/specs/inbox-v1.md · Criteria (API side): AC-1, AC-2, AC-3, AC-4, AC-5, AC-9
Harness: Codex, in its own worktree · Branch: inbox/api
Blocked by: T1 (contract merged to main) · Blocks: T5 (integration)
Status: todo

## Owns
- apps/inbox/server.ts
- apps/inbox/lib/**
- tests/inbox-api.test.ts

## Must not touch
- apps/inbox/shared/contract.ts (changes go through T1)
- apps/inbox/src/**, tests/e2e/**, src/**, data/triage/results.jsonl

## Rules
- Validate every request body and response with the schemas in apps/inbox/shared/contract.ts.
- Append each decision as one line. Never rewrite data/decisions.jsonl.
- Resolve every data path from FORGE_DATA_DIR (default data). Bind to 127.0.0.1 on INBOX_PORT (default 8787).
- No GitHub client, no outbound network calls, no new dependencies.
- If the contract is missing something, stop and report it. Do not edit it here.

## Checkpoint
- `npm run typecheck && npx vitest run tests/inbox-api.test.ts` passes.
- You commit the work (the Codex sandbox keeps .git read-only), then add a line to tasks/progress.md.

## Report (paste into the PR)
- Criteria met, each with its test name
- Criteria skipped, and why
- Commands run, with results
- Files changed
- Assumptions made
