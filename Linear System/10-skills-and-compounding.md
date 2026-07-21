# 10 — Skills-first and compounding engineering

This chapter is an add-on to the base system: how to run the factory
**skills-first** and make each batch **compound** so the factory improves itself.
It draws on two external ideas and fits them into the Linear loop:

- **Craft skills** — reusable how-to procedures for a domain (the archetype being
  **Matt Pocock–style** TypeScript/testing skills). They make each ticket *better
  executed*.
- **Compound engineering** (Every / Kieran Klaassen, Dan Shipper) — every unit of
  work also produces a reusable asset, so the *next* unit is cheaper. It makes the
  *factory* better, and maps directly onto the article's Toyota-Production-System /
  continuous-improvement thesis.

The Linear system is the orchestration layer; skills slot into specific stages of
it rather than replacing it.

## Two things called "skills"

| | Craft skill | Compound skill |
|---|---|---|
| Purpose | Do a domain task the right way | Capture a lesson so future work is cheaper |
| Example | "write a DB migration", a Pocock TS skill | [`capture-compound`](../.claude/skills/capture-compound/SKILL.md) |
| When it runs | During implementation | At closeout |
| Improves | This ticket | The factory |

Both live in [`.claude/skills/`](../.claude/skills/) and are versioned with the
code. See that folder's [README](../.claude/skills/README.md) for the `SKILL.md`
format and how skills trigger.

## Where skills plug into the loop

| Loop stage | Craft skills | Compound skills |
|---|---|---|
| Triage → intake ([02](02-triage-inbox.md)) | a ticket-authoring skill enforces the contract | — |
| Workstream planning ([05](05-batches-and-workstreams.md)) | — | planner asks: is there a skill for this? worth creating one? |
| Implementation | agent applies the matching craft skill **before** hand-rolling | — |
| Verification ([04](04-verification-checklists.md)) | a testing skill authors the checks | — |
| Closeout ([06](06-agent-session-lifecycle.md)) | — | agent captures any reusable pattern as a new/updated skill |

## "Skills-first" is an ordering rule

It's enforced in the agent rules (`CLAUDE.md` /
[`templates/agent-rules.md`](templates/agent-rules.md)):

> Before hand-rolling logic, look for a skill that covers the task and apply it.
> Only write bespoke code when no skill fits.

Three things make it real:

1. **Skills live in the repo** (`.claude/skills/`), so every Claude Code
   workstream sees the same set.
2. **The ticket's Implementation-approach section** can name the skill to use —
   that's exactly what that section is for (guidance without over-constraining;
   see [03](03-ticket-contract.md)).
3. **The workstream prompt** reminds the agent to consult skills first (see
   [`prompts/workstream-update.md`](prompts/workstream-update.md)).

## The compound step (the real unlock)

One clause bolted onto the **completion contract** ([06](06-agent-session-lifecycle.md)):

> Before closeout: if this ticket revealed a reusable pattern, capture it as a
> skill (or a `CLAUDE.md` rule / verification pattern) and commit it. Prefer
> improving an existing skill over adding a new one.

Now every batch doesn't just ship tickets — it **grows the skill library**, and
next week's tickets are faster. The [`capture-compound`](../.claude/skills/capture-compound/SKILL.md)
skill is the concrete procedure for this step. When an improvement is bigger than
a quick capture, make it a **Foundation** ticket named for the outcome ("the
factory can now do X") so it shows up in the outcome tree instead of being lost.

## Installing the Pocock (and other craft) skills

1. Create a folder per skill: `.claude/skills/<skill-name>/SKILL.md`.
2. Paste/adapt the instructions; keep `name`/`description` sharp so it triggers.
3. Commit it.

If a skill ships as a plugin/marketplace item, install it via the harness's
mechanism instead; if it's just a `SKILL.md`, copy the folder in.

## The multi-harness caveat

`SKILL.md` is Claude Code's format. Codex / Cursor / Antigravity have their own
rules/skills mechanisms, so a skills-first workflow is cleanest in **Claude Code**
workstreams. For the others, translate the skill into their native rule format or
route skill-heavy tickets to Claude Code. This is the same "multiple harnesses, no
clean API" tax the rest of the system already pays ([08](08-linear-mcp-setup.md),
[06](06-agent-session-lifecycle.md)).

## How this changes your day

- You **invest once** in a skill and every future ticket that matches it gets
  faster and more consistent — your review burden drops because output is more
  uniform.
- The factory's capability is now an **asset that visibly grows** (the skills
  directory) rather than living only in your head.
- Combined with metrics later ([08](08-linear-mcp-setup.md) roadmap), you can see
  which skills move completion/defect rates and double down — continuous
  improvement with a feedback loop.
