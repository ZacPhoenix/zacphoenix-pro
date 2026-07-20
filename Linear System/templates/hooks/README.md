# Hooks

> ⚠️ **These are an admitted hack.** Because the system runs across multiple
> harnesses without a clean API to invoke agents, hooks are how you *force*
> completion instead of relying on a real workflow engine. The article's author
> calls the agent-session tracking "deeply disturbing" and plans to replace it
> with a proper state machine. Use these because they work today; see the
> roadmap in [`../../08-linear-mcp-setup.md`](../../08-linear-mcp-setup.md).

Hooks are the **backstop** for the rules in
[`../agent-rules.md`](../agent-rules.md). Prompts tell the agent what to do;
hooks refuse to let it stop early.

These are written as **harness-agnostic pseudo-logic** so you can implement each
one wherever your harness supports interception (Claude Code hooks, a shell
wrapper, a git pre-push hook, or inside your custom Linear MCP). Wire each to the
event in its heading.

| Hook | Purpose |
|------|---------|
| [`block-askuser.md`](block-askuser.md) | Stop agents stalling on questions mid-batch |
| [`require-session.md`](require-session.md) | No work without a registered agent session |
| [`verify-checkboxes.md`](verify-checkboxes.md) | No close while a Verification box is unchecked |
| [`require-merged-pr.md`](require-merged-pr.md) | No close without a merged + deployed PR |
| [`session-closeout.md`](session-closeout.md) | Session can't complete until postconditions are met |

## Where to enforce

- **Description/checkbox/PR rules** → best enforced in your **custom Linear MCP**
  (it sees every ticket mutation). See
  [`../../08-linear-mcp-setup.md`](../../08-linear-mcp-setup.md).
- **AskUser blocking** → harness-level hook (e.g. Claude Code's hook config).
- **Session lifecycle** → wherever you store agent-session records (a Sessions
  project in Linear, or an external store).
