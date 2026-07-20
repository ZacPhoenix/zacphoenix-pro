# 02 — Triage: an inbox for future prompts

> "To avoid interrupting that process, I report issues into the triage inbox
> rather than starting new agents when I see issues. I don't have to think about
> prioritization for what I put into the triage inbox — I just drop anything I
> can think of that needs doing." — @enginoid

## Why triage matters here

Your agents run in **3–5 workstreams at a time**, deliberately chosen so they
don't touch the same code area. If you start a new agent every time you notice a
problem, you interrupt that carefully-non-overlapping batch and create conflicts.

So instead: **when you see something, drop it in Triage.** No new agent, no
prioritization decision, no context switch. Triage is a *capture inbox for
future prompts*, and it gets processed at the start of the next batch (see
[`05-batches-and-workstreams.md`](05-batches-and-workstreams.md)).

A ticket can start life as almost nothing — even just a screenshot — and later
get fleshed out to standard by an agent following the **ticket intake
guidelines**.

## Enable and configure Triage in Linear

1. **Turn on Triage for the team.** Team → *Settings → Triage* → enable it.
   New issues without a status land in the Triage queue instead of the backlog.
2. **Route capture into Triage.** Anything you drop from mobile, from a Slack
   integration, from email-to-Linear, or that an agent files for you should
   arrive **unassigned and untriaged** so it hits the queue.
3. **Give agents a triage label.** Create a label like `source:human-capture`
   vs `source:agent` so you can tell at a glance where an item came from (agents
   file into triage too).
4. **Don't prioritize on capture.** Priority and parent are assigned during
   intake, not when you drop the item.

## The two-stage flow

```
   You/agent notice something
             │
             ▼
     [ Triage inbox ]   ← raw capture, may be one line or a screenshot
             │
             │  processed at start of each batch by the intake step
             ▼
  Ticket brought to standard:
   - named after the outcome
   - given a parent in the outcome tree
   - filled out to the ticket contract (Goal/Why/Outcomes/…)
   - prioritized relative to current goals
             │
             ▼
        Backlog / ready to pick up
```

## Ticket intake guidelines

These are the rules the intake step (an agent) follows to turn a raw triage item
into a standard ticket. The full copy-paste version is in
[`prompts/ticket-intake.md`](prompts/ticket-intake.md). In summary, for each
triage item:

1. **Figure out the real need.** If the item is a screenshot or a fragment,
   infer the underlying outcome. When genuinely ambiguous, leave a question in
   the ticket rather than guessing silently.
2. **Rename to the outcome.** Title = the target state in the world.
3. **Place it in the tree.** Attach it to the parent outcome it serves; create
   the parent if it doesn't exist yet.
4. **Fill the contract.** Add Goal / Why / Outcomes / Implementation approach /
   Verifications sections (see [`03-ticket-contract.md`](03-ticket-contract.md)).
5. **Set priority** relative to current goals and what's urgent — not by gut on
   the raw item.
6. **De-duplicate.** Search for an existing ticket covering the same outcome
   before creating a new one; merge if found.

## Your side of the discipline

- When something occurs to you, **drop it in Triage and move on.** Resist the
  urge to spin up an agent mid-batch.
- Keep captures cheap. A title and a screenshot is enough; intake does the rest.
- Trust the batch cadence: the next workstream update will read everything new
  in Triage and fold it into the plan.
