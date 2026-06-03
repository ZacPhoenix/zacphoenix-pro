# Design decisions (the 12 locked decisions — PRD §6)

These were settled during design and are **not relitigated** in v1. Each is built to.

1. **Deterministic layered engine.** Layout, metric math, diffing, and rendering are
   done by deterministic Node/TS code, never improvised by the LLM. Same IR in →
   identical output out. *Where:* `metrics.ts`, `scenarios.ts`, `mermaid.ts`,
   `report.ts`, the diff half of `excalidraw.ts`, `idmap.ts` — all pure, no LLM/clock/
   randomness. Proven by `projectIR` determinism + hand-worked metric tests.
2. **Architect-led workshops.** Operated by the consultant, designed around a
   facilitated workshop. *Where:* `skill/SKILL.md` orchestration; Stage 5 review valve.
3. **Own IR → Mermaid (report) and → Excalidraw (canvas).** The IR is the single source
   of truth; diagrams are projections. *Where:* `ir.ts` is the spine; `mermaid.ts` and
   `excalidraw.ts` are projections of it.
4. **Improvement + deliverable dual tagging.** Every opportunity carries an
   `improvementType` (lean lens) AND a `deliverableType` (sellable lens). *Where:*
   `Opportunity` in `ir.ts`; both required by the schema.
5. **Multi-process value stream.** Multiple interconnected processes; flows may cross
   processes. *Where:* `IR.processes[]`, `Flow.fromStepId/toStepId` may reference
   foreign steps; `referentialIssues` validates across all processes.
6. **Narrative + context files → LLM extraction.** Input is transcript + docs; Claude
   extracts. *Where:* `ingest.ts` + SKILL.md Stage 1 (M2).
7. **Classic VSM core metrics.** PT, WT, %C&A, Lead Time, PCE, Rolled %C&A. *Where:*
   `metrics.ts` (§11).
8. **2–3 pre-baked named scenarios, consultant-editable.** Curated bundles, not a live
   simulator. Metrics computed, not stored. *Where:* `Scenario` in `ir.ts`,
   `scenarios.ts`; Stage 5 review before report.
9. **Self-contained HTML report.** One `.html`, Mermaid inlined, offline-viewable.
   *Where:* `report.ts` + `cli/build-sample.ts` (inlines `mermaid.min.js`).
10. **Claude Code skill on the consultant's subscription.** Not a standalone app, not
    the metered API. *Where:* `skill/SKILL.md`; no API key anywhere in the engine.
11. **Live annotate-and-read-back canvas loop is core to v1.** *Where:* `excalidraw.ts`
    round-trip + `excalidraw-mcp.ts` transport; logic proven against fixtures.
12. **Excalidraw canvas + Node/TS engine.** *Where:* the entire `engine/` is Node/TS;
    Excalidraw is the live surface.

## The deterministic / judgment split (PRD §7.2 — sacred)

- **Claude (judgment) only:** reading transcripts & docs; extracting structure;
  interpreting freeform annotations; designing scenarios; proposing deliverable types &
  AI viability; writing report prose.
- **Engine (deterministic) only:** layout; all metric arithmetic; the board↔IR diff for
  tracked elements; Mermaid; HTML assembly. **No metric or layout is ever computed by
  the LLM.**

## Notable implementation choices (PRD §18 open questions)

- **Q1 (field names):** steps/flows nested per process; cross-process flows by foreign
  id reference. `StepMetrics.estimated[]` added for FR-4.
- **Q2 (label parsing):** parse only well-formed `PT/WT/%C&A` tokens deterministically;
  anything ambiguous goes to `unparsed[]` for Claude (`parseStepText`).
- **Q3 (scenarios):** up to 3, names chosen by Claude per client.
- **Q4 (branding):** neutral default CSS; `ReportOptions.brandCss` override hook.
- **Q5 (ID-map):** sidecar `idmap.ts` is the durable source of truth, PLUS `customData`
  when present — round-trip survives customData stripping (proven in `reconcile.test.ts`).
