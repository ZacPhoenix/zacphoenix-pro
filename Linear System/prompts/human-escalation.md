# Prompt: human escalation

The format an agent must use when it genuinely needs a human. Written to the
standard in [`../07-human-escalation-standard.md`](../07-human-escalation-standard.md):
assume the human is busy, context-free, and wants to spend ≤2 minutes.

The agent should: first confirm it can't do the task itself → mark the ticket
**Blocked** → post this escalation → assign it to the human (as the agent's own
identity, so the human is notified).

---

## Template

```markdown
## Human escalation: <one line, plain English, exactly what you need>

**Estimated time for you:** <target: ≤2 minutes>

### What I need you to do
1. <exact step — literal values, not "configure X">
2. <exact step>
<or, preferred: "Run this script: `./scripts/unblock-<x>.sh` — it does
everything. It will prompt you for <the one secret> and nothing else.">

### Why (30-second version)
<Plain-language reason. No jargon, no project shorthand. Assume you have never
seen this code and don't know why you're involved.>

### Exact values / config
<Everything needed, literally: env var names, URLs, account names, the app to
create and its exact settings. Leave nothing for the human to look up or decide.>

### How work resumes
When you've done the above, <exact unblock condition — e.g. "paste the value into
`.env` as `STRIPE_KEY=` and reply 'done' on this ticket">.
Everything else on this batch is already proceeding; only this step is
outstanding, so this unblocks the whole workstream.
```

## Anti-patterns (do NOT do these)

- ❌ "Add a GitHub app." → ✅ Give the exact app name, permissions, callback URL,
  and where to paste the resulting credentials.
- ❌ "Set up the deploy secret." → ✅ "Create a repo secret named `DEPLOY_TOKEN`
  with the value from <where>; here's the gh command: `gh secret set DEPLOY_TOKEN`."
- ❌ Assuming the human knows what "the component quality ratchet" is. → ✅ One
  plain sentence of context.
- ❌ Leaving other work stalled behind this. → ✅ Keep all other unblocked work
  moving so minimal work remains after the human acts.
