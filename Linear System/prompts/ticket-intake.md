# Prompt: ticket intake

Paste this to an agent to process the **Triage** inbox and bring raw captures up
to the ticket contract. This is the "ticket intake guidelines" the system runs
on. (See [`../02-triage-inbox.md`](../02-triage-inbox.md) and
[`../03-ticket-contract.md`](../03-ticket-contract.md).)

---

```
You are running ticket intake on the Linear Triage queue. For each untriaged
item, turn it into a standard ticket. Work through the whole queue.

For each item:

1. FIGURE OUT THE REAL NEED.
   The item may be a screenshot, a one-liner, or a fragment. Infer the
   underlying OUTCOME the person actually wants. If it's genuinely ambiguous,
   write your best interpretation and leave an explicit open question in the
   ticket rather than silently guessing.

2. RENAME TO THE OUTCOME.
   Title = the target state in the world (e.g. "Shared links open for
   logged-out users"), never the technical task.

3. PLACE IT IN THE OUTCOME TREE.
   Attach it to the parent outcome it serves. If no suitable parent exists,
   create one (a Project or parent Issue named for the larger outcome). Never
   leave it parentless.

4. FILL THE CONTRACT.
   Add these sections to the description (see the ticket template):
     - Goal: the target state, 1–2 sentences.
     - Why: why it matters; context the implementer needs.
     - Outcomes: observable end states that define "done".
     - Implementation approach: "Implementer's discretion" unless there's a
       specific constraint to inject.
     - Verifications: the MINIMAL testing procedure — Automated (prefer these),
       Manual (only what can't be automated yet, ≤2 min each), Visual (when
       user-visible). Do not pad; every box is a real gate.

5. SET PRIORITY.
   Relative to current weekly goals and what's urgent — not by gut reaction to
   the raw item.

6. DE-DUPLICATE.
   Before creating, search for an existing ticket covering the same outcome.
   If found, merge into it instead of creating a duplicate.

Use the diff/patch tool for any edits to existing tickets — never overwrite a
description wholesale, and never disturb an existing Verifications section.

When the queue is clear, report: how many items you processed, any you flagged
as ambiguous (with the open question), and any new parent outcomes you created.
```
