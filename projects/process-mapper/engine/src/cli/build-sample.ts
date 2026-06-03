/**
 * Build the sample report from samples/sample-ir.json (PRD §15, §19 AC-6).
 *
 * Inlines the Mermaid library so the produced HTML renders fully offline. Looks
 * for a UMD build of mermaid in node_modules; if none is found, still writes the
 * report (diagrams as source) and warns. Usage: `npm run sample`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseIR } from "../ir.js";
import { renderReport } from "../report.js";
import { findMermaid } from "./mermaid-bundle.js";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "../.."); // engine/
const samples = join(root, "../samples");

const ir = parseIR(readFileSync(join(samples, "sample-ir.json"), "utf8"));
const mermaidJs = findMermaid();
if (!mermaidJs)
  console.warn(
    "[build-sample] mermaid UMD bundle not found in node_modules; diagrams will show as source. Run `npm install` to enable offline rendering.",
  );

const html = renderReport(ir, { mermaidJs });
const out = join(samples, "sample-report.html");
writeFileSync(out, html, "utf8");
console.log(`[build-sample] wrote ${out} (${(html.length / 1024).toFixed(0)} KB, mermaid inlined: ${Boolean(mermaidJs)})`);
