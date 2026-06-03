# Local setup — wiring the live Excalidraw round-trip (M3 transport)

> This is the one piece that couldn't be built/verified in the cloud session: the
> **live** Excalidraw MCP transport. The round-trip *logic* is done and unit-tested;
> only the live wiring + tool-surface verification (PRD §14.4, R2) happens here, on your
> machine, where the canvas and its MCP actually run. Until you do this, the offline
> `FileTransport` path (below) gives you a full working round-trip.

## 0. Prereqs
```bash
cd projects/process-mapper/engine
npm install
npm test          # expect: all passing
npm run sample    # open ../samples/sample-report.html — renders offline
```

## 1. Offline path (works today, no MCP)
Good enough to run a real engagement if you'd rather not self-host yet:
```bash
npm run project   -- path/to/ir.json          # writes ir.excalidraw + ir.idmap.json
```
Open `ir.excalidraw` in Excalidraw (desktop app, or excalidraw.com → Open). Edit it live
in the workshop. **Export** it back to a `.excalidraw` file, then:
```bash
npm run reconcile -- path/to/ir.json  edited.excalidraw    # → ir.reconciled.json + ir.proposals.json
npm run report    -- path/to/ir.reconciled.json            # → offline .report.html
```
`ir.proposals.json` holds the human additions + ambiguous edits for you to confirm
(Stage 5) before reporting — they are never auto-merged.

## 2. Live path (self-hosted Excalidraw + MCP)
1. **Pick an MCP build** and self-host the canvas locally (keeps client data on your LAN,
   §14.5). Candidates from PRD §21:
   - `github.com/yctimlin/mcp_excalidraw` (the surface this engine targets — verified: 26
     tools incl. `batch_create_elements`, `query_elements`, `export_scene`)
   - `github.com/excalidraw/excalidraw-mcp` (official)
   - Excalidraw+ MCP (`plus.excalidraw.com/docs/mcp`)
2. **Add it to Claude Code** as an MCP server (`claude mcp add …` or your `settings.json`).
   Confirm the tools appear in this session.
3. **Verify the actual tool surface** (R2 — it may differ from the README):
   - bulk create (out): `batch_create_elements` — does it accept `customData`? If not,
     rely on the sidecar ID-map (already the durable source of truth here).
   - read back: `export_scene` (full `.excalidraw` JSON) or `query_elements`.
   - Note the exact tool names + arg shapes.
4. **Adapt the transport only** — everything else stays put. In
   `engine/src/excalidraw-mcp.ts`, the live binding is intentionally a stub
   (`McpTransportNotWired`). The live path is meant to be driven by Claude Code from
   `skill/SKILL.md`, not from Node: the skill calls `projectIR` → feeds elements to
   `batch_create_elements`; later calls `export_scene` → feeds JSON to `reconcileBoard`.
   The pure logic in `excalidraw.ts` is unchanged regardless of the MCP build.
5. **Smoke test the round-trip:**
   - project the sample IR, push to the live board, confirm 7 step boxes + 6 arrows + 2
     process frames appear;
   - move a box, edit a timing, add a sticky note, add a box;
   - export and run reconcile — confirm the move/edit/delete land deterministically and
     the sticky/box show up as proposals (matches `test/reconcile.test.ts`).

## 3. What to tell me when you're back
- Which MCP build you chose and its real tool names/arg shapes (so I can finalize the
  thin wrapper + the SKILL.md call steps).
- Whether `customData` survives a round-trip on that build (decides how hard we lean on
  the sidecar ID-map vs customData).

Then the only remaining work is M2's live extraction prompt + M5's solution-research
prompts (both LLM-driven via SKILL.md) and a full dry-run on a real transcript.
