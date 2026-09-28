#!/usr/bin/env node
// Validates course content: schema, full agenda coverage, quiz integrity, snippets, and style rules.
// Usage: node tools/validate.mjs [--strict] [--day 3]
//   --strict  treat missing day files as errors (use before shipping)
//   --day N   validate one day only

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { course, dayFile } from '../content/course.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const strict = args.includes('--strict')
const onlyDay = args.includes('--day') ? Number(args[args.indexOf('--day') + 1]) : null

const BANNED = [
  'delve', 'tapestry', 'game-changer', 'game changer', 'unlock the power', "in today's", 'fast-paced',
  "let's dive", 'dive in', 'dive into', "it's not just", 'not just about', 'seamless', 'harness the power',
  'revolutionize', 'supercharge', 'cutting-edge', 'in the realm of', 'navigate the complexities',
  'ever-evolving', 'embark', 'unleash', 'at the end of the day', 'secret sauce', 'buckle up',
  'without further ado', 'the magic happens', 'a testament to', 'look no further', 'elevate your',
]

let errors = 0
let warnings = 0
const report = []

function err(where, msg) {
  errors++
  report.push(`  ERROR  ${where}: ${msg}`)
}
function warn(where, msg) {
  warnings++
  report.push(`  warn   ${where}: ${msg}`)
}

const isStr = (x) => typeof x === 'string' && x.trim().length > 0
const words = (s) => String(s).trim().split(/\s+/).filter(Boolean).length
const toText = (x) => (Array.isArray(x) ? x.join('\n') : String(x ?? ''))

function stripCode(s) {
  return toText(s)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`\n]*`/g, ' ')
}

function styleCheck(where, text, { prose = true } = {}) {
  const raw = toText(text)
  if (raw.includes('—')) err(where, 'em dash found (rewrite the sentence)')
  if (raw.includes('–')) warn(where, 'en dash found (prefer "to" for ranges)')
  if (!prose) return
  const plain = stripCode(raw)
  if (/;/.test(plain.replace(/&[a-z]+;/gi, ''))) err(where, `semicolon in prose: "${plain.slice(Math.max(0, plain.indexOf(';') - 40), plain.indexOf(';') + 20).trim()}"`)
  const lower = plain.toLowerCase()
  for (const b of BANNED) if (lower.includes(b)) warn(where, `cliche "${b}"`)
}

const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[`*]/g, '')
    .replace(/[‐-―-]/g, ' ')
    .replace(/[^a-z0-9. ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

function termParts(term) {
  return String(term)
    .replace(/\([^)]*\)/g, ' ')
    .split(/\s+·\s+|\s+\/\s+|,\s+|\s+and\s+|\s+&\s+/i)
    .map(norm)
    .filter(Boolean)
}

function topicCovered(topic, bites) {
  const t = norm(topic)
  return bites.some(([term]) => {
    const parts = termParts(term)
    const whole = norm(term)
    return parts.includes(t) || whole === t || whole.startsWith(`${t} `) || parts.some((p) => p === t || p.startsWith(`${t} `))
  })
}

async function validateDay(meta) {
  const file = join(ROOT, 'content', 'days', `${dayFile(meta.n)}.js`)
  const tag = `Day ${String(meta.n).padStart(2, '0')}`
  if (!existsSync(file)) {
    ;(strict ? err : warn)(tag, 'content file missing')
    return null
  }
  let c
  try {
    c = (await import(`${pathToFileURL(file).href}?t=${Date.now()}`)).default
  } catch (e) {
    err(tag, `failed to import: ${e.message}`)
    return null
  }
  if (!c || typeof c !== 'object') return err(tag, 'default export must be an object')
  if (c.day !== meta.n) err(tag, `day field is ${c.day}, expected ${meta.n}`)
  for (const k of ['hook', 'anchor', 'plusOne']) {
    if (!isStr(c[k])) err(tag, `${k} missing`)
    else {
      styleCheck(`${tag} ${k}`, c[k])
      if (words(c[k]) > 40) warn(`${tag} ${k}`, `${words(c[k])} words (aim for 30 or fewer)`)
    }
  }
  for (const k of ['tldr', 'outcomes']) {
    if (!Array.isArray(c[k]) || c[k].length !== 3 || !c[k].every(isStr)) err(tag, `${k} must be exactly 3 strings`)
    else c[k].forEach((t, i) => {
      styleCheck(`${tag} ${k}[${i}]`, t)
      if (words(t) > 26) warn(`${tag} ${k}[${i}]`, `${words(t)} words (aim for 22 or fewer)`)
    })
  }
  if (!c.minutes || typeof c.minutes.learn !== 'number' || typeof c.minutes.practice !== 'number') err(tag, 'minutes.learn and minutes.practice required')
  if (c.map) {
    if (!Array.isArray(c.map.mermaid) || !c.map.mermaid.length) err(tag, 'map.mermaid must be an array of lines')
    styleCheck(`${tag} map`, [c.map.title || '', c.map.caption || ''])
    styleCheck(`${tag} map.mermaid`, c.map.mermaid, { prose: false })
  }

  // Sections
  const sections = Array.isArray(c.sections) ? c.sections : []
  if (sections.length !== meta.agenda.length) err(tag, `has ${sections.length} sections, agenda has ${meta.agenda.length}`)
  const ids = new Set()
  let coreWords = words(c.hook) + words(c.anchor) + words(c.plusOne) + words(toText(c.tldr)) + words(toText(c.outcomes))
  let deeperWords = 0
  sections.forEach((s, i) => {
    const where = `${tag} §${s.id || i}`
    const agenda = meta.agenda[i]
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.id || '')) err(where, 'id must be kebab-case')
    if (ids.has(s.id)) err(where, 'duplicate section id')
    ids.add(s.id)
    if (agenda && s.title !== agenda.title) err(where, `title "${s.title}" should be "${agenda.title}"`)
    if (!isStr(s.lead)) err(where, 'lead missing')
    else {
      styleCheck(`${where} lead`, s.lead)
      if (words(s.lead) > 24) warn(`${where} lead`, `${words(s.lead)} words (aim for 20 or fewer)`)
    }
    coreWords += words(s.lead || '')
    if (!Array.isArray(s.bites) || s.bites.length < 2) err(where, 'needs at least 2 bites')
    ;(s.bites || []).forEach((b, j) => {
      if (!Array.isArray(b) || b.length !== 2 || !isStr(b[0]) || !isStr(b[1])) return err(`${where} bite ${j}`, 'bite must be [term, body]')
      styleCheck(`${where} bite "${b[0]}"`, b)
      const w = words(b[1])
      coreWords += w + words(b[0])
      if (w > 60) err(`${where} bite "${b[0]}"`, `${w} words (hard max 60)`)
      else if (w > 48) warn(`${where} bite "${b[0]}"`, `${w} words (aim for 45 or fewer)`)
    })
    if ((s.bites || []).length > 9) warn(where, `${s.bites.length} bites (group topics with " · " to stay at 8 or fewer)`)
    if (agenda) {
      for (const topic of agenda.topics) if (!topicCovered(topic, s.bites || [])) err(where, `agenda topic not covered by a bite term: "${topic}"`)
    }
    if (s.visual) {
      const v = s.visual
      if (!v.mermaid && !v.table && !v.md) err(where, 'visual needs mermaid, table, or md')
      if (v.mermaid) styleCheck(`${where} visual`, v.mermaid, { prose: false })
      if (v.table) {
        if (!Array.isArray(v.table.head) || !Array.isArray(v.table.rows)) err(where, 'visual.table needs head and rows')
        else {
          v.table.rows.forEach((r, k) => r.length !== v.table.head.length && err(where, `table row ${k} has ${r.length} cells, head has ${v.table.head.length}`))
          styleCheck(`${where} table`, [v.table.head.join(' '), ...v.table.rows.map((r) => r.join(' '))])
        }
      }
      if (v.md) styleCheck(`${where} visual.md`, v.md)
      if (v.caption) styleCheck(`${where} caption`, v.caption)
    }
    for (const [k, co] of (s.callouts || []).entries()) {
      if (!['example', 'pitfall', 'pro', 'note'].includes(co.type)) err(`${where} callout ${k}`, `bad type "${co.type}"`)
      if (!co.body) err(`${where} callout ${k}`, 'body missing')
      styleCheck(`${where} callout ${k}`, [co.title || '', toText(co.body)])
      coreWords += words(stripCode(co.body))
    }
    if ((s.callouts || []).length > 2) warn(where, 'more than 2 callouts')
    if (s.deeper) {
      if (!s.deeper.body) err(where, 'deeper.body missing')
      styleCheck(`${where} deeper`, [s.deeper.title || '', toText(s.deeper.body)])
      deeperWords += words(stripCode(s.deeper.body))
    }
  })

  // Quiz
  const quiz = Array.isArray(c.quiz) ? c.quiz : []
  if (quiz.length < 6 || quiz.length > 12) err(tag, `quiz has ${quiz.length} questions (need 6 to 12)`)
  const qids = new Set()
  let longestIsAnswer = 0
  const perSection = {}
  quiz.forEach((q, i) => {
    const where = `${tag} quiz ${q.id || i}`
    if (!isStr(q.id)) err(where, 'id missing')
    if (qids.has(q.id)) err(where, 'duplicate id')
    qids.add(q.id)
    if (!isStr(q.q)) err(where, 'question text missing')
    if (!Array.isArray(q.options) || q.options.length < 3 || q.options.length > 5 || !q.options.every(isStr)) err(where, 'options must be 3 to 5 strings')
    else if (new Set(q.options.map(norm)).size !== q.options.length) err(where, 'duplicate options')
    if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= (q.options?.length || 0)) err(where, 'answer index out of range')
    if (!isStr(q.why)) err(where, 'why missing')
    else if (words(q.why) > 70) warn(where, `why is ${words(q.why)} words (aim for 55 or fewer)`)
    if (q.section) {
      if (!ids.has(q.section)) err(where, `section "${q.section}" does not exist`)
      perSection[q.section] = (perSection[q.section] || 0) + 1
    }
    const opts = (q.options || []).map((o) => o.length)
    if (opts.length && opts.indexOf(Math.max(...opts)) === q.answer && opts.filter((l) => l === Math.max(...opts)).length === 1) longestIsAnswer++
    styleCheck(where, [q.q, ...(q.options || []), q.why || ''])
    if ((q.options || []).some((o) => /all of the above|none of the above/i.test(o))) err(where, 'no "all/none of the above" options')
  })
  const finals = quiz.filter((q) => !q.section).length
  if (finals < 2) err(tag, `only ${finals} final-round questions (need at least 2 without a section)`)
  for (const [sid, count] of Object.entries(perSection)) if (count > 2) warn(tag, `section ${sid} has ${count} quick checks (1 is ideal)`)
  if (quiz.length && longestIsAnswer / quiz.length > 0.5) warn(tag, `correct option is the longest in ${longestIsAnswer}/${quiz.length} questions (a guessable tell)`)

  // Tasks
  const tasks = Array.isArray(c.tasks) ? c.tasks : []
  const levels = tasks.map((t) => t.level).join(',')
  if (levels !== 'quick,build,stretch') err(tag, `tasks must be [quick, build, stretch] in order, got [${levels}]`)
  const tids = new Set()
  for (const t of tasks) {
    const where = `${tag} task ${t.id || t.level}`
    if (!isStr(t.id)) err(where, 'id missing')
    if (tids.has(t.id)) err(where, 'duplicate id')
    tids.add(t.id)
    for (const k of ['title', 'goal', 'done']) if (!isStr(t[k])) err(where, `${k} missing`)
    if (typeof t.minutes !== 'number') err(where, 'minutes missing')
    if (!Array.isArray(t.steps) || t.steps.length < 2) err(where, 'needs at least 2 steps')
    if (t.level === 'build' && !isStr(t.minimum)) err(where, 'build task needs a minimum version')
    styleCheck(where, [t.title, t.goal, t.done || '', t.minimum || '', ...(t.steps || [])])
    const prompts = t.prompts || (t.prompt ? [t.prompt] : [])
    prompts.forEach((p, k) => {
      const text = typeof p === 'object' && !Array.isArray(p) ? p.text : p
      if (!text || !toText(text).trim()) err(`${where} prompt ${k}`, 'empty prompt')
      styleCheck(`${where} prompt ${k}`, text)
    })
    for (const code of t.code || []) {
      if (code.file) {
        const f = join(ROOT, 'content', 'snippets', code.file)
        if (!existsSync(f)) err(where, `snippet file missing: content/snippets/${code.file}`)
        else styleCheck(`${where} snippet ${code.file}`, await readFile(f, 'utf8'), { prose: false })
      } else if (!Array.isArray(code.lines)) err(where, 'code needs lines or file')
      else styleCheck(`${where} code`, code.lines, { prose: false })
    }
  }

  // Glossary, resources, reflect
  if (!Array.isArray(c.glossary) || c.glossary.length < 4) err(tag, 'glossary needs at least 4 entries')
  else c.glossary.forEach((g, i) => {
    if (!Array.isArray(g) || g.length !== 2 || !isStr(g[0]) || !isStr(g[1])) err(`${tag} glossary ${i}`, 'entry must be [term, definition]')
    else {
      styleCheck(`${tag} glossary "${g[0]}"`, g)
      if (words(g[1]) > 35) warn(`${tag} glossary "${g[0]}"`, `${words(g[1])} words (aim for 25 or fewer)`)
    }
  })
  if (!Array.isArray(c.resources) || c.resources.length < 3) err(tag, 'resources needs at least 3 entries')
  else c.resources.forEach((r, i) => {
    if (!isStr(r.title) || !/^https:\/\//.test(r.url || '')) err(`${tag} resource ${i}`, 'needs title and https url')
    styleCheck(`${tag} resource ${i}`, [r.title || '', r.note || ''])
  })
  if (!Array.isArray(c.reflect) || c.reflect.length < 2 || c.reflect.length > 3) err(tag, 'reflect needs 2 or 3 prompts')
  else styleCheck(`${tag} reflect`, c.reflect)

  const readMin = Math.round(coreWords / 220)
  if (readMin > 26) warn(tag, `core reading is about ${readMin} min (aim for 25 or less)`)
  return { tag, sections: sections.length, bites: sections.reduce((a, s) => a + (s.bites || []).length, 0), quiz: quiz.length, readMin, deeperMin: Math.round(deeperWords / 220) }
}

async function validateRosetta() {
  const f = join(ROOT, 'content', 'rosetta.js')
  if (!existsSync(f)) return (strict ? err : warn)('Rosetta', 'content/rosetta.js missing')
  let r
  try {
    r = (await import(`${pathToFileURL(f).href}?t=${Date.now()}`)).default
  } catch (e) {
    return err('Rosetta', `failed to import: ${e.message}`)
  }
  if (!Array.isArray(r.rows) || r.rows.length < 10) err('Rosetta', 'needs at least 10 rows')
  for (const [i, row] of (r.rows || []).entries()) {
    for (const k of ['concept', 'claude', 'codex']) if (!isStr(row[k])) err(`Rosetta row ${i}`, `${k} missing`)
    styleCheck(`Rosetta row ${row.concept || i}`, [row.concept, row.claude, row.codex, row.gap || ''])
  }
  for (const [i, p] of (r.patterns || []).entries()) styleCheck(`Rosetta pattern ${i}`, [p.title, p.why, toText(p.body)])
  styleCheck('Rosetta intro', r.intro || '')
  if (r.notes) styleCheck('Rosetta notes', r.notes)
}

async function validateCourse() {
  const c = course.capstone
  styleCheck('Course', [course.tagline, ...course.weeks.flatMap((w) => [w.goal, w.promise])])
  styleCheck('Capstone', [c.pitch, ...c.why, ...c.stack, ...c.setup, ...c.milestones.flatMap((m) => [m.title, m.deliverable, m.minimum])])
  if (c.milestones.length !== course.days.length) err('Capstone', 'one milestone per day required')
}

const targets = course.days.filter((d) => !onlyDay || d.n === onlyDay)
const rows = []
await validateCourse()
for (const d of targets) {
  const r = await validateDay(d)
  if (r) rows.push(r)
}
if (!onlyDay) await validateRosetta()

console.log('\nAI Engineer Pro content check\n')
for (const r of rows) console.log(`  ${r.tag}  ${String(r.sections).padStart(2)} sections  ${String(r.bites).padStart(3)} bites  ${String(r.quiz).padStart(2)} questions  ~${r.readMin} min core  +${r.deeperMin} min deeper`)
if (report.length) console.log(`\n${report.join('\n')}`)
console.log(`\n  ${rows.length}/${targets.length} day files loaded · ${errors} error(s) · ${warnings} warning(s)\n`)
process.exit(errors ? 1 : 0)
