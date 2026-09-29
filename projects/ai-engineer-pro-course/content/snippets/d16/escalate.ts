// src/run/escalate.ts: one open escalation issue per repo, one comment per run and reason, never duplicated.
// Uses the gh CLI (logged in locally, GH_TOKEN in Actions). execFile passes arguments without a shell.
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { effectOnce, idempotencyKey, type Checkpoint } from './checkpoint.js'

const exec = promisify(execFile)
const gh = async (...args: string[]) => (await exec('gh', args)).stdout.trim()
const LABEL = 'forge:escalation' // create once: gh label create forge:escalation

export interface Escalation {
  reason: string // stop reason, for example run_budget or tool_failures
  question: string // the one decision you need from the human
  counts: Record<string, number> // processed, drafted, skipped, failed
}

// Listing is consistent, unlike search, so an issue created seconds ago is already visible.
async function openEscalation(): Promise<string | undefined> {
  const n = await gh('issue', 'list', '--label', LABEL, '--state', 'open', '--limit', '1',
    '--json', 'number', '--jq', '.[0].number // empty')
  return n || undefined
}

export async function escalate(cp: Checkpoint, e: Escalation) {
  const key = idempotencyKey(cp.runId, 'escalation', e.reason)
  const body = [
    `<!-- ${key} -->`,
    `**Run** \`${cp.runId}\` stopped with \`${e.reason}\`.`,
    `**Spend today** $${cp.spend.usd.toFixed(2)} · **Completed** ${cp.completed.length} · **In flight** ${cp.inFlight ?? 'none'}`,
    `**Counts** ${Object.entries(e.counts).map(([k, v]) => `${k} ${v}`).join(' · ')}`,
    `**Decision needed** ${e.question}`,
    'Resume: rerun the workflow. Stop every run: set the TRIAGE_ENABLED variable to false.',
  ].join('\n\n')

  return effectOnce(cp, key, 'escalation', {
    // After a crash, look for the hidden key before posting again.
    find: async (k) => {
      const issue = await openEscalation()
      if (!issue) return undefined
      const hit = await gh('api', `repos/{owner}/{repo}/issues/${issue}/comments`, '--paginate',
        '--jq', `.[] | select(.body | contains("${k}")) | .html_url`)
      if (hit) return hit.split('\n')[0]
      const opener = await gh('issue', 'view', issue, '--json', 'body,url', '--jq', `select(.body | contains("${k}")) | .url`)
      return opener || undefined
    },
    // One open issue collects every escalation, so a bad night produces comments, not an issue flood.
    run: async () => {
      const issue = await openEscalation()
      return issue
        ? gh('issue', 'comment', issue, '--body', body)
        : gh('issue', 'create', '--title', 'Triage needs a decision', '--label', LABEL, '--body', body)
    },
  })
}
