---
name: cartographer
description: >-
  Turn a live consulting workshop into a sellable solution proposal. Ingest a
  workshop transcript + supporting docs, extract the client's business processes
  into a structured model (IR), project it onto a live Excalidraw canvas the room
  edits in real time, reconcile those edits back into the model, and generate a
  self-contained HTML report that documents current state, presents 2–3 future-state
  scenarios, and identifies concrete minimal-viable solutions the consultant can
  build and sell back (with ongoing support). Use when a consultant says they have a
  discovery-workshop transcript / process docs and want a process map + proposal.
---

# Cartographer — orchestration

You are the orchestrator. The **deterministic engine** (`../engine`, Node/TS) owns ALL
layout, metric math, the board↔IR diff, Mermaid, and report assembly. **You (the LLM)
only** read/extract, interpret freeform annotations, design scenarios, research
solutions + AI viability, and write report prose. **Never compute a metric or a layout
yourself** — always call the engine.

The IR (`../engine/src/ir.ts`) is the single source of truth. Validate it with the
engine after every change you make.

> Engine entry points (npm scripts in `../engine`): `npm run project -- <ir.json>`
> (→ `.excalidraw` + `.idmap.json`), `npm run reconcile -- <ir.json> <board.excalidraw>`
> (→ reconciled IR + `.proposals.json`), `npm run report -- <ir.json>` (→ offline HTML),
> `npm run sample`. Stage-1 ingest file-handling lives in `src/ingest.ts`. For the live
> canvas, drive the Excalidraw MCP tools directly (Stage 2/4). See `../docs/LOCAL_SETUP.md`.

## Stage 1 — Ingest (your judgment → IR)
1. Read every input file in the engagement folder. PDFs: read natively (document
   blocks — preserves tables). `.docx`: convert to text first (`engine` uses `mammoth`;
   `pandoc` if available). Transcript: read directly.
2. Extract the current-state value stream(s) into IR JSON per `ir.ts` (§8):
   processes → steps (with role, description) → flows; capture pain points.
3. For metrics: use ONLY numbers stated in the source. Where a metric is not stated,
   mark it in `metrics.estimated[]` rather than inventing a precise number (FR-4).
4. Validate with the engine (`validateIR`). Fix referential issues before continuing.

## Stage 2 — Project (deterministic engine)
1. Run the engine projection (`projectIR`) to turn the IR into Excalidraw elements +
   the sidecar ID-map. Do not hand-place elements.
2. Push to the live canvas via the Excalidraw MCP (`batch_create_elements`). If no MCP
   is available, use `FileTransport` to write a `.excalidraw` file the consultant
   imports. Surface the board URL / file path to the consultant.

## Stage 3 — Workshop (humans; you wait)
The consultant and room edit the live board (move, retime, annotate with sticky notes,
add/remove steps, rewire). Real-time sync is native to Excalidraw — you do nothing here
except be ready to reconcile when asked. **Never run multi-agent / dynamic-workflow runs
during the live session** (rate-limit risk in front of the client — §16.1).

## Stage 4 — Reconcile (engine diff + your interpretation)
1. Read the board back (`export_scene` via MCP, or read the exported `.excalidraw`).
2. Run the engine reconcile (`reconcileBoard`). It returns:
   - `trackedChanges` — deterministic moves/edits/deletes (engine-owned, trustworthy);
   - `untrackedAdditions` — human additions bucketed as pain-point / new-step / new-flow
     / note, with nearest step + resolved arrow endpoints — **for you to interpret**;
   - `deletedIrIds`.
3. For each untracked addition, propose how it maps to the IR (a pain point on the
   nearest step, a new step with inferred name/role, a new flow, or a note). Do **not**
   silently apply — collect proposals for Stage 5.
4. Apply the safe deterministic changes with `applyTrackedChanges` (bumps irVersion).
5. Generate/refresh **2–3 named scenarios** and **tagged opportunities** (Stage 4b).

## Stage 4b — Opportunities, MVS solution research & AI viability (your judgment)
For every opportunity (PRD §12 — the commercial core):
- Dual-tag it: `improvementType` (lean lens) AND `deliverableType` (sellable ladder).
- **Sweep the complexity ladder bottom-up and STOP at the lowest rung that solves it
  (MVS):** process-change → enable-owned-feature → off-the-shelf → no-code → integration
  → custom-Claude-build. Record `ladderRung` (must match the deliverable type).
- Assess **AI viability at every altitude** (`aiViability`): existing/SaaS AI feature →
  AI inside no-code → custom AI agent; state which MVS selects and why higher rungs are
  rejected (`rejectedAlternatives`).
- Cross-check off-the-shelf / AI-feature claims (web search where available); mark
  unverifiable claims as assumptions for the report appendix. Optionally use an offline
  dynamic workflow for this research — never during the live workshop (§16.1).
- Fill `estimatedImpact` (the engine turns these into ROI deltas — you do not compute
  the rolled-up numbers), `complexity`, `roiToComplexity`, and `sellBack` (build +
  ongoing support). Leave pricing blank (N5).
- Bundle opportunities into scenarios (`scenarios[]`).

## Stage 5 — Review (consultant safety valve) → Report
1. Present the reconciled IR + your addition proposals + scenarios + opportunities to
   the consultant to review/edit (editing the IR JSON directly is fine). Apply their
   confirmed changes. **Nothing reaches the report without this gate (FR-15).**
2. Validate the IR. Then render the report with the engine (`renderReport`, inlining
   `mermaid.min.js` for offline). Hand the consultant the single `.html` file.

The report (§13) MUST: document current state with baseline metrics + PCE; list pain
points; show each scenario with a before/after metrics table; and present Opportunities
**ranked by ROI-to-complexity**, each framed as a sell-back engagement (build + ongoing
support) with the MVS solution, its ladder rung, the AI-viability summary, the rejected
higher-complexity alternatives, quantified ROI, and pricing left blank. A report that
maps process but omits the sell-back framing has missed the point.

## Guardrails
- Local-first: client data stays on the consultant's machine/LAN (§14.5).
- Runs on the consultant's subscription as a Claude Code skill — never the metered API
  or subscription OAuth in a standalone app (§14.1, hard constraint).
- Determinism: if you ever find yourself computing a metric or placing a node, stop and
  call the engine instead (§7.2).
