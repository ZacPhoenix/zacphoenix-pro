# Hook: session-closeout

**Fires on:** an agent requesting to mark its **agent session Complete**.

**Why:** The session is the unit you measure and audit. It can't complete until
every postcondition is satisfied and a transcript is uploaded. (See
[`../../06-agent-session-lifecycle.md`](../../06-agent-session-lifecycle.md).)

## Pseudo-logic

```
on session_complete_request(session):
    tickets = session.tickets

    # Every ticket must be resolved one way or the other.
    for t in tickets:
        if t.status not in {Done, Closed, Blocked}:
            deny: f"Cannot complete session: ticket {t.id} is still {t.status}.
                    Close it (merged PR + all boxes ticked) or mark it Blocked
                    with a formal escalation."

    # Done tickets must have passed the other gates (defense in depth).
    for t in tickets where t.status in {Done, Closed}:
        assert verify_checkboxes(t)      # see verify-checkboxes.md
        assert require_merged_pr(t)      # see require-merged-pr.md

    # Transcript is mandatory for root-cause analysis.
    if session.transcript is missing:
        deny: "Cannot complete session: upload the session transcript first."

    session.status = Complete
    allow
```

## The interactive waiver

If the session worked **no ticket** (e.g. you asked codebase questions unrelated
to any ticket), the agent may request a **waiver** instead of formal closeout:

```
on waiver_request(session, reason):
    if session.tickets is empty:
        record waiver with reason
        session.status = Complete (waived)
        allow
    else:
        deny: "Waiver only applies to sessions with no worked ticket. This
               session has tickets; follow formal closeout."
```

## The transcript-upload pain

The agent has to locate its transcript in a **harness-specific location** and
upload it. This per-harness rummaging is the ugliest part of the current
implementation and the main thing the future API-based/workflow version removes.
Document, per harness, exactly where the transcript lives so agents don't guess:

- Claude Code: `<path>`
- Codex: `<path>`
- Cursor: `<path>`
- Antigravity: `<path>`
