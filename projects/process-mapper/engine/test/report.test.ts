import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseIR } from "../src/ir.js";
import { renderReport } from "../src/report.js";

const here = dirname(fileURLToPath(import.meta.url));
const ir = parseIR(readFileSync(join(here, "../../samples/sample-ir.json"), "utf8"));
// Render without the mermaid bundle: fast, and lets us assert the offline fallback.
const html = renderReport(ir);

describe("report structure (§13, AC-6)", () => {
  it("contains all seven section areas", () => {
    for (const h of [
      "Current state",
      "Pain points",
      "Future-state scenarios",
      "Opportunities",
      "Next steps",
      "Appendix",
    ])
      expect(html).toContain(h);
  });

  it("leads with the PCE headline finding", () => {
    expect(html).toMatch(/process cycle efficiency/i);
    expect(html).toContain("1.38%"); // baseline PCE from the sample
  });

  it("embeds Mermaid diagrams as source when the bundle is not inlined", () => {
    expect(html).toContain('<pre class="mermaid">');
    expect(html).not.toContain("mermaid.initialize"); // no runtime without the bundle
  });
});

describe("the commercial contract (the point of the product — §2.4)", () => {
  it("ranks opportunities by ROI-to-complexity (MVS ordering)", () => {
    // Scope to the Opportunities section: titles also appear in scenario narratives.
    const section = html.slice(html.indexOf("Opportunities &amp; recommended solutions"));
    const order = ["Auto-approve small quotes", "Automatic reorder points", "Unify order intake", "Automate invoicing", "AI order-triage agent"];
    const positions = order.map((t) => section.indexOf(t));
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("frames every opportunity as a sell-back engagement (build + ongoing)", () => {
    expect(html).toContain("What we build:");
    expect(html).toContain("Ongoing support:");
  });

  it("leaves pricing blank, one per opportunity (N5)", () => {
    const count = (html.match(/to be scoped/g) ?? []).length;
    expect(count).toBe(ir.opportunities.length);
  });

  it("shows the AI-viability decision and rejected higher-complexity alternatives", () => {
    expect(html).toContain("AI viability");
    expect(html).toMatch(/Selected:/);
    expect(html).toContain("Why not a bigger build?");
  });
});

describe("brand override hook (§18 Q4)", () => {
  it("appends consultant brand CSS after the defaults", () => {
    const branded = renderReport(ir, { brandCss: ".cover{background:#000}" });
    expect(branded).toContain("/* brand overrides */");
    expect(branded.indexOf("/* brand overrides */")).toBeGreaterThan(branded.indexOf(":root{"));
  });
});
