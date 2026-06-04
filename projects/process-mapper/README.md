# Cartographer

A Claude Code skill that turns a live consulting workshop into a sellable solution
proposal. Ingest a transcript + docs → extract processes into an internal model (IR) →
project onto a live Excalidraw canvas the room edits → reconcile edits back → generate a
self-contained HTML report that documents current state, shows 2–3 future-state
scenarios, and identifies concrete **minimal-viable** solutions the consultant can build
and maintain for recurring revenue.

**`PRD.md` is the source of truth.** Start there. Then `docs/ARCHITECTURE.md` and
`docs/DECISIONS.md`.

## Status

| Milestone | What | State |
|---|---|---|
| M1 | IR + metrics + scenarios + Mermaid + HTML report (standalone) | ✅ done, tested |
| M4-logic | Excalidraw round-trip **logic** (project + reconcile diff) vs fixtures | ✅ done, tested |
| M5 | Opportunity tagging + MVS research + sell-back framing in report | ✅ schema + report contract tested; research is LLM-driven via SKILL.md |
| M2 | Ingest file-handling (transcript/PDF/docx) | ✅ `ingest.ts` done, tested; LLM extraction via SKILL.md |
| M6 | Offline pipeline CLIs (`project`/`reconcile`/`report`) | ✅ done, verified end-to-end |
| M3 (transport) | Live MCP push/read | ✅ done, smoke-tested live (2026-06-04) |

All milestones complete. 44/44 tests passing. Next: end-to-end pilot on a real workshop transcript — see `docs/PILOT_PLAYBOOK.md`.

## Quickstart

```bash
cd engine
npm install
npm test          # metrics (hand-worked), scenarios, reconciliation, ingest, report
npm run sample    # renders ../samples/sample-report.html (mermaid inlined, offline)
```

Open `samples/sample-report.html` in a browser — it renders fully offline.

Offline pipeline (no MCP needed):

```bash
npm run project   -- ../samples/sample-ir.json   # → .excalidraw scene + .idmap.json
# (consultant edits the scene in Excalidraw, exports it back)
npm run reconcile -- ../samples/sample-ir.json <edited>.excalidraw
npm run report    -- <reconciled>.json           # → offline .report.html
```

## Layout

```
PRD.md                  source of truth
docs/                   ARCHITECTURE.md, DECISIONS.md
skill/SKILL.md          orchestration (the only place LLM judgment enters)
engine/src/             deterministic Node/TS: ir, metrics, scenarios, mermaid,
                        report, excalidraw (round-trip), excalidraw-mcp, idmap
engine/test/            unit tests (metrics + reconciliation = correctness core)
samples/                worked example: transcript, IR, rendered report
```
