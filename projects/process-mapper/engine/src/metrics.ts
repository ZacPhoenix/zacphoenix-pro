/**
 * VSM metric computations (PRD §11, decision 7).
 *
 * DETERMINISTIC ONLY. Same steps in → identical numbers out, every time. No LLM,
 * no randomness, no clock. This is the trust core of the product (§7.2, R4): a
 * consultant cannot present numbers that change between runs.
 */
import type { IR, Process, Step } from "./ir.js";
import { allSteps } from "./ir.js";

export interface StreamMetrics {
  /** Number of steps the rollup covers. */
  stepCount: number;
  /** Σ Process Time (value-adding work time), minutes. */
  totalProcessTimeMin: number;
  /** Σ Wait Time (delay/queue), minutes. */
  totalWaitTimeMin: number;
  /** Total elapsed time end-to-end = Σ PT + Σ WT, minutes. */
  totalLeadTimeMin: number;
  /** Σ PT for steps where isValueAdded = true, minutes. */
  totalValueAddedTimeMin: number;
  /** (Value-Added Time ÷ Lead Time) × 100. The headline efficiency number. */
  pce: number;
  /** Product of each step's (%C&A ÷ 100), as a percentage. Quality compounding. */
  rolledPctCompleteAccurate: number;
}

/** Round to a fixed number of decimals to keep output stable and presentable. */
function round(n: number, dp = 2): number {
  const f = 10 ** dp;
  // +0 normalizes -0 to 0 for clean serialization.
  return Math.round(n * f) / f + 0;
}

/**
 * Core rollup over an arbitrary set of steps. Used for the whole stream, a single
 * process, or a scenario's mutated step set.
 */
export function computeStreamMetrics(steps: Step[]): StreamMetrics {
  let pt = 0;
  let wt = 0;
  let va = 0;
  let rolled = 1;
  for (const step of steps) {
    pt += step.metrics.processTimeMin;
    wt += step.metrics.waitTimeMin;
    if (step.isValueAdded) va += step.metrics.processTimeMin;
    rolled *= step.metrics.pctCompleteAccurate / 100;
  }
  const leadTime = pt + wt;
  const pce = leadTime > 0 ? (va / leadTime) * 100 : 0;
  const rolledPct = steps.length > 0 ? rolled * 100 : 0;
  return {
    stepCount: steps.length,
    totalProcessTimeMin: round(pt),
    totalWaitTimeMin: round(wt),
    totalLeadTimeMin: round(leadTime),
    totalValueAddedTimeMin: round(va),
    pce: round(pce),
    rolledPctCompleteAccurate: round(rolledPct),
  };
}

/** Baseline metrics across every step in every process. */
export function computeBaselineMetrics(ir: IR): StreamMetrics {
  return computeStreamMetrics(allSteps(ir));
}

/** Per-process rollups, keyed by process id. */
export function computeProcessMetrics(ir: IR): Record<string, StreamMetrics> {
  const out: Record<string, StreamMetrics> = {};
  for (const proc of ir.processes) out[proc.id] = computeStreamMetrics(proc.steps);
  return out;
}

export interface MetricDelta {
  totalLeadTimeMin: number;
  totalProcessTimeMin: number;
  totalWaitTimeMin: number;
  totalValueAddedTimeMin: number;
  pce: number;
  rolledPctCompleteAccurate: number;
}

/** before → after deltas (after − before), for the report's comparison tables. */
export function metricDelta(before: StreamMetrics, after: StreamMetrics): MetricDelta {
  return {
    totalLeadTimeMin: round(after.totalLeadTimeMin - before.totalLeadTimeMin),
    totalProcessTimeMin: round(after.totalProcessTimeMin - before.totalProcessTimeMin),
    totalWaitTimeMin: round(after.totalWaitTimeMin - before.totalWaitTimeMin),
    totalValueAddedTimeMin: round(
      after.totalValueAddedTimeMin - before.totalValueAddedTimeMin,
    ),
    pce: round(after.pce - before.pce),
    rolledPctCompleteAccurate: round(
      after.rolledPctCompleteAccurate - before.rolledPctCompleteAccurate,
    ),
  };
}

// ---- Presentation helpers (deterministic, used by report.ts) --------------

/** Minutes → a compact human string (e.g. 240 → "4h", 2880 → "2d"). */
export function formatMinutes(min: number): string {
  if (min < 60) return `${round(min, 1)}m`;
  const hours = min / 60;
  if (hours < 8) return `${round(hours, 1)}h`;
  // Treat a working day as 8h for lead-time readability in an SMB context.
  const days = hours / 8;
  return `${round(days, 1)}d`;
}

/**
 * Flag steps the room should see as pain (FR-8): bottleneck wait, low %C&A.
 * Thresholds are deterministic engine policy, not LLM judgment.
 */
export interface StepFlags {
  highWait: boolean;
  lowQuality: boolean;
}
export const FLAG_THRESHOLDS = { highWaitMin: 120, lowQualityPct: 80 } as const;

export function flagsForStep(step: Step): StepFlags {
  return {
    highWait: step.metrics.waitTimeMin >= FLAG_THRESHOLDS.highWaitMin,
    lowQuality: step.metrics.pctCompleteAccurate < FLAG_THRESHOLDS.lowQualityPct,
  };
}

export function isBottleneck(step: Step): boolean {
  const f = flagsForStep(step);
  return f.highWait || f.lowQuality;
}

/** All bottleneck steps across the IR, in document order. */
export function bottlenecks(ir: IR): { process: Process; step: Step }[] {
  const out: { process: Process; step: Step }[] = [];
  for (const process of ir.processes)
    for (const step of process.steps)
      if (isBottleneck(step)) out.push({ process, step });
  return out;
}
