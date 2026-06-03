/**
 * Stage 1 ingest — file handling (PRD §14.3, FR-1/2).
 *
 * The EXTRACTION (text → IR) is Claude's judgment, done from SKILL.md. This module
 * only does the deterministic file plumbing the extraction needs:
 *   • transcript (.md/.txt) → read directly
 *   • PDF → left as-is; Claude reads it natively as a document block (preserves tables)
 *   • .docx → converted to text here (mammoth), since the model can't ingest .docx
 *
 * It produces an InputManifest the skill consumes; it does NOT call the LLM.
 */
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, basename } from "node:path";
import mammoth from "mammoth";

export type InputKind = "transcript" | "pdf" | "docx" | "other";

export function classifyFile(path: string): InputKind {
  const ext = extname(path).toLowerCase();
  if (ext === ".md" || ext === ".txt") return "transcript";
  if (ext === ".pdf") return "pdf";
  if (ext === ".docx") return "docx";
  return "other";
}

export interface InputManifest {
  /** Transcript/markdown files, read into text. */
  transcripts: { path: string; name: string; text: string }[];
  /** PDF paths — Claude reads these natively (not converted here). */
  pdfs: { path: string; name: string }[];
  /** .docx files converted to plain text via mammoth. */
  docxTexts: { path: string; name: string; text: string; warnings: string[] }[];
  /** Anything we don't handle, surfaced so the consultant notices. */
  others: { path: string; name: string }[];
}

/** Convert a .docx file to plain text. Throws if the file can't be read. */
export async function docxToText(path: string): Promise<{ text: string; warnings: string[] }> {
  const result = await mammoth.extractRawText({ path });
  return { text: result.value, warnings: result.messages.map((m) => m.message) };
}

/**
 * Scan an engagement input folder and build a manifest. Requires at least one
 * transcript (FR-1); throws otherwise so the consultant fixes the input set.
 */
export async function prepareInputs(folder: string): Promise<InputManifest> {
  const entries = await readdir(folder);
  const manifest: InputManifest = { transcripts: [], pdfs: [], docxTexts: [], others: [] };

  for (const entry of entries.sort()) {
    const path = join(folder, entry);
    if (!(await stat(path)).isFile()) continue;
    const name = basename(path);
    switch (classifyFile(path)) {
      case "transcript":
        manifest.transcripts.push({ path, name, text: await readFile(path, "utf8") });
        break;
      case "pdf":
        manifest.pdfs.push({ path, name });
        break;
      case "docx": {
        const { text, warnings } = await docxToText(path);
        manifest.docxTexts.push({ path, name, text, warnings });
        break;
      }
      default:
        manifest.others.push({ path, name });
    }
  }

  if (manifest.transcripts.length === 0)
    throw new Error(
      `No transcript found in ${folder}. Add at least one .md/.txt transcript (FR-1).`,
    );
  return manifest;
}

/**
 * Assemble a single text bundle for the LLM extraction prompt: every transcript
 * and every converted .docx, with PDFs referenced by name (the skill attaches them
 * as native document blocks separately).
 */
export function bundleForExtraction(m: InputManifest): string {
  const parts: string[] = [];
  for (const t of m.transcripts) parts.push(`# TRANSCRIPT: ${t.name}\n\n${t.text}`);
  for (const d of m.docxTexts) parts.push(`# DOCUMENT (from .docx): ${d.name}\n\n${d.text}`);
  if (m.pdfs.length)
    parts.push(
      `# PDFs (attached natively, not inlined): ${m.pdfs.map((p) => p.name).join(", ")}`,
    );
  return parts.join("\n\n---\n\n");
}
