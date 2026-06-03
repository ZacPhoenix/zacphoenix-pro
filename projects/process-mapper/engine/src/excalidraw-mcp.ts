/**
 * Excalidraw transport boundary (PRD §14.4, R2).
 *
 * The ONLY place that knows how elements get to/from a canvas. Everything in
 * `excalidraw.ts` is pure data transformation; this file isolates the I/O so the
 * round-trip logic can be unit-tested offline and the live binding can be swapped
 * without touching the engine.
 *
 * Two transports:
 *   • FileTransport — reads/writes `.excalidraw` JSON on disk. Works offline and
 *     today, in this cloud session. The consultant can also import/export these in
 *     the Excalidraw UI by hand. Used for tests and the local fallback workflow.
 *   • (Live) MCP transport — mediated by Claude Code's Excalidraw MCP tools, driven
 *     from SKILL.md, NOT from Node. See the tool mapping below. Verify the actual
 *     tool surface of the consultant's chosen MCP build at wire-up time (§14.4).
 *
 * Targeted MCP tool surface (yctimlin/mcp_excalidraw, 26 tools — verified from its
 * README; re-verify on the consultant's machine):
 *   OUT  : batch_create_elements (bulk push), create/update/delete_element
 *   BACK : export_scene (full .excalidraw JSON), query_elements, describe_scene
 *   GROUP: group_elements, align_elements, distribute_elements
 */
import { readFile, writeFile } from "node:fs/promises";
import type { ExcalidrawElement } from "./excalidraw.js";

/** Minimal `.excalidraw` document shape (the on-disk / export_scene format). */
export interface ExcalidrawScene {
  type: "excalidraw";
  version: number;
  source: string;
  elements: ExcalidrawElement[];
  appState?: Record<string, unknown>;
  files?: Record<string, unknown>;
}

export function wrapScene(elements: ExcalidrawElement[]): ExcalidrawScene {
  return {
    type: "excalidraw",
    version: 2,
    source: "cartographer",
    elements,
    appState: { viewBackgroundColor: "#ffffff", gridSize: null },
    files: {},
  };
}

export interface ExcalidrawTransport {
  /** OUT: push the projected scene to the canvas / file. */
  pushScene(elements: ExcalidrawElement[]): Promise<void>;
  /** BACK: read the current scene's elements. */
  readScene(): Promise<ExcalidrawElement[]>;
}

/**
 * Offline / local-fallback transport: a `.excalidraw` file on disk. Push writes it
 * (the consultant opens/imports it in Excalidraw); read parses the exported file
 * after the workshop. Lets the entire round-trip run with zero MCP dependency.
 */
export class FileTransport implements ExcalidrawTransport {
  constructor(private readonly path: string) {}

  async pushScene(elements: ExcalidrawElement[]): Promise<void> {
    await writeFile(this.path, JSON.stringify(wrapScene(elements), null, 2) + "\n", "utf8");
  }

  async readScene(): Promise<ExcalidrawElement[]> {
    const raw = await readFile(this.path, "utf8");
    const doc = JSON.parse(raw) as Partial<ExcalidrawScene>;
    return doc.elements ?? [];
  }
}

/**
 * Placeholder for the live MCP transport. In v1 the live path is driven by Claude
 * Code from SKILL.md (call the engine → get elements → call batch_create_elements;
 * call export_scene → feed JSON back to the engine). This class documents the
 * contract; wire it to an MCP client only if a non-Claude-Code caller ever needs it.
 */
export class McpTransportNotWired implements ExcalidrawTransport {
  async pushScene(): Promise<void> {
    throw new Error(
      "Live MCP push is driven by Claude Code (SKILL.md) via batch_create_elements, not from Node. Use FileTransport for offline runs.",
    );
  }
  async readScene(): Promise<ExcalidrawElement[]> {
    throw new Error(
      "Live MCP read is driven by Claude Code (SKILL.md) via export_scene, not from Node. Use FileTransport for offline runs.",
    );
  }
}
