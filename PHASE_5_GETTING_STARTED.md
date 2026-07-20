# Phase 5: Run Your First Workstream Batch

## Overview

This is where the system actually works. Phase 5 turns agents loose in parallel to complete real work, then you review and kick off the next batch.

---

## Prerequisites

Before Phase 5, you need:

- ✅ Phase 1: Linear workspace configured (labels, projects, statuses)
- ✅ Phase 2: Ticket contract & verification standards adopted
- ⚠️ Phase 3: Stock Linear MCP working (custom MCP optional for first batch)
- ⚠️ Phase 4: Agent rules in CLAUDE.md + AskUser hook installed

---

## Step 1: Populate Triage (drop 5–10 items)

Don't overthink this. Drop anything that needs doing into Triage:

- Feature ideas
- Bugs noticed
- Tech debt
- Research tasks
- Infrastructure work
- Doc updates

**In Linear:**
- Go to your team's **Triage** queue
- Click **New issue** or capture from mobile/Slack
- Drop items in **unassigned, untriaged** (the default)
- No need to flesh out yet — even a one-liner is fine

**Example triage items:**
```
- Handle 404s gracefully on gated pages
- Add logging to auth flow
- Refactor the payment handler module
- Document the agent escalation process
- Add a dark mode toggle
```

---

## Step 2: Run the Workstream Update

The workstream update is a **recurring planning step** that:

1. Reconciles in-progress work
2. Reads new triage tickets
3. Loads priorities (WIP first, then your goals, then urgent)
4. Proposes 3–5 non-overlapping workstreams
5. Emits a document with 3–5 agent prompts (ready to paste)

### How to run it:

**You need:** A planning agent window (Claude Code, Codex, Cursor, Antigravity)

**Step A:** Open your planning harness

**Step B:** Paste this prompt:

```
WORKSTREAM UPDATE: Generate 3–5 agent prompts for the next batch.

My weekly goals: [DESCRIBE YOUR 1–3 HIGH-LEVEL GOALS FOR THIS WEEK]

Steps:

1. RECONCILE IN-PROGRESS
   Check Linear for tickets marked "In Progress". If they're not actively being
   worked (no recent session record), release them so they can be picked up.

2. READ NEW TRIAGE
   List all issues in Triage. Read their descriptions. If any lack a standard
   contract (Goal/Why/Outcomes), run the ticket-intake guidelines
   (Linear System/prompts/ticket-intake.md) to flesh them out first.

3. LOAD PRIORITIES
   Rank by:
   - Finish in-progress work first
   - Then my weekly goals [REPEAT GOALS]
   - Then anything newly urgent

4. PROPOSE 3–5 WORKSTREAMS
   Pick 3–5 tickets such that:
   - Each is a complete, meaningful outcome
   - No two touch the same code files/modules (prevent merge conflicts)
   - Each meaningfully advances a goal

5. EMIT THE WORKSTREAM-UPDATE DOCUMENT
   Format:
   
   ---
   
   # Workstream Update — [Date]
   
   ## Context
   
   [1–2 sentence summary of weekly goals and in-progress state]
   
   [List the 3–5 workstreams and which code area each owns]
   
   ---
   
   ## Workstream 1: [Outcome title]
   
   **Tickets:** [Linear link(s)]
   
   **Code area:** [Module/path] (you own this)
   
   **Do not touch:** [Other modules being worked in parallel]
   
   **Your task:**
   - Read the ticket contract (Goal/Why/Outcomes/Verifications)
   - Implement the outcome
   - Write + run Verifications (Automated, Manual, Visual)
   - Tick every checkbox
   - Merge the PR and deploy
   - Mark the ticket Done
   - Mark your session Complete
   
   **Remember:** This session is unsupervised but monitored for quality and safety.
   Either proceed and finish, or raise a formal escalation (see
   Linear System/prompts/human-escalation.md). Never block silently.
   
   Follow the completion contract in your agent rules.
   
   ---
   
   [Repeat for Workstreams 2–5]

Output only the document. Make each segment copy-paste-ready for a harness window.
```

**Step C:** Copy the generated document

---

## Step 3: Deploy Agents (Paste into Harness Windows)

No fancy orchestrator here. You literally paste each workstream prompt into a separate agent window.

**For each workstream (1–5):**

1. Open a new Claude Code / Codex / Cursor / Antigravity window
2. Copy the corresponding Workstream segment from the update document
3. Paste into the agent
4. Agent runs unsupervised

**Example:** 3 parallel windows:
- **Window 1** → Workstream 1 (Payment handler refactor)
- **Window 2** → Workstream 2 (Auth logging)
- **Window 3** → Workstream 3 (404 page handling)

Each agent:
- Registers an agent session
- Marks tickets In Progress
- Does the work
- Merges PRs
- Ticks verification boxes
- Closes tickets
- Marks session Complete

---

## Step 4: Let the Batch Run Unsupervised

**Your job:** Don't do anything.

The agents are running under the completion contract:
- They **must** merge + deploy
- They **must** tick every verification box
- They **cannot** ask you questions (AskUser blocked)
- They **must** close tickets or mark Blocked + escalate

**Monitor passively:**
- Check PR status if curious
- Watch for escalations
- But **don't interrupt** — let the batch finish

**Typical time:** 30 minutes to 4 hours (depends on complexity)

---

## Step 5: Review & Kick Off Next Batch

When agents signal done (or time passes + you want to kick off again):

1. **Review tickets that closed** — spot-check a few PRs
2. **Check for escalations** — any blocked tickets need your input?
3. **Run the workstream update again** — repeat Step 2
4. **Deploy next batch** — repeat Step 3

**Cadence:** 2–4 batches/day (depends on your work)

---

## Troubleshooting

### Agent is blocked on something

Check if it's a **genuine blocker** or something they could solve:
- Can they deploy themselves? (yes → not blocked)
- Can they add an env var? (yes → not blocked)
- Need you to create a GitHub app? (yes → blocker, they should escalate)

The escalation should be precise: exact steps, 2 minutes to resolve, clear unblock condition.

### Two agents touched the same code

**This shouldn't happen** — the workstream update is supposed to keep workstreams non-overlapping. If it did:

1. Check whether the conflicts are actually conflicts (different areas of same file?)
2. Manually rebase one agent's branch or pick-commit the other's
3. Next workstream update, be more explicit about code area boundaries

### An agent closed a ticket but something's wrong

The hooks should have caught it (unchecked box, unmerged PR, etc.). If not:

- Check whether that hook is actually wired in your setup
- Mark the ticket back to In Progress
- Update the problem in a comment
- Let the agent re-work it or mark Blocked + escalate

---

## First Batch Checklist

- [ ] Triage populated with 5–10 items
- [ ] Ticket intake run on any non-standard triage items (Goal/Why/Outcomes)
- [ ] Agent rules installed in CLAUDE.md
- [ ] AskUser hook installed (blocks questions mid-batch)
- [ ] Linear MCP connected and working
- [ ] Workstream update run
- [ ] Document generated with 3–5 workstream prompts
- [ ] Each prompt pasted into a separate agent window
- [ ] Agents running (you step back and let unsupervised batch run)
- [ ] Next workstream update run after batch completes or 4 hours pass
- [ ] Escalations reviewed and resolved

---

## What Happens Next

After you run 2–3 batches, you'll see patterns:

- Which types of work bottleneck
- Where agents stall or skip verification
- Code areas that collide (need better boundaries)
- Escalations that repeat (might need a rule or tool)

**Phase 6** (the roadmap) is where you:
- Replace hooks with real workflows
- Add metrics (completion rate, defect rate)
- Evals to improve agent performance

For now: run batches, review, iterate on your workstream update approach.

---

## Quick Reference: Workstream Update Skill

**When:** Start of each batch (every 1–4 hours)

**Input:** Weekly goals + current backlog state

**Output:** Workstream-update document with 3–5 copy-paste agent prompts

**Result:** 3–5 agents run in parallel, unsupervised, non-overlapping code areas

**Next:** Review batch → run another update → deploy next batch

See `Linear System/prompts/workstream-update.md` for the full prompt.

---

## Key Reading

- `Linear System/05-batches-and-workstreams.md` — detailed workstream theory
- `Linear System/06-agent-session-lifecycle.md` — session tracking
- `Linear System/07-human-escalation-standard.md` — escalation protocol
- `Linear System/prompts/workstream-update.md` — full workstream prompt
- `Linear System/templates/workstream-update-doc.md` — output document shape
