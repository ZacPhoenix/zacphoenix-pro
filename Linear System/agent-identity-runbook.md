# Runbook — Agent identity for Linear (OAuth app + self-hosted MCP)

A revisit-later guide to how agents get their **own identity** in Linear instead
of acting as you. Read this if you're setting it up on a new machine, rotating a
token, or debugging why an agent is acting as the wrong identity.

**What it achieves**
- Agent actions in Linear show as the **app** ("Zac Phoenix Agents"), not as you.
- You get **notified** when an agent assigns something to you.
- The audit trail cleanly separates agent actions from yours.
- **No extra paid seat** — an app actor (`actor=app`) doesn't consume a seat,
  unlike inviting a second user.

**The three moving parts**
1. A Linear **OAuth application** (created once, in Linear settings).
2. An **app access token** minted with `actor=app`
   ([`scripts/linear-app-token.mjs`](scripts/linear-app-token.mjs)).
3. A **self-hosted MCP** that authenticates with that token
   ([`linear-mcp/index.mjs`](linear-mcp/index.mjs)), which every agent harness
   points at instead of the stock Linear MCP.

```
Linear OAuth app  ──mint token (actor=app)──►  LINEAR_APP_TOKEN (a secret)
        │                                              │
        │                                              ▼
        │                                   self-hosted linear-mcp (Bearer auth)
        │                                              │
        └── you keep your personal login       ┌───────┼────────┬───────────┐
            for laptop + mobile                 ▼       ▼        ▼           ▼
                                            Claude   Codex   Cursor   Antigravity
                                                (all act AS THE APP)
```

Deeper background: [`08-linear-mcp-setup.md`](08-linear-mcp-setup.md). Component
docs: [`scripts/README.md`](scripts/README.md),
[`linear-mcp/README.md`](linear-mcp/README.md).

---

## Reference facts for this workspace

| Thing | Value |
|-------|-------|
| Linear team | **Zac Phoenix** (`ZAC`) |
| Org urlKey | `zac-phoenix` |
| OAuth app name | **Zac Phoenix Agents** |
| OAuth app location | Linear → **Settings → API → OAuth applications** |
| Callback URL (must match the script) | `http://localhost:8787/callback` |
| Scopes | `read`, `write` |
| Token env var | `LINEAR_APP_TOKEN` (User-scope env var on Windows) |
| MCP entry point | `…\zacphoenix-pro\Linear System\linear-mcp\index.mjs` |
| Local harness config | `…\zacphoenix-pro\.mcp.json` (gitignored) |

> The **Client secret** and the **app token** are secrets. They are NOT stored in
> this repo. The token lives only in your `LINEAR_APP_TOKEN` env var; the client
> secret lives only in Linear (and is regenerable).

---

## Full setup on Windows (from scratch)

> On a Mac? Skip to [Setting up on macOS](#setting-up-on-macos-macbook-pro). The
> OAuth app (step 1) is shared across machines — you only create it once and
> reuse it everywhere.

### 1. Create the OAuth application
Linear → **Settings → API → OAuth applications → Create new**:
- **Name:** `Zac Phoenix Agents`
- **Callback URL:** `http://localhost:8787/callback` (exact)
- **Public:** off · **Webhooks:** off
- Save → copy the **Client ID** and **Client secret**.

### 2. Mint an app token (`actor=app`)
From the repo, in a terminal (Node 18+):
```powershell
cd "C:\Users\zaclu\zacphoenix-pro\Linear System\scripts"
$env:LINEAR_CLIENT_ID = "<client-id>"
$env:LINEAR_CLIENT_SECRET = "<client-secret>"
node linear-app-token.mjs
```
Open the printed authorize URL → **Approve** → the script prints the
`lin_oauth_…` token. Copy it. (The script uses `actor=app`, so writes are
attributed to the app.)

### 3. Store the token as an env var
Windows PowerShell (`setx` may not be on PATH — use the .NET call, which is the
persistent equivalent), then also set it in the current session:
```powershell
[Environment]::SetEnvironmentVariable("LINEAR_APP_TOKEN", "lin_oauth_…", "User")
$env:LINEAR_APP_TOKEN = "lin_oauth_…"
```
Verify: `echo $env:LINEAR_APP_TOKEN`.

### 4. Point the MCP at the token
Copy the template to a project-level `.mcp.json` (it references
`${LINEAR_APP_TOKEN}`, so no secret is written to the file):
```powershell
Copy-Item "C:\Users\zaclu\zacphoenix-pro\Linear System\linear-mcp\mcp.example.json" "C:\Users\zaclu\zacphoenix-pro\.mcp.json"
```
Restart Claude Code from the project folder; approve the `linear-app` server when
prompted. Remove any stock Linear MCP so it isn't used by mistake:
```powershell
claude mcp list
claude mcp remove linear   # only if a personal-identity Linear MCP is listed
```

### 5. Verify identity
In Claude Code: *"Call the linear-app whoami tool."* → expect `Zac Phoenix` /
`zac-phoenix`. Then have it add a test comment and confirm in Linear the author
is the **app** (app badge) and that you were notified. Delete the test comment.

### 6. Other harnesses
Codex / Cursor / Antigravity each accept `command` + `args` + `env`:
- command `node`
- args `["…\\Linear System\\linear-mcp\\index.mjs"]`
- env `LINEAR_APP_TOKEN=<token>`

---

## Setting up on macOS (MacBook Pro)

Same three parts, different shell (zsh) and paths. **You do NOT create a new
OAuth app** — reuse "Zac Phoenix Agents" from Linear. You do need a fresh **app
token** on the Mac (or copy the existing one across securely).

Assumes the repo is cloned at `~/zacphoenix-pro` and Node 18+ is installed
(`brew install node`, or via `nvm`). Adjust paths if you clone elsewhere.

### 1. (Reuse the existing OAuth app)
Skip creation. You need the app's **Client ID** and **Client secret** from
Linear → **Settings → API → OAuth applications → Zac Phoenix Agents**. The
callback URL `http://localhost:8787/callback` is already registered and works on
the Mac too (the flow runs on localhost).

### 2. Mint an app token (`actor=app`)
In Terminal (zsh) — the inline `VAR=value` prefix works in zsh/bash:
```bash
cd ~/zacphoenix-pro/"Linear System"/scripts
LINEAR_CLIENT_ID=<client-id> LINEAR_CLIENT_SECRET=<client-secret> node linear-app-token.mjs
```
Open the printed URL → **Approve** → copy the `lin_oauth_…` token.

### 3. Store the token as an env var
Add it to your shell profile so every new terminal has it, then load it now:
```bash
echo 'export LINEAR_APP_TOKEN="lin_oauth_…"' >> ~/.zshrc
export LINEAR_APP_TOKEN="lin_oauth_…"
```
Verify: `echo $LINEAR_APP_TOKEN`.

> Note: env vars set in `~/.zshrc` are seen by tools launched **from a terminal**
> (including `claude`). A GUI app launched from the Dock won't read `~/.zshrc`; if
> you run a harness as a Mac app, set the token in that app's MCP env config
> instead (step 4 covers the token inline).

### 4. Point the MCP at the token
On macOS the `claude mcp add` CLI works cleanly (no PowerShell `--` quirk):
```bash
claude mcp add linear-app --env "LINEAR_APP_TOKEN=$LINEAR_APP_TOKEN" -- \
  node "$HOME/zacphoenix-pro/Linear System/linear-mcp/index.mjs"
```
Or use the file method — copy the template to a project `.mcp.json` and fix the
path to the Mac location:
```bash
cp ~/zacphoenix-pro/"Linear System"/linear-mcp/mcp.example.json ~/zacphoenix-pro/.mcp.json
```
Then edit `~/zacphoenix-pro/.mcp.json` so `args` points at the macOS path
(forward slashes, no `C:\`):
```json
{
  "mcpServers": {
    "linear-app": {
      "command": "node",
      "args": ["/Users/zaclu/zacphoenix-pro/Linear System/linear-mcp/index.mjs"],
      "env": { "LINEAR_APP_TOKEN": "${LINEAR_APP_TOKEN}" }
    }
  }
}
```
Restart Claude Code from the project folder and approve the `linear-app` server.
Remove any stock Linear MCP: `claude mcp list` then `claude mcp remove linear`.

### 5. Verify identity
Same as Windows: *"Call the linear-app whoami tool"* → expect `Zac Phoenix` /
`zac-phoenix`; confirm a test comment is authored by the **app** and notifies you.

### macOS quick-reference vs Windows

| Step | Windows (PowerShell) | macOS (zsh) |
|------|----------------------|-------------|
| Session env var | `$env:LINEAR_APP_TOKEN = "…"` | `export LINEAR_APP_TOKEN="…"` |
| Persistent env var | `[Environment]::SetEnvironmentVariable("LINEAR_APP_TOKEN","…","User")` | `echo 'export LINEAR_APP_TOKEN="…"' >> ~/.zshrc` |
| Repo path | `C:\Users\zaclu\zacphoenix-pro` | `~/zacphoenix-pro` (`/Users/zaclu/zacphoenix-pro`) |
| MCP args path | `C:\\…\\linear-mcp\\index.mjs` (escaped backslashes) | `/Users/zaclu/…/linear-mcp/index.mjs` |
| `claude mcp add` with `--` | breaks — use `.mcp.json` | works fine |
| Print a var | `echo $env:LINEAR_APP_TOKEN` | `echo $LINEAR_APP_TOKEN` |

---

## Maintenance

**Rotate / re-mint the token.** Re-run steps 2–3. Then update `LINEAR_APP_TOKEN`
(step 3) and restart the harnesses. Re-minting alone doesn't invalidate an old
token — to invalidate, revoke (below) or regenerate the client secret.

**Kill switch.** Revoke the app in Linear → **Settings → API → OAuth
applications → (app) → Revoke**. All its tokens stop working immediately — a
clean way to disable the whole agent fleet at once.

**If the token leaks** (e.g. pasted into a shared log): regenerate the client
secret in Linear (invalidates old tokens), then re-mint (steps 2–3).

**Where secrets live.** Token → `LINEAR_APP_TOKEN` env var only. Client secret →
Linear only. Neither is in git; `.mcp.json`, `.env*` are gitignored.

---

## Troubleshooting (things we actually hit)

| Symptom | Cause | Fix |
|---------|-------|-----|
| `VAR=value` → *not recognized as a cmdlet* | Used bash env-var syntax in PowerShell | PowerShell uses `$env:VAR = "…"` (session) and `[Environment]::SetEnvironmentVariable(...,"User")` (persistent) |
| `cd … : Cannot find path …` | Repo not cloned locally, or two commands got pasted onto one line | Clone the repo; run commands **one line at a time** |
| `Cannot find module …\linear-app-token.mjs` | Ran `node` from the wrong folder | `cd` into `Linear System\scripts` first (use the absolute path) |
| `Assertion failed: … async.c` after the token prints | Harmless Windows/libuv shutdown quirk | Ignore — the token above it is valid. (Fixed in the current script.) |
| `setx : not recognized` | `setx.exe` not on PATH | Use `[Environment]::SetEnvironmentVariable("LINEAR_APP_TOKEN","…","User")` |
| `claude mcp add … error: missing required argument 'commandOrUrl'` | PowerShell mangles the `--` separator | Skip the CLI — use the `.mcp.json` file method (step 4) |
| `whoami` / tools return `Linear API error (401 …)` | Token wrong, revoked, or missing scope | Re-mint (steps 2–3); confirm the MCP sends `Authorization: Bearer <token>` |
| Agent still acts as *you* | Stock Linear MCP still connected, or wrong token | `claude mcp list`; remove the stock `linear`; confirm `.mcp.json` uses `linear-app` |
| `PATH` var itself missing / `git` or `node` not recognized | Broken PowerShell PATH | Open a fresh terminal; if it persists, repair the system PATH env var |

---

## The three fixes baked into the MCP

The self-hosted server isn't just an identity swap — it also enforces the three
customizations from [`08-linear-mcp-setup.md`](08-linear-mcp-setup.md):

1. **Diff-only description edits** — `patch_issue_description` replaces one exact
   `oldText`→`newText` and **refuses to delete the Verifications section or
   reduce the checkbox count** (unless `allowScopeChange=true`). There is no
   full-overwrite tool.
2. **App identity** — all writes go out under the app token (`actor=app`).
3. **Full-context `get_issue`** — one call returns description, comments,
   sub-issues, parent, labels, project, attachments, and a verification summary.
