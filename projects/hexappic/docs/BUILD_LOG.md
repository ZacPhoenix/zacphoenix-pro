# Hexappic Build Log

## 2026-03-12

### 01:40 CDT — Build resumed under artifact-first discipline
- Mission: Research proven indie iOS team operating models, define Hexappic operating model, build local tooling, validate with Gherkin tests.
- Constraint: No claims without artifacts, running service, tests, or commits.
- Canonical company setup:
  - CEO / Sponsor: Zac Phoenix
  - PM: Hex
  - Initial working assumption: PM + Dev + Research, add UX only if clearly value-add
- Existing assets confirmed:
  - `projects/hexappic/assets/logo.jpg`
  - `projects/hexappic/assets/logo-full.jpg`

### Current execution plan
1. Research proven patterns from successful indie iOS teams
2. Distill operating model and anti-patterns
3. Build local KB + ticketing platform
4. Link docs ↔ tickets
5. Validate with Gherkin scenarios
6. Deliver morning report

### 13:22 CDT — Phase 2 minimum viable platform implemented
- Created `projects/hexappic/platform/` with docs, tickets, board, reports, tests, and scripts
- Added local CLI: `platform/scripts/hexappic.py`
- Commands verified:
  - `board`
  - `readout`
  - `validate`
- Validation result: `Validation OK`
- Generated readout: `projects/hexappic/platform/reports/phase-2-readout.md`
- Starter tickets HX-001 through HX-003 marked done with linked evidence

### 13:46 CDT — Desktop cockpit app stub created and parked
- Built native macOS viewer app source: `projects/hexappic/HexappicDesktopApp.swift`
- Built desktop app bundle: `~/Desktop/Hexappic.app`
- Current capabilities:
  - Overview
  - Board
  - Readout
  - Operating Model
  - Workflow
  - Validate
  - Open Folder
- Current limitation: read-oriented cockpit, not yet an interactive operating surface
- Deferred by request while finishing the website first
- Next return point:
  1. replace plain text panes with card-based dashboard UI
  2. add ticket create/edit/move actions
  3. expose validation + evidence links more cleanly
