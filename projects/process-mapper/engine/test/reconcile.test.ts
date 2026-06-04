import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { parseIR, referentialIssues } from "../src/ir.js";
import {
  projectIR,
  reconcileBoard,
  applyTrackedChanges,
  parseStepText,
  parseDuration,
  type ExcalidrawElement,
} from "../src/excalidraw.js";
import { FileTransport } from "../src/excalidraw-mcp.js";

const here = dirname(fileURLToPath(import.meta.url));
const ir = parseIR(readFileSync(join(here, "../../samples/sample-ir.json"), "utf8"));

const clone = (els: ExcalidrawElement[]): ExcalidrawElement[] =>
  JSON.parse(JSON.stringify(els));
const find = (els: ExcalidrawElement[], id: string) => els.find((e) => e.id === id)!;
const center = (e: ExcalidrawElement) => ({ x: e.x + e.width / 2, y: e.y + e.height / 2 });

describe("projectIR (OUT, FR-5/6)", () => {
  const { elements, idMap } = projectIR(ir);
  it("emits one element per step, flow, and process, all id-tagged", () => {
    const steps = elements.filter((e) => e.customData?.kind === "step");
    const flows = elements.filter((e) => e.customData?.kind === "flow");
    const procs = elements.filter((e) => e.customData?.kind === "process");
    expect(steps).toHaveLength(7);
    expect(flows).toHaveLength(6);
    expect(procs).toHaveLength(2);
    expect(idMap.irToElement["step_001"]).toBe("el_step_001");
    expect(idMap.elementToIr["el_step_001"]).toBe("step_001");
  });
  it("binds flow arrows to their endpoint step elements", () => {
    const f = find(elements, "el_flow_001");
    expect(f.startBinding?.elementId).toBe("el_step_001");
    expect(f.endBinding?.elementId).toBe("el_step_002");
  });
  it("is deterministic (same IR → identical elements)", () => {
    expect(projectIR(ir).elements).toEqual(elements);
  });
});

describe("reconcileBoard (BACK, §10.2) — the round-trip", () => {
  const { elements, idMap } = projectIR(ir);

  // ---- Build an "edited board" simulating a live workshop session ----
  const board = clone(elements);
  // 1. moved step
  find(board, "el_step_002").x += 75;
  // 2. text-edited step (rename + change a timing)
  find(board, "el_step_001").text = "Take order\nSales admin\nPT 8m · WT 2h · %C&A 70";
  // 3. customData stripped but still in ID-map → resolves via sidecar; also moved
  const s3 = find(board, "el_step_003");
  s3.customData = null;
  s3.y += 40;
  // 4. deletions: a step and its bound arrows vanish from the board
  const removed = new Set(["el_step_004", "el_flow_003", "el_flow_004"]);
  const boardAfterDeletes = board.filter((e) => !removed.has(e.id));
  // 5. untracked additions
  const near5 = center(find(elements, "el_step_005"));
  boardAfterDeletes.push(
    { id: "add_note", type: "text", x: near5.x + 10, y: near5.y + 10, width: 120, height: 30, text: "payment chased twice" },
    { id: "add_box", type: "rectangle", x: 4000, y: 4000, width: 220, height: 90, text: "Send order confirmation" },
    { id: "add_arrow", type: "arrow", x: 0, y: 0, width: 0, height: 0, startBinding: { elementId: "el_step_002" }, endBinding: { elementId: "el_step_005" } },
  );

  const result = reconcileBoard(ir, idMap, boardAfterDeletes);

  it("detects the moved step deterministically", () => {
    const moved = result.trackedChanges.find((c) => c.irId === "step_002");
    expect(moved?.moved?.to.x).toBe(find(board, "el_step_002").x);
  });

  it("resolves a stripped-customData element via the sidecar ID-map", () => {
    const moved = result.trackedChanges.find((c) => c.irId === "step_003");
    expect(moved?.moved).toBeTruthy();
  });

  it("parses an edited node's metric + name change", () => {
    const edit = result.trackedChanges.find((c) => c.irId === "step_001");
    expect(edit?.textEdited?.parsed.name).toBe("Take order");
    expect(edit?.textEdited?.parsed.waitTimeMin).toBe(120); // 2h
  });

  it("records deletions for removed step + flows", () => {
    expect(result.deletedIrIds.sort()).toEqual(["flow_003", "flow_004", "step_004"]);
  });

  it("buckets untracked additions and guesses their kind (FR-12)", () => {
    const byId = new Map(result.untrackedAdditions.map((a) => [a.elementId, a]));
    expect(byId.get("add_note")?.guess).toBe("pain-point");
    expect(byId.get("add_note")?.nearestStepIrId).toBe("step_005");
    expect(byId.get("add_box")?.guess).toBe("new-step");
    expect(byId.get("add_arrow")?.guess).toBe("new-flow");
    expect(byId.get("add_arrow")?.fromStepIrId).toBe("step_002");
    expect(byId.get("add_arrow")?.toStepIrId).toBe("step_005");
  });

  it("does NOT auto-apply additions — only deterministic changes (Stage 5 safety valve)", () => {
    const next = applyTrackedChanges(ir, result);
    // deterministic: rename + timing applied, step/flows deleted, version bumped
    const s1 = next.processes[0]!.steps.find((s) => s.id === "step_001")!;
    expect(s1.name).toBe("Take order");
    expect(s1.metrics.waitTimeMin).toBe(120);
    expect(next.processes[0]!.steps.find((s) => s.id === "step_004")).toBeUndefined();
    expect(next.processes[0]!.flows.map((f) => f.id)).not.toContain("flow_003");
    expect(next.meta.irVersion).toBe(ir.meta.irVersion + 1);
    // additions NOT merged: no "Send order confirmation" step appeared
    const names = next.processes.flatMap((p) => p.steps.map((s) => s.name));
    expect(names).not.toContain("Send order confirmation");
    // result stays referentially valid
    expect(referentialIssues(next)).toEqual([]);
  });
});

describe("MCP export format compatibility (label.text, auto-routed arrows, missing dimensions)", () => {
  const { elements, idMap } = projectIR(ir);

  it("detects a text edit when text is in label.text (MCP export format)", () => {
    const board = clone(elements);
    const s1 = find(board, "el_step_001");
    // MCP stores text in label.text, not text
    delete (s1 as Record<string, unknown>).text;
    (s1 as Record<string, unknown>).label = { text: "Take order\nSales admin\nPT 8m · WT 2h · %C&A 70" };
    const result = reconcileBoard(ir, idMap, board);
    const edit = result.trackedChanges.find((c) => c.irId === "step_001");
    expect(edit?.textEdited?.parsed.name).toBe("Take order");
    expect(edit?.textEdited?.parsed.waitTimeMin).toBe(120);
  });

  it("does not flag arrow position as a move (auto-routed arrows, MCP export format)", () => {
    const board = clone(elements);
    // MCP sets actual routed positions on arrows — should not appear as "moved"
    const f1 = find(board, "el_flow_001");
    f1.x = 268;
    f1.y = 125;
    const result = reconcileBoard(ir, idMap, board);
    const flowChange = result.trackedChanges.find((c) => c.irId === "flow_001");
    expect(flowChange?.moved).toBeUndefined();
  });

  it("computes center for text elements missing width/height without NaN", () => {
    const board = clone(elements);
    // Text elements from MCP have no width/height
    board.push({ id: "txt_mcp", type: "text", x: 100, y: 200, width: undefined as unknown as number, height: undefined as unknown as number, text: "a note" });
    const result = reconcileBoard(ir, idMap, board);
    const note = result.untrackedAdditions.find((a) => a.elementId === "txt_mcp");
    expect(note).toBeDefined();
    expect(Number.isFinite(note!.position.x)).toBe(true);
    expect(Number.isFinite(note!.position.y)).toBe(true);
  });
});

describe("parseDuration / parseStepText (Q2 — parse well-formed, defer ambiguity)", () => {
  it("parses durations with units", () => {
    expect(parseDuration("8m")).toBe(8);
    expect(parseDuration("1.5h")).toBe(90);
    expect(parseDuration("2d")).toBe(960); // 2 * 8h
    expect(parseDuration("4 hr")).toBe(240);
  });
  it("returns undefined for unparseable durations", () => {
    expect(parseDuration("about a day")).toBeUndefined();
  });
  it("flags ambiguous label content for Claude rather than guessing", () => {
    const p = parseStepText("PT 8m · this approval is a nightmare");
    expect(p.processTimeMin).toBe(8);
    expect(p.unparsed).toContain("this approval is a nightmare");
  });
});

describe("FileTransport round-trip (offline, no MCP)", () => {
  it("writes a scene and reads it back with zero spurious changes", async () => {
    const { elements, idMap } = projectIR(ir);
    const path = join(tmpdir(), `cartographer-scene-${Date.now()}.excalidraw`);
    const t = new FileTransport(path);
    await t.pushScene(elements);
    const readBack = await t.readScene();
    const result = reconcileBoard(ir, idMap, readBack);
    expect(result.trackedChanges).toEqual([]);
    expect(result.untrackedAdditions).toEqual([]);
    expect(result.deletedIrIds).toEqual([]);
  });
});
