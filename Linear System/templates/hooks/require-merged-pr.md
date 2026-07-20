# Hook: require-merged-pr

**Fires on:** a request to move a ticket to **Done / Closed**.

**Why:** Agents stop before the job is truly done — before committing, before a
PR, before merge, before deploy. "Done" requires a **merged and deployed** PR
with all code pushed. (See
[`../../06-agent-session-lifecycle.md`](../../06-agent-session-lifecycle.md).)

## Pseudo-logic

```
on ticket_transition(ticket_id, to_status):
    if to_status not in {Done, Closed}:
        allow; return

    prs = linked_prs(ticket_id)

    if prs is empty:
        deny: "Cannot close: no PR linked. Push all code into a PR and link it."

    if not any(pr.merged for pr in prs):
        deny: "Cannot close: no linked PR is merged. Get the PR reviewed, passing
               tests, merged, and deployed before closing."

    if not all(pr.deployed for pr in prs where pr.merged):
        deny: "Cannot close: merged code is not yet deployed. Ensure the change
               is deployed before closing."

    if has_uncommitted_or_unpushed_changes():
        deny: "Cannot close: there is code not pushed into a PR. Push everything
               first."

    allow
```

## Notes

- "Deployed" depends on your pipeline; wire the `pr.deployed` check to whatever
  signals a successful deploy (CI status, a deploy webhook, an environment tag).
- If deploy is manual/gated in your setup, this is a legitimate place for a
  **human escalation** rather than a hard block — the agent marks Blocked and
  hands you the exact deploy step.
