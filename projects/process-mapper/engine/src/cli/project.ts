/**
 * CLI: project an IR onto an Excalidraw scene + sidecar ID-map (Stage 2, M3 offline).
 *
 *   npx tsx src/cli/project.ts <ir.json> [--out scene.excalidraw] [--idmap idmap.json]
 *
 * Writes a `.excalidraw` file the consultant imports into Excalidraw (FileTransport),
 * plus the ID-map sidecar reconcile needs later. The live MCP push is driven from
 * SKILL.md; this CLI is the zero-MCP local path.
 */
import { readFileSync } from "node:fs";
import { parseIR } from "../ir.js";
import { projectIR } from "../excalidraw.js";
import { FileTransport } from "../excalidraw-mcp.js";
import { serializeIdMap } from "../idmap.js";
import { writeFileSync } from "node:fs";
import { getArg } from "./args.js";

const irPath = process.argv[2];
if (!irPath) {
  console.error("usage: project <ir.json> [--out scene.excalidraw] [--idmap idmap.json]");
  process.exit(1);
}
const out = getArg("--out") ?? irPath.replace(/\.json$/, "") + ".excalidraw";
const idmapPath = getArg("--idmap") ?? irPath.replace(/\.json$/, "") + ".idmap.json";

const ir = parseIR(readFileSync(irPath, "utf8"));
const { elements, idMap } = projectIR(ir);
await new FileTransport(out).pushScene(elements);
writeFileSync(idmapPath, serializeIdMap(idMap), "utf8");
console.log(
  `[project] ${elements.length} elements → ${out}; ID-map (${Object.keys(idMap.irToElement).length} ids) → ${idmapPath}`,
);
