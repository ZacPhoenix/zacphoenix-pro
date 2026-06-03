import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseIR } from "../src/ir.js";
import {
  computeScenario,
  computeAllScenarios,
  rankOpportunities,
  applyScenario,
} from "../src/scenarios.js";

const here = dirname(fileURLToPath(import.meta.url));
const ir = parseIR(readFileSync(join(here, "../../samples/sample-ir.json"), "utf8"));

describe("Quick Wins scenario (hand-worked, AC-4/AC-5)", () => {
  const scn = ir.scenarios.find((s) => s.id === "scn_quick_wins")!;
  const r = computeScenario(ir, scn);

  it("applies deltas to the right steps", () => {
    const byId = new Map(applyScenario(ir, scn).map((s) => [s.id, s]));
    expect(byId.get("step_001")!.metrics).toMatchObject({ processTimeMin: 3, waitTimeMin: 60, pctCompleteAccurate: 95 });
    expect(byId.get("step_003")!.metrics.waitTimeMin).toBe(60);
    expect(byId.get("step_006")!.metrics).toMatchObject({ waitTimeMin: 480, pctCompleteAccurate: 80 });
  });

  it("recomputes rolled-up metrics", () => {
    expect(r.after.totalProcessTimeMin).toBe(95);
    expect(r.after.totalWaitTimeMin).toBe(2700);
    expect(r.after.totalLeadTimeMin).toBe(2795);
    expect(r.after.totalValueAddedTimeMin).toBe(75);
    expect(r.after.pce).toBe(2.68);
    expect(r.after.rolledPctCompleteAccurate).toBe(26.51);
  });

  it("reports an improving before/after delta", () => {
    expect(r.before.totalLeadTimeMin).toBe(5800);
    expect(r.delta.totalLeadTimeMin).toBe(2795 - 5800);
    expect(r.delta.pce).toBeGreaterThan(0);
  });
});

describe("clamping", () => {
  it("never pushes %C&A above 100 or times below 0", () => {
    const scn = ir.scenarios.find((s) => s.id === "scn_transform")!;
    const steps = applyScenario(ir, scn);
    for (const s of steps) {
      expect(s.metrics.pctCompleteAccurate).toBeLessThanOrEqual(100);
      expect(s.metrics.pctCompleteAccurate).toBeGreaterThanOrEqual(0);
      expect(s.metrics.processTimeMin).toBeGreaterThanOrEqual(0);
      expect(s.metrics.waitTimeMin).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("all scenarios compute", () => {
  it("produces a result per scenario", () => {
    const results = computeAllScenarios(ir);
    expect(results.map((r) => r.scenario.id)).toEqual([
      "scn_quick_wins",
      "scn_automate_core",
      "scn_transform",
    ]);
  });
});

describe("rankOpportunities (MVS ordering, §13.5)", () => {
  it("orders by ROI, then complexity, then ladder rung", () => {
    const ranked = rankOpportunities(ir.opportunities).map((o) => o.id);
    expect(ranked).toEqual(["opp_002", "opp_004", "opp_001", "opp_003", "opp_005"]);
  });
});
