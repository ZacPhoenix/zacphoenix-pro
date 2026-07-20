# Phase 4: Rules & Hooks Implementation

## Overview

Phase 4 has two parts:
1. **Install agent rules** — Paste into CLAUDE.md / harness rules
2. **Install enforcement hooks** — Wire into your harness & Linear MCP

---

## Part 1: Install Agent Rules ✅ READY

The complete agent rules are in `Linear System/templates/agent-rules.md`.

### For Claude Code (this project):

Create or update `.claude/settings.json` to include the agent rules in the `system` field:

```json
{
  "rules": "See CLAUDE.md"
}
```

Then create `CLAUDE.md` with:

```markdown
# Zac Phoenix — Agent Rules

[Paste the complete content of Linear System/templates/agent-rules.md here]
```

### For other harnesses (Cursor, Codex, Antigravity):

Paste the agent rules into the equivalent config file:
- **Cursor:** `.cursorules` or `.cursor/rules.md`
- **Codex:** your equivalent rules file
- **Antigravity:** your equivalent rules file

---

## Part 2: Install Hooks

Hooks enforce the rules when the prompt alone isn't enough.

### Hook Implementation Map

| Hook | Purpose | Implementation Location |
|------|---------|------------------------|
| **verify-checkboxes** | No close with unchecked verification boxes | Custom Linear MCP (on ticket status change) |
| **require-merged-pr** | No close without merged + deployed PR | Custom Linear MCP (on ticket status change) |
| **block-askuser** | Stop agents asking mid-batch | Claude Code `AskUser` hook |
| **require-session** | No work without registered session | Custom Linear MCP (on ticket status change) or Sessions project |
| **session-closeout** | Session can't complete until postconditions met | Sessions project + transcript validation |

### How to Implement Hooks

#### For Claude Code (AskUser block):

Create `.claude/hooks/block-askuser.json`:

```json
{
  "event": "tool_call",
  "tool_name": "AskUserQuestion",
  "action": "block",
  "message": "Agent sessions run unsupervised. Cannot use AskUserQuestion mid-batch. If you need clarification or input, mark the ticket Blocked and raise a human escalation instead. See Linear System/prompts/human-escalation.md."
}
```

This will intercept any call to AskUserQuestion and refuse it.

#### For Custom Linear MCP (Verification & PR checks):

Implement the hooks in your MCP server's ticket-mutation handler:

```typescript
// In your custom MCP's save_issue endpoint

async function save_issue(issueId: string, updates: any) {
  const ticket = await linear.getIssue(issueId);
  
  // Hook 1: verify-checkboxes
  if (updates.status?.name === 'Done' || updates.status?.name === 'Closed') {
    const verifications = parseVerifications(ticket.description);
    
    if (verifications.hasUncheckedBoxes()) {
      throw new Error(`
        Cannot close: unchecked Verification items remain. Complete and tick
        every Automated, Manual, and Visual box, or mark the ticket Blocked
        and escalate.
      `);
    }
    
    if (verifications.count < ticket.metadata?.baseline_verification_count) {
      throw new Error(`
        Cannot close: the Verifications section has fewer checkboxes than before.
        Do not delete checks to close a ticket. Restore them and satisfy each.
      `);
    }
  }
  
  // Hook 2: require-merged-pr
  if (updates.status?.name === 'Done' || updates.status?.name === 'Closed') {
    const prs = await linear.getIssuePullRequests(issueId);
    
    if (prs.length === 0) {
      throw new Error(`
        Cannot close: no PR linked. Push all code into a PR and link it.
      `);
    }
    
    const mergedPRs = prs.filter(pr => pr.merged);
    if (mergedPRs.length === 0) {
      throw new Error(`
        Cannot close: no linked PR is merged. Get the PR reviewed, passing tests,
        merged, and deployed before closing.
      `);
    }
    
    for (const pr of mergedPRs) {
      if (!pr.deployed) {
        throw new Error(`
          Cannot close: merged code is not yet deployed. Ensure the change is
          deployed before closing.
        `);
      }
    }
  }
  
  return await linear.updateIssue(issueId, updates);
}
```

#### For Sessions Project (lifecycle checks):

Create a Sessions issue for each agent run:

```markdown
## Session: [Date] [Workstream Name]

Agent: Agent Automation
Status: In Progress
Tickets: ZAC-1, ZAC-2, ZAC-3

### Session Postconditions (must be complete before session closes)

- [ ] All assigned tickets are Done or Blocked
- [ ] All merged PRs deployed to production
- [ ] Session transcript uploaded to this issue
- [ ] Root-cause analysis written (if any failures)

### Transcript
[Paste agent session output here after completion]

### Closeout
[Session marked Complete when all postconditions checked]
```

---

## Part 3: Human Escalation Standard

When an agent truly needs human help, it follows this standard.

**File:** `Linear System/prompts/human-escalation.md`

**Key points:**

1. **Mark ticket Blocked** in Linear (status + blocked label)
2. **Write precise instructions** — not vague tasks, exact steps + values
3. **Make it 2 minutes, not 15** — pre-fill everything
4. **State the exact unblock condition** — "Once you [X], I can [Y]"
5. **Keep other work unblocked** — finish what you can while waiting

**Example:**

```
Escalation: Create GitHub OAuth app

Blocked on: GitHub app creation

Current state: Feature branch is ready, tests passing. Need GitHub app configured
to run integration tests. Waiting for OAuth app to be created and token added to
environment.

Exact steps:
1. Go to https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in:
   - Application name: "Zac Phoenix Dev"
   - Homepage URL: http://localhost:3000
   - Authorization callback URL: http://localhost:3000/auth/callback
4. Copy the Client ID and Client Secret
5. Add to `.env.local`:
   GITHUB_CLIENT_ID=<copied ID>
   GITHUB_CLIENT_SECRET=<copied secret>
6. Restart the dev server

Unblock condition: Once .env.local has the two variables, I can run
integration tests and merge.

Assigned to: zacphoenix
```

---

## Checklist: Phase 4 Setup

- [ ] **Agent Rules**
  - [ ] Copy `Linear System/templates/agent-rules.md` to this repo's CLAUDE.md
  - [ ] Paste into other harnesses (Cursor, Codex, etc.)

- [ ] **Hooks**
  - [ ] Create `.claude/hooks/block-askuser.json` (blocks AskUserQuestion)
  - [ ] Implement verify-checkboxes in custom Linear MCP
  - [ ] Implement require-merged-pr in custom Linear MCP
  - [ ] Create Sessions project for tracking agent session lifecycle
  - [ ] Create session postcondition tracking template

- [ ] **Human Escalation**
  - [ ] Read `Linear System/prompts/human-escalation.md`
  - [ ] Confirm agents know to mark Blocked + escalate rather than ask

---

## Next: Phase 5 (Run First Workstream)

Once rules + hooks are in place:

1. Drop 5–10 items into Triage
2. Run the workstream update step (see Phase 5)
3. Batch 3–5 non-overlapping prompts
4. Deploy agents in parallel
5. Let unsupervised batch run
6. Review + kick off next batch

See `Linear System/05-batches-and-workstreams.md` and `PHASE_5_IMPLEMENTATION.md`.
