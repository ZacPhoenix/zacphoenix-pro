// src/tools/spec.ts: the one contract every Forge tool follows, whichever runtime calls it.
// Day 6 adapts it to the Messages API, Day 7 to the Agent SDK, Day 8 to an MCP server.
import { join } from 'node:path'
import { z } from 'zod'

export type ToolOutput = { text: string, isError?: boolean }

export interface ToolSpec<S extends z.ZodObject = z.ZodObject> {
  name: string // snake_case verb, such as list_feedback
  description: string // the only documentation the model reads
  input: S
  readOnly: boolean
  run(input: z.infer<S>): Promise<ToolOutput>
}

export const defineTool = <S extends z.ZodObject>(spec: ToolSpec<S>): ToolSpec<S> => spec

export const ok = (text: string): ToolOutput => ({ text })
export const fail = (text: string): ToolOutput => ({ text, isError: true })

// Evals (Day 10) point FORGE_DATA_DIR at frozen fixtures so runs cannot read live state.
export const dataPath = (...parts: string[]) => join(process.env.FORGE_DATA_DIR ?? 'data', ...parts)

// Validate model-supplied input before running, and turn every failure into text the model can act on.
export async function runTool(spec: ToolSpec, raw: unknown): Promise<ToolOutput> {
  const parsed = spec.input.safeParse(raw)
  if (!parsed.success) {
    return fail(`Invalid input for ${spec.name}:\n${z.prettifyError(parsed.error)}\nFix these fields and call ${spec.name} again.`)
  }
  try {
    return await spec.run(parsed.data)
  } catch (err) {
    return fail(`${spec.name} failed: ${(err as Error).message}`)
  }
}
