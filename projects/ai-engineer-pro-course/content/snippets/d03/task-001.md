# 001: Define the FeedbackItem and TriageResult schemas

Status: ready
Harness: codex implements, claude-code reviews
Source: docs/specs/triage.md (Data contract, AC-1, AC-6). Milestone: Day 4.
Depends on: none

## Goal
One Zod contract that every later Triage component imports, so bad feedback or bad model
output fails loudly at the edge instead of deep inside the agent.

## Scope
In:
- `src/schema.ts` and `tests/schema.test.ts` (both new)
- `package.json`: add `zod` and `vitest`, and set the `test` script to `vitest run`
Out:
- Triage logic, file reading or writing, and every other existing file

## Requirements
- [ ] `FeedbackItem` has exactly the fields in the spec's Data contract and rejects unknown keys
- [ ] `TriageResult` has exactly the 11 spec fields, with the enums from AGENTS.md
- [ ] `duplicateOf` is required and nullable: `null` passes, a missing key fails
- [ ] `receivedAt` accepts `2026-10-28T09:15:00Z` and rejects `2026-10-28`
- [ ] `z.toJSONSchema(TriageResult)` sets `additionalProperties: false` and lists all 11 fields
      as required, so it works as a structured-output schema in both harnesses
- [ ] No existing file changes except `package.json` and `package-lock.json`

## Stages
- [ ] Plan
- [ ] Implement
- [ ] Verify
- [ ] Review

## Completion indicators
- `npm run typecheck` exits 0
- `npm test` passes, with at least 8 tests in `tests/schema.test.ts`
- `git diff --stat main` lists only `src/schema.ts`, `tests/schema.test.ts`, `package.json`, and `package-lock.json`

## Ask before
- Adding a field or enum value, or any dependency other than `zod` and `vitest`

## Notes
