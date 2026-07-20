# Workstream-update document (output shape)

The `workstream-update` skill produces a document like this. The top is
high-level context; below it are **3–5 non-overlapping segments**, each pasted
into one agent window.

---

```markdown
# Workstream update — <date> — batch <n>

## Context
- **Weekly goals:** <the 1–3 goals this batch should advance>
- **In progress (kept):** <tickets genuinely being worked, and by whom>
- **Newly from triage:** <what came in, brought to standard>
- **Steer from me:** <any explicit direction for this batch>
- **Do NOT overlap:** each workstream below is scoped to a distinct code area.
  <one line naming the areas so conflicts are obvious>

---

## Workstream 1 — <outcome, plain English>
**Code area:** <files/modules — must not overlap others>
**Tickets:** <LIN-123>, <LIN-124 (sub)>
**Goal it advances:** <which weekly goal>

<Paste-ready prompt for the agent:>
You are working ticket LIN-123 (and its sub-issues). Follow the agent rules
(completion contract, verifications, escalation standard). Register an agent
session, mark the tickets In Progress, deliver the outcome, open + merge + deploy
a PR, tick all Verification boxes, close the tickets, upload the transcript, and
mark the session complete. Stay within <code area>; do not touch <areas owned by
other workstreams>. This session is unsupervised but monitored.

---

## Workstream 2 — <outcome>
**Code area:** <distinct area>
**Tickets:** <LIN-…>
**Goal it advances:** <…>

<Paste-ready prompt…>

---

## Workstream 3 — <outcome>
...

## Workstream 4 — <outcome>
...

## Workstream 5 — <outcome>
...
```

---

## Usage

1. Skim the **Context** block to confirm the plan matches your intent.
2. Copy **Workstream 1's prompt** into harness window 1, Workstream 2 into
   window 2, etc. — one per window.
3. Let the batch run unsupervised.
4. Come back and review + run the next `workstream-update` in one sitting.
