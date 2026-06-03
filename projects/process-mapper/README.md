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
| M5 | Opportunity tagging + MVS research + sell-back framing in report | ✅ schema + report; research is LLM-driven via SKILL.md |
| M3 (transport) | Live MCP push/read | ⏳ logic ready; live wiring on the consultant's machine |
| M2 | Ingest (transcript/PDF/docx → IR) | ⏳ schema + SKILL.md stage; `ingest.ts` pending |
| M6 | End-to-end CLIs + Stage 5 review wiring | ⏳ pending |

The Excalidraw **transport** is deferred to a local machine (this engine was built in a
cloud session with no live Excalidraw MCP); the lossy/risky reconciliation **logic** is
fully unit-tested here. See `docs/ARCHITECTURE.md` → "Why this de-risking".

## Quickstart

```bash
cd engine
npm install
npm test          # 30 tests: metrics (hand-worked), scenarios, reconciliation
npm run sample    # renders ../samples/sample-report.html (mermaid inlined, offline)
```

Open `samples/sample-report.html` in a browser — it renders fully offline.

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
