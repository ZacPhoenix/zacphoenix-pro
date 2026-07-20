# Linear System — an implementation guide for running coding agents

This folder turns Fred Jonsson's (@enginoid) essay *"How I use Linear to
manage agents (and why we should all be building software factories)"* into a
step-by-step guide you can follow to set up and configure Linear to work the
same way.

> Source article: https://x-thread.org/t/2078850177926938666

The goal: use Linear as the **central place of coordination** for a fleet of
coding agents (Claude Code, Codex, Cursor, Antigravity, etc.) working **in
parallel**, so that your attention scales instead of drowning in agent windows
and PR reviews.

---

## The idea in one paragraph

You keep a tree of tickets named after **outcomes** (not technical tasks). You
drop anything that needs doing into **Triage**, which acts as an inbox for
future prompts. A "workstream update" step reads the backlog and proposes
**3–5 parallel agent prompts** that don't touch the same code area. You paste
those into your agent harnesses and let them run **unsupervised** (but
monitored). Hooks and prompts force each agent to actually *finish* — merge the
PR, tick every verification checkbox, and either close the ticket or raise a
well-formed **human escalation**. You review and kick off work in chunks, and
do deep work in between.

---

## What you get in this folder

Read them in order the first time; after that use them as reference.

| File | What it covers |
|------|----------------|
| [`01-outcome-hierarchy.md`](01-outcome-hierarchy.md) | Structuring tickets as an outcome tree (epics → roots) |
| [`02-triage-inbox.md`](02-triage-inbox.md) | Using Triage as an inbox for future prompts + intake guidelines |
| [`03-ticket-contract.md`](03-ticket-contract.md) | The ticket template: Goal / Why / Outcomes / Implementation / Verifications |
| [`04-verification-checklists.md`](04-verification-checklists.md) | Verification standard + the "no unchecked box" close rule |
| [`05-batches-and-workstreams.md`](05-batches-and-workstreams.md) | Batching 3–5 non-overlapping workstreams; the workstream-update skill |
| [`06-agent-session-lifecycle.md`](06-agent-session-lifecycle.md) | Forcing completion: agent sessions, hooks, closeout |
| [`07-human-escalation-standard.md`](07-human-escalation-standard.md) | How agents should ask *you* for help without wasting your time |
| [`08-linear-mcp-setup.md`](08-linear-mcp-setup.md) | Linear MCP, agent identity, and the three interface fixes |
| [`agent-identity-runbook.md`](agent-identity-runbook.md) | Revisit-later runbook: OAuth app + token + self-hosted MCP, Windows **and** macOS, with troubleshooting |
| [`09-setup-checklist.md`](09-setup-checklist.md) | Do-this-in-order checklist to stand the whole thing up |
| [`templates/`](templates/) | Copy-paste ticket template, workstream doc, hooks, agent rules |
| [`prompts/`](prompts/) | Ready-to-paste prompts for intake, workstream updates, escalations |

---

## Design principles (keep these in mind)

1. **Outcomes over tasks.** Tickets are named for the target state, not the
   implementation. This keeps *you* oriented and gives the agent room to pick a
   good approach.
2. **The ticket is the contract.** Human-readable, outcome-focused. If you can
   read it and know what "done" means, an agent can too.
3. **Your quality of life is the driver.** Batches run unsupervised so you get
   back focus for deep work. You review in chunks, not by task-switching.
4. **Finishing is mandatory.** "I'm done" is not done. Done = merged, deployed,
   every checkbox ticked, ticket closed — or a formal escalation/blocked.
5. **Agents get their own identity.** They act as themselves, not as you, so
   notifications and audit trails make sense.
6. **Build toward a real state machine.** The hooks below are an honest,
   admitted hack. They work today; plan to replace them with proper workflows +
   metrics (completion rate, defect rate, variance) later.

---

## Fastest path to running

If you just want to get going, jump to
[`09-setup-checklist.md`](09-setup-checklist.md). It walks you through the
Linear configuration (statuses, labels, triage, templates) and the agent-side
setup (rules file, hooks, MCP) in the order that gets you to a first batch
quickest.
