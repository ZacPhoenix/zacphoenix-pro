---
name: capture-compound
description: Run at ticket closeout to capture a reusable pattern discovered while
  working, turning it into a new or improved skill (or a rule / verification
  pattern) so future tickets are cheaper. Use whenever finishing a ticket that
  revealed a repeatable technique, a gotcha worth encoding, or a step you had to
  figure out from scratch.
---

# Capture the compound

This is the compound-engineering step of the software factory: every ticket
should leave the factory a little more capable. Run this before you close a
ticket.

## 1. Decide if there's anything to capture

Ask: *did I do something here that a future ticket will need again?* Signals:

- You figured out a non-obvious sequence of steps.
- You hit a gotcha and worked around it.
- You wrote code/tests in a shape worth repeating.
- You had to read several files to learn "how we do X here".

If nothing reusable came up, note that in the ticket and stop — don't
manufacture a skill for its own sake.

## 2. Prefer improving an existing skill

Scan [`../`](..) (the skills directory) and the repo rules
(`CLAUDE.md`). If an existing skill nearly covers this, **extend or correct it**
rather than adding a near-duplicate. Consolidation is the point.

## 3. Capture it in the right place

- A repeatable **procedure / technique** → a **skill** (`.claude/skills/<name>/SKILL.md`).
- A **standing rule** that should always apply → a line in `CLAUDE.md`.
- A **testing/verification pattern** → fold it into how future tickets author
  their Verifications (and, if broad, note it in
  `Linear System/04-verification-checklists.md`).

Write a sharp `name`/`description` (see the skills
[`README`](../README.md)) so it triggers next time.

## 4. Commit it with the work

Commit the new/updated skill alongside the ticket's code change, so the capability
ships in the same PR. Reference it in the ticket comment.

## 5. Consider a factory ticket

If the improvement is bigger than a quick capture (a whole new capability for the
factory), propose a ticket under **Foundation** named for the outcome ("the
factory can now do X"), so it shows up in the outcome tree instead of being lost.
