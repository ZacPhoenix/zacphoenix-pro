// Outcomes: the nine end-of-course capabilities, with coverage, self-rating, and evidence.

import { course, h, url, dayUrl, inline, loadAllDays, pct, esc } from './core.js'
import { mountShell } from './shell.js'
import * as store from './store.js'
import { dayProgress, outcomeCoverage } from './progress.js'

const { content: root } = await mountShell({ page: 'outcomes', width: 'read' })
const days = await loadAllDays()

function linkify(text) {
  return esc(text).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
}

function lessonEvidence(o) {
  const items = []
  for (const n of o.days) {
    const ds = store.peekDay(n)
    const c = days.get(n)
    if (!ds || !c) continue
    for (const t of c.tasks) {
      const ev = ds.evidence?.[t.id]?.trim()
      if (ev) items.push({ n, task: t.title, ev })
    }
  }
  return items
}

function card(o) {
  const cur = store.outcome(o.n)
  const cov = outcomeCoverage(days, o)
  const levels = h(
    'div',
    { class: 'levels', role: 'group', 'aria-label': `Self-rating for outcome ${o.n}` },
    course.levels.map((label, i) => h('button', { type: 'button', 'aria-pressed': String((cur.level || 0) === i), 'data-l': i, text: label })),
  )
  levels.addEventListener('click', (e) => {
    const b = e.target.closest('[data-l]')
    if (!b) return
    store.setOutcome(o.n, { level: Number(b.dataset.l) })
    levels.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  })
  const ta = h('textarea', { class: 'field', style: { minHeight: '90px' }, placeholder: 'Links and notes that prove it: PRs, repos, demos, write-ups.', 'aria-label': `Evidence for outcome ${o.n}` })
  ta.value = cur.evidence || ''
  let timer
  ta.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(() => store.setOutcome(o.n, { evidence: ta.value }, { activity: false, silent: true }), 450)
  })
  const logged = lessonEvidence(o)
  return h(
    'article',
    { class: 'card', id: `outcome-${o.n}` },
    h('div', { class: 'row', style: { alignItems: 'flex-start', flexWrap: 'nowrap' } }, h('span', { class: 'outcome-num', text: String(o.n).padStart(2, '0') }), h('div', { style: { flex: '1' } }, h('h2', { style: { fontSize: '1.15rem' }, text: o.title }), h('ul', { class: 'outcomes-list', style: { marginTop: '8px' } }, o.scope.map((s) => h('li', { text: s }))))),
    h(
      'div',
      { style: { marginTop: '14px' } },
      h('div', { class: 'kicker', style: { marginBottom: '8px' }, text: 'Built on' }),
      h(
        'div',
        { class: 'chips' },
        o.days.map((n) => {
          const p = dayProgress(days.get(n), n)
          const meta = course.days[n - 1]
          return h('a', { class: `chip${p.status === 'done' ? ' is-done' : ''}`, href: dayUrl(n), 'data-week': String(meta.week), title: meta.title }, h('span', { class: 'dot' }), `Day ${n}`)
        }),
      ),
      h('div', { class: 'row', style: { marginTop: '12px' } }, h('div', { class: 'meter meter-sm meter-good', style: { flex: '1' } }, h('i', { style: { width: pct(cov) } })), h('span', { class: 'tiny muted', text: `${pct(cov)} of related lessons` })),
    ),
    h('div', { style: { marginTop: '16px' } }, h('div', { class: 'kicker', style: { marginBottom: '8px' }, text: 'Self-rating' }), levels),
    logged.length
      ? h(
          'div',
          { style: { marginTop: '16px' } },
          h('div', { class: 'kicker', style: { marginBottom: '6px' }, text: 'Evidence logged in lessons' }),
          h('ul', { class: 'resources' }, logged.map((x) => h('li', { html: `<span class="tiny muted">Day ${x.n} · ${inline(x.task)}</span><br>${linkify(x.ev)}` }))),
        )
      : null,
    h('div', { style: { marginTop: '16px' } }, h('div', { class: 'kicker', style: { marginBottom: '8px' }, text: 'Your evidence' }), ta),
  )
}

function render() {
  root.innerHTML = ''
  const rated = course.outcomes.filter((o) => (store.outcome(o.n).level || 0) >= 3).length
  root.append(
    h(
      'div',
      { class: 'stack-lg' },
      h(
        'section',
        { class: 'card' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), 'End state'),
        h('h1', { style: { fontSize: '1.9rem', margin: '8px 0 6px' }, text: 'What you can do by the end' }),
        h('p', { class: 'ink-2', text: 'Nine capabilities, each built across several days. Coverage fills as you finish the related lessons. The rating and evidence are yours: claim a level only when you can point at proof.' }),
        h('p', { class: 'small muted', style: { marginTop: '10px' }, text: `${rated} of 9 rated Confident or higher. Evidence from task fields on day pages shows up here automatically.` }),
        h('p', { class: 'small', style: { marginTop: '8px' }, html: `<a href="${url('capstone.html')}">See how the capstone builds each outcome</a>` }),
      ),
      course.outcomes.map(card),
    ),
  )
}

render()
