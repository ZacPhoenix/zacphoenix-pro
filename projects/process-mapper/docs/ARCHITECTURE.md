# Architecture (PRD §7 + §10, expanded)

## The spine: IR as single source of truth

```
① INGEST    transcript + PDFs/Word  ──Claude──▶  IR (current-state value stream, JSON)
② PROJECT   IR ──engine (deterministic)──▶ Excalidraw elements ──MCP/file──▶ live canvas
                 (each element tagged with its IR id via customData + sidecar ID-map)
③ WORKSHOP  consultant + room edit the canvas live (move, annotate, rewire, retime)
④ RECONCILE read board back ──▶ deterministic diff on id-tagged elements
                              + Claude interprets untagged freeform additions
                              ──▶ updated IR + 2–3 named scenarios + tagged opportunities
⑤ REPORT    engine (deterministic) ──▶ Mermaid + VSM metric deltas ──▶ self-contained HTML
```

Stages 2–4 may loop (re-project a revised IR for another round of live editing).

## Module map (`engine/src/`)

| Module | Role | LLM? |
|---|---|---|
| `ir.ts` | IR types + zod schema + validate/load/save + lookups | no |
| `metrics.ts` | VSM metric math (§11), bottleneck flags, formatting | no |
| `scenarios.ts` | apply opportunity deltas → recompute rollups; rank opps | no |
| `mermaid.ts` | IR → Mermaid flowcharts (current + scenarios) | no |
| `report.ts` | Mermaid + metrics + opportunities → self-contained HTML (§13) | no |
| `excalidraw.ts` | IR ⇄ element JSON: project out + reconcile/diff back (§10) | no |
| `excalidraw-mcp.ts` | transport boundary: FileTransport (offline) + live MCP contract | no |
| `idmap.ts` | sidecar IR-id ↔ element-id map (§10.1) | no |
| `ingest.ts` | file handling: PDF passthrough, docx→text (§14.3) — M2 | via skill |
| `cli/build-sample.ts` | render the sample report (inlines mermaid) | no |

`SKILL.md` is the orchestrator and the *only* place Claude's judgment enters the
pipeline (extraction, annotation interpretation, scenario design, solution research,
prose). The engine is invoked by the skill as deterministic steps.

## The Excalidraw round-trip contract (§10 — the riskiest piece)

### Out: IR → Excalidraw (`projectIR`, deterministic)
- Each step → one rectangle carrying `customData {kind:"step", irId, irVersion}`.
- Each flow → one bound arrow carrying `customData {kind:"flow", irId}` with
  start/end bindings to the step elements.
- Each process → a frame. Bottleneck steps get a pain background (FR-8).
- Every element is recorded in a sidecar **ID-map** (durable even if customData is
  stripped on edit).

### Back: Excalidraw → IR (`reconcileBoard`, §10.2 three buckets)
1. **Tracked & matched** (customData or ID-map) → **deterministic**: position moved,
   text edited (parse `PT/WT/%C&A`; ambiguous → Claude), deleted.
2. **Untracked additions** (no id, human-added) → bucketed by heuristic
   (`pain-point` / `new-step` / `new-flow` / `note`) with nearest-step + resolved arrow
   endpoints, then handed to Claude (FR-12). **Proposed, never auto-applied.**
3. **Tracked but heavily mutated** → flagged `ambiguous` for the consultant.

`applyTrackedChanges` applies ONLY bucket-1 deterministic edits + deletions and bumps
`irVersion`. Buckets 2–3 flow through the **Stage 5 review safety valve** (FR-15) before
anything reaches the report.

### Fidelity (honest)
The return leg is **not** lossless and **not** fully deterministic — freeform human
input can't be. That is acceptable because Claude *proposes* and the consultant
*approves* before the report. Stable IDs are the linchpin; on ID loss the engine falls
back to nearest-neighbour matching and flags low confidence.

## Runtime topology

All local (PRD §14.5). Claude Code runs the skill on the consultant's subscription;
Excalidraw is self-hosted; the engine is Node/TS; output is one `.html` file. No client
data leaves the machine except the LLM calls inherent to Claude Code.

### Transport in this build
- **`FileTransport`** (works today, offline, in any session): writes/reads `.excalidraw`
  JSON files. The consultant can import/export these in the Excalidraw UI by hand — a
  zero-MCP fallback that exercises the full round-trip.
- **Live MCP** (consultant's machine): driven by Claude Code from `SKILL.md` via the
  Excalidraw MCP tools (`batch_create_elements` out; `export_scene` back). Verify the
  actual tool surface of the chosen MCP build at wire-up time (§14.4, R2) — only
  `excalidraw-mcp.ts` changes if it differs.

## Why this de-risking (cloud-session note)

This repo's engine was built and proven in a remote Claude Code session with **no live
Excalidraw MCP**. The genuinely lossy/risky part — the reconciliation *logic* — is fully
unit-tested against element-JSON fixtures (`test/reconcile.test.ts`). Only the live
*transport* verification is deferred to the consultant's local machine, where the canvas
and its MCP actually live.
