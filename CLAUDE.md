# Agent operating rules — Linear software factory

This repo is run as a software factory coordinated through **Linear** (team
`ZAC` / "Zac Phoenix"). The full system is documented in
[`Linear System/`](Linear%20System/); the operating rules below are the
contract every agent, in every harness (Claude Code, Codex, Cursor,
Antigravity), must follow. Hooks in `Linear System/templates/hooks/` are the
backstop for when these rules aren't enough.

## Linear workspace facts

- **Team:** Zac Phoenix (`ZAC`)
- **Statuses:** Triage → Backlog → Todo → In Progress → In Review → Done
  (+ **Blocked**, Canceled, Duplicate). A ticket that can't proceed is moved to
  the **Blocked** status and gets a formal escalation.
- **Labels:** `source:human-capture`, `source:agent`, `blocked` (the `blocked`
  label is now redundant with the Blocked status — prefer the status).
- **Root outcome project:** `Foundation`. Every outcome tree rolls up here (or
  another root project/initiative).
- **Agent sessions** are recorded in the `Sessions` project (metadata +
  transcript + links to worked tickets).

## You are running unsupervised

This session is **unsupervised, but monitored for quality and safety.** No human
is watching in real time. Do not wait for anyone. Either proceed on your own
judgment (documenting the decision in the ticket) or raise a formal escalation.
**Never stop silently, and never pause to ask a question mid-batch.**

## Completion contract — "done" means done

You may not consider work finished until ALL of these are true:

1. **Register an agent session** (in the `Sessions` project) tied to the
   ticket(s) you're working, before starting.
2. **Mark the tickets In Progress.**
3. **Do the work.**
4. **Submit PRs and ensure they are merged and deployed.**
5. **Ensure all code is pushed and in a PR.**
6. **Tick every Verification checkbox** in each ticket (all Automated, Manual,
   Visual). You may not close a ticket while any box is unchecked, and you may
   not delete or rewrite checkboxes to get around this.
7. **Mark every ticket Done or Blocked.** No ticket left In Progress.
8. **Upload a transcript** of this session to its `Sessions` record.
9. **Mark the agent session Complete.**

If you cannot finish, move the ticket to the **Blocked** status, raise a **human
escalation** to the standard below, and stop cleanly. Blocked + escalation is the
only acceptable alternative to Done.

**Interactive waiver:** if this session worked no ticket (e.g. you answered
codebase questions), request a closeout **waiver** instead, stating why no
ticket applies.

## Tickets are outcome-named and tree-shaped

- Name every ticket after the **outcome** (target state in the world), never the
  technical task. "X now works for Y", not "Refactor the Z handler".
- Every ticket has a **parent** describing a larger outcome, up to a root
  (`Foundation` or another root project/initiative). Never leave a ticket
  parentless.
- When you finish a leaf, check whether the parent outcome is now met; if the
  whole subtree is done, propose closing the parent. **Finish trees down to the
  root.**
- Keep the backlog organized. This is part of your job.

## Editing tickets — patch, never overwrite

- **Never replace a ticket description wholesale.** Change only the specific
  section you mean to change.
- **Never touch the Verifications section** unless the ticket explicitly asks
  for a scope change — the reviewer depends on it.

## Verifications

- Write the **minimal** verification procedure that proves the Outcomes are met:
  Automated (prefer these), Manual (only what can't be automated yet, ≤2 min
  each), Visual (when user-visible). Don't pad; every box is a real gate.

## Before you block — can you do it yourself?

Agents often block on things they could just do (e.g. "the MCP lacks tool X"
when you could add it). Before escalating, confirm you genuinely cannot do it
with the tools, deploys, and config available to you.

## Human escalation standard

When you truly need a human, assume they are **very busy, not in the headspace,
and know very little** about the code or why they're involved.

- **Give exact instructions, not tasks.** Not "add a GitHub app" — the precise
  steps, values, and config. If it can be a script, **write the script.**
- **Make it two minutes, not fifteen.** Pre-fill everything.
- **State the exact unblock condition.**
- **Keep all other unblocked work moving** so minimal work remains once resolved.
- Move the ticket to **Blocked**, write the escalation per
  [`Linear System/prompts/human-escalation.md`](Linear%20System/prompts/human-escalation.md),
  and assign it to the human so they're notified.

## Identity

Act as **yourself** (your agent identity), not as the human. Assignments,
comments, and status changes should be attributable to you.

---

New to this system? Read [`Linear System/README.md`](Linear%20System/README.md)
and follow [`Linear System/09-setup-checklist.md`](Linear%20System/09-setup-checklist.md).
