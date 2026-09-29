# Forge Inbox: product brief

Status: draft · Owner: @you · Date: YYYY-MM-DD · Next: docs/specs/inbox-v1.md (Day 12)

<!-- Fill Outcome, User, Metrics, and Non-goals yourself before any agent reads this file. -->

## Problem
Triage writes proposals to `data/triage/results.jsonl`, and nobody reviews them in one place.
Reviewing today means opening JSONL, finding the raw item in `data/inbox/`, and editing by hand.
Unreviewed proposals never become issues, so feedback stalls before it reaches the roadmap.

## Outcome
<!-- A behavior change, not a feature. Whose behavior changes, and where will you see it? -->
A reviewer clears the day's proposals in one sitting and decides each one without opening a raw file.

## User
- Primary: the maintainer reviewing Triage output. Desk, keyboard, 20 to 100 proposals a day.
- Secondary: a teammate who spot-checks decisions once a week.
- Not in v1: external contributors, mobile use.

## Success metric, guardrails, kill criterion
<!-- Pre-register these now. Day 15 compares them with what actually happened. -->
- Metric: median time to decide a proposal is under 30 seconds by week two.
- Metric: every edit records which fields changed, so corrections can become eval cases.
- Guardrail: no proposal is ever decided twice.
- Guardrail: the Inbox makes zero GitHub writes in v1.
- Kill criterion: median time to decide is still above 60 seconds after two weeks.

## Assumptions ledger
| ID | Assumption | Status | Check or owner |
|---|---|---|---|
| A1 | One reviewer works the queue at a time | open | Ask: will anyone else review? |
| A2 | Most edits change severity, labels, or the title | unverified | Count edited fields in the prototypes |
| A3 | Triage only appends. The latest results.jsonl line per id wins | confirmed | loadResults in src/tools/inbox.ts (Day 6) |
| A4 | Raw feedback is short enough to show inline | unverified | Measure the longest item in data/inbox/ |
| A5 | 30 seconds per decision is realistic | unverified | Time five decisions per prototype |

## Tradeoffs
- Keyboard speed over a mobile layout, because review happens at a desk.
- Append-only decisions over editing results in place, so Triage output stays evidence.
- A small Node API over files instead of a database, because the data is small and local.

## Non-goals for v1
- Creating GitHub issues. That stays behind the Day 10 approval gate.
- The cluster view (Day 18).
- A weekly insights view (after Day 15 produces reports).
- Auth, roles, and any deployment beyond localhost.

## Expected system diff
<!-- Predict it now. Day 14 writes the actual one and compares. -->
| Dimension | Expected change |
|---|---|
| Behavior | Decisions become explicit records instead of hand edits |
| User experience | A local web UI at http://localhost:5173 |
| Data | Reads results and feedback. Appends to `data/decisions.jsonl` |
| Architecture | New `apps/inbox` UI and `apps/inbox/server.ts` API. Triage code unchanged |
| Complexity | One app, one API, one shared contract file |
| Operations | Two local processes, no secrets. Off means stop both |

## Taste rubric
<!-- A reviewer agent grades screenshots against these lines, pass or fail with evidence. -->
- Density: feedback, proposal, and decision controls fit on one screen at 1440 px wide.
- Speed: every decision has a keyboard path.
- Honesty: low-confidence and needsHuman proposals look different from confident ones.
- Restraint: nothing appears that this brief does not ask for.

## Open questions
<!-- Filled from the interrogation prompt. Each gets an answer, an owner, or becomes an assumption. -->
- Q1:
