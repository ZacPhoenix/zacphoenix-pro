# Phase 3: Linear MCP & Agent Identity Setup

## Overview

Phase 3 has three parts:
1. **Test stock Linear MCP** — verify basics work
2. **Create bot identity** — OAuth app for agents (not personal)
3. **Build custom MCP** — three essential fixes for agent use

---

## Part 1: Test Stock Linear MCP ✅ READY

The Linear MCP is **already connected** to your claude.ai org. You can immediately use tools like:

### Available tools to test:

```
✓ list_issues — list by status/project/team
✓ get_issue — read a ticket
✓ create_issue — create new ticket with parent
✓ save_issue — move status, update fields
✓ list_comments — read ticket discussion
✓ list_projects — see current projects
```

### Quick test commands:

```bash
# List issues in Backlog
mcp__Linear__list_issues team="Zac Phoenix" state="Backlog"

# Get the Foundation project
mcp__Linear__get_project query="Foundation"

# Create a test issue
mcp__Linear__save_issue team="Zac Phoenix" title="Test" project="Foundation"
```

---

## Part 2: Create Bot/App Identity

This is a **Linear UI step** (cannot be done via MCP).

### In Linear settings:

1. Go to **Settings → Workspace → Integrations → OAuth applications**
2. Click **Create new OAuth app**
   - **App name:** "Agent Automation" (or your preferred name)
   - **Redirect URI:** `http://localhost:3000/callback` (dummy for now)
   - **Scopes:** Select all (or at minimum: `write`, `read`, `issues:comments`)

3. Save the resulting **Client ID** and **Client Secret** — you'll need these for the custom MCP

4. Authenticate as this app by getting an access token (via standard OAuth flow or direct grant)

### Why this matters:

- **Personal MCP** → agents appear as "you" → no notifications, confusing audit trail
- **Bot-authenticated MCP** → agents appear as "Agent Automation" → clear who did what, proper notifications

---

## Part 3: Build Custom MCP (Three Fixes)

The stock Linear MCP works well but needs three enhancements for agent use. You'll build a **thin wrapper** over Linear's API with these three tools.

### Fix 1: Description Patch Tool

**Problem:** Agents overwrite ticket descriptions wholesale, deleting Verifications.

**Solution:** Add a tool that patches descriptions with diffs instead.

```typescript
// Pseudocode for the tool
async function update_issue_description_patch(issueId: string, patch: string) {
  // 1. Fetch current description
  const issue = await linear.getIssue(issueId);
  
  // 2. Apply unified diff to description
  const newDescription = applyDiff(issue.description, patch);
  
  // 3. SAFETY CHECK: Verify Verifications section still exists
  if (!newDescription.includes('## Verifications')) {
    throw new Error('Patch would remove Verifications section. Use allow_scope_change=true to override.');
  }
  
  // 4. SAFETY CHECK: No checkboxes removed
  const oldBoxes = (issue.description.match(/- \[ \]/g) || []).length;
  const newBoxes = (newDescription.match(/- \[ \]/g) || []).length;
  if (newBoxes < oldBoxes && !allow_scope_change) {
    throw new Error('Patch would delete verification checkboxes.');
  }
  
  // 5. Update description
  return await linear.updateIssue(issueId, { description: newDescription });
}
```

**Tool interface:**

```
update_issue_description_patch(
  issue_id: string,
  patch: string,  // unified diff like "@@@ -5,3 +5,4 @@@"
  allow_scope_change?: boolean  // to override safety checks
)
```

### Fix 2: Bot-Authenticated MCP Server

Your custom MCP runs as a small HTTP service (Node.js, Python, Go, etc.):

```typescript
// Setup: Use Linear OAuth app credentials, NOT personal token
const linearClient = new LinearClient({
  apiKey: process.env.LINEAR_BOT_API_KEY,  // from OAuth app, not personal
  // ...
});

// Now all requests act as the bot/app, not as you
```

**Identity in requests:**
- Comment author: "Agent Automation" (the app/bot)
- Status changes attributed to: "Agent Automation"
- Notifications: You get pinged when bot assigns to you ✓

### Fix 3: Enhanced get_issue Tool

**Problem:** Stock `get_issue` doesn't return comments, sub-issues, or PR links by default.

**Solution:** Create a wrapper that returns full context in one call.

```typescript
async function get_issue_full(issueId: string) {
  const issue = await linear.getIssue(issueId);
  const comments = await linear.getIssueComments(issueId);
  const subIssues = await linear.getIssueSubIssues(issueId);
  const prs = await linear.getIssuePullRequests(issueId);
  
  // Parse verification checkboxes from description
  const verifications = parseVerifications(issue.description);
  
  return {
    ...issue,
    comments,
    sub_issues: subIssues,
    linked_prs: prs,
    verifications,  // { automated: [{text, checked}, ...], manual: [...], visual: [...] }
  };
}
```

**Tool interface:**

```
get_issue_full(issue_id: string) -> {
  id, title, description, status, priority, assignee, parent,
  comments[],           // all comments with author + timestamp
  sub_issues[],         // child issues
  linked_prs[],         // related GitHub PRs
  verifications: {      // parsed checklist state
    automated: [{text, checked}, ...],
    manual: [{text, checked}, ...],
    visual: [{text, checked}, ...]
  }
}
```

---

## How to Build the Custom MCP

Choose your platform:

### Option A: Node.js (Express + Linear SDK)

```bash
npm install @linear/sdk express
```

```typescript
// server.ts
import { LinearClient } from "@linear/sdk";
import express from "express";

const linear = new LinearClient({ apiKey: process.env.LINEAR_BOT_API_KEY });
const app = express();

app.post("/mcp/get_issue", async (req, res) => {
  const { issueId } = req.body;
  // Implement get_issue_full here
  res.json(result);
});

app.post("/mcp/update_description_patch", async (req, res) => {
  const { issueId, patch } = req.body;
  // Implement update_issue_description_patch here
  res.json(result);
});

app.listen(3000);
```

### Option B: Python (FastAPI + Linear GraphQL)

```python
from fastapi import FastAPI
import httpx

app = FastAPI()
linear_api_key = os.getenv("LINEAR_BOT_API_KEY")

@app.post("/mcp/get_issue")
async def get_issue_full(issue_id: str):
    # Use Linear GraphQL API
    # Implement get_issue_full here
    pass

@app.post("/mcp/update_description_patch")
async def update_description_patch(issue_id: str, patch: str):
    # Implement update_issue_description_patch here
    pass
```

---

## Then: Point Agent Harnesses at Custom MCP

Once running, update your agent MCP config:

```json
{
  "mcpServers": {
    "linear": {
      "url": "http://localhost:3000",  // or your custom MCP host
      "headers": {}
    }
  }
}
```

---

## Minimum Viable Phase 3

If you want to defer the custom MCP for now:

1. ✅ Use stock Linear MCP as-is (already connected)
2. ✅ Test it works (list issues, read ticket, create, move)
3. 📋 Create bot OAuth app in Linear (manual step)
4. 🔄 Build custom MCP later when you hit the pain points

You can run Phase 4 and 5 with just the stock MCP and revisit custom MCP after seeing agents interact with it.

---

## Next: Phase 4 (Rules & Hooks)

Once you've confirmed stock Linear MCP works, move to Phase 4:
- Install agent rules with ticket contract + verification enforcement
- Install hooks that block status changes if verifications unchecked
- Add human escalation standard
