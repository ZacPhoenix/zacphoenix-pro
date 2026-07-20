# Hook: require-session

**Fires on:** an agent starting work / first touching a ticket (moving it to In
Progress, committing, opening a PR).

**Why:** Every unit of work must be tied to a registered **agent session** so you
can track which agents are active and do root-cause analysis on slow or bad
results. (See [`../../06-agent-session-lifecycle.md`](../../06-agent-session-lifecycle.md).)

## Pseudo-logic

```
on work_start(ticket_id, agent):
    session = current_session(agent)
    if session is None or not session.registered:
        deny with message:
          "Register an agent session before working. Create a session record,
           tie it to this ticket (and any siblings you'll work), then proceed."
    else:
        link ticket_id -> session
        allow
```

## What "register a session" means

Create a session record containing:

- a session id,
- the agent identity + harness (Claude Code / Codex / Cursor / Antigravity),
- the ticket(s) it will work,
- start time.

Store it wherever you keep sessions (a Sessions project in Linear, or an external
store). The record is finalized by [`session-closeout.md`](session-closeout.md).
