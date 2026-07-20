# 08 — Linear MCP setup, agent identity, and the three fixes

> "In general, Linear's MCP server works really well, but I did need to make
> three minor adjustments to the interface with Linear." — @enginoid

This chapter covers connecting agents to Linear and the three tweaks that were
"just enough to replace their MCP server with our own."

## Start with the stock Linear MCP

Linear ships an official MCP server, and it works really well for most of this
system — creating/updating issues, moving statuses, reading the backlog. Connect
your harnesses to it first and confirm the basics work before customizing.

For each harness (Claude Code, Codex, Cursor, Antigravity), add the Linear MCP
server per that harness's MCP config. Verify the agent can:

- list issues in Triage and the backlog,
- read a ticket (description + comments + sub-issues),
- create a ticket with a parent,
- move a ticket's status.

## The three adjustments (why you'll end up with your own MCP)

The stock server has three gaps for agent use. Fixing them is what pushed the
author to a custom MCP server (a thin wrapper over Linear's API).

### 1. Update summaries through **diffs**, not overwrites

**Problem:** Agents keep the ticket description current by rewriting it — good
instinct — but they tend to **completely override the Verification criteria and
other details of the original ticket**, which the reviewer agent depends on.

**Fix:** **Ban direct description edits.** Give agents a tool that sends **diffs
/ patches** to specific sections instead of replacing the whole description.

This is the enforcement half of the rule in
[03](03-ticket-contract.md) and [04](04-verification-checklists.md). Tool shape:

```
update_issue_description_patch(issue_id, patch)
  - patch is a unified diff (or a section-scoped edit) against the current
    description
  - reject any change that removes the Verifications section or deletes
    checkboxes unless the caller explicitly passes allow_scope_change=true
  - there is NO tool that overwrites the full description
```

### 2. Give agents their **own identity**

**Problem:** The Linear MCP server uses **your personal OAuth by default**, so
agents act **as you**. Consequences the author hit:

- No notifications when an agent assigned a task to you (it was "you" assigning
  to "you").
- Constant confusion about whether *you* closed a ticket or an *agent* did.

**Fix:** Switch agents to an MCP server using **app-based authentication and
identity** — a Linear OAuth app / bot actor, not your personal token. Then:

- Agents appear as themselves in history, comments, and assignments.
- When an agent assigns something to you (e.g. an escalation from
  [07](07-human-escalation-standard.md)), you actually get notified.
- The audit trail is trustworthy — you can tell agent actions from yours.

Setup outline (full step-by-step + helper script:
[`scripts/README.md`](scripts/README.md)):

1. Create a Linear **OAuth application** for your agents in Linear settings.
2. Mint an access token with **`actor=app`** so actions are attributed to the
   app — this does **not** consume a paid seat (unlike inviting a bot user).
   Use [`scripts/linear-app-token.mjs`](scripts/linear-app-token.mjs).
3. Authenticate a **self-hosted MCP server** with that app token, not your user.
4. Point all agent harnesses at the app-authenticated MCP server.
5. Keep *your* personal access for your own Linear use on laptop + mobile.

### 3. Minor ergonomics — a fuller `get_issue`

**Problem:** The stock `get_issue` doesn't always return enough context —
notably **comments and subtasks** — so agents work with a partial picture unless
they remember to ask for each piece separately.

**Fix:** Provide a `get_issue` that returns the **full picture in one call**:
description, all comments, sub-issues, parent, links/PRs, and status — so agents
don't have to "remember" to fetch everything.

```
get_issue(issue_id) -> {
  ...core fields,
  description,
  comments[],
  sub_issues[],
  parent,
  linked_prs[],
  verifications  // parsed checklist state
}
```

## Recommended architecture

```
   Your Linear (personal login) ── you, on laptop + mobile
             │
             │  same workspace
             ▼
   Custom MCP server ── authenticated as an APP/BOT (not you)
     ├─ get_issue           (full context in one call)      [fix 3]
     ├─ update_desc_patch   (diffs only, protects Verifs)   [fix 1]
     ├─ create/update/move  (standard operations)
     └─ acts with agent identity                            [fix 2]
             │
     ┌───────┼────────┬──────────┐
     ▼       ▼        ▼          ▼
  Claude   Codex   Cursor   Antigravity   ← agent harnesses
```

## Where this is headed (roadmap)

The article is candid that today's setup is a prototype. The MCP + hooks
approach exists because the author depends on **subscription** economics
(desktop harnesses) rather than API tokens. Planned evolution:

- **Replace hooks with workflows.** Invoke agents via API directly from Linear
  tickets and manage agent-session postconditions in a real workflow
  representation — no more transcript rummaging.
- **Workflows with measurement.** Capture completion rate, defect rate, and
  variance (Toyota Production System / continuous-improvement style) and
  systematically improve the low-hanging fruit.
- **Evals.** Repeat the same task under different guidance and run the suite
  weekly. Easier once standardized on one harness/API.

You don't need any of that to start — but design your custom MCP and session
records so they can emit metrics later.
