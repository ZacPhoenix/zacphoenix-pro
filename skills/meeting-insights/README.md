# Meeting Insights — turn any meeting transcript into sharp, useful insight

Paste a business meeting transcript (any mix of roles) and get back a candid,
plain-language read on the meeting itself: **was it worth holding, what actually
got decided, what was left open, how the room really worked, and what you might
have missed** — plus a few concrete ways to make the next one better.

Built for anyone in a business meeting — not just project managers — and friendly
to people new to using AI for this. No jargon, no homework.

## What makes it different
- **It's about the meeting, not a review of you.** The focus is value, decisions,
  and group dynamics.
- **It never calls anyone out by name.** Feedback is about patterns and behaviors,
  described by role — so it's safe to read and share.
- **It surfaces the non-obvious.** A dedicated "what you might have missed"
  section: the question nobody answered, the decision everyone assumed was made,
  the topic that ate 20 minutes and shouldn't have.
- **It tells you the truth about value** — including whether the meeting could
  have been a message instead.

## Two ways to use it

### 1. As a Claude Code skill (recommended)
Drop the `meeting-insights/` folder into your skills directory:
- **Project-level:** `.claude/skills/meeting-insights/`
- **User-level:** `~/.claude/skills/meeting-insights/` (available everywhere)

Then paste a transcript and say something like:
> "Here's the transcript from this morning's meeting — how useful was it, and
> what should we do differently?"

### 2. As a plain prompt (anywhere — Claude.ai, work chat, etc.)
Copy everything in `SKILL.md` **below the `---` frontmatter block** (from
"# Meeting Insights" onward), paste it as your message, then paste the
transcript underneath. No setup needed.

## Tips for best results
- **One meeting or many** — paste several transcripts and ask for trends over
  time; it will track recurring open loops and whether meetings are improving.
- **One line of context helps** — what the meeting was supposed to achieve — but
  it works fine with none; it will infer the purpose.
- **Great for after recurring meetings** (weekly staff, project syncs, planning)
  to catch drift, slipping action items, and status-for-show.

## A note on privacy
Meeting transcripts often contain confidential or personal information. Only run
this through tools approved by your employer, and follow your workplace policy on
what can be shared with AI systems.

---

*Companion skill: `pm-coach` — same evidence-based engine, but a private
performance coach for an individual project manager rather than a read on the
meeting as a whole.*
