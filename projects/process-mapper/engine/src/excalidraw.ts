/**
 * IR ⇄ Excalidraw elements (PRD §10 — the round-trip contract, the riskiest piece).
 *
 * OUT (IR → elements) is easy and fully deterministic.
 * BACK (elements → IR) is where fidelity is lost. We keep it manageable by:
 *   1. tagging every projected element with its IR id (customData + sidecar ID-map);
 *   2. classifying every returned element into one of three buckets (§10.2):
 *        tracked & matched (deterministic), untracked additions (→ Claude),
 *        tracked but heavily mutated (→ consultant);
 *   3. only ever AUTO-APPLYING the safe deterministic changes; additions are
 *        PROPOSED for the Stage 5 review safety valve (FR-15), never auto-merged.
 *
 * This module is pure data transformation over the Excalidraw element JSON shape.
 * The live MCP transport lives entirely in `excalidraw-mcp.ts`. Everything here is
 * unit-tested against element-JSON fixtures with no live canvas (de-risk plan Q1-A).
 */
import type { Flow, IR, Step } from "./ir.js";
import { allSteps } from "./ir.js";
import {
  emptyIdMap,
  irIdForElement,
  setMapping,
  type IdMap,
} from "./idmap.js";
import { flagsForStep, formatMinutes } from "./metrics.js";

// ---------------------------------------------------------------------------
// Minimal Excalidraw element shape (only the fields the round-trip needs).
// ---------------------------------------------------------------------------

export interface ExcalidrawElement {
  id: string;
  type: string; // "rectangle" | "arrow" | "text" | "frame" | ...
  x: number;
  y: number;
  width: number;
  height: number;
  /** Label text. Some MCP builds store text inline; we read it if present. */
  text?: string;
  /** Bound source/target for arrows. */
  startBinding?: { elementId: string } | null;
  endBinding?: { elementId: string } | null;
  /** Our tracking tag. May be stripped by some edits — sidecar ID-map is the backup. */
  customData?: { kind?: string; irId?: string; irVersion?: number } | null;
  /** Excalidraw marks deleted elements rather than removing them. */
  isDeleted?: boolean;
  [k: string]: unknown;
}

export interface CartographerCustomData {
  kind: "step" | "flow" | "process";
  irId: string;
  irVersion: number;
}

// ---------------------------------------------------------------------------
// Deterministic layout (decision 1 — layout is engine-owned, never the LLM).
// ---------------------------------------------------------------------------

const LAYOUT = {
  nodeW: 220,
  nodeH: 90,
  hGap: 70,
  procHeader: 40,
  vGap: 120,
  originX: 40,
  originY: 40,
} as const;

function elementIdFor(irId: string): string {
  return `el_${irId}`;
}

function stepLabel(step: Step): string {
  const m = step.metrics;
  const role = step.role ? `\n${step.role}` : "";
  return `${step.name}${role}\nPT ${formatMinutes(m.processTimeMin)} · WT ${formatMinutes(
    m.waitTimeMin,
  )} · %C&A ${m.pctCompleteAccurate}`;
}

export interface ProjectResult {
  elements: ExcalidrawElement[];
  idMap: IdMap;
}

/**
 * OUT: project the IR onto Excalidraw elements (FR-5/6). Deterministic positions,
 * one rectangle per step, one bound arrow per flow, one frame per process. Every
 * element carries customData {kind, irId, irVersion} and is recorded in the ID-map.
 */
export function projectIR(ir: IR): ProjectResult {
  const elements: ExcalidrawElement[] = [];
  const idMap = emptyIdMap(ir.meta.irVersion);
  let cursorY = LAYOUT.originY;

  for (const proc of ir.processes) {
    const rowWidth =
      Math.max(proc.steps.length, 1) * (LAYOUT.nodeW + LAYOUT.hGap) - LAYOUT.hGap;
    const frameId = elementIdFor(proc.id);
    elements.push({
      id: frameId,
      type: "frame",
      x: LAYOUT.originX - 16,
      y: cursorY - 16,
      width: rowWidth + 32,
      height: LAYOUT.procHeader + LAYOUT.nodeH + 32,
      text: proc.name,
      customData: { kind: "process", irId: proc.id, irVersion: ir.meta.irVersion },
    });
    setMapping(idMap, proc.id, frameId);

    proc.steps.forEach((step, j) => {
      const elId = elementIdFor(step.id);
      const flags = flagsForStep(step);
      elements.push({
        id: elId,
        type: "rectangle",
        x: LAYOUT.originX + j * (LAYOUT.nodeW + LAYOUT.hGap),
        y: cursorY + LAYOUT.procHeader,
        width: LAYOUT.nodeW,
        height: LAYOUT.nodeH,
        text: stepLabel(step),
        // Pain styling hint (FR-8); kept in customData so reconcile ignores it.
        customData: { kind: "step", irId: step.id, irVersion: ir.meta.irVersion },
        backgroundColor: flags.highWait || flags.lowQuality ? "#fde2e2" : "transparent",
      });
      setMapping(idMap, step.id, elId);
    });

    cursorY += LAYOUT.procHeader + LAYOUT.nodeH + LAYOUT.vGap;
  }

  // Flows become bound arrows (after all step elements exist).
  for (const proc of ir.processes) {
    for (const flow of proc.flows) {
      const arrowId = elementIdFor(flow.id);
      elements.push({
        id: arrowId,
        type: "arrow",
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        text: flow.label ?? "",
        startBinding: { elementId: elementIdFor(flow.fromStepId) },
        endBinding: { elementId: elementIdFor(flow.toStepId) },
        customData: { kind: "flow", irId: flow.id, irVersion: ir.meta.irVersion },
      });
      setMapping(idMap, flow.id, arrowId);
    }
  }

  return { elements, idMap };
}

// ---------------------------------------------------------------------------
// Metric / label parsing for edited nodes (§10.2; Q2 — parse only well-formed
// patterns, defer anything ambiguous to Claude).
// ---------------------------------------------------------------------------

/** Parse a duration like "8m", "1.5h", "4 hr", "2d" into minutes (8h working day). */
export function parseDuration(s: string): number | undefined {
  const m = s.trim().match(/^(\d+(?:\.\d+)?)\s*(m|min|mins|h|hr|hrs|d|day|days)?$/i);
  if (!m) return undefined;
  const n = parseFloat(m[1]!);
  const unit = (m[2] ?? "m").toLowerCase();
  if (unit.startsWith("h")) return n * 60;
  if (unit.startsWith("d")) return n * 8 * 60;
  return n; // minutes
}

export interface ParsedStepEdit {
  name?: string;
  processTimeMin?: number;
  waitTimeMin?: number;
  pctCompleteAccurate?: number;
  /** Lines/tokens we could not confidently parse — hand to Claude. */
  unparsed: string[];
}

/**
 * Parse an edited node's text back into step fields. The first line is treated as
 * the step name; recognised "PT …", "WT …", "%C&A …" tokens update metrics.
 * Anything else is collected in `unparsed` for Claude to interpret.
 */
export function parseStepText(text: string): ParsedStepEdit {
  const out: ParsedStepEdit = { unparsed: [] };
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, idx) => {
    if (idx === 0 && !/\b(PT|WT|wait|%?C&A)\b/i.test(line)) {
      out.name = line;
      return;
    }
    // A metric line may carry several "Key value" tokens separated by · , or ;
    const tokens = line.split(/[·,;]+/).map((t) => t.trim()).filter(Boolean);
    for (const tok of tokens) {
      const pt = tok.match(/^PT\s+(.+)$/i);
      const wt = tok.match(/^(?:WT|wait)\s+(.+)$/i);
      const ca = tok.match(/^%?C&A\s+(\d+(?:\.\d+)?)\s*%?$/i);
      if (pt) {
        const v = parseDuration(pt[1]!);
        if (v !== undefined) out.processTimeMin = v;
        else out.unparsed.push(tok);
      } else if (wt) {
        const v = parseDuration(wt[1]!);
        if (v !== undefined) out.waitTimeMin = v;
        else out.unparsed.push(tok);
      } else if (ca) {
        out.pctCompleteAccurate = parseFloat(ca[1]!);
      } else {
        out.unparsed.push(tok);
      }
    }
  });
  return out;
}

// ---------------------------------------------------------------------------
// BACK: reconcile a board's elements against the IR (§10.2).
// ---------------------------------------------------------------------------

export type AdditionGuess = "new-step" | "pain-point" | "new-flow" | "note";

export interface TrackedChange {
  irId: string;
  elementId: string;
  kind: "step" | "flow" | "process";
  moved?: { from: { x: number; y: number }; to: { x: number; y: number } };
  textEdited?: { from: string; to: string; parsed: ParsedStepEdit };
  deleted?: boolean;
  /** Set when matched but heavily mutated — surface to consultant, don't guess (§10.2.3). */
  ambiguous?: string;
}

export interface UntrackedAddition {
  elementId: string;
  type: string;
  text?: string;
  position: { x: number; y: number };
  guess: AdditionGuess;
  /** Nearest tracked step (for pain-point attachment / arrow endpoints). */
  nearestStepIrId?: string;
  nearestDistance?: number;
  /** For new arrows: resolved endpoint step ids when bindings are tracked. */
  fromStepIrId?: string;
  toStepIrId?: string;
}

export interface ReconcileResult {
  /** Deterministic changes to tracked elements (auto-appliable). */
  trackedChanges: TrackedChange[];
  /** Human additions for Claude to interpret + consultant to confirm (FR-12). */
  untrackedAdditions: UntrackedAddition[];
  /** IR ids whose elements vanished from the board (deletions). */
  deletedIrIds: string[];
}

function center(el: ExcalidrawElement): { x: number; y: number } {
  return { x: el.x + (el.width ?? 0) / 2, y: el.y + (el.height ?? 0) / 2 };
}

/** Read element text from either the top-level `text` field or the MCP `label.text` format. */
function elementText(el: ExcalidrawElement): string | undefined {
  return el.text ?? (el.label as { text?: string } | undefined)?.text;
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const MOVE_EPSILON = 1; // px; ignore sub-pixel jitter

/**
 * Reconcile the current board against the prior IR + ID-map. Returns a structured
 * diff; it does NOT mutate the IR (see `applyTrackedChanges`). Additions are
 * proposed, never applied here.
 */
export function reconcileBoard(
  ir: IR,
  idMap: IdMap,
  board: ExcalidrawElement[],
): ReconcileResult {
  const prior = projectIR(ir); // canonical prior positions/labels for tracked elements
  const priorById = new Map(prior.elements.map((e) => [e.id, e]));
  const stepById = new Map(allSteps(ir).map((s) => [s.id, s]));

  // Resolve the IR id for a board element via customData first, then the sidecar.
  const resolveIrId = (el: ExcalidrawElement): string | undefined =>
    el.customData?.irId ?? irIdForElement(idMap, el.id);

  const live = board.filter((e) => !e.isDeleted);
  const seenIrIds = new Set<string>();

  // Index live tracked step elements for nearest-neighbour lookups.
  const trackedStepCenters: { irId: string; center: { x: number; y: number } }[] = [];
  for (const el of live) {
    const irId = resolveIrId(el);
    if (irId && stepById.has(irId)) trackedStepCenters.push({ irId, center: center(el) });
  }

  const trackedChanges: TrackedChange[] = [];
  const untrackedAdditions: UntrackedAddition[] = [];

  for (const el of live) {
    const irId = resolveIrId(el);

    // ---- Bucket 2: untracked addition (human-added) ----
    if (!irId) {
      untrackedAdditions.push(classifyAddition(el, trackedStepCenters, idMap, stepById));
      continue;
    }

    seenIrIds.add(irId);
    const kind: TrackedChange["kind"] = stepById.has(irId)
      ? "step"
      : ir.processes.some((p) => p.id === irId)
        ? "process"
        : "flow";
    const before = priorById.get(`el_${irId}`);
    const change: TrackedChange = { irId, elementId: el.id, kind };

    if (before) {
      // Position change (tracked deterministically; report layout stays engine-owned).
      // Skip flow/arrow moves — arrows auto-route to their bound elements; position is not meaningful.
      if (
        kind !== "flow" &&
        (Math.abs(before.x - el.x) > MOVE_EPSILON ||
          Math.abs(before.y - el.y) > MOVE_EPSILON)
      ) {
        change.moved = { from: { x: before.x, y: before.y }, to: { x: el.x, y: el.y } };
      }
      // Text change → parse known metric patterns; ambiguous text noted for Claude.
      // Read text from either el.text (file transport) or el.label.text (MCP export format).
      const elText = elementText(el);
      const beforeText = elementText(before);
      if (kind === "step" && elText !== undefined && elText !== beforeText) {
        const parsed = parseStepText(elText);
        change.textEdited = { from: beforeText ?? "", to: elText, parsed };
        if (parsed.unparsed.length > 0 && parsed.name === undefined)
          change.ambiguous = `unrecognised label content: ${parsed.unparsed.join(" | ")}`;
      }
    }
    if (change.moved || change.textEdited) trackedChanges.push(change);
  }

  // ---- Deletions: tracked ids that no longer appear on the board ----
  const deletedIrIds: string[] = [];
  for (const irId of Object.keys(idMap.irToElement)) {
    if (seenIrIds.has(irId)) continue;
    // Only count things that still exist in the IR (steps/flows/processes).
    const exists =
      stepById.has(irId) ||
      ir.processes.some((p) => p.id === irId || p.flows.some((f) => f.id === irId));
    if (exists) {
      deletedIrIds.push(irId);
      trackedChanges.push({
        irId,
        elementId: idMap.irToElement[irId]!,
        kind: stepById.has(irId) ? "step" : ir.processes.some((p) => p.id === irId) ? "process" : "flow",
        deleted: true,
      });
    }
  }

  return { trackedChanges, untrackedAdditions, deletedIrIds };
}

/** Deterministic heuristic for what a human-added element probably is (§10.2.2). */
function classifyAddition(
  el: ExcalidrawElement,
  trackedStepCenters: { irId: string; center: { x: number; y: number } }[],
  idMap: IdMap,
  stepById: Map<string, Step>,
): UntrackedAddition {
  const pos = center(el);
  let nearest: { irId: string; d: number } | undefined;
  for (const t of trackedStepCenters) {
    const d = distance(pos, t.center);
    if (!nearest || d < nearest.d) nearest = { irId: t.irId, d };
  }

  const base: UntrackedAddition = {
    elementId: el.id,
    type: el.type,
    text: elementText(el),
    position: pos,
    guess: "note",
    nearestStepIrId: nearest?.irId,
    nearestDistance: nearest ? Math.round(nearest.d) : undefined,
  };

  if (el.type === "arrow" || el.type === "line") {
    // Support both file-transport format (startBinding.elementId) and MCP export format (start.id).
    const startEl = (el.startBinding as { elementId?: string } | undefined)?.elementId
      ?? (el.start as { id?: string } | undefined)?.id;
    const endEl = (el.endBinding as { elementId?: string } | undefined)?.elementId
      ?? (el.end as { id?: string } | undefined)?.id;
    const from = startEl ? irIdForElement(idMap, startEl) : undefined;
    const to = endEl ? irIdForElement(idMap, endEl) : undefined;
    return {
      ...base,
      guess: "new-flow",
      fromStepIrId: from && stepById.has(from) ? from : undefined,
      toStepIrId: to && stepById.has(to) ? to : undefined,
    };
  }

  // A sticky note / small text near a step → likely a pain point on that step.
  const NEAR = 180; // px
  if ((el.type === "text" || el.type === "rectangle") && nearest && nearest.d <= NEAR) {
    // A bigger rectangle that's standalone reads more like a new step than a note.
    if (el.type === "rectangle" && el.width >= LAYOUT.nodeW * 0.7) return { ...base, guess: "new-step" };
    return { ...base, guess: "pain-point" };
  }
  if (el.type === "rectangle") return { ...base, guess: "new-step" };
  return base;
}

/**
 * Apply ONLY the safe deterministic changes (text-parsed metric/name edits and
 * deletions) to a copy of the IR and bump irVersion. Untracked additions and
 * ambiguous changes are intentionally NOT applied — they go through Stage 5 review.
 */
export function applyTrackedChanges(ir: IR, result: ReconcileResult): IR {
  const next: IR = JSON.parse(JSON.stringify(ir));
  const deleted = new Set(result.deletedIrIds);

  for (const proc of next.processes) {
    proc.steps = proc.steps.filter((s) => !deleted.has(s.id));
    proc.flows = proc.flows.filter((f) => !deleted.has(f.id));
    for (const step of proc.steps) {
      const change = result.trackedChanges.find(
        (c) => c.irId === step.id && c.textEdited && !c.ambiguous,
      );
      if (!change?.textEdited) continue;
      const p = change.textEdited.parsed;
      if (p.name) step.name = p.name;
      if (p.processTimeMin !== undefined) step.metrics.processTimeMin = p.processTimeMin;
      if (p.waitTimeMin !== undefined) step.metrics.waitTimeMin = p.waitTimeMin;
      if (p.pctCompleteAccurate !== undefined)
        step.metrics.pctCompleteAccurate = p.pctCompleteAccurate;
    }
  }
  next.meta.irVersion = ir.meta.irVersion + 1;
  return next;
}
