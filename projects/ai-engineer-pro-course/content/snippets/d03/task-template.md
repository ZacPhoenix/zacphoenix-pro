# NNN: Short imperative title

Status: ready
Harness: any
Source: the spec section, issue, or milestone this task comes from
Depends on: task ids, or none

<!-- Status values: ready, in-progress, verifying, blocked, done.
     Agents change only the Status line and the checkboxes. Humans set everything else. -->

## Goal
One or two sentences: the outcome, and who notices when it is done.

## Scope
In:
- Files and behavior this task may change
Out:
- What it must not touch, including files that must stay unchanged

## Requirements
Each line is something a test or a command can prove.
- [ ] Requirement
- [ ] Negative requirement: what must stay the same

## Stages
- [ ] Plan: list the files you will touch and how you will verify. Stop and ask if the plan changes Scope.
- [ ] Implement: the smallest change that meets the requirements.
- [ ] Verify: run every completion indicator and paste the last lines of output into Notes.
- [ ] Review: the other harness reviews the diff before the PR opens.

## Completion indicators
Commands anyone can run. The task is done only when all of them pass.
- `npm run typecheck` exits 0
- A test command and its expected result

## Ask before
- Adding a dependency, changing an exported type, or editing a file outside Scope.

## Notes
Decisions made during the task, with dates. Append only.
