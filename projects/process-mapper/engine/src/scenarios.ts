/**
 * Scenario computation (PRD §11 + decision 8).
 *
 * A scenario is a curated bundle of opportunities. Its metrics are COMPUTED, not
 * stored: start from the baseline per-step metrics, apply each bundled
 * opportunity's `estimatedImpact` deltas to the affected steps (adding/removing
 * steps where it says so), then recompute all rollups. DETERMINISTIC (§7.2).
 */
import type { IR, Opportunity, Scenario, Step } from "./ir.js";
import { allSteps, opportunityById } from "./ir.js";
import {
  computeStreamMetrics,
  metricDelta,
  type MetricDelta,
  type StreamMetrics,
} from "./metrics.js";

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Deep-ish clone of a step's mutable metric fields (enough for delta application). */
function cloneStep(step: Step): Step {
  return { ...step, metrics: { ...step.metrics }, painPoints: [...step.painPoints] };
}

/**
 * Apply a single opportunity's impact to a working map of steps (keyed by id).
 * Mutates `byId` in place. Unknown target ids are ignored (validated upstream).
 */
function applyOpportunity(byId: Map<string, Step>, opp: Opportunity): void {
  const imp = opp.estimatedImpact;
  for (const id of opp.targetStepIds) {
    const step = byId.get(id);
    if (!step) continue;
    const m = step.metrics;
    if (imp.processTimeDeltaMin !== undefined)
      m.processTimeMin = clamp(m.processTimeMin + imp.processTimeDeltaMin, 0, Infinity);
    if (imp.waitTimeDeltaMin !== undefined)
      m.waitTimeMin = clamp(m.waitTimeMin + imp.waitTimeDeltaMin, 0, Infinity);
    if (imp.pctCompleteAccurateDelta !== undefined)
      m.pctCompleteAccurate = clamp(
        m.pctCompleteAccurate + imp.pctCompleteAccurateDelta,
        0,
        100,
      );
  }
  for (const id of imp.removesStepIds ?? []) byId.delete(id);
  for (const added of imp.addsSteps ?? []) byId.set(added.id, cloneStep(added));
}

/**
 * Build the mutated step set for a scenario by applying its opportunities in
 * order over a clone of the baseline steps. Returns a fresh array (insertion
 * order preserved; newly-added steps appended).
 */
export function applyScenario(ir: IR, scenario: Scenario): Step[] {
  const byId = new Map<string, Step>();
  for (const step of allSteps(ir)) byId.set(step.id, cloneStep(step));
  for (const oid of scenario.opportunityIds) {
    const opp = opportunityById(ir, oid);
    if (opp) applyOpportunity(byId, opp);
  }
  return [...byId.values()];
}

export interface ScenarioResult {
  scenario: Scenario;
  before: StreamMetrics;
  after: StreamMetrics;
  delta: MetricDelta;
  /** The mutated step set, for downstream Mermaid rendering of the future state. */
  mutatedSteps: Step[];
}

/** Compute a single scenario against the IR baseline. */
export function computeScenario(ir: IR, scenario: Scenario): ScenarioResult {
  const before = computeStreamMetrics(allSteps(ir));
  const mutatedSteps = applyScenario(ir, scenario);
  const after = computeStreamMetrics(mutatedSteps);
  return { scenario, before, after, delta: metricDelta(before, after), mutatedSteps };
}

/** Compute every scenario in the IR, in document order. */
export function computeAllScenarios(ir: IR): ScenarioResult[] {
  return ir.scenarios.map((s) => computeScenario(ir, s));
}

/**
 * Rank opportunities by ROI-to-complexity for the report (§13.5 / MVS ordering).
 * Higher ROI first; ties broken by lower complexity, then lower ladder rung.
 */
export function rankOpportunities(opps: Opportunity[]): Opportunity[] {
  const roiRank = { high: 0, medium: 1, low: 2 } as const;
  const cxRank = { S: 0, M: 1, L: 2 } as const;
  return [...opps].sort((a, b) => {
    if (roiRank[a.roiToComplexity] !== roiRank[b.roiToComplexity])
      return roiRank[a.roiToComplexity] - roiRank[b.roiToComplexity];
    if (cxRank[a.complexity] !== cxRank[b.complexity])
      return cxRank[a.complexity] - cxRank[b.complexity];
    return a.ladderRung - b.ladderRung;
  });
}
