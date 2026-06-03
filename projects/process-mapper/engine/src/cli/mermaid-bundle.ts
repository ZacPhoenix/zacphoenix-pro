/** Locate the inlinable Mermaid UMD bundle for offline self-contained reports. */
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

export function findMermaid(): string | undefined {
  const root = join(dirname(fileURLToPath(import.meta.url)), "../.."); // engine/
  for (const p of [
    join(root, "node_modules/mermaid/dist/mermaid.min.js"),
    join(root, "node_modules/mermaid/dist/mermaid.js"),
  ])
    if (existsSync(p)) return readFileSync(p, "utf8");
  return undefined;
}
