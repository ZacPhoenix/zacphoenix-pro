// src/tools/inbox.ts: list_feedback, get_feedback and save_triage over the files in data/.
// Field names follow src/schema.ts from Day 4. If your FeedbackItem calls the text field something
// other than `text`, change clip() and nothing else.
import { appendFile, mkdir, readdir, readFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { z } from 'zod'
import { FeedbackItem, TriageResult } from '../schema.js'
import { dataPath, defineTool, fail, ok } from './spec.js'

const MAX_TEXT = 1_200 // characters per item in list results

async function readJsonl(path: string): Promise<unknown[]> {
  try {
    const raw = await readFile(path, 'utf8')
    return raw.split('\n').filter(Boolean).map((line) => JSON.parse(line))
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }
}

export async function loadInbox(): Promise<FeedbackItem[]> {
  const dir = dataPath('inbox')
  const files = (await readdir(dir)).filter((f) => f.endsWith('.jsonl')).sort()
  const rows = (await Promise.all(files.map((f) => readJsonl(`${dir}/${f}`)))).flat()
  return rows.map((row) => FeedbackItem.parse(row))
}

// Append-only log. The latest line for an id wins, so a retry never needs to rewrite history.
export async function loadResults(): Promise<Map<string, TriageResult>> {
  const rows = await readJsonl(dataPath('triage', 'results.jsonl'))
  return new Map(rows.map((row) => TriageResult.parse(row)).map((r) => [r.id, r] as const))
}

export async function appendResult(result: TriageResult): Promise<void> {
  const file = dataPath('triage', 'results.jsonl')
  await mkdir(dirname(file), { recursive: true })
  await appendFile(file, JSON.stringify(TriageResult.parse(result)) + '\n')
}

const clip = (item: FeedbackItem) =>
  item.text.length <= MAX_TEXT ? item : { ...item, text: `${item.text.slice(0, MAX_TEXT)} [truncated: call get_feedback for the full text]` }

export const listFeedback = defineTool({
  name: 'list_feedback',
  description:
    'List feedback items that have no triage result yet, oldest first. Returns one JSON object per line and a footer ' +
    'with the untriaged count and the next cursor. Text over 1,200 characters is cut and marked. ' +
    'Use it to find work, then call save_triage once per item.',
  input: z.object({
    limit: z.number().describe('How many items to return, from 1 to 20'),
    cursor: z.number().describe('0 for the first page, otherwise next_cursor from the previous call'),
  }),
  readOnly: true,
  async run({ limit, cursor }) {
    const done = await loadResults()
    const open = (await loadInbox()).filter((item) => !done.has(item.id))
    const n = Math.min(Math.max(Math.round(limit), 1), 20)
    const start = Math.max(Math.round(cursor), 0)
    const page = open.slice(start, start + n)
    if (page.length === 0) return ok(`No untriaged items at cursor ${start}. ${open.length} untriaged in total.`)
    const next = start + page.length < open.length ? `next_cursor ${start + page.length}` : 'no more items'
    return ok([...page.map((item) => JSON.stringify(clip(item))), `showing ${page.length} of ${open.length} untriaged, ${next}`].join('\n'))
  },
})

export const getFeedback = defineTool({
  name: 'get_feedback',
  description: 'Get one feedback item by id with its full text. Use it when list_feedback marked text as truncated or to compare a suspected duplicate.',
  input: z.object({ id: z.string().describe('A feedback id exactly as list_feedback or search_issues printed it') }),
  readOnly: true,
  async run({ id }) {
    const item = (await loadInbox()).find((i) => i.id === id)
    return item ? ok(JSON.stringify(item)) : fail(`No feedback item with id "${id}". Copy an id from list_feedback output.`)
  },
})

export const saveTriage = defineTool({
  name: 'save_triage',
  description:
    'Save the triage result for one feedback item. Call it once per item after every field is decided. ' +
    'The id must be a feedback id. Saving the same id again replaces the earlier result.',
  input: TriageResult,
  readOnly: false,
  async run(result) {
    const inbox = await loadInbox()
    if (!inbox.some((i) => i.id === result.id)) return fail(`Unknown feedback id "${result.id}". Use an id from list_feedback.`)
    await appendResult(result)
    const done = await loadResults()
    return ok(`Saved ${result.id}. ${inbox.filter((i) => !done.has(i.id)).length} untriaged items remain.`)
  },
})
