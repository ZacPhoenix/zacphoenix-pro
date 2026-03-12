# Hexappic Platform

Hexappic is a local-first, artifact-driven micro-studio workspace.

## Purpose
This platform keeps research, planning, execution, and validation in one place with explicit cross-links.

## Structure
- `docs/` — KB docs and operating model artifacts
- `tickets/` — one markdown file per ticket
- `boards/kanban.md` — lightweight status board
- `scripts/hexappic.py` — local CLI for board/readout/validation
- `tests/gherkin/` — acceptance scenarios
- `reports/` — generated readouts

## Workflow
1. Research or product thinking becomes a doc.
2. PM creates or updates tickets.
3. Tickets link back to source docs.
4. Acceptance criteria are written in Gherkin.
5. Validation checks links and ticket hygiene.

## Commands
```bash
python3 projects/hexappic/platform/scripts/hexappic.py readout
python3 projects/hexappic/platform/scripts/hexappic.py validate
python3 projects/hexappic/platform/scripts/hexappic.py board
```
