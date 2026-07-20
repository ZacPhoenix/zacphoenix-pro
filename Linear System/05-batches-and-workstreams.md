# 05 — Batches and the workstream update

> "I've found the best balance by organizing work into batches of 3–5 parallel
> workstreams." — @enginoid

This is the engine of the system: how work actually gets picked up and handed to
agents, in a way that keeps you doing deep work instead of babysitting windows.

## What a batch is

- **3–5 parallel workstreams** running at once.
- Each workstream is **non-overlapping in code area** — no two touch the same
  files/modules, so they don't conflict.
- A batch takes **30 minutes to 4+ hours** depending on the day and the size of
  the work, yielding **2–4 batches per day**.
- Batches run **unsupervised** (but monitored for quality and safety — see
  [06](06-agent-session-lifecycle.md) and [07](07-human-escalation-standard.md)).

Why 3–5? It's the balance point where you get real parallelism without the
merge-conflict chaos of everyone editing the same code, and without more agents
than you can review in one sitting.

## The driver: your quality of life

> "An important philosophy of this system is my own quality of life." — @enginoid

The whole point of batching is that you **review and kick off in chunks**
instead of task-switching between agent windows all day. Two things make
unsupervised batches actually unsupervised:

1. **Block Claude's AskUser hook.** Otherwise an agent asks a question after ~15
   minutes and then does nothing for two hours. Blocking it forces the agent to
   either proceed or raise a proper escalation. (See
   [`templates/hooks/block-askuser.md`](templates/hooks/block-askuser.md).)
2. **Tell the agent it's unsupervised — "but monitored for quality and
   safety."** Agents love to block on things a human "must" do (log into a
   browser, click something). Telling them no one is watching in real time
   stops them stalling; "monitored" is a low-effort nudge against cheating or
   sabotage.

This buys back focus for deep work, and lets you do reviews and kick-offs on
your schedule.

## The workstream update

To create a batch, run a **"workstream update" skill**. It's the recurring
routine that turns the current backlog into a set of agent prompts. It:

1. **Reconciles in-progress work** — makes sure anything marked in progress is
   actually in progress, and makes other work available to pick up.
2. **Reads new tickets** that have come in from you or other agents via Triage
   (this is where intake from [02](02-triage-inbox.md) gets folded in).
3. **Loads up on priorities** — finishing work in progress first, then your
   steer and weekly goals, then anything newly urgent.
4. **Proposes 4–5 agent prompts** that you paste into the agents.

The output is a **workstream update document**: a short high-level context
section at the top, followed by **3–5 segments**, each a task assignment for one
agent. The authoring agent is prompted to make each segment **non-overlapping in
code area**, while assigning workstreams that **meaningfully advance a current
goal**.

Templates:
- Skill definition: [`templates/workstream-update-skill.md`](templates/workstream-update-skill.md)
- Output document shape: [`templates/workstream-update-doc.md`](templates/workstream-update-doc.md)
- The prompt that generates it: [`prompts/workstream-update.md`](prompts/workstream-update.md)

## Running the batch (the low-tech part)

> "When I said the system was low-tech earlier, I meant it: I paste each
> workstream prompt into Codex, Claude Code, Cursor or Antigravity." — @enginoid

There is no fancy orchestrator. You literally **paste each workstream prompt
into a harness** — Codex, Claude Code, Cursor, Antigravity — one workstream per
window. This is a deliberate trade-off: subscription tokens are far cheaper than
API tokens, so pasting into desktop harnesses is economical even though it's
manual. Expect to replace this with API invocation later (see the roadmap in the
[README](README.md) and [08](08-linear-mcp-setup.md)).

## The batch loop, end to end

```
        ┌──────────────────────────────────────────────┐
        │  Run the "workstream update" skill           │
        │   - reconcile in-progress                    │
        │   - read new triage tickets                  │
        │   - load priorities / weekly goals           │
        │   - emit 3–5 non-overlapping prompts         │
        └───────────────────┬──────────────────────────┘
                            │
                            ▼
        Paste each prompt into a harness (one per window)
                            │
                            ▼
      Agents run UNSUPERVISED (AskUser blocked, monitored)
        each registers an agent session, works the ticket,
        merges, ticks boxes, closes — or marks Blocked + escalates
                            │
                            ▼
        You review + kick off the next batch in one sitting
                            │
                            └────────── repeat (2–4×/day) ─────────►
```

## Cadence to aim for

- **2–4 batches/day.**
- Between batches: your deep work, your reviews, your kick-offs — batched, not
  interleaved.
- Keep each batch's workstreams disjoint. If two proposed workstreams would edit
  the same area, the workstream-update step should merge or resequence them.
