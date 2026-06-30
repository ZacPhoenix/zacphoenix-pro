# PM Coach v2.0 — a self-coaching skill for Project Managers

Turns your meeting transcripts into honest, evidence-based coaching on how
you're performing as a PM — strengths, blindspots, agency, strategy, execution,
risk management, and communication.

**What's new in v2.0:**
- A dedicated **Risk Up Front (RUF)** lens — coaching against the four
  principles (accountability, transparency, integrity, commitment), the
  **DKDK** unknown-unknowns ritual, **CEI** risk format, commitment
  interrogation, and front-loaded urgency.
- A **detection layer** that listens for specific hedge phrases and
  status/concern mismatches (weak commitments, watermelon status, false
  consensus, the shit funnel, the 99% illusion) as raw evidence.
- An expanded **execution lens** with high-velocity practitioner tactics
  (owner+date+artifact in real time, fast OODA loops, decision velocity / 70%
  rule, calibrated delegation, blocker-hunting).
- A named **anti-pattern watchlist** the coach scans for and calls out.

Built on three foundations: the *Reading List for Generalists* (disposition &
strategy), the **Risk Up Front** methodology (Josephs & Rubenstein), and modern
practitioner wisdom from high-velocity tech orgs.

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

## Sources behind the framework
- **Risk Up Front:** *Risk Up Front: Managing Projects in a Complex World* —
  Adam Josephs & Brad Rubenstein (2018); [riskupfront.com](https://riskupfront.com/).
- **Execution / high-velocity practice:** Ben Kuhn, [How I've run major
  projects](https://www.benkuhn.net/pjm/); Pragmatic Engineer, [How Big Tech
  runs tech projects](https://newsletter.pragmaticengineer.com/p/project-management-in-tech)
  and [What TPMs do](https://blog.pragmaticengineer.com/what-do-tpms-do/);
  Lenny's Newsletter; [GitLab DRI / decision velocity](https://handbook.gitlab.com/handbook/people-group/directly-responsible-individuals/);
  Tomasz Tunguz on [deciding with speed](https://tomtunguz.com/decisiveness/);
  Klein's [pre-mortem](https://hbr.org/2007/09/performing-a-project-premortem).
- **Anti-patterns / failure modes:** Jade Rubick, [PM anti-patterns](https://www.rubick.com/three-anti-patterns-for-project-management/);
  LeadDev, [management anti-patterns](https://leaddev.com/communication/five-management-anti-patterns-and-why-they-happen);
  Marty Cagan, [Product management theater](https://www.lennysnewsletter.com/p/product-management-theater-marty);
  [Watermelon status](https://www.leadinginproduct.com/p/watermelon-status);
  Camille Fournier, *The Manager's Path*.
- **Disposition & strategy:** *A Reading List for Generalists* (Dylan Bowman) —
  see `generalist-reading-list-summary.md` in this repo.
