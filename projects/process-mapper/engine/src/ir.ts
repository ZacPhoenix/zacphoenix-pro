/**
 * IR — the Intermediate Representation (PRD §8).
 *
 * The IR is Cartographer's single source of truth: a JSON model of the client's
 * value stream(s). Everything else is either an input that updates the IR or a
 * projection of it (Excalidraw canvas, Mermaid, the HTML report).
 *
 * Types are derived from zod schemas so runtime validation and the static types
 * never drift. Keep IDs STABLE — the Excalidraw round-trip (§10) depends on them.
 */
import { z } from "zod";

/** §12.1 — operational ("lean") lens. Required on every opportunity (decision 4). */
export const ImprovementType = z.enum([
  "eliminate-waste",
  "reduce-wait",
  "improve-quality",
  "automate-manual",
  "consolidate",
  "reorder",
  "augment-with-ai",
]);
export type ImprovementType = z.infer<typeof ImprovementType>;

/**
 * §12.2 — deliverable ("sellable") lens, an ascending complexity/risk ladder.
 * The array order IS the ladder order (rung 0..5); see `ladderRungOf`.
 */
export const DELIVERABLE_LADDER = [
  "process-change", // rung 0 — advisory only, no tech
  "config-or-feature-toggle", // rung 1 — enable an owned, unused feature
  "off-the-shelf-product", // rung 2 — adopt/integrate existing SaaS
  "no-code-automation", // rung 3 — Airtable/Zapier/Make/n8n/Apps Script
  "integration", // rung 4 — connect systems that don't talk
  "custom-claude-build", // rung 5 — bespoke app / custom AI agent
] as const;
export const DeliverableType = z.enum(DELIVERABLE_LADDER);
export type DeliverableType = z.infer<typeof DeliverableType>;

/** The ladder rung (0..5) implied by a deliverable type. Single source of truth. */
export function ladderRungOf(d: DeliverableType): number {
  return DELIVERABLE_LADDER.indexOf(d);
}

export const FlowType = z.enum([
  "sequential",
  "conditional",
  "rework-loop",
  "handoff",
]);
export type FlowType = z.infer<typeof FlowType>;

/** Per-step VSM inputs (§11). Rolled-up metrics are computed, never stored. */
export const StepMetrics = z.object({
  /** Value-adding work time to process one item at the step (minutes). */
  processTimeMin: z.number().min(0),
  /** Delay/queue time before the step (minutes). */
  waitTimeMin: z.number().min(0),
  /** % of items arriving usable without rework (0..100). */
  pctCompleteAccurate: z.number().min(0).max(100),
  /** People assigned to the step. Optional. */
  fte: z.number().min(0).optional(),
  /** Items per day. Optional. */
  demandPerDay: z.number().min(0).optional(),
  /**
   * FR-4: names of metric fields whose values are estimated/unknown (not stated
   * in the source). The report surfaces these as gaps rather than hard numbers.
   */
  estimated: z.array(z.string()).optional(),
});
export type StepMetrics = z.infer<typeof StepMetrics>;

export const Step = z.object({
  /** STABLE id — survives round-trips (§10). */
  id: z.string().min(1),
  name: z.string().min(1),
  role: z.string().optional(),
  description: z.string().optional(),
  metrics: StepMetrics,
  painPoints: z.array(z.string()).default([]),
  /** For PCE: does this step add customer value? */
  isValueAdded: z.boolean(),
  /** Link to the Excalidraw element (§10). Set on project / reconcile. */
  canvasElementId: z.string().optional(),
});
export type Step = z.infer<typeof Step>;

export const Flow = z.object({
  id: z.string().min(1),
  fromStepId: z.string().min(1),
  toStepId: z.string().min(1),
  type: FlowType,
  label: z.string().optional(),
});
export type Flow = z.infer<typeof Flow>;

export const Process = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  steps: z.array(Step),
  /** Edges between steps. May reference steps in other processes (decision 5). */
  flows: z.array(Flow).default([]),
});
export type Process = z.infer<typeof Process>;

/** §12.4 — AI viability assessed at every altitude of the ladder. */
export const AiViability = z.object({
  existingFeature: z.string(),
  noCodeAi: z.string(),
  customAgent: z.string(),
  selected: z.enum(["existingFeature", "noCodeAi", "customAgent", "none"]),
  rationale: z.string(),
});
export type AiViability = z.infer<typeof AiViability>;

/**
 * §11 — the estimated effect of an opportunity on its target steps. Deltas are
 * applied by the deterministic scenario engine; the LLM never computes metrics.
 */
export const EstimatedImpact = z.object({
  waitTimeDeltaMin: z.number().optional(),
  pctCompleteAccurateDelta: z.number().optional(),
  processTimeDeltaMin: z.number().optional(),
  /** Steps this opportunity introduces (e.g. a new automated step). */
  addsSteps: z.array(Step).optional(),
  /** Steps this opportunity eliminates. */
  removesStepIds: z.array(z.string()).optional(),
});
export type EstimatedImpact = z.infer<typeof EstimatedImpact>;

/** §12 / decision 4 — the commercial core. Dual-tagged, MVS-selected. */
export const Opportunity = z.object({
  id: z.string().min(1),
  targetStepIds: z.array(z.string()),
  title: z.string().min(1),
  problem: z.string(),
  improvementType: ImprovementType,
  deliverableType: DeliverableType,
  /** 0..5; must equal ladderRungOf(deliverableType) — enforced by validateIR. */
  ladderRung: z.number().int().min(0).max(5),
  proposedSolution: z.string(),
  aiViability: AiViability,
  /** Why higher rungs were NOT chosen (credibility — §12.3). */
  rejectedAlternatives: z.array(z.string()).default([]),
  estimatedImpact: EstimatedImpact,
  complexity: z.enum(["S", "M", "L"]),
  /** Ranking key for the report (§13.5). */
  roiToComplexity: z.enum(["high", "medium", "low"]),
  sellBack: z.object({ build: z.string(), ongoing: z.string() }),
});
export type Opportunity = z.infer<typeof Opportunity>;

/** decision 8 — a named future state: a curated bundle of opportunities. */
export const Scenario = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  narrative: z.string(),
  /** Metrics are COMPUTED from this bundle, never stored (§8 note). */
  opportunityIds: z.array(z.string()),
});
export type Scenario = z.infer<typeof Scenario>;

export const IRMeta = z.object({
  client: z.string(),
  engagementDate: z.string(),
  consultant: z.string().default(""),
  sourceFiles: z.array(z.string()).default([]),
  /** Bumped each reconcile round (§8). */
  irVersion: z.number().int().min(1).default(1),
});
export type IRMeta = z.infer<typeof IRMeta>;

export const IR = z.object({
  meta: IRMeta,
  processes: z.array(Process),
  opportunities: z.array(Opportunity).default([]),
  scenarios: z.array(Scenario).default([]),
});
export type IR = z.infer<typeof IR>;

// ---------------------------------------------------------------------------
// Validation, load, save
// ---------------------------------------------------------------------------

export class IRValidationError extends Error {
  constructor(
    message: string,
    readonly issues: string[],
  ) {
    super(message);
    this.name = "IRValidationError";
  }
}

/**
 * Parse + validate an unknown value into an IR, applying cross-field invariants
 * the zod schema can't express on its own (referential integrity, MVS rung).
 */
export function validateIR(input: unknown): IR {
  const parsed = IR.safeParse(input);
  if (!parsed.success) {
    throw new IRValidationError(
      "IR failed schema validation",
      parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
    );
  }
  const ir = parsed.data;
  const issues = referentialIssues(ir);
  if (issues.length > 0) {
    throw new IRValidationError("IR failed referential validation", issues);
  }
  return ir;
}

/** Non-throwing referential/invariant check. Returns a list of human-readable issues. */
export function referentialIssues(ir: IR): string[] {
  const issues: string[] = [];
  const stepIds = new Set<string>();
  for (const proc of ir.processes) {
    for (const step of proc.steps) {
      if (stepIds.has(step.id)) issues.push(`duplicate step id: ${step.id}`);
      stepIds.add(step.id);
    }
  }
  for (const proc of ir.processes) {
    for (const flow of proc.flows) {
      if (!stepIds.has(flow.fromStepId))
        issues.push(`flow ${flow.id} references missing fromStepId ${flow.fromStepId}`);
      if (!stepIds.has(flow.toStepId))
        issues.push(`flow ${flow.id} references missing toStepId ${flow.toStepId}`);
    }
  }
  const oppIds = new Set<string>();
  for (const opp of ir.opportunities) {
    if (oppIds.has(opp.id)) issues.push(`duplicate opportunity id: ${opp.id}`);
    oppIds.add(opp.id);
    const expectedRung = ladderRungOf(opp.deliverableType);
    if (opp.ladderRung !== expectedRung)
      issues.push(
        `opportunity ${opp.id}: ladderRung ${opp.ladderRung} != rung ${expectedRung} for ${opp.deliverableType}`,
      );
    for (const sid of opp.targetStepIds)
      if (!stepIds.has(sid))
        issues.push(`opportunity ${opp.id} targets missing step ${sid}`);
  }
  for (const scn of ir.scenarios) {
    for (const oid of scn.opportunityIds)
      if (!oppIds.has(oid))
        issues.push(`scenario ${scn.id} references missing opportunity ${oid}`);
  }
  return issues;
}

/** Stable JSON serialization (2-space indent, trailing newline) for clean diffs. */
export function serializeIR(ir: IR): string {
  return JSON.stringify(ir, null, 2) + "\n";
}

export function parseIR(json: string): IR {
  return validateIR(JSON.parse(json));
}

// ---- Small lookup helpers used across the engine -------------------------

export function allSteps(ir: IR): Step[] {
  return ir.processes.flatMap((p) => p.steps);
}

export function stepById(ir: IR, id: string): Step | undefined {
  return allSteps(ir).find((s) => s.id === id);
}

export function opportunityById(ir: IR, id: string): Opportunity | undefined {
  return ir.opportunities.find((o) => o.id === id);
}
