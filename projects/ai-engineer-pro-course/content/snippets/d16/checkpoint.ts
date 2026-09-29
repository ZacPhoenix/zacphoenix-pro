// src/run/checkpoint.ts: checkpoint and resume for unattended Triage runs.
// Resume skips finished items. A write-ahead effects ledger makes side effects safe to retry.
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'

const Effect = z.object({
  kind: z.enum(['escalation', 'issue', 'label', 'comment', 'pr']),
  status: z.enum(['intent', 'done']), // intent is saved before the call, done after it
  ref: z.string().optional(), // issue or comment URL once known
})

export const Checkpoint = z.object({
  version: z.literal(1),
  runId: z.string(),
  status: z.enum(['running', 'paused', 'done', 'failed']),
  stopReason: z.string().optional(),
  updatedAt: z.string(),
  completed: z.array(z.string()), // feedback ids finished in this run
  inFlight: z.string().optional(), // the item being worked on if the process died
  spend: z.object({ day: z.string(), usd: z.number() }), // today's total across every invocation
  effects: z.record(z.string(), Effect), // keyed by idempotency key
})
export type Checkpoint = z.infer<typeof Checkpoint>
type EffectKind = z.infer<typeof Effect>['kind']

let activePath = process.env.FORGE_CHECKPOINT ?? 'state/triage-checkpoint.json'
const today = () => new Date().toISOString().slice(0, 10)

// Deterministic on purpose: a retry of the same logical effect must produce the same key.
export const idempotencyKey = (...parts: string[]) =>
  `forge-${createHash('sha256').update(parts.join('|')).digest('hex').slice(0, 16)}`

export async function loadCheckpoint(path = activePath): Promise<Checkpoint | null> {
  try {
    return Checkpoint.parse(JSON.parse(await readFile(path, 'utf8')))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null
    throw err // a corrupt checkpoint stops the run instead of silently starting over
  }
}

// Temp file plus rename: a crash mid-write leaves the previous checkpoint intact.
export async function saveCheckpoint(cp: Checkpoint, path = activePath) {
  cp.updatedAt = new Date().toISOString()
  await mkdir(dirname(path), { recursive: true })
  const tmp = `${path}.${process.pid}.tmp`
  await writeFile(tmp, `${JSON.stringify(cp, null, 2)}\n`)
  await rename(tmp, path)
}

export type Start = { cp: Checkpoint; resumed: boolean } | { blocked: string }

// Resume an unfinished run, refuse to start after a failure, or begin a new run.
export async function startOrResume(runId: string, path = activePath): Promise<Start> {
  activePath = path
  const prev = await loadCheckpoint(path)
  if (prev?.status === 'failed') {
    return { blocked: `Run ${prev.runId} failed (${prev.stopReason}). Resolve its escalation, then delete ${path}.` }
  }
  const day = today()
  const spend = prev && prev.spend.day === day ? prev.spend : { day, usd: 0 }
  if (prev && (prev.status === 'running' || prev.status === 'paused')) {
    const cp: Checkpoint = { ...prev, status: 'running', stopReason: undefined, spend }
    await saveCheckpoint(cp)
    return { cp, resumed: true }
  }
  const effects = prev?.effects ?? {} // keep the ledger so old keys still dedupe
  const cp: Checkpoint = { version: 1, runId, status: 'running', updatedAt: '', completed: [], spend, effects }
  await saveCheckpoint(cp)
  return { cp, resumed: false }
}

export async function beginItem(cp: Checkpoint, id: string) {
  cp.inFlight = id
  await saveCheckpoint(cp)
}

// Spend is recorded per finished item, so a hard kill undercounts by at most one item.
export async function completeItem(cp: Checkpoint, id: string, costUsd: number) {
  if (!cp.completed.includes(id)) cp.completed.push(id)
  cp.inFlight = undefined
  cp.spend.usd += costUsd
  await saveCheckpoint(cp)
}

export async function finishRun(cp: Checkpoint, status: 'paused' | 'done' | 'failed', stopReason?: string) {
  cp.status = status
  cp.stopReason = stopReason
  await saveCheckpoint(cp)
}

// Write-ahead intent. `find` looks for the effect outside (for example, a marker in an issue body).
// `run` performs it and returns a reference. Crash anywhere and the next run neither loses nor repeats it.
export async function effectOnce(
  cp: Checkpoint,
  key: string,
  kind: EffectKind,
  io: { find: (key: string) => Promise<string | undefined>; run: (key: string) => Promise<string> },
): Promise<{ ref: string; replayed: boolean }> {
  const prev = cp.effects[key]
  if (prev?.status === 'done' && prev.ref) return { ref: prev.ref, replayed: true }
  if (prev?.status === 'intent') {
    const found = await io.find(key) // the call may have succeeded before the crash
    if (found) {
      cp.effects[key] = { kind, status: 'done', ref: found }
      await saveCheckpoint(cp)
      return { ref: found, replayed: true }
    }
  }
  cp.effects[key] = { kind, status: 'intent' }
  await saveCheckpoint(cp)
  const ref = await io.run(key)
  cp.effects[key] = { kind, status: 'done', ref }
  await saveCheckpoint(cp)
  return { ref, replayed: false }
}
