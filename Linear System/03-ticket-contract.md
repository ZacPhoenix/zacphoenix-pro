# 03 — The ticket contract (formatting tickets for agents)

> "The ticket is the contract between me and the agent, kind of like a plan, but
> to make them maximally readable to humans, they all have a 'Goal', 'Why' and
> 'Outcomes' section." — @enginoid

Every ticket is a **contract** between you and the agent. It is optimized to be
read by a *human* first — so that you can remember exactly what the ticket is
about — and that same clarity gives the agent a good shot at solving the real
need.

## The five sections

| Section | Written by | Purpose |
|---------|-----------|---------|
| **Goal** | You / intake | The target state, in one or two sentences. What is true when this is done? |
| **Why** | You / intake | The reason it matters. Context the agent needs to make good calls. |
| **Outcomes** | You / intake | Observable results that define "done" — phrased as end states, not steps. |
| **Implementation approach** | *Usually you* | Optional guidance on *how*, injected only when you have a specific opinion. |
| **Verifications** | Ticket-authoring agent | The minimal testing procedure: Automated / Manual / Visual checks (see [04](04-verification-checklists.md)). |

The copy-paste template is in
[`templates/ticket-template.md`](templates/ticket-template.md).

## Why "target state" instead of steps

> "Focusing on the target state avoids overly constraining the implementation
> approach. At the point of defining a ticket, the code is typically not deeply
> researched, so the exact approach is best left up to the implementing agent.
> As in human teams, implementer autonomy works great for agents if they have a
> clear standard to work to." — @enginoid

When you write a ticket, you usually haven't researched the code deeply. If you
over-specify the *how*, you lock the agent into an approach that may be wrong.
Instead:

- **Goal / Outcomes describe the world when it's done.** Leave the route open.
- **Implementation approach is opt-in.** Add it only when you actually have a
  reason to steer (a constraint, a gotcha, a preferred library). Otherwise, let
  the implementing agent choose — it has the code in front of it and you don't.

The pairing that makes autonomy safe is: **clear standard (Outcomes +
Verifications) + freedom on approach.** That's what works with human teams, and
it works with agents for the same reason.

## Writing good Outcomes

Outcomes are the acceptance criteria. Make them **observable** and **outcome
-shaped**:

- ✅ "A logged-out user visiting a gated page is redirected to sign-in and
  returned to the page afterward."
- ❌ "Add an auth guard middleware to the router." (that's a step, not an
  outcome)

If you can't tell from the outcome whether it happened by looking at the running
product, rewrite it.

## Keep descriptions stable — patch, don't overwrite

Agents like to keep the description current by rewriting it — good instinct, but
they tend to **stomp the Verification criteria and other details the reviewer
depends on.** So the rule is:

- **Direct edits to the description are banned.** Updates are sent as **diffs /
  patches** against the description, never wholesale replacements.

This is enforced at the MCP layer — see
[`08-linear-mcp-setup.md`](08-linear-mcp-setup.md). Add the corresponding rule
to [`templates/agent-rules.md`](templates/agent-rules.md):

```
Never replace a ticket description wholesale. To change a ticket, send a diff
that patches the specific section. Never touch the Verifications section unless
the ticket explicitly asks you to change scope — the reviewer depends on it.
```

## The template at a glance

```markdown
## Goal
<One or two sentences: the target state. What is true when this is done?>

## Why
<Why this matters. Context the implementer needs to make good decisions.>

## Outcomes
- <Observable end state 1>
- <Observable end state 2>

## Implementation approach
<Optional. Only fill this in when you have a specific opinion or constraint.
Otherwise write "Implementer's discretion.">

## Verifications
### Automated
- [ ] <test/check>
### Manual
- [ ] <manual step>
### Visual
- [ ] <what it should look like>
```
