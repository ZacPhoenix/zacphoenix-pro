# Cartographer — Pilot Playbook

End-to-end guide for running a real (or practice) engagement from raw input to delivered HTML report.

---

## Before the engagement

### One-time machine setup (if not done)

```bash
# 1. Clone and build the Excalidraw MCP server
git clone https://github.com/yctimlin/mcp_excalidraw
cd mcp_excalidraw && npm ci && npm run build

# 2. Register it with Claude Code (replace the path)
claude mcp add excalidraw --scope user \
  -e EXPRESS_SERVER_URL=http://127.0.0.1:3000 \
  -e ENABLE_CANVAS_SYNC=true \
  -- node /absolute/path/to/mcp_excalidraw/dist/index.js

# 3. Build the engine
cd /path/to/projects/process-mapper/engine
npm install
npm test          # expect: 44/44 passing
npm run sample    # sanity check — open samples/sample-report.html
```

Restart Claude Code after registering the MCP. Confirm with `claude mcp list` — `excalidraw` should show `✓ Connected`.

---

## Day-of workflow

### Step 1 — Collect inputs

Create an engagement folder anywhere on your machine, e.g. `~/engagements/acme-2026-06/`.

Drop in:
- The **workshop transcript** (`.txt`, `.md`, or `.docx`)
- Any **supporting docs** (SOPs, org charts, spreadsheets-as-PDFs, Word process descriptions)

No required naming convention. Claude reads whatever is in the folder.

---

### Step 2 — Start the canvas (Terminal 1, keep running)

```bash
cd /path/to/mcp_excalidraw
PORT=3000 npm run canvas
```

Open `http://127.0.0.1:3000` in your browser. Leave it open — this is the live workshop canvas.

---

### Step 3 — Invoke Cartographer (Stage 1 + 2)

Open Claude Code (desktop or terminal). Run:

```
/cartographer
```

When prompted (or as context), point Claude at your engagement folder:

> "Engagement folder: ~/engagements/acme-2026-06/. Run Stage 1 then Stage 2."

**What happens:**
- Claude reads every file in the folder (PDFs natively, docx via mammoth/pandoc)
- Extracts the current-state value stream into IR JSON
- Validates the IR with the engine (`validateIR`)
- Runs `npm run project` to turn IR into Excalidraw elements
- Pushes all elements to the live canvas via `batch_create_elements`

**You should see** step boxes, process frames, and connecting arrows appear on `http://127.0.0.1:3000`.

**If extraction looks wrong**, tell Claude directly: "Step 3 should come before step 2" or "the approval step is missing" — Claude updates the IR and re-projects. Iterate until the map is right before the client arrives.

> Offline fallback (no MCP): Claude writes a `.excalidraw` file instead. Import it into the Excalidraw desktop app or excalidraw.com manually, run the workshop, export it back, then continue from Step 5.

---

### Step 4 — Workshop (Stage 3 — you and the client)

Share your screen showing `http://127.0.0.1:3000`.

Walk the client through the map. They will correct you:
- Drag boxes to reorder steps
- Edit timing labels (format: `PT 2h / WT 1d / %C&A 80%`)
- Add sticky notes for pain points
- Add new boxes/arrows for missing steps
- Delete steps that don't apply

Claude does nothing during this stage. Real-time sync is native to Excalidraw.

**When the map is agreed:** signal Claude to reconcile.

---

### Step 5 — Reconcile (Stage 4)

Tell Claude:

> "The workshop is done. Run Stage 4 — reconcile and generate scenarios."

**What happens:**
- Claude calls `export_scene` to read the board back
- Runs `npm run reconcile` — engine diffs tracked elements deterministically
- Claude interprets untracked additions (sticky notes, new boxes) and proposes how they map to the IR
- Claude generates 2–3 named future-state scenarios
- Claude tags every opportunity with a deliverable type and MVS ladder rung
- Output: reconciled IR + `*.proposals.json` (human additions, never auto-merged)

**Proposals are surfaced to you** — not silently applied. You confirm or reject each one.

---

### Step 6 — Review (Stage 5 safety valve)

Claude presents:
- The reconciled IR (you can edit the JSON directly or ask Claude to make changes)
- The proposed additions from the workshop
- The 2–3 named scenarios with metric deltas
- The opportunities list ranked by ROI-to-complexity

Review each one. Correct anything that's wrong. This is the only gate before the report — nothing that hasn't passed through here appears in the deliverable.

When you're satisfied: "Generate the report."

---

### Step 7 — Report

Claude runs `npm run report` on the final IR and hands you a single `.html` file.

Open it in any browser — it renders fully offline, no internet required. It contains:
- Current-state process map (Mermaid diagram)
- Baseline VSM metrics (PCE, Lead Time, bottlenecks)
- Pain points
- 2–3 named scenarios with before/after metric tables
- Opportunities ranked by ROI-to-complexity, each framed as a sellable engagement (MVS solution, ladder rung, AI-viability summary, quantified ROI, pricing blank for you to fill)

Send this file to the client. It stands alone without you present.

---

## Iterating before the report

Stages 2–4 can loop. If a second round of editing is useful:

```
"Re-project the reconciled IR to the canvas for another round."
```

Claude re-runs Stage 2 with the updated IR, pushes a fresh canvas, and you repeat from Step 4.

---

## Troubleshooting

**Canvas shows nothing after Stage 2**
- Check Terminal 1 is still running (`PORT=3000 npm run canvas`)
- Check `claude mcp list` — `excalidraw` must show `✓ Connected`
- Reload `http://127.0.0.1:3000`

**`npm run project` fails with schema errors**
- The IR Claude extracted has a referential issue (a flow points to a non-existent step ID)
- Tell Claude: "The IR failed validation — fix the referential issues and try again"
- Claude runs `validateIR`, reads the error output, patches the IR

**Reconcile produces unexpected changes**
- Check `*.proposals.json` — human additions go there, not into the IR automatically
- Tracked changes (moves, label edits, deletes) are deterministic; if one looks wrong, check whether the label was in `PT/WT/%C&A` format
- Ambiguous elements land in the `ambiguous` bucket and are flagged for you — Claude doesn't guess

**Report HTML shows blank Mermaid diagrams**
- Open browser console — most likely a CSP issue in a sandboxed browser
- Try opening the file in Safari or Firefox instead of a Chromium-based browser in locked-down mode

**`docx` files not parsing**
- Verify `mammoth` is installed: `cd engine && npm ls mammoth`
- If pandoc is available (`which pandoc`), Claude falls back to it automatically

---

## What makes a good pilot transcript

The engine can work with rough notes, but Claude's extraction is better when the transcript has:
- Step names and owners ("Sarah in billing runs the approval")
- At least some timing data, even rough ("takes about two days", "30 minutes usually")
- Explicit pain points ("we always get rejections here", "this bottleneck kills us")

If you're doing a practice run first, the `samples/` folder has a worked example transcript and IR you can use as a template.

---

## File outputs summary

| File | When created | What |
|---|---|---|
| `<name>.ir.json` | After Stage 1 | Extracted current-state IR |
| `<name>.excalidraw` | After Stage 2 (offline only) | Canvas scene file |
| `<name>.idmap.json` | After Stage 2 | Sidecar element ID map |
| `<name>.reconciled.json` | After Stage 4 | Updated IR with tracked changes applied |
| `<name>.proposals.json` | After Stage 4 | Human additions + ambiguous items for review |
| `<name>.report.html` | After Stage 5 | Self-contained deliverable |
