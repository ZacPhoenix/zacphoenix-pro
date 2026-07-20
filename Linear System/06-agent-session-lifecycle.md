# 06 — Forcing completion: agent sessions and hooks

> "In the early iterations, I had a lot of issues with different agents fail to
> complete the assigned work… To overcome this, I've gone to great lengths to
> make the agents actually finish work." — @enginoid

This is the messiest and most important part of the system. Agents stop *before
the job is done* — before committing, before opening a PR, before marking it
ready, before tests pass, before merge, before ticking the boxes. This chapter
is how you make "done" actually mean done.

> ⚠️ **Honest disclaimer (from the author):** this is a hack. Because you're
> working across multiple harnesses without a clean API to invoke agents, you
> rely on **hooks** instead of a proper workflow engine. The author calls the
> agent-session tracking "deeply disturbing" and plans to replace it with a real
> state machine. Use it because it works today — and read the roadmap in the
> [README](README.md) for where it's going.

## The completion contract

Through prompts **and** hooks, every agent is required to:

1. **Register an "agent session"**, tied to the ticket(s) it's working.
2. **Mark the tickets in progress.**
3. **Work on the tickets.**
4. **Submit PRs and ensure they are merged and deployed.**
5. **Ensure all code is pushed and in a PR.**
6. **Tick off all checkboxes** in each ticket (see [04](04-verification-checklists.md)).
7. **Ensure all tickets are marked closed or blocked.**
8. **Upload a transcript** of the session, for root-cause analysis.
9. **Mark the agent session complete.**

If an agent *can't* finish, it must instead mark the ticket **Blocked** and
raise a **formal human escalation** (see [07](07-human-escalation-standard.md)).
There is no third option — no silent stopping.

## The agent-session object

An "agent session" is a lightweight record that:

- Tracks which agents are currently active and what tickets they hold.
- Enables **root-cause analysis** into agents that are slow or produce bad
  results (via the uploaded transcript).
- Has clear **postconditions** (steps 4–9 above) that must all be satisfied
  before it can be marked complete.

Where to store it: the article uses a hook-managed record. Practical options
(pick one):

- A dedicated Linear ticket per session, in a "Sessions" project, with the
  transcript attached and links to the worked tickets.
- A row in a small external store keyed by session id.

The transcript upload is the awkward bit: the agent has to go **find the
transcript in a harness-specific location** and upload it. That per-harness
rummaging is exactly the kind of thing the future API-based version removes.

## The hooks

Hooks are what make the contract real rather than aspirational. Copy-paste
starting points are in [`templates/hooks/`](templates/hooks/). The essential
ones:

| Hook | Fires on | Enforces |
|------|----------|----------|
| `block-askuser` | agent tries to ask the user mid-batch | Blocks it — agent must proceed or escalate ([05](05-batches-and-workstreams.md)) |
| `require-session` | agent starts work / touches a ticket | An agent session must be registered first |
| `verify-checkboxes` | ticket → Done | All Verification boxes ticked; none deleted ([04](04-verification-checklists.md)) |
| `require-merged-pr` | ticket → Done | Linked PR exists, is merged, and deployed |
| `session-closeout` | agent session → Complete | Steps 4–9 all satisfied, transcript uploaded |

### Known false positives

Sometimes an agent blocks on something a human **isn't** actually needed for —
e.g. "our MCP server doesn't support tool X" when the agent could just deploy a
new tool to the MCP server itself. Expect a few of these and tune the escalation
prompt so agents check "can I do this myself?" before escalating. But for the
most part, with these hooks in place, agents finish.

## The interactive-session waiver

Not every session is a batch. If you use an agent interactively — e.g. you ask
some questions about the codebase unrelated to any ticket — forcing full formal
closeout (which requires verified-done tickets) makes no sense. So the agent may
request a **waiver**:

```
If this session did not work any ticket (e.g. it was an interactive Q&A or
exploration), request a closeout WAIVER instead of formal closeout. State why no
ticket applies. A waiver skips the ticket-verification postconditions but still
records the session.
```

## Putting it in your rules file

The completion contract belongs at the top of
[`templates/agent-rules.md`](templates/agent-rules.md) so every agent, in every
harness, sees it. The hooks are the backstop for when the prompt isn't enough.
