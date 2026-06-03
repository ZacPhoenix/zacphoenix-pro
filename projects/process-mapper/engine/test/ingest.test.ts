import { describe, it, expect } from "vitest";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { classifyFile, prepareInputs, bundleForExtraction } from "../src/ingest.js";

describe("classifyFile", () => {
  it("classifies by extension", () => {
    expect(classifyFile("/x/transcript.md")).toBe("transcript");
    expect(classifyFile("/x/notes.txt")).toBe("transcript");
    expect(classifyFile("/x/sop.pdf")).toBe("pdf");
    expect(classifyFile("/x/process.docx")).toBe("docx");
    expect(classifyFile("/x/data.xlsx")).toBe("other");
  });
});

describe("prepareInputs", () => {
  it("builds a manifest and requires a transcript (FR-1)", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cartographer-ingest-"));
    try {
      await writeFile(join(dir, "transcript.md"), "# Workshop\nRaj re-keys orders.");
      await writeFile(join(dir, "sop.pdf"), "%PDF-1.4 fake");
      await writeFile(join(dir, "export.xlsx"), "binary-ish");
      const m = await prepareInputs(dir);
      expect(m.transcripts).toHaveLength(1);
      expect(m.transcripts[0]!.text).toContain("re-keys");
      expect(m.pdfs.map((p) => p.name)).toEqual(["sop.pdf"]);
      expect(m.others.map((o) => o.name)).toEqual(["export.xlsx"]);
      const bundle = bundleForExtraction(m);
      expect(bundle).toContain("TRANSCRIPT: transcript.md");
      expect(bundle).toContain("sop.pdf"); // referenced, not inlined
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  it("throws when no transcript is present", async () => {
    const dir = await mkdtemp(join(tmpdir(), "cartographer-ingest-"));
    try {
      await writeFile(join(dir, "sop.pdf"), "%PDF-1.4 fake");
      await expect(prepareInputs(dir)).rejects.toThrow(/No transcript/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
