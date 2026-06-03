/**
 * The ID-map (PRD §10.1, resolves §18 Q5).
 *
 * A persistent IR-id ↔ Excalidraw-element-id mapping kept as a sidecar so the
 * round-trip survives even if Excalidraw strips an element's `customData` on edit.
 * customData is belt; this sidecar is suspenders — and the durable source of truth.
 */
import { z } from "zod";

export const IdMap = z.object({
  irVersion: z.number().int().min(1),
  /** IR id (step/flow id) → Excalidraw element id. */
  irToElement: z.record(z.string(), z.string()),
  /** Reverse index, maintained alongside for O(1) reconcile lookups. */
  elementToIr: z.record(z.string(), z.string()),
});
export type IdMap = z.infer<typeof IdMap>;

export function emptyIdMap(irVersion = 1): IdMap {
  return { irVersion, irToElement: {}, elementToIr: {} };
}

export function setMapping(map: IdMap, irId: string, elementId: string): void {
  map.irToElement[irId] = elementId;
  map.elementToIr[elementId] = irId;
}

export function irIdForElement(map: IdMap, elementId: string): string | undefined {
  return map.elementToIr[elementId];
}

export function elementIdForIr(map: IdMap, irId: string): string | undefined {
  return map.irToElement[irId];
}

export function serializeIdMap(map: IdMap): string {
  return JSON.stringify(map, null, 2) + "\n";
}

export function parseIdMap(json: string): IdMap {
  return IdMap.parse(JSON.parse(json));
}
