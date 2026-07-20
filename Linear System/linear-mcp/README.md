# linear-app-mcp — self-hosted Linear MCP with agent identity

A tiny, **dependency-free** MCP server that talks to Linear **as your OAuth app**
(`actor=app`) instead of as you. It's the piece that makes the app token from
[`../scripts/README.md`](../scripts/README.md) actually get used, and it bakes in
the three fixes from [`../08-linear-mcp-setup.md`](../08-linear-mcp-setup.md):

- **fix 1** — `patch_issue_description` is the only way to edit a description
  (targeted diff, never a wholesale overwrite) and it **refuses to delete the
  Verifications section or reduce the checkbox count**.
- **fix 2** — acts with the **app identity** (via the Bearer app token).
- **fix 3** — `get_issue` returns **full context in one call** (description,
  comments, sub-issues, parent, labels, project, attachments + a verification
  summary).

Requires **Node 18+** (built-in `fetch`). No `npm install`.

## Tools

`whoami`, `list_teams`, `list_workflow_states`, `list_projects`, `list_labels`,
`list_issues`, `get_issue`, `create_issue`, `update_issue_state`, `assign_issue`,
`add_comment`, `patch_issue_description`.

## 1. Set the token

The server reads `LINEAR_APP_TOKEN` from the environment. On Windows (persist it
for future terminals, then open a **new** terminal so it takes effect):

```powershell
setx LINEAR_APP_TOKEN "lin_oauth_xxxxxxxx..."
```

> The token is a secret. Don't commit it and don't hard-code it into any file
> that goes into git.

## 2. Wire it into Claude Code

**Option A — CLI (simplest).** From anywhere:

```powershell
claude mcp add linear-app --env LINEAR_APP_TOKEN=%LINEAR_APP_TOKEN% -- node "C:\Users\zaclu\zacphoenix-pro\Linear System\linear-mcp\index.mjs"
```

**Option B — config file.** Add this to your Claude Code MCP config (`.mcp.json`
at the project root, or your user config). It expands `${LINEAR_APP_TOKEN}` from
the environment so no secret is written to the file — see
[`mcp.example.json`](mcp.example.json):

```json
{
  "mcpServers": {
    "linear-app": {
      "command": "node",
      "args": [
        "C:\\Users\\zaclu\\zacphoenix-pro\\Linear System\\linear-mcp\\index.mjs"
      ],
      "env": { "LINEAR_APP_TOKEN": "${LINEAR_APP_TOKEN}" }
    }
  }
}
```

Then restart Claude Code so it picks up the server.

> **Replace, don't stack.** If you had the stock/hosted Linear MCP connected,
> remove or disable it — otherwise you'll have two Linear MCPs and the agent may
> use the personal-identity one. This `linear-app` server should be the only
> Linear MCP the agents see.

## 3. Verify identity

Ask the agent to run the `whoami` tool (or in Claude Code: *"call the linear-app
whoami tool"*). You should see your organization (`Zac Phoenix` / `zac-phoenix`)
and the app acting as itself. Then have it create a throwaway comment and confirm
in Linear that the author is the **app**, not you — and that you got notified.

## 4. Wire the other harnesses

Codex, Cursor, and Antigravity each take an MCP server as a `command` + `args` +
`env`. Use the same three values:

- command: `node`
- args: `["C:\\Users\\zaclu\\zacphoenix-pro\\Linear System\\linear-mcp\\index.mjs"]`
- env: `LINEAR_APP_TOKEN` = your token

## Notes & limits

- This is intentionally minimal — the core loop (triage → create → move → comment
  → patch). Extend `TOOLS` in `index.mjs` as you need more (e.g. project/session
  creation helpers, user lookup for `assign_issue`).
- `assign_issue` takes a user UUID. Grab yours from Linear (or add a `list_users`
  tool) when you wire up escalations that assign to you.
- Auth uses `Authorization: Bearer <token>` — correct for OAuth app tokens. (A
  personal API key would use the header without `Bearer`.)
- If a call returns `Error: Linear API error (401 …)`, the token is wrong,
  revoked, or missing the needed scope — re-mint with
  [`../scripts/linear-app-token.mjs`](../scripts/linear-app-token.mjs).
