# Prompt: workstream update

Paste this to your planning agent at the start of each batch. It produces the
3–5 paste-ready workstream prompts. (See
[`../05-batches-and-workstreams.md`](../05-batches-and-workstreams.md) and the
skill definition in
[`../templates/workstream-update-skill.md`](../templates/workstream-update-skill.md).)

---

```
Run a WORKSTREAM UPDATE to plan the next batch. Produce a document I can paste
into 3–5 agent windows.

Do these steps:

1. RECONCILE IN-PROGRESS WORK.
   Check every ticket marked In Progress. If it isn't genuinely being worked
   (stale session, no active window), release it so it can be picked up. Make
   available anything falsely held.

2. READ NEW TICKETS.
   Pull everything new from Triage (from me and from other agents). If anything
   isn't to standard, run intake on it first (ticket-intake guidelines).

3. LOAD PRIORITIES, in this order:
   - finish WORK IN PROGRESS first,
   - then my steer and the weekly goals: <PASTE WEEKLY GOALS / STEER HERE>,
   - then anything newly urgent.

4. PROPOSE 3–5 WORKSTREAMS. Each must:
   - be NON-OVERLAPPING IN CODE AREA with the others (no shared files/modules —
     this prevents merge conflicts), and
   - meaningfully advance a current goal (no busywork).
   If two candidates would touch the same area, merge them or defer one.

5. EMIT THE WORKSTREAM-UPDATE DOCUMENT:
   - a short Context block (weekly goals, in-progress kept, new-from-triage,
     my steer, and a one-line statement of which distinct code area each
     workstream owns), then
   - 3–5 segments, each a SELF-CONTAINED prompt for one agent that includes:
       * the ticket link(s) and the outcome,
       * the code area it owns and the areas it must NOT touch,
       * a reminder to follow the completion contract + escalation standard,
       * "this session is unsupervised but monitored".

Output only the document, formatted so I can copy each segment straight into a
harness window.
```
