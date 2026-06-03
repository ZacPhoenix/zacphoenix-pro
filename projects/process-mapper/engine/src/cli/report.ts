/**
 * CLI: render the self-contained HTML report from an IR (Stage 5, M6).
 *
 *   npx tsx src/cli/report.ts <ir.json> [--out report.html] [--brand-css brand.css]
 *
 * Inlines the Mermaid bundle so the output renders fully offline (PRD §13, AC-6).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseIR } from "../ir.js";
import { renderReport } from "../report.js";
import { findMermaid } from "./mermaid-bundle.js";
import { getArg } from "./args.js";

const irPath = process.argv[2];
if (!irPath) {
  console.error("usage: report <ir.json> [--out report.html] [--brand-css brand.css]");
  process.exit(1);
}
const out = getArg("--out") ?? irPath.replace(/\.json$/, "") + ".report.html";
const brandPath = getArg("--brand-css");

const ir = parseIR(readFileSync(irPath, "utf8"));
const mermaidJs = findMermaid();
if (!mermaidJs)
  console.warn("[report] mermaid bundle not found; diagrams will show as source (run npm install).");
const brandCss = brandPath ? readFileSync(brandPath, "utf8") : undefined;

const html = renderReport(ir, { mermaidJs, brandCss });
writeFileSync(out, html, "utf8");
console.log(`[report] wrote ${out} (${(html.length / 1024).toFixed(0)} KB, mermaid inlined: ${Boolean(mermaidJs)})`);
