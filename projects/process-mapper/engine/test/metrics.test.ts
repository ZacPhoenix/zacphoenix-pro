import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import {
  computeStreamMetrics,
  computeBaselineMetrics,
  metricDelta,
  formatMinutes,
  isBottleneck,
  bottlenecks,
} from "../src/metrics.js";
import { parseIR, type Step } from "../src/ir.js";

const here = dirname(fileURLToPath(import.meta.url));
const sampleIR = parseIR(
  readFileSync(join(here, "../../samples/sample-ir.json"), "utf8"),
);

function step(p: Partial<Step> & { id: string; metrics: Step["metrics"]; isValueAdded: boolean }): Step {
  return { name: p.id, painPoints: [], ...p } as Step;
}

describe("computeStreamMetrics — hand-worked", () => {
  const steps: Step[] = [
    step({ id: "a", metrics: { processTimeMin: 10, waitTimeMin: 50, pctCompleteAccurate: 50 }, isValueAdded: true }),
    step({ id: "b", metrics: { processTimeMin: 20, waitTimeMin: 30, pctCompleteAccurate: 80 }, isValueAdded: false }),
  ];
  const m = computeStreamMetrics(steps);

  it("sums process and wait time", () => {
    expect(m.totalProcessTimeMin).toBe(30);
    expect(m.totalWaitTimeMin).toBe(80);
    expect(m.totalLeadTimeMin).toBe(110);
  });
  it("counts only value-added process time", () => {
    expect(m.totalValueAddedTimeMin).toBe(10);
  });
  it("computes PCE = VA / LT * 100", () => {
    expect(m.pce).toBe(9.09); // 10/110*100
  });
  it("computes rolled %C&A as the product of step quality", () => {
    expect(m.rolledPctCompleteAccurate).toBe(40); // 0.5*0.8*100
  });
});

describe("edge cases", () => {
  it("empty stream yields zeros, not NaN", () => {
    const m = computeStreamMetrics([]);
    expect(m.pce).toBe(0);
    expect(m.rolledPctCompleteAccurate).toBe(0);
    expect(m.totalLeadTimeMin).toBe(0);
  });
  it("zero lead time does not divide by zero", () => {
    const m = computeStreamMetrics([
      step({ id: "z", metrics: { processTimeMin: 0, waitTimeMin: 0, pctCompleteAccurate: 100 }, isValueAdded: true }),
    ]);
    expect(m.pce).toBe(0);
  });
});

describe("metricDelta", () => {
  it("computes after - before", () => {
    const before = computeStreamMetrics([
      step({ id: "a", metrics: { processTimeMin: 10, waitTimeMin: 90, pctCompleteAccurate: 50 }, isValueAdded: true }),
    ]);
    const after = computeStreamMetrics([
      step({ id: "a", metrics: { processTimeMin: 10, waitTimeMin: 30, pctCompleteAccurate: 80 }, isValueAdded: true }),
    ]);
    const d = metricDelta(before, after);
    expect(d.totalWaitTimeMin).toBe(-60);
    expect(d.rolledPctCompleteAccurate).toBe(30);
  });
});

describe("formatMinutes", () => {
  it("formats minutes, hours, days (8h day)", () => {
    expect(formatMinutes(8)).toBe("8m");
    expect(formatMinutes(240)).toBe("4h");
    expect(formatMinutes(2880)).toBe("6d"); // 2880/60/8
  });
});

describe("bottleneck flags", () => {
  it("flags high wait and low quality", () => {
    expect(
      isBottleneck(step({ id: "h", metrics: { processTimeMin: 1, waitTimeMin: 200, pctCompleteAccurate: 100 }, isValueAdded: true })),
    ).toBe(true);
    expect(
      isBottleneck(step({ id: "q", metrics: { processTimeMin: 1, waitTimeMin: 0, pctCompleteAccurate: 70 }, isValueAdded: true })),
    ).toBe(true);
    expect(
      isBottleneck(step({ id: "ok", metrics: { processTimeMin: 1, waitTimeMin: 10, pctCompleteAccurate: 95 }, isValueAdded: true })),
    ).toBe(false);
  });
});

describe("sample IR baseline (AC-4)", () => {
  const m = computeBaselineMetrics(sampleIR);
  it("matches hand-worked totals", () => {
    expect(m.totalProcessTimeMin).toBe(100);
    expect(m.totalWaitTimeMin).toBe(5700);
    expect(m.totalLeadTimeMin).toBe(5800);
    expect(m.totalValueAddedTimeMin).toBe(80);
    expect(m.pce).toBe(1.38);
    expect(m.rolledPctCompleteAccurate).toBe(12.21);
  });
  it("identifies the expected bottlenecks", () => {
    const ids = bottlenecks(sampleIR).map((b) => b.step.id);
    // high wait: 001,002,003,004(no, 60<120),005,006,007 ; low quality(<80): 001(70),005(60),006(50)
    expect(ids).toContain("step_005");
    expect(ids).toContain("step_006");
    expect(ids).not.toContain("step_004");
  });
});
