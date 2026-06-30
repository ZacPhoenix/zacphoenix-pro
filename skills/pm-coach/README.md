# PM Coach — a self-coaching skill for Project Managers

Turns your meeting transcripts into honest, evidence-based coaching on how
you're performing as a PM — strengths, blindspots, agency, strategy, leadership,
and communication. Built on the *Reading List for Generalists* framework.

## Two ways to use it

### 1. As a Claude Code skill (recommended)
Drop the `pm-coach/` folder into your skills directory:

- **Project-level:** `.claude/skills/pm-coach/` in your work repo.
- **User-level:** `~/.claude/skills/pm-coach/` to have it everywhere.

Then in Claude Code, paste a transcript and say something like:
> "Here's a transcript from today's planning meeting — coach me on how I did."

The skill triggers automatically and runs the coaching framework.

### 2. As a plain prompt (anywhere — Claude.ai, work chat, etc.)
Copy everything in `SKILL.md` **below the `---` frontmatter block** (from
"# PM Coach" onward) and paste it as your message, then paste your
transcript(s) underneath. It works as a standalone prompt with no setup.

## Tips for best results
- **Tell it which speaker is you** (e.g. "I'm the speaker labeled 'PM'") so it
  coaches the right person.
- **Feed it several meetings over time** — it will track patterns and trends,
  which is where the real insight shows up.
- **Add one line of context** on what you were trying to achieve in the meeting;
  it sharpens the read.
- Use it **regularly** (e.g. weekly). The "3 experiments" section is designed to
  be run and reviewed against the next batch of transcripts.

## A note on privacy
Meeting transcripts may contain confidential or personal information. Only run
this through tools approved by your employer, and follow your workplace policy
on what can be shared with AI systems.
