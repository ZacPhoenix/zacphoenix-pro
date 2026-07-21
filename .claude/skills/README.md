# Skills

Reusable, versioned procedures the agents apply while working tickets. This is
the **skills-first** layer of the Linear software factory: before hand-rolling
logic, an agent looks for a skill that covers the task and applies it. See the
pattern in
[`../../Linear System/10-skills-and-compounding.md`](../../Linear%20System/10-skills-and-compounding.md).

## Two kinds of skill

- **Craft skills** — how to do a domain task well (e.g. TypeScript patterns,
  testing, migrations). This is where **Matt Pocock–style** skills go. They make
  each ticket *better executed*.
- **Compound skills** — the meta-loop: capture what a ticket taught you so the
  next ticket is cheaper (e.g. [`capture-compound/`](capture-compound/)). They
  make the *factory* better.

## Structure

Each skill is a folder containing a `SKILL.md` with YAML frontmatter:

```markdown
---
name: my-skill
description: One or two sentences on WHAT it does and WHEN to use it. This is
  what triggers the skill, so be specific about the situation it applies to.
---

# My skill

Step-by-step instructions the agent follows when this skill triggers.
Keep them concrete. Reference any scripts/resources in this folder by relative
path.
```

Optional: put helper scripts, templates, or reference docs in the same folder and
point to them from `SKILL.md`.

## How skills trigger

- **Auto (model-invoked):** the harness matches the task against each skill's
  `description` and loads the matching skill's instructions into context. Good
  descriptions = good triggering. Write the description around the *situation*,
  not just the topic.
- **Explicit (user-invoked):** run `/my-skill` by name.

## Adding craft skills (e.g. the Pocock skills)

1. Create a folder here per skill: `.claude/skills/<skill-name>/SKILL.md`.
2. Paste/adapt the skill's instructions; keep the `name`/`description` sharp.
3. Commit it — skills are versioned with the code so every Claude Code workstream
   sees the same set.

Drop each Pocock skill in as its own folder. If it ships as a plugin/marketplace
skill, install it per the harness's mechanism; if it's just a `SKILL.md`, copy
the folder in here.

## Multi-harness note

`SKILL.md` is Claude Code's format. Codex / Cursor / Antigravity have their own
rules/skills mechanisms, so a skills-first workflow is cleanest in **Claude Code**
workstreams. For the other harnesses, translate the skill into their native rule
format, or route skill-heavy tickets to Claude Code. (Same "multiple harnesses,
no clean API" tax the rest of the system already pays.)

## Conventions

- **Name for the task, not the tool.** `write-migration`, not `postgres-helper`.
- **Small and composable** beats one giant skill.
- **Improve before you add.** If a skill nearly fits, extend it rather than
  creating a near-duplicate (this is the compound discipline).
