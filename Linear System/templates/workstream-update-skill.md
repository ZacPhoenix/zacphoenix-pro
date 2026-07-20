# Workstream-update skill

This is the recurring routine that turns the current backlog into a batch of
3–5 agent prompts. Register it as a skill/command in your primary harness (the
one you use to plan), then paste its output into the executing harnesses.

See [`../05-batches-and-workstreams.md`](../05-batches-and-workstreams.md) for
the concept, and [`workstream-update-doc.md`](workstream-update-doc.md) for the
output shape.

---

## Name

`workstream-update`

## When to use

At the start of every batch (2–4× per day), to decide what the next 3–5 agents
should work on.

## What it does (steps)

1. **Reconcile in-progress work.** Check every ticket marked In Progress. If it's
   not actually being worked (stale session, dead window), release it so it can
   be picked up. Make available anything that was falsely held.
2. **Read new tickets.** Pull everything new from **Triage** — from you and from
   other agents. Run intake on anything not yet to standard (see
   [`../prompts/ticket-intake.md`](../prompts/ticket-intake.md)).
3. **Load priorities.** In order:
   - finishing **work in progress** first,
   - your **steer** and **weekly goals**,
   - anything **newly urgent**.
4. **Propose 3–5 workstreams.** Each is a task assignment for one agent that:
   - is **non-overlapping in code area** with the others (no shared files/
     modules — this prevents merge conflicts), and
   - **meaningfully advances a current goal** (not busywork).
5. **Emit the workstream-update document** (see the doc template): a short
   high-level context section, then 3–5 self-contained agent prompts ready to
   paste.

## Guardrails

- If two candidate workstreams would touch the same code area, **merge them into
  one** or drop one to the next batch.
- Prefer finishing existing trees over starting new ones.
- Each emitted prompt must be self-contained: ticket link(s), the outcome, and a
  reminder of the completion contract + escalation standard.

## Output

A single document following [`workstream-update-doc.md`](workstream-update-doc.md).
Each segment is copy-pasted, as-is, into one harness window.
