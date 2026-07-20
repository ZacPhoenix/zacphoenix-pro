# 01 — Organize tickets into an outcome hierarchy

> "For my own clarity of what needs to be done (which is the whole point of
> Linear), I've set them up to maintain a hierarchy of tickets named after
> outcomes rather than the technical task." — @enginoid

## The problem this solves

Left alone, vanilla agents scatter tickets creatively across the backlog and
name them in cryptic engineering lingo like *"Fix gated-access exception in
owned-compute handler."* You lose the thread of what's actually being built and
why.

## The rule

Tickets are named after **outcomes**, and arranged as a **tree**. Each ticket
rolls up into a parent that describes the larger outcome it serves, all the way
up to a root outcome.

- **Bad (task-named):** "Fix gated-access exception in owned-compute handler"
- **Good (outcome-named):** "Users on shared compute can access gated features
  without errors"

Naming for the outcome does two things:

1. Gives *you* a high-level sense of progress at a glance.
2. Lets you push agents to **finish whole trees** of epics down to the root,
   instead of leaving a scatter of half-done technical fragments.

Unlike most humans, agents are genuinely happy to keep the backlog organized —
so lean into it and make backlog maintenance part of their job.

## How to set it up in Linear

Linear's native hierarchy is: **Initiative → Project → Issue → Sub-issue**.
Map the outcome tree onto it like this:

| Outcome-tree level | Linear object | Named after |
|--------------------|---------------|-------------|
| Root outcome / mission | **Initiative** | The end state for a whole area of the product |
| Major outcome / epic | **Project** (or a parent Issue) | A shippable outcome a user would notice |
| Outcome | **Issue** | A concrete change in the world, phrased as a result |
| Slice of an outcome | **Sub-issue** | A smaller result that rolls up to its parent |

Practical guidance:

- Use **parent/sub-issue relationships** (Linear supports arbitrarily nested
  sub-issues) as the tree edges. Every leaf ticket should have a path up to a
  root outcome.
- Prefer **Projects** for outcomes big enough to span many issues; use
  **parent issues** for smaller trees inside a project.
- Keep the tree shallow where you can. Depth is only worth it when it helps you
  see progress.

## Make the agents maintain the tree

Add this to your agent rules file (see
[`templates/agent-rules.md`](templates/agent-rules.md)):

```
When creating or updating tickets:
- Name every ticket after the OUTCOME (the target state in the world), never
  the technical task. "X now works for Y" not "Refactor the Z handler".
- Every ticket must have a parent that describes a larger outcome, up to a root
  outcome (Initiative/Project). Never leave a ticket parentless in the backlog.
- When you finish a leaf, check whether its parent outcome is now fully met. If
  the whole subtree is done, propose closing the parent too — finish trees down
  to the root.
- Do not invent cryptic engineering titles. If you catch yourself writing one,
  rename it to the outcome it serves.
```

## What "good" looks like

```
◆ Initiative: Self-serve billing is trustworthy and self-service
  └─ ▣ Project: Customers can manage their own subscription
       ├─ ◻ Customers can upgrade/downgrade without contacting support
       │    ├─ ◻ Plan change takes effect immediately with prorated charge
       │    └─ ◻ Plan change is reflected in the account UI within one refresh
       └─ ◻ Failed payments recover without losing the customer
            ├─ ◻ Customer is warned before the card is retried
            └─ ◻ A recovered payment restores full access automatically
```

You can look at that and know exactly what's being built and how close it is —
which is the whole point of Linear.
