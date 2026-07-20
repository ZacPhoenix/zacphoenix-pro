# 04 — Verification checklists (and the "no unchecked box" rule)

> "An agent will be blocked from closing a task if any of the checklist items
> are unchecked, to avoid cheating or hasty work." — @enginoid

Verifications are how you stop "I'm done" from meaning "I stopped." They are the
minimal, explicit testing procedure a ticket must pass before it can close.

## Who writes them

The **ticket-authoring agent** creates the Verifications section, under **strict
guidance about the minimal testing procedure** for new features. You don't hand
-write these every time — the intake/authoring step does, following the standard
below.

## The three standard check types

Almost every ticket gets all three:

- **Automated** — tests/checks that run without a human. Unit/integration/e2e,
  a script, a lint/type gate. Prefer these; they're repeatable.
- **Manual** — a human (or, for now, the agent) performs steps and confirms the
  result. *Planned to be replaced with automated checks over time for
  repeatability — which depends on a robust computer-use agent.*
- **Visual** — what it should look like. A screenshot to compare, a described
  end state.

## The hard rule: unchecked box = cannot close

An agent is **blocked from closing a ticket while any checklist item is
unchecked.** This is the anti-cheating / anti-haste mechanism.

Honest caveat from the article: an agent *can* still cheat — it can tick a box
it didn't really verify, or delete checkboxes. But in practice they don't,
because doing so "requires a higher degree of dishonesty than typical 'I'm done'
declarations." The checkbox raises the bar enough to matter.

## How to enforce it

There are two layers. Use both.

### 1. Prompt-level (cheap, always do this)

In [`templates/agent-rules.md`](templates/agent-rules.md):

```
You may not move a ticket to Done/Closed while any Verification checkbox is
unchecked. Every Automated, Manual, and Visual box must be genuinely satisfied
and ticked. Do not delete or rewrite Verification checkboxes to get around this
— if a check no longer applies, leave a comment explaining why and ask for the
scope change instead of removing it.
```

### 2. Hook-level (the real gate)

A close/status-change hook inspects the ticket before allowing the transition to
Done. See [`templates/hooks/verify-checkboxes.md`](templates/hooks/verify-checkboxes.md)
for the logic. In short:

```
on ticket → Done request:
  fetch full ticket (description + comments)
  parse Verifications section
  if any "- [ ]" (unchecked) remains under Automated/Manual/Visual:
      reject the transition
      require the agent to either complete & tick it, or mark Blocked + escalate
```

Because agents can technically remove checkboxes, the hook should also reject a
close if the Verifications section is **missing or has fewer boxes than the last
known state** (defense against silent deletion). Pair this with the diff-only
description rule from [03](03-ticket-contract.md) / [08](08-linear-mcp-setup.md).

## Authoring guidance for the checklist

Give the authoring agent this standard (also in
[`prompts/ticket-intake.md`](prompts/ticket-intake.md)):

```
Write the MINIMAL verification procedure that proves the Outcomes are met.
- Automated: at least one automated check per Outcome where feasible.
- Manual: only steps that cannot yet be automated; write them so a busy person
  can follow them in under two minutes.
- Visual: include when the change is user-visible; state exactly what should
  appear.
Do not pad the list. Every box should be a real gate, not busywork.
```

## Direction of travel

The plan is to **replace Manual checks with Automated ones** for repeatability,
once a robust computer-use agent is available to drive the manual steps. Design
your Manual checks so they're easy to automate later (concrete steps, concrete
expected results).
