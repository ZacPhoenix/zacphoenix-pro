# Ticket template

Copy this into every ticket description. It is the **contract** between you and
the agent (see [`../03-ticket-contract.md`](../03-ticket-contract.md)). Name the
ticket after the **outcome**, not the task.

```markdown
## Goal
<One or two sentences describing the target state. What is true in the world
when this is done? Not the steps — the end state.>

## Why
<Why this matters. The context an implementer needs to make good decisions:
who's affected, what breaks without it, how it connects to a larger outcome.>

## Outcomes
- <Observable end state 1 — verifiable by looking at the running product>
- <Observable end state 2>
- <Observable end state 3>

## Implementation approach
<OPTIONAL. Fill this in ONLY when you have a specific opinion, constraint, or
gotcha to inject. Otherwise write "Implementer's discretion — choose the best
approach given the code." Do not over-constrain: the implementing agent has the
code in front of it and you probably don't.>

## Verifications
<Authored to the minimal-testing standard. An agent is BLOCKED from closing this
ticket while any box is unchecked. Do not delete boxes.>

### Automated
- [ ] <automated test/check that proves an Outcome>

### Manual
- [ ] <manual step a busy person can do in under 2 minutes; expected result>

### Visual
- [ ] <what it should look like; attach/compare a screenshot>
```

## Filled example

```markdown
## Goal
A logged-out user who opens a gated page is sent to sign-in and returned to that
exact page after authenticating.

## Why
Right now gated pages 500 for logged-out users, so shared links look broken and
we lose sign-ups from exactly the moment of highest intent.

## Outcomes
- Visiting any gated URL while logged out redirects to sign-in (no error page).
- After signing in, the user lands back on the originally requested URL.
- Already-authenticated users see the gated page unchanged.

## Implementation approach
Implementer's discretion. (Note: auth state is already available via the
existing session middleware — reuse it rather than adding a new dependency.)

## Verifications
### Automated
- [ ] e2e test: logged-out request to a gated route → 302 to /signin?next=…
- [ ] e2e test: completing sign-in redirects to the original URL
- [ ] unit test: authenticated request to a gated route passes through
### Manual
- [ ] In an incognito window, open a gated link, sign in, confirm you land on
      the original page.
### Visual
- [ ] The sign-in page shows the normal layout (no error banner); screenshot
      attached.
```
