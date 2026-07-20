# Hook: verify-checkboxes

**Fires on:** a request to move a ticket to **Done / Closed**.

**Why:** The core anti-cheating / anti-haste gate. An agent is blocked from
closing a ticket while any Verification checkbox is unchecked. (See
[`../../04-verification-checklists.md`](../../04-verification-checklists.md).)

## Pseudo-logic

```
on ticket_transition(ticket_id, to_status):
    if to_status not in {Done, Closed}:
        allow; return

    ticket = get_issue(ticket_id)          # full context (see MCP fix 3)
    verifs = parse_verifications(ticket.description)

    # 1) No unchecked boxes may remain.
    if verifs.has_unchecked():             # any "- [ ]" under Automated/Manual/Visual
        deny with message:
          "Cannot close: unchecked Verification items remain. Complete and tick
           every Automated, Manual, and Visual box, or mark the ticket Blocked
           and escalate."

    # 2) Boxes must not have been silently deleted.
    #    Compare against the last known count to catch checkbox removal.
    if verifs.total_count < ticket.baseline_verification_count:
        deny with message:
          "Cannot close: the Verifications section has fewer checkboxes than
           before. Do not delete checks to close a ticket. Restore them and
           satisfy each, or request a scope change."

    # 3) The section must exist at all.
    if verifs is empty:
        deny with message:
          "Cannot close: no Verifications section. Author the minimal
           verification procedure and satisfy it before closing."

    allow
```

## Notes

- **Honest limitation:** an agent *can* still tick a box it didn't really verify.
  In practice they don't, because it takes more dishonesty than a bare "I'm
  done." This hook raises the bar; it isn't a proof.
- Pair with the **diff-only description rule** (MCP fix 1,
  [`../../08-linear-mcp-setup.md`](../../08-linear-mcp-setup.md)) so the
  Verifications section can't be wholesale-overwritten in the first place.
- `baseline_verification_count` = the checkbox count captured when the ticket was
  authored/last legitimately edited. Store it in ticket metadata or your MCP.
