// src/tools/issues.ts: search_issues ranks existing GitHub issues and earlier triage results as duplicate candidates.
// Refresh the issue snapshot with:
//   gh issue list --state all --limit 500 --json number,title,body,state > data/issues.json
// A local snapshot keeps runs cheap, offline and repeatable, which Day 10's evals depend on.
import { readFile } from 'node:fs/promises'
import { z } from 'zod'
import { loadResults } from './inbox.js'
import { dataPath, defineTool, fail, ok } from './spec.js'

type Candidate = { ref: string, title: string, text: string, state: string }
type Issue = { number: number, title: string, body?: string, state: string }

async function candidates(): Promise<Candidate[]> {
  const raw = await readFile(dataPath('issues.json'), 'utf8').catch(() => '[]')
  const issues = JSON.parse(raw) as Issue[]
  const triaged = [...(await loadResults()).values()]
  return [
    ...issues.map((i) => ({ ref: `#${i.number}`, title: i.title, text: `${i.title} ${i.body ?? ''}`, state: i.state.toLowerCase() })),
    ...triaged.map((t) => ({ ref: t.id, title: t.suggestedTitle || t.summary, text: `${t.suggestedTitle} ${t.summary} ${t.area}`, state: 'triaged' })),
  ]
}

const terms = (s: string) => new Set(s.toLowerCase().match(/[a-z0-9]{3,}/g) ?? [])

export const searchIssues = defineTool({
  name: 'search_issues',
  description:
    'Search existing GitHub issues (a snapshot in data/issues.json) and earlier triage results for likely duplicates. ' +
    'Returns up to `limit` candidates ranked by word overlap, each with a ref (#number for issues, a feedback id for triaged items), ' +
    'its state and a score from 0 to 1. Use it before setting duplicateOf. It does not search the web or open issues.',
  input: z.object({
    query: z.string().describe('Three to six words naming the feature and the symptom, such as "csv export timeout large workspace"'),
    limit: z.number().describe('How many candidates to return, from 1 to 10'),
  }),
  readOnly: true,
  async run({ query, limit }) {
    const q = terms(query)
    if (q.size === 0) return fail('The query has no searchable words. Use three to six words naming the feature and the symptom.')
    const all = await candidates()
    const ranked = all
      .map((c) => {
        const words = terms(c.text)
        return { ...c, score: [...q].filter((w) => words.has(w)).length / q.size }
      })
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(Math.max(Math.round(limit), 1), 10))
    const header = `Searched ${all.length} candidates (issues snapshot plus triaged feedback) for "${query}".`
    if (ranked.length === 0) return ok(`${header} No matches. Treat the item as new unless the text says otherwise.`)
    const lines = ranked.map((c) => `${c.ref} [${c.state}] score ${c.score.toFixed(2)}: ${c.title.slice(0, 100)}`)
    return ok([header, ...lines, 'Scores under 0.5 are weak evidence. Call get_feedback on a feedback id to compare full text.'].join('\n'))
  },
})
