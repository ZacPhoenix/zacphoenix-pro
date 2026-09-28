// Progress store. Source of truth is data/progress.json via the local server.
// Every change is mirrored to localStorage, so the course still works (browser-only)
// under any static server, and tabs stay in sync through the storage event.

import { course, url, todayISO, iso, addDays, parseISO } from './core.js'

const KEY = 'aep.progress.v1'
const API = url('api/progress')
const LEITNER = [1, 2, 4, 8, 16] // days until next review for boxes 1..5

let state = null
let mode = 'browser' // 'disk' | 'browser'
let saveTimer = null
let dirty = false
const listeners = new Set()

export function blank() {
  return {
    version: 1,
    settings: { startDate: course.defaultStart, theme: 'system' },
    days: {},
    review: {},
    outcomes: {},
    activity: {},
    updatedAt: null,
  }
}

function normalize(s) {
  const base = blank()
  const out = { ...base, ...(s || {}) }
  out.settings = { ...base.settings, ...(s?.settings || {}) }
  for (const k of ['days', 'review', 'outcomes', 'activity']) {
    if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) out[k] = {}
  }
  return out
}

function newest(a, b) {
  if (!a?.updatedAt) return b?.updatedAt ? b : a || b
  if (!b?.updatedAt) return a
  return a.updatedAt >= b.updatedAt ? a : b
}

function readLocal() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeLocal() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Private mode or storage disabled. The server copy still persists.
  }
}

export async function init() {
  if (state) return state
  const local = readLocal()
  let remote = null
  try {
    const res = await fetch(API, { cache: 'no-store' })
    if (res.ok && (res.headers.get('content-type') || '').includes('json')) {
      remote = await res.json()
      mode = 'disk'
    }
  } catch {
    mode = 'browser'
  }
  const hasRemote = remote && remote.days
  state = normalize(newest(hasRemote ? remote : null, local))
  writeLocal()
  // Local copy is newer than disk (e.g. edited while the server was off): push it.
  if (mode === 'disk' && state.updatedAt && state.updatedAt !== remote?.updatedAt) {
    dirty = true
    scheduleFlush()
  }
  applyTheme()
  return state
}

export const get = () => state
export const storageMode = () => mode
export const on = (fn) => (listeners.add(fn), () => listeners.delete(fn))
const emit = () => listeners.forEach((fn) => fn(state))

function scheduleFlush() {
  clearTimeout(saveTimer)
  saveTimer = setTimeout(flush, 350)
}

async function flush() {
  if (!dirty || mode !== 'disk') return
  dirty = false
  try {
    const res = await fetch(API, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) })
    if (!res.ok) throw new Error(String(res.status))
  } catch {
    dirty = true
  }
}

function beacon() {
  if (!dirty || mode !== 'disk' || !navigator.sendBeacon) return
  const ok = navigator.sendBeacon(API, new Blob([JSON.stringify(state)], { type: 'application/json' }))
  if (ok) dirty = false
}

window.addEventListener('pagehide', beacon)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') beacon()
})
window.addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue || !state) return
  try {
    const incoming = JSON.parse(e.newValue)
    if ((incoming.updatedAt || '') > (state.updatedAt || '')) {
      state = normalize(incoming)
      applyTheme()
      emit()
    }
  } catch {
    // Ignore malformed writes from other tabs.
  }
})

// All writes go through here. `activity` counts meaningful actions for the streak and heatmap.
export function mutate(fn, { activity = true, silent = false } = {}) {
  fn(state)
  if (activity) {
    const t = todayISO()
    state.activity[t] = (state.activity[t] || 0) + 1
  }
  state.updatedAt = new Date().toISOString()
  writeLocal()
  dirty = true
  scheduleFlush()
  if (!silent) emit()
}

/* ---------- Day state ---------- */

export function day(n) {
  const key = String(n)
  if (!state.days[key]) {
    state.days[key] = { sections: {}, quiz: {}, tasks: {}, evidence: {}, notes: '', rating: 0, completedAt: null, startedAt: null }
  }
  return state.days[key]
}

export function peekDay(n) {
  return state.days[String(n)] || null
}

export function touchDay(n) {
  const d = day(n)
  if (!d.startedAt) mutate(() => (d.startedAt = new Date().toISOString()), { activity: false, silent: true })
}

export function setSection(n, id, done) {
  mutate(() => {
    day(n).sections[id] = !!done
  })
}

export function answer(n, qid, picked, correct) {
  mutate(() => {
    const d = day(n)
    if (d.quiz[qid]) return // first attempt is the one that counts
    d.quiz[qid] = { picked, correct, at: new Date().toISOString() }
    const cardKey = `${n}:${qid}`
    if (!correct && !state.review[cardKey]) {
      state.review[cardKey] = { box: 1, due: iso(addDays(new Date(), 1)), seen: 0, lapses: 1 }
    }
  })
}

export function resetQuiz(n) {
  mutate(() => {
    day(n).quiz = {}
  })
}

export function setTask(n, id, done) {
  mutate(() => {
    day(n).tasks[id] = !!done
  })
}

export function setEvidence(n, id, text) {
  mutate(() => {
    day(n).evidence[id] = text
  }, { activity: false, silent: true })
}

export function setNotes(n, text) {
  const d = day(n)
  const first = !d.notes && text
  mutate(() => {
    d.notes = text
  }, { activity: !!first, silent: true })
}

export function setRating(n, value) {
  mutate(() => {
    day(n).rating = value
  })
}

export function completeDay(n, done = true) {
  mutate(() => {
    day(n).completedAt = done ? new Date().toISOString() : null
  })
}

/* ---------- Review (Leitner) ---------- */

export function reviewCards() {
  return Object.entries(state.review).map(([key, v]) => {
    const [n, qid] = key.split(':')
    return { key, day: Number(n), qid, ...v }
  })
}

export function dueCards(dateISO = todayISO()) {
  return reviewCards().filter((c) => !c.retired && c.due <= dateISO)
}

export function gradeCard(key, correct) {
  mutate(() => {
    const c = state.review[key] || { box: 1, seen: 0, lapses: 0 }
    c.seen = (c.seen || 0) + 1
    if (correct) {
      if (c.box >= LEITNER.length) c.retired = true
      c.box = Math.min(LEITNER.length, (c.box || 1) + 1)
    } else {
      c.box = 1
      c.lapses = (c.lapses || 0) + 1
      c.retired = false
    }
    c.due = iso(addDays(new Date(), correct ? LEITNER[c.box - 1] : 1))
    state.review[key] = c
  })
}

export function addToReview(n, qid) {
  const key = `${n}:${qid}`
  if (state.review[key]) return
  mutate(() => {
    state.review[key] = { box: 1, due: todayISO(), seen: 0, lapses: 0 }
  }, { activity: false })
}

/* ---------- Outcomes ---------- */

export function outcome(n) {
  return state.outcomes[String(n)] || { level: 0, evidence: '' }
}

export function setOutcome(n, patch, opts) {
  mutate(() => {
    state.outcomes[String(n)] = { ...outcome(n), ...patch }
  }, opts)
}

/* ---------- Settings ---------- */

export function setSetting(key, value) {
  mutate(() => {
    state.settings[key] = value
  }, { activity: false })
  if (key === 'theme') applyTheme()
}

export function applyTheme() {
  const theme = state?.settings?.theme || 'system'
  if (theme === 'system') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', theme)
  try {
    localStorage.setItem('aep.theme', theme)
  } catch {
    // Theme preference is a convenience only.
  }
}

/* ---------- Streak ---------- */

export function streak() {
  const act = state.activity
  let d = new Date()
  if (!act[iso(d)]) d = addDays(d, -1) // today not started yet: count through yesterday
  let n = 0
  while (act[iso(d)]) {
    n++
    d = addDays(d, -1)
  }
  return n
}

/* ---------- Import / export / reset ---------- */

export function exportFile() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `ai-engineer-pro-progress-${todayISO()}.json`
  document.body.append(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(a.href)
    a.remove()
  }, 500)
}

export async function importFile(file) {
  const text = await file.text()
  const parsed = JSON.parse(text)
  if (!parsed || typeof parsed !== 'object' || typeof parsed.days !== 'object') {
    throw new Error('That file does not look like AI Engineer Pro progress.')
  }
  state = normalize(parsed)
  mutate(() => {}, { activity: false })
  applyTheme()
}

export function resetAll() {
  const keepSettings = { ...state.settings }
  state = blank()
  state.settings = keepSettings
  mutate(() => {}, { activity: false })
}

export const dateFromISO = parseISO
