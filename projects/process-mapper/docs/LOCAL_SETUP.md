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

## 2. Live path — yctimlin/mcp_excalidraw (chosen build)

> **Run this NATIVELY on the Mac**, not in a cloud session. A cloud container's
> `127.0.0.1:3000` canvas isn't reachable from your browser; the live workshop canvas
> only works when Claude Code, the MCP, and your browser are on the same machine.

We chose `github.com/yctimlin/mcp_excalidraw` because its 26-tool structured API maps
1:1 onto the engine's round-trip (`batch_create_elements` ⇆ `projectIR`, `export_scene`
⇆ `reconcileBoard`); the official `excalidraw/excalidraw-mcp` is a conversational
"MCP Apps" drawing server without the structured query/export primitives the
deterministic reconcile needs. Self-hosting also keeps client data on your LAN (§14.5).

### 2a. Install + run (two terminals)
```bash
git clone https://github.com/yctimlin/mcp_excalidraw && cd mcp_excalidraw
npm ci && npm run build

# Terminal 1 — the live canvas (open http://127.0.0.1:3000 in your browser)
PORT=3000 npm run canvas
```

### 2b. Register the MCP with Claude Code
```bash
claude mcp add excalidraw --scope user \
  -e EXPRESS_SERVER_URL=http://127.0.0.1:3000 \
  -e ENABLE_CANVAS_SYNC=true \
  -- node /absolute/path/to/mcp_excalidraw/dist/index.js
```
Restart Claude Code so the `excalidraw` tools load, then confirm I can see them.

### 2c. Verify the real tool surface (R2 — do this once, tell me the answers)
The README lists 26 tools; confirm the three the round-trip depends on and their arg
shapes, since they gate how the wrapper is finalized:
- **out:** `batch_create_elements` — does it accept/persist a `customData` field per
  element? (If not, we lean entirely on the sidecar ID-map — already the durable source
  of truth, so either way works.)
- **back:** `export_scene` — returns full `.excalidraw` JSON with `x/y`, `label/text`,
  and `customData` intact?
- note exact tool names + the create payload shape (esp. how labels/edges are expressed).

### 2d. Smoke test the round-trip (mirrors `test/reconcile.test.ts`)
- `npm run project -- ../samples/sample-ir.json` → feed `elements` to
  `batch_create_elements`; confirm **7 step boxes + 6 arrows + 2 process frames** appear
  on the canvas (`get_canvas_screenshot` to verify).
- On the canvas: move a box, edit a timing label, add a sticky note, add a new box.
- `export_scene` → save as `edited.excalidraw` → `npm run reconcile -- ../samples/sample-ir.json edited.excalidraw`.
- Confirm the move/edit/delete land deterministically in the reconciled IR, and the
  sticky + new box surface in `*.proposals.json` (never auto-merged).

The live push/read is driven by Claude Code from `skill/SKILL.md`, **not** from Node —
`engine/src/excalidraw-mcp.ts::McpTransportNotWired` documents that boundary on purpose.
The pure logic in `excalidraw.ts` is identical to the offline path; only the I/O changes.

## 3. After the round-trip works
Remaining work is all LLM-driven via `skill/SKILL.md` (no more engine code needed):
M2's transcript→IR extraction and M5's MVS solution-research / AI-viability prompts,
then a full dry-run on a real workshop transcript end-to-end.
