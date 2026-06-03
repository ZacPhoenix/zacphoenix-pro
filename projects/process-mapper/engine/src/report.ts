/**
 * Self-contained HTML report (PRD §13, decision 9, FR-18). DETERMINISTIC assembly.
 *
 * One `.html` file with Mermaid inlined so it renders offline with no network.
 * This file IS the proposal (§2.4): it documents current state, presents 2–3
 * future-state scenarios with before/after metrics, and frames every opportunity
 * as a sell-back engagement (build + ongoing support), ranked by ROI-to-complexity,
 * with pricing deliberately left blank (N5).
 *
 * `mermaidJs` (the library source) is injected by the caller so this module stays
 * pure and testable without bundling megabytes. When omitted, diagrams still embed
 * as `<pre class="mermaid">` and a small note explains how to enable rendering.
 */
import type { IR, Opportunity, Step } from "./ir.js";
import { allSteps, ladderRungOf, type DeliverableType } from "./ir.js";
import {
  bottlenecks,
  computeBaselineMetrics,
  flagsForStep,
  formatMinutes,
  type MetricDelta,
  type StreamMetrics,
} from "./metrics.js";
import { computeAllScenarios, rankOpportunities, type ScenarioResult } from "./scenarios.js";
import { mermaidCurrentState, mermaidScenario } from "./mermaid.js";

export interface ReportOptions {
  /** The Mermaid library source to inline (e.g. node_modules/mermaid/dist/mermaid.min.js). */
  mermaidJs?: string;
  /** Optional consultant brand CSS appended last to override defaults (§18 Q4). */
  brandCss?: string;
}

const esc = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const DELIVERABLE_LABEL: Record<DeliverableType, string> = {
  "process-change": "Process change",
  "config-or-feature-toggle": "Enable an owned feature/config",
  "off-the-shelf-product": "Off-the-shelf product",
  "no-code-automation": "No-code automation",
  integration: "Integration / data plumbing",
  "custom-claude-build": "Custom Claude build",
};

const AI_LABEL: Record<string, string> = {
  existingFeature: "Existing / SaaS AI feature",
  noCodeAi: "AI inside no-code automation",
  customAgent: "Custom AI agent",
  none: "No AI needed",
};

function mermaidBlock(src: string): string {
  return `<pre class="mermaid">\n${esc(src)}\n</pre>`;
}

function metricsTable(m: StreamMetrics): string {
  const rows: [string, string][] = [
    ["Total Lead Time", formatMinutes(m.totalLeadTimeMin)],
    ["Total Process Time", formatMinutes(m.totalProcessTimeMin)],
    ["Value-Added Time", formatMinutes(m.totalValueAddedTimeMin)],
    ["Total Wait Time", formatMinutes(m.totalWaitTimeMin)],
    ["Process Cycle Efficiency (PCE)", `${m.pce}%`],
    ["Rolled %C&A", `${m.rolledPctCompleteAccurate}%`],
  ];
  return `<table class="metrics"><tbody>${rows
    .map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`)
    .join("")}</tbody></table>`;
}

function deltaCell(value: number, fmt: (n: number) => string, goodIsNegative: boolean): string {
  const cls = value === 0 ? "" : (value < 0) === goodIsNegative ? "good" : "bad";
  const sign = value > 0 ? "+" : "";
  return `<td class="${cls}">${sign}${fmt(value)}</td>`;
}

function comparisonTable(before: StreamMetrics, after: StreamMetrics, d: MetricDelta): string {
  const pct = (n: number) => `${n}%`;
  const row = (
    name: string,
    b: string,
    a: string,
    delta: number,
    fmt: (n: number) => string,
    goodIsNegative: boolean,
  ) => `<tr><th>${name}</th><td>${b}</td><td>${a}</td>${deltaCell(delta, fmt, goodIsNegative)}</tr>`;
  return `<table class="compare">
  <thead><tr><th>Metric</th><th>Current</th><th>Future</th><th>Change</th></tr></thead>
  <tbody>
    ${row("Lead Time", formatMinutes(before.totalLeadTimeMin), formatMinutes(after.totalLeadTimeMin), d.totalLeadTimeMin, formatMinutes, true)}
    ${row("Process Time", formatMinutes(before.totalProcessTimeMin), formatMinutes(after.totalProcessTimeMin), d.totalProcessTimeMin, formatMinutes, true)}
    ${row("Wait Time", formatMinutes(before.totalWaitTimeMin), formatMinutes(after.totalWaitTimeMin), d.totalWaitTimeMin, formatMinutes, true)}
    ${row("PCE", pct(before.pce), pct(after.pce), d.pce, pct, false)}
    ${row("Rolled %C&A", pct(before.rolledPctCompleteAccurate), pct(after.rolledPctCompleteAccurate), d.rolledPctCompleteAccurate, pct, false)}
  </tbody>
</table>`;
}

function impactSummary(opp: Opportunity): string {
  const i = opp.estimatedImpact;
  const bits: string[] = [];
  if (i.waitTimeDeltaMin) bits.push(`Wait ${i.waitTimeDeltaMin > 0 ? "+" : ""}${formatMinutes(i.waitTimeDeltaMin)}`);
  if (i.processTimeDeltaMin) bits.push(`Process ${i.processTimeDeltaMin > 0 ? "+" : ""}${formatMinutes(i.processTimeDeltaMin)}`);
  if (i.pctCompleteAccurateDelta) bits.push(`%C&A ${i.pctCompleteAccurateDelta > 0 ? "+" : ""}${i.pctCompleteAccurateDelta}`);
  if (i.addsSteps?.length) bits.push(`+${i.addsSteps.length} step(s)`);
  if (i.removesStepIds?.length) bits.push(`−${i.removesStepIds.length} step(s)`);
  return bits.length ? bits.join(" · ") : "Qualitative improvement";
}

function opportunityCard(ir: IR, opp: Opportunity, idx: number): string {
  const rung = ladderRungOf(opp.deliverableType);
  const ai = opp.aiViability;
  const stepNames = opp.targetStepIds
    .map((id) => allSteps(ir).find((s) => s.id === id)?.name ?? id)
    .map(esc)
    .join(", ");
  return `<article class="opp">
  <header>
    <span class="rank">#${idx + 1}</span>
    <h3>${esc(opp.title)}</h3>
    <span class="badges">
      <span class="badge roi-${opp.roiToComplexity}">ROI/complexity: ${opp.roiToComplexity}</span>
      <span class="badge">Complexity: ${opp.complexity}</span>
      <span class="badge ladder">Rung ${rung} · ${DELIVERABLE_LABEL[opp.deliverableType]}</span>
      <span class="badge">${esc(opp.improvementType)}</span>
    </span>
  </header>
  <p class="targets"><strong>Affects:</strong> ${stepNames || "—"}</p>
  <p class="problem"><strong>Problem.</strong> ${esc(opp.problem)}</p>
  <p class="solution"><strong>Recommended (minimal viable) solution.</strong> ${esc(opp.proposedSolution)}</p>
  <div class="ai">
    <strong>AI viability.</strong>
    <ul>
      <li><em>Existing / SaaS AI feature:</em> ${esc(ai.existingFeature)}</li>
      <li><em>AI inside no-code:</em> ${esc(ai.noCodeAi)}</li>
      <li><em>Custom AI agent:</em> ${esc(ai.customAgent)}</li>
      <li><strong>Selected: ${AI_LABEL[ai.selected] ?? esc(ai.selected)}.</strong> ${esc(ai.rationale)}</li>
    </ul>
  </div>
  ${
    opp.rejectedAlternatives.length
      ? `<div class="rejected"><strong>Why not a bigger build?</strong><ul>${opp.rejectedAlternatives
          .map((r) => `<li>${esc(r)}</li>`)
          .join("")}</ul></div>`
      : ""
  }
  <p class="impact"><strong>Quantified impact (ROI).</strong> ${impactSummary(opp)}</p>
  <div class="sellback">
    <div><strong>What we build:</strong> ${esc(opp.sellBack.build)}</div>
    <div><strong>Ongoing support:</strong> ${esc(opp.sellBack.ongoing)}</div>
    <div class="pricing"><strong>Investment:</strong> <span class="blank">[ to be scoped ]</span></div>
  </div>
</article>`;
}

function scenarioSection(ir: IR, r: ScenarioResult): string {
  return `<section class="scenario">
  <h3>${esc(r.scenario.name)}</h3>
  <p class="narrative">${esc(r.scenario.narrative)}</p>
  ${mermaidBlock(mermaidScenario(ir, r))}
  ${comparisonTable(r.before, r.after, r.delta)}
  <p class="bundle"><strong>Includes:</strong> ${r.scenario.opportunityIds.map(esc).join(", ")}</p>
</section>`;
}

function painPointsSection(ir: IR): string {
  const items: string[] = [];
  for (const { process, step } of bottlenecks(ir)) {
    const f = flagsForStep(step);
    const tags = [f.highWait ? "high wait" : "", f.lowQuality ? "low %C&A" : ""]
      .filter(Boolean)
      .join(", ");
    items.push(
      `<li><strong>${esc(step.name)}</strong> <span class="muted">(${esc(process.name)} — ${tags})</span>: ${
        step.painPoints.map(esc).join("; ") || "flagged by metrics"
      }</li>`,
    );
  }
  // Also surface explicit pain points even where metrics didn't flag the step.
  for (const step of allSteps(ir))
    if (step.painPoints.length && !bottlenecks(ir).some((b) => b.step.id === step.id))
      items.push(`<li><strong>${esc(step.name)}</strong>: ${step.painPoints.map(esc).join("; ")}</li>`);
  return items.length
    ? `<ul class="pains">${items.join("")}</ul>`
    : `<p class="muted">No bottlenecks flagged.</p>`;
}

function appendixSection(ir: IR): string {
  const estimated: string[] = [];
  for (const step of allSteps(ir))
    if (step.metrics.estimated?.length)
      estimated.push(`<li><strong>${esc(step.name)}:</strong> ${step.metrics.estimated.map(esc).join(", ")}</li>`);
  return `<h3>Assumptions & data gaps</h3>
  ${estimated.length ? `<ul>${estimated.join("")}</ul>` : `<p class="muted">No estimated metrics flagged.</p>`}
  <h3>Source files</h3>
  <ul>${ir.meta.sourceFiles.map((f) => `<li>${esc(f)}</li>`).join("") || "<li class='muted'>—</li>"}</ul>`;
}

function execHeadline(ir: IR, baseline: StreamMetrics): string {
  const oppCount = ir.opportunities.length;
  return `${esc(ir.meta.client)}'s mapped processes run at <strong>${baseline.pce}% process cycle efficiency</strong>. We identified <strong>${oppCount} improvement ${
    oppCount === 1 ? "opportunity" : "opportunities"
  }</strong> across ${ir.processes.length} process(es), bundled into ${ir.scenarios.length} future-state scenario(s).`;
}

const BASE_CSS = `
:root{--ink:#1f2933;--muted:#7b8794;--line:#e4e7eb;--accent:#2b6cb0;--good:#2f855a;--bad:#c53030;--pain:#c0392b;}
*{box-sizing:border-box}
body{font:16px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;color:var(--ink);margin:0;background:#fff}
.wrap{max-width:960px;margin:0 auto;padding:48px 32px}
h1{font-size:30px;margin:0 0 4px}h2{font-size:22px;margin:48px 0 12px;padding-bottom:6px;border-bottom:2px solid var(--line)}
h3{font-size:18px;margin:24px 0 8px}
.cover{padding:32px;background:#f5f7fa;border:1px solid var(--line);border-radius:12px}
.cover .meta{color:var(--muted);font-size:14px}
.lead{font-size:18px}
.muted{color:var(--muted)}
table{border-collapse:collapse;width:100%;margin:12px 0;font-size:15px}
th,td{border:1px solid var(--line);padding:8px 10px;text-align:left}
table.metrics th{width:55%;background:#f5f7fa}
table.compare thead th{background:#f5f7fa}
td.good{color:var(--good);font-weight:600}td.bad{color:var(--bad);font-weight:600}
pre.mermaid{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px;overflow:auto}
.scenario{margin:24px 0;padding:16px;border:1px solid var(--line);border-radius:10px}
article.opp{border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:8px;padding:16px 18px;margin:16px 0}
article.opp header{display:flex;flex-wrap:wrap;align-items:center;gap:8px}
article.opp h3{margin:0;flex:1 1 auto}
.rank{font-weight:700;color:var(--accent)}
.badges{display:flex;flex-wrap:wrap;gap:6px;flex-basis:100%}
.badge{font-size:12px;background:#edf2f7;border-radius:999px;padding:2px 10px;color:#334}
.badge.ladder{background:#e6f0fb}
.badge.roi-high{background:#def7ec;color:#03543f}.badge.roi-medium{background:#fef3c7;color:#92400e}.badge.roi-low{background:#fde2e2;color:#9b1c1c}
.ai ul,.rejected ul{margin:4px 0 4px 18px}
.sellback{background:#f5f7fa;border-radius:8px;padding:10px 12px;margin-top:8px;font-size:15px}
.sellback .blank{color:var(--muted);font-style:italic}
.pains li{margin:4px 0}
.cta{background:#e6f0fb;border:1px solid #bcd4ef;border-radius:10px;padding:18px}
footer{margin-top:48px;color:var(--muted);font-size:13px;border-top:1px solid var(--line);padding-top:12px}
@media print{.wrap{padding:0}body{font-size:12px}h2{page-break-after:avoid}article.opp,.scenario{page-break-inside:avoid}}
`;

function mermaidRuntime(mermaidJs?: string): string {
  if (mermaidJs) {
    return `<script>${mermaidJs}</script>
<script>mermaid.initialize({startOnLoad:true,securityLevel:"loose",flowchart:{useMaxWidth:true}});</script>`;
  }
  return `<!-- mermaid library not inlined; diagrams shown as source. To render, rebuild with the mermaid bundle injected (engine/src/cli/build-sample.ts). -->`;
}

/** Render the full self-contained HTML report for an IR. */
export function renderReport(ir: IR, opts: ReportOptions = {}): string {
  const baseline = computeBaselineMetrics(ir);
  const scenarios = computeAllScenarios(ir);
  const ranked = rankOpportunities(ir.opportunities);

  const body = `<div class="wrap">
  <section class="cover">
    <h1>Process & Opportunity Report</h1>
    <div class="meta">${esc(ir.meta.client)} · ${esc(ir.meta.engagementDate)}${
      ir.meta.consultant ? ` · ${esc(ir.meta.consultant)}` : ""
    }</div>
    <p class="lead">${execHeadline(ir, baseline)}</p>
  </section>

  <h2>1 · Current state</h2>
  ${mermaidBlock(mermaidCurrentState(ir))}
  <h3>Baseline metrics</h3>
  ${metricsTable(baseline)}

  <h2>2 · Pain points</h2>
  ${painPointsSection(ir)}

  <h2>3 · Future-state scenarios</h2>
  ${scenarios.map((r) => scenarioSection(ir, r)).join("\n") || '<p class="muted">No scenarios defined.</p>'}

  <h2>4 · Opportunities &amp; recommended solutions</h2>
  <p class="muted">Ranked by ROI-to-complexity (minimal-viable-solution ordering). Pricing is left for the consultant to scope.</p>
  ${ranked.map((o, i) => opportunityCard(ir, o, i)).join("\n") || '<p class="muted">No opportunities identified.</p>'}

  <h2>5 · Next steps</h2>
  <div class="cta">
    <p>The opportunities above are concrete engagements we can deliver — each is a build plus ongoing support and iteration. We recommend starting with the highest ROI-to-complexity items.</p>
    <p class="muted">Scope, timeline, and pricing to be confirmed together.</p>
  </div>

  <h2>6 · Appendix</h2>
  ${appendixSection(ir)}

  <footer>Generated by Cartographer · IR v${ir.meta.irVersion} · self-contained, offline-viewable.</footer>
</div>`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(ir.meta.client)} — Process & Opportunity Report</title>
<style>${BASE_CSS}${opts.brandCss ? "\n/* brand overrides */\n" + opts.brandCss : ""}</style>
</head>
<body>
${body}
${mermaidRuntime(opts.mermaidJs)}
</body>
</html>
`;
}
