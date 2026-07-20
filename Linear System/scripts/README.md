# Agent identity — Linear OAuth app setup (how-to)

Give your agents their **own identity** in Linear instead of acting as you.
This fixes the two problems from the article: you get **notified** when an agent
assigns you something, and the audit trail clearly separates **agent actions
from yours**. (Concept: [`../08-linear-mcp-setup.md`](../08-linear-mcp-setup.md),
fix 2.)

We use an **OAuth application authorized with `actor=app`**. The app acts as
itself (a workspace bot actor), which — unlike inviting a second user — **does
not consume a paid seat**.

---

## Step 1 — Create the OAuth application in Linear

1. Go to **https://linear.app/settings/api** → **OAuth applications** →
   **Create new** (menu path: *Settings → API → OAuth applications*; Linear
   occasionally reshuffles this — look for "OAuth applications" or "Create
   application").
2. Fill in:
   - **Application name:** `Zac Phoenix Agents`
   - **Developer name:** your name
   - **Developer URL / icon:** optional
   - **Callback URLs (redirect URIs):** add exactly
     `http://localhost:8787/callback`
     *(this must match the script's redirect URI character-for-character)*
   - **Public:** leave **off** (this app is only for your workspace)
   - **Webhooks:** optional; leave off for now
3. Save. Linear shows you a **Client ID** and **Client secret** — copy both.
   Treat the secret like a password.

## Step 2 — Mint an app token (actor=app)

From this folder, run the helper script with your credentials:

```bash
cd "Linear System/scripts"
LINEAR_CLIENT_ID=<client-id> LINEAR_CLIENT_SECRET=<client-secret> \
  node linear-app-token.mjs
```

The script (Node 18+, no install needed):

1. Prints an **authorize URL** — open it in your browser and click **Approve**.
2. Catches the redirect on `http://localhost:8787/callback`.
3. Exchanges the code and prints an **app access token** (issued with
   `actor=app`, so writes are attributed to the app).

Copy that token. **Do not commit it.** Store it as a secret, e.g.:

```bash
# in your shell profile or a gitignored .env the MCP reads
export LINEAR_APP_TOKEN=lin_oauth_xxx...
```

## Step 3 — Point a self-hosted MCP at the app token

> ⚠️ The **hosted/stock Linear MCP uses your personal OAuth** and cannot be
> re-identified. To act as the app you must run a **self-hosted Linear MCP** that
> reads a token from the environment.

1. Choose a self-hostable Linear MCP that accepts a token via env (e.g. a
   `LINEAR_API_KEY` / `LINEAR_TOKEN` variable). This is also the natural home
   for the three custom fixes in
   [`../08-linear-mcp-setup.md`](../08-linear-mcp-setup.md) (diff-only
   description edits, full-context `get_issue`).
2. Set its token env var to your `LINEAR_APP_TOKEN`.
   - Linear's GraphQL API accepts OAuth tokens as `Authorization: Bearer
     <token>`. If your MCP was written for personal API keys (which use a raw
     `Authorization: <key>` header), make sure it sends the **`Bearer `** prefix
     for OAuth tokens, or the requests will 401.
3. Register that MCP in **each** harness (Claude Code, Codex, Cursor,
   Antigravity) in place of the stock Linear MCP.

## Step 4 — Verify identity

1. Have an agent create a test comment or assign a throwaway issue to you.
2. Confirm in Linear that:
   - the action is attributed to **Zac Phoenix Agents** (app badge), not to you,
     and
   - **you received a notification** for the assignment.
3. Delete the test artifacts.

When both are true, agent identity is working. Keep your **personal** Linear
login for your own use on laptop + mobile — only the *agents* use the app token.

---

## Token lifetime & rotation

- Linear OAuth access tokens are long-lived, but if a token is ever leaked or
  you rotate the client secret, **re-run Step 2** to mint a fresh one and update
  the secret your MCP reads.
- If you revoke the app in Linear (*Settings → API → OAuth applications*), all
  its tokens stop working immediately — a clean kill switch for the whole fleet.

## Simpler fallback (costs a seat)

If you don't want to run a self-hosted MCP yet, you can invite a **dedicated bot
member** (e.g. `agents@yourdomain`), generate that user's **Personal API key**
(*Settings → API → Personal API keys*), and point the MCP at it. Agents then act
as that bot user. It works in one minute, but the extra member **consumes a paid
seat** — which is why `actor=app` above is preferred.
