# 07 — The human escalation standard

> "Agents are notoriously bad at assigning work to humans, because they have the
> curse of knowledge." — @enginoid

When an agent genuinely needs you, *how* it asks matters enormously. Done badly,
escalations turn you back into a full-time unblocking service — which defeats
the whole quality-of-life purpose. This standard fixes that.

## The problems it solves

Left unguided, agents escalate badly:

- **Curse of knowledge.** They assume you share their mental state — that you
  know exactly what "needing this to deploy the component quality ratchet"
  means. You don't.
- **Fifteen-minute tasks disguised as two-minute ones.** They say "add a GitHub
  app" instead of giving the exact steps and configuration, so a trivial action
  balloons into a research project for you.

Note the author's real-world observation: much of the remaining human work is
**access control** — creating accounts, moving secrets from one place to
another. Optimize escalations for exactly that kind of work.

## The standard (what every escalation must do)

Prompt agents to write escalations assuming the human is **very busy, really not
in the headspace, and knows very little** about the code, the problem, or why
they're even involved. Concretely:

1. **Assume zero context.** Explain what you need and why in plain language, as
   if the reader has never seen this code. No internal jargon, no project-
   specific shorthand.
2. **Give exact instructions, not tasks.** Not "add a GitHub app" but the precise
   steps, values, and configuration. If it can be a script, **write the script**
   so the human just runs it.
3. **Make it two minutes, not fifteen.** Go out of your way to let the human act
   quickly without thinking. Pre-fill everything you can.
4. **State the exact unblock condition.** What, precisely, will let work resume?
   (e.g. "paste the token into `.env` as `STRIPE_KEY=` and reply done".)
5. **Keep everything else moving.** Ensure all other unblocked work proceeds
   optimistically, so when the human resolves the escalation there's a **minimal
   amount of work left** to finish the task.

## Escalation = Blocked + formal request

An escalation is not a chat message. It is:

- The ticket moved to the **Blocked** status.
- A **formal escalation** written to this standard, attached to the ticket and
  assigned to you (as *you*, because the agent has its own identity — see
  [08](08-linear-mcp-setup.md), so notifications actually reach you).

Before escalating, the agent must first check: **can I do this myself?** (See
the false-positive note in [06](06-agent-session-lifecycle.md) — e.g. deploying
a tool to the MCP server rather than asking you to.)

## The escalation template

Full copy-paste version: [`prompts/human-escalation.md`](prompts/human-escalation.md).

```markdown
## Human escalation: <one line, plain English, what you need>

**Estimated time for you:** <target: ≤2 minutes>

### What I need you to do
1. <exact step>
2. <exact step>
<or: "Run this script: `./scripts/unblock-x.sh` — it does everything.">

### Why (30-second version)
<Plain-language reason. No jargon. Assume you've never seen this code.>

### Exact values / config
<Paste literal values, env var names, URLs, account names — everything needed.>

### How work resumes
When you've done the above, <exact condition>. Everything else on this batch is
already proceeding; only this step is outstanding.
```

## Reviewer/author checklist for escalations

Add this to [`templates/agent-rules.md`](templates/agent-rules.md):

```
Before raising a human escalation:
- Confirm you actually cannot do it yourself (tools, deploys, config you can
  change count as "yourself").
- Rewrite any task-shaped ask ("add a GitHub app") into exact steps or a script.
- Assume the human is busy and context-free. Strip all jargon.
- State the precise unblock condition.
- Make sure all other unblocked work in this batch keeps going.
- Move the ticket to the Blocked status and assign the escalation to the human.
```
