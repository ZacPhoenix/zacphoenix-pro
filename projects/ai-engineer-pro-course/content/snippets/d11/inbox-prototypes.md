# Inbox prototypes: decision record

Date: YYYY-MM-DD
Inputs: data/triage/results.jsonl (N proposals) plus 3 hand-made edge cases
Rubric: the Taste rubric in docs/product/inbox-brief.md

## Variants
| Variant | Bet | Harness | Branch or worktree | Minutes |
|---|---|---|---|---|
| A | Dense table, keyboard first | Claude Code | worktree-inbox-proto-a | |
| B | One card at a time, raw feedback beside it | Codex | ~/.codex/worktrees/... | |
| C | Split list and detail, inline edit | Claude Code | worktree-inbox-proto-c | |

## Evidence
| Check | A | B | C |
|---|---|---|---|
| Median seconds per decision (5 timed) | | | |
| Rubric: density, speed, honesty, restraint (pass or fail) | | | |
| Edge cases: long item, low confidence, duplicate | | | |
| New dependencies or processes | | | |
| Screenshots (paths) | | | |

## Assumptions moved
<!-- Update the ledger in the brief too. -->
- A2:
- A4:
- A5:

## Decision
- Pick:
- Why, evidence first, two sentences:
- Rejected variants, and the one idea worth keeping from each:
- Brief changes (outcome, non-goals, expected system diff):

## Cleanup
- [ ] Winning branch kept unmerged as a reference for Day 13
- [ ] Other worktrees removed with `git worktree remove <path>`
- [ ] No prototype code merged to main
