// Review deck: spaced repetition (Leitner boxes) over the questions you missed,
// plus a mixed practice mode drawn from days you have started.

import { course, h, url, dayUrl, loadAllDays, fmtDate, parseISO, todayISO, icon } from './core.js'
import { mountShell } from './shell.js'
import * as store from './store.js'
import { mcq } from './quiz.js'

const { content: root } = await mountShell({ page: 'review', width: 'read' })
const days = await loadAllDays()

let mode = 'due'
let queue = []
let pos = 0
let session = { right: 0, total: 0 }

function findQuestion(dayN, qid) {
  const c = days.get(dayN)
  const q = c?.quiz.find((x) => x.id === qid)
  if (!q) return null
  const sec = q.section ? c.sections.find((s) => s.id === q.section) : null
  return { q, dayN, where: sec ? sec.title : 'Final round' }
}

function buildQueue() {
  if (mode === 'due') return store.dueCards().sort((a, b) => a.due.localeCompare(b.due) || a.box - b.box).map((c) => ({ day: c.day, qid: c.qid, key: c.key }))
  if (mode === 'missed') return store.reviewCards().filter((c) => !c.retired).sort((a, b) => a.box - b.box).map((c) => ({ day: c.day, qid: c.qid, key: c.key }))
  const started = course.days.filter((d) => store.peekDay(d.n)?.startedAt && days.get(d.n))
  const pool = started.flatMap((d) => days.get(d.n).quiz.map((q) => ({ day: d.n, qid: q.id, key: `${d.n}:${q.id}` })))
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, 12)
}

function header() {
  const cards = store.reviewCards()
  const active = cards.filter((c) => !c.retired)
  const boxes = [1, 2, 3, 4, 5].map((b) => active.filter((c) => c.box === b).length)
  const max = Math.max(1, ...boxes)
  const seg = h(
    'div',
    { class: 'seg', role: 'group', 'aria-label': 'Review mode' },
    [
      ['due', `Due now (${store.dueCards().length})`],
      ['missed', `All missed (${active.length})`],
      ['practice', 'Mixed practice'],
    ].map(([id, label]) => h('button', { type: 'button', 'aria-pressed': String(mode === id), onclick: () => setMode(id), text: label })),
  )
  return h(
    'section',
    { class: 'card' },
    h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), 'Spaced repetition'),
    h('h1', { style: { fontSize: '1.9rem', margin: '8px 0 6px' }, text: 'Review deck' }),
    h('p', { class: 'ink-2', text: 'Questions you miss come back after 1 day. Each correct answer moves a card up a box and pushes it further out: 1, 2, 4, 8, then 16 days. A miss sends it back to box 1.' }),
    h(
      'div',
      { class: 'row', style: { marginTop: '16px', alignItems: 'flex-end' } },
      h(
        'div',
        { 'aria-label': 'Cards per box' },
        h('div', { class: 'boxes', style: { height: '56px' } }, boxes.map((count, i) => h('div', { title: `Box ${i + 1}: ${count}`, style: { display: 'grid', justifyItems: 'center', gap: '4px' } }, h('span', { class: 'tiny muted', text: String(count) }), h('div', { class: 'b', style: { height: `${Math.max(4, (count / max) * 34)}px` } })))),
        h('div', { class: 'tiny muted', style: { marginTop: '4px' }, text: 'Boxes 1 to 5' }),
      ),
      h('span', { class: 'spacer' }),
      h('div', { class: 'small muted', style: { textAlign: 'right' } }, `${active.length} active · ${cards.length - active.length} retired`),
    ),
    h('div', { style: { marginTop: '16px' } }, seg),
  )
}

function emptyState() {
  const upcoming = store.reviewCards().filter((c) => !c.retired).sort((a, b) => a.due.localeCompare(b.due))[0]
  const msg =
    mode === 'practice'
      ? 'Start a day first. Practice pulls questions from days you have opened.'
      : upcoming
        ? `Nothing due right now. Next card returns ${fmtDate(parseISO(upcoming.due), 'weekday')}.`
        : 'No missed questions yet. Answer questions on the day pages and any misses land here.'
  return h('section', { class: 'card empty' }, h('div', { class: 'big', html: icon('check') }), h('p', { text: msg }), h('a', { class: 'btn', href: url('index.html'), text: 'Back to dashboard' }))
}

function questionCard() {
  const item = queue[pos]
  const found = item && findQuestion(item.day, item.qid)
  if (!found) {
    pos++
    return pos < queue.length ? questionCard() : doneCard()
  }
  const card = store.get().review[item.key]
  const next = h('button', { class: 'btn btn-primary', type: 'button', hidden: true, html: `${pos + 1 < queue.length ? 'Next question' : 'Finish'} ${icon('right')}` })
  next.addEventListener('click', () => {
    pos++
    paint()
  })
  const info = h('span', { class: 'small muted' })
  const q = mcq({
    question: found.q,
    seed: `${item.key}:${card?.seen || 0}:${mode}`,
    label: `Day ${found.dayN} · ${found.where}`,
    reviewHint: false,
    onAnswer: (picked, correct) => {
      session.total++
      if (correct) session.right++
      if (mode === 'practice') {
        if (!correct) store.addToReview(found.dayN, item.qid)
        info.textContent = correct ? 'Correct.' : 'Added to your deck.'
      } else {
        store.gradeCard(item.key, correct)
        const updated = store.get().review[item.key]
        info.textContent = updated?.retired ? 'Retired. You know this one.' : `Box ${updated.box}. Back ${fmtDate(parseISO(updated.due), 'weekday')}.`
      }
      next.hidden = false
      next.focus()
    },
  })
  return h(
    'section',
    { class: 'card review-card' },
    h('div', { class: 'row', style: { marginBottom: '12px' } }, h('span', { class: 'kicker', text: `${pos + 1} of ${queue.length}` }), h('span', { class: 'spacer' }), h('a', { class: 'small', href: `${dayUrl(found.dayN)}#q-${item.qid}`, text: 'Open in lesson' })),
    q,
    h('div', { class: 'row', style: { marginTop: '16px' } }, info, h('span', { class: 'spacer' }), next),
  )
}

function doneCard() {
  return h(
    'section',
    { class: 'card empty' },
    h('div', { class: 'big', html: icon('check') }),
    h('h2', { text: 'Session done' }),
    h('p', { class: 'ink-2', text: `${session.right} of ${session.total} correct.` }),
    h('div', { class: 'row', style: { justifyContent: 'center', marginTop: '12px' } }, h('button', { class: 'btn', type: 'button', onclick: () => setMode(mode), text: 'Go again' }), h('a', { class: 'btn btn-ghost', href: url('index.html'), text: 'Dashboard' })),
  )
}

function paint() {
  root.innerHTML = ''
  const body = queue.length === 0 ? emptyState() : pos >= queue.length ? doneCard() : questionCard()
  root.append(h('div', { class: 'stack-lg' }, header(), body))
  root.querySelector('.mcq')?.focus({ preventScroll: true })
}

function setMode(m) {
  mode = m
  queue = buildQueue()
  pos = 0
  session = { right: 0, total: 0 }
  paint()
}

setMode(store.dueCards().length ? 'due' : 'missed')
