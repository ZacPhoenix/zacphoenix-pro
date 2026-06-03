/**
 * CLI: reconcile an edited board back into the IR (Stage 4, M4 offline path).
 *
 *   npx tsx src/cli/reconcile.ts <ir.json> <board.excalidraw> \
 *       [--idmap idmap.json] [--out updated-ir.json] [--proposals proposals.json]
 *
 * Applies ONLY the safe deterministic changes to the IR (moves/edits/deletes) and
 * writes the updated IR. The human additions + ambiguous changes are written to a
 * proposals file for the consultant to confirm in Stage 5 — they are NOT auto-merged.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { parseIR, serializeIR } from "../ir.js";
import { reconcileBoard, applyTrackedChanges } from "../excalidraw.js";
import { FileTransport } from "../excalidraw-mcp.js";
import { parseIdMap, emptyIdMap } from "../idmap.js";
import { getArg } from "./args.js";

const irPath = process.argv[2];
const boardPath = process.argv[3];
if (!irPath || !boardPath) {
  console.error(
    "usage: reconcile <ir.json> <board.excalidraw> [--idmap idmap.json] [--out updated-ir.json] [--proposals proposals.json]",
  );
  process.exit(1);
}
const idmapPath = getArg("--idmap") ?? irPath.replace(/\.json$/, "") + ".idmap.json";
const outPath = getArg("--out") ?? irPath.replace(/\.json$/, "") + ".reconciled.json";
const proposalsPath = getArg("--proposals") ?? irPath.replace(/\.json$/, "") + ".proposals.json";

const ir = parseIR(readFileSync(irPath, "utf8"));
let idMap;
try {
  idMap = parseIdMap(readFileSync(idmapPath, "utf8"));
} catch {
  console.warn(`[reconcile] no ID-map at ${idmapPath}; relying on element customData only`);
  idMap = emptyIdMap(ir.meta.irVersion);
}

const board = await new FileTransport(boardPath).readScene();
const result = reconcileBoard(ir, idMap, board);
const updated = applyTrackedChanges(ir, result);

writeFileSync(outPath, serializeIR(updated), "utf8");
writeFileSync(
  proposalsPath,
  JSON.stringify(
    {
      note: "Human additions + ambiguous changes for Stage 5 review. NOT applied automatically.",
      untrackedAdditions: result.untrackedAdditions,
      ambiguous: result.trackedChanges.filter((c) => c.ambiguous),
      deletedIrIds: result.deletedIrIds,
    },
    null,
    2,
  ) + "\n",
  "utf8",
);

const auto = result.trackedChanges.filter((c) => !c.ambiguous).length;
console.log(
  `[reconcile] applied ${auto} deterministic change(s), ${result.deletedIrIds.length} deletion(s) → ${outPath} (irVersion ${updated.meta.irVersion})`,
);
console.log(
  `[reconcile] ${result.untrackedAdditions.length} addition(s) + ${result.trackedChanges.filter((c) => c.ambiguous).length} ambiguous for review → ${proposalsPath}`,
);
