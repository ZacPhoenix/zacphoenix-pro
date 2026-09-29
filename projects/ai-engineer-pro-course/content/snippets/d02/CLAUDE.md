@AGENTS.md

## Claude Code only
- Skills: edit the real folder in `.agents/skills/`. The entries in `.claude/skills/` are symlinks to it.
- Research: delegate web research to the `researcher` subagent (`@agent-researcher`).
  Keep its report in this session, not its raw search results.
- Plan first (Shift+Tab to plan mode) when a change touches more than three files,
  or anything under `.claude/`, `.codex/`, or `.agents/`.
- Permissions live in `.claude/settings.json`. A denied command is policy:
  report it instead of looking for another route.
