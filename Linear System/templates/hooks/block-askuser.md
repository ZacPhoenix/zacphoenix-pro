# Hook: block-askuser

**Fires on:** the agent attempting to ask the user a question / pause for input
during an unsupervised batch (e.g. Claude Code's `AskUser` hook).

**Why:** Without this, an agent asks a question after ~15 minutes and then does
nothing for two hours — killing the unsupervised batch and your quality of life.
(See [`../../05-batches-and-workstreams.md`](../../05-batches-and-workstreams.md).)

**Behavior:** block the question. Force the agent to either proceed on its own
judgment or raise a **formal escalation** (Blocked + escalation to standard).

## Pseudo-logic

```
on ask_user_attempt(question):
    # No human is watching this batch. Do not allow a silent stall.
    deny with message:
      "This session is unsupervised. You may not pause for a question.
       Either:
         (a) make a reasonable decision and proceed, documenting it in the
             ticket, or
         (b) if you are genuinely blocked and cannot proceed without a human,
             mark the ticket Blocked and raise a formal human escalation
             (see the escalation standard).
       Do not stop and wait."
```

## Claude Code note

Configure this via the harness's hook mechanism so the AskUser tool is
intercepted/blocked for batch sessions. Keep an **interactive mode** where the
block is off, for when you *are* sitting with the agent.

## Tuning

If you see agents escalating for things they could do themselves (false
positives — e.g. "the MCP lacks tool X" when they could deploy it), tighten the
"can you do it yourself?" check in [`../agent-rules.md`](../agent-rules.md)
rather than loosening this hook.
