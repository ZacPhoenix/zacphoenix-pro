/**
 * IR → Mermaid flowcharts (PRD FR-17, §13). DETERMINISTIC projection of the IR.
 *
 * Produces a `flowchart` for the current state (subgraph per process) and for any
 * scenario's mutated step set. Bottleneck steps (§FR-8) get a pain style so the
 * map reads at a glance.
 */
import type { Flow, IR, Process, Step } from "./ir.js";
import { allSteps } from "./ir.js";
import { type ScenarioResult } from "./scenarios.js";
import { flagsForStep, formatMinutes } from "./metrics.js";

/** Mermaid label text is wrapped in quotes; escape quotes and encode line breaks. */
function label(text: string): string {
  return text.replace(/"/g, "&quot;").replace(/\n/g, "<br/>");
}

/** A safe mermaid node/subgraph id (ids in the IR are already id-safe, but be defensive). */
function safeId(id: string): string {
  return id.replace(/[^A-Za-z0-9_]/g, "_");
}

/** The metric line shown inside each node. */
function metricLine(step: Step): string {
  const m = step.metrics;
  const parts = [
    `PT ${formatMinutes(m.processTimeMin)}`,
    `WT ${formatMinutes(m.waitTimeMin)}`,
    `%C&A ${m.pctCompleteAccurate}`,
  ];
  return parts.join(" · ");
}

function nodeDef(step: Step): string {
  const top = step.role ? `${step.name}<br/><i>${step.role}</i>` : step.name;
  return `  ${safeId(step.id)}["${label(top)}<br/>${label(metricLine(step))}"]`;
}

const EDGE_BY_TYPE: Record<Flow["type"], (lbl: string) => string> = {
  sequential: (l) => (l ? `-->|${l}|` : "-->"),
  conditional: (l) => (l ? `-.->|${l}|` : "-.->"),
  "rework-loop": (l) => (l ? `==>|${l}|` : "==>"),
  handoff: (l) => (l ? `-->|${l}|` : "-->"),
};

function edgeDef(flow: Flow): string {
  const op = EDGE_BY_TYPE[flow.type](flow.label ? label(flow.label) : "");
  return `  ${safeId(flow.fromStepId)} ${op} ${safeId(flow.toStepId)}`;
}

interface Grouping {
  /** Ordered process groups (id + display name) covering the rendered steps. */
  groups: { id: string; name: string; steps: Step[] }[];
  /** Steps not belonging to any known process (e.g. scenario-added). */
  ungrouped: Step[];
}

/** Group a flat step list back under their owning processes, in process order. */
function groupSteps(ir: IR, steps: Step[]): Grouping {
  const owner = new Map<string, string>(); // stepId -> processId
  const procName = new Map<string, string>();
  for (const proc of ir.processes) {
    procName.set(proc.id, proc.name);
    for (const s of proc.steps) owner.set(s.id, proc.id);
  }
  const byProc = new Map<string, Step[]>();
  const ungrouped: Step[] = [];
  for (const step of steps) {
    const pid = owner.get(step.id);
    if (pid) {
      const arr = byProc.get(pid) ?? [];
      arr.push(step);
      byProc.set(pid, arr);
    } else {
      ungrouped.push(step);
    }
  }
  const groups = ir.processes
    .filter((p) => byProc.has(p.id))
    .map((p) => ({ id: p.id, name: p.name, steps: byProc.get(p.id)! }));
  return { groups, ungrouped };
}

/** All flows in the IR whose endpoints both exist in `stepIds`. */
function flowsAmong(ir: IR, stepIds: Set<string>): Flow[] {
  const out: Flow[] = [];
  for (const proc of ir.processes)
    for (const flow of proc.flows)
      if (stepIds.has(flow.fromStepId) && stepIds.has(flow.toStepId)) out.push(flow);
  return out;
}

function render(ir: IR, steps: Step[]): string {
  const stepIds = new Set(steps.map((s) => s.id));
  const { groups, ungrouped } = groupSteps(ir, steps);
  const lines: string[] = ["flowchart TD"];

  for (const g of groups) {
    lines.push(`  subgraph ${safeId(g.id)}["${label(g.name)}"]`);
    for (const s of g.steps) lines.push("  " + nodeDef(s));
    lines.push("  end");
  }
  if (ungrouped.length > 0) {
    lines.push(`  subgraph added["New / Added"]`);
    for (const s of ungrouped) lines.push("  " + nodeDef(s));
    lines.push("  end");
  }

  for (const flow of flowsAmong(ir, stepIds)) lines.push(edgeDef(flow));

  // Pain styling (deterministic, FR-8).
  const painful = steps.filter((s) => {
    const f = flagsForStep(s);
    return f.highWait || f.lowQuality;
  });
  if (painful.length > 0) {
    lines.push("  classDef pain fill:#fde2e2,stroke:#c0392b,stroke-width:2px;");
    lines.push(`  class ${painful.map((s) => safeId(s.id)).join(",")} pain;`);
  }
  return lines.join("\n");
}

/** Mermaid for the current-state value stream(s). */
export function mermaidCurrentState(ir: IR): string {
  return render(ir, allSteps(ir));
}

/** Mermaid for a computed scenario's future state. */
export function mermaidScenario(ir: IR, result: ScenarioResult): string {
  return render(ir, result.mutatedSteps);
}

/** Convenience: a Mermaid diagram for a single process (used in detail sections). */
export function mermaidProcess(ir: IR, process: Process): string {
  return render(ir, process.steps);
}
