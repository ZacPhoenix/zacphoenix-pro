// apps/inbox/shared/contract.ts: the one file both halves of the Inbox import (merge point 1).
// The UI (Claude Code) and the API (Codex) change it only through task T1, on main.
// Field names follow src/schema.ts (Day 4). If yours differ, adjust the pick() lists and nothing else.
import { z } from 'zod'
import { FeedbackItem, TriageResult } from '../../../src/schema.js'

export const Status = z.enum(['pending', 'approved', 'edited', 'rejected'])
export const Action = z.enum(['approve', 'edit', 'reject'])

// Fields a reviewer may change (spec section 3). Everything else stays Triage's evidence.
export const EditableField = z.enum(['category', 'severity', 'area', 'labels', 'suggestedTitle', 'summary'])

export const Change = z.object({
  field: EditableField,
  from: z.unknown(),
  to: z.unknown(),
})

// One line of data/decisions.jsonl. Day 15 adds schemaVersion 2 and keeps these v1 lines readable.
export const DecisionV1 = z.object({
  schemaVersion: z.literal(1),
  id: z.string(), // decision id, minted by the server
  proposalId: z.string(), // the TriageResult id, which is also the FeedbackItem id
  action: Action,
  changes: z.array(Change), // empty unless action is edit
  reason: z.string().optional(), // present for reject
  reviewer: z.string(),
  at: z.iso.datetime(),
})

const Edits = TriageResult.pick({
  category: true,
  severity: true,
  area: true,
  labels: true,
  suggestedTitle: true,
  summary: true,
})
  .partial()
  .refine((e) => Object.keys(e).length > 0, { message: 'Change at least one field' })

const reviewer = z.string().min(1).default('local')

// What the UI sends. The server derives changes, mints the id, and stamps the time.
export const DecisionInput = z.discriminatedUnion('action', [
  z.object({ action: z.literal('approve'), reviewer }),
  z.object({ action: z.literal('edit'), reviewer, edits: Edits }),
  z.object({ action: z.literal('reject'), reviewer, reason: z.string().trim().min(3).max(280) }),
])

export const Proposal = z.object({
  id: z.string(),
  status: Status, // derived from data/decisions.jsonl, never stored
  triage: TriageResult, // the latest results.jsonl line for this id
  feedback: FeedbackItem.nullable(), // null when the raw item is missing
  decision: DecisionV1.nullable(), // the single decision, once one exists
})

export const Health = z.object({
  ok: z.boolean(),
  proposals: z.number().int(),
  decisions: z.number().int(),
  skippedLines: z.number().int(), // malformed lines skipped while reading (AC-9)
})

export const ApiError = z.object({ error: z.string(), details: z.string().optional() })

export const routes = {
  list: '/api/proposals', // GET, optional ?status=pending|approved|edited|rejected|all
  one: (id: string) => `/api/proposals/${encodeURIComponent(id)}`, // GET
  decide: (id: string) => `/api/proposals/${encodeURIComponent(id)}/decision`, // POST DecisionInput
  health: '/api/health', // GET
} as const

export type Status = z.infer<typeof Status>
export type Action = z.infer<typeof Action>
export type Change = z.infer<typeof Change>
export type DecisionV1 = z.infer<typeof DecisionV1>
export type DecisionInput = z.input<typeof DecisionInput>
export type Proposal = z.infer<typeof Proposal>
export type Health = z.infer<typeof Health>
