// Day page renderer. Reads content/days/day-XX.js and wires every interaction to the store.

import { course, getDay, getWeek } from '../../content/course.js'
import { h, $, $$, url, dayUrl, inline, md, esc, icon, toast, loadDay, fetchText, scheduleDate, fmtDate, todayISO, iso, ringSvg, pct, codeBlock, mermaidBlock, tableHtml } from './core.js'
import { mountShell, isTyping } from './shell.js'
import * as store from './store.js'
import { dayProgress } from './progress.js'
import { mcq } from './quiz.js'
import { renderDiagrams } from './diagrams.js'

const n = Number(document.body.dataset.day)
const meta = getDay(n)
const week = getWeek(meta.week)

const LEVEL = {
  quick: { label: 'Quick win', icon: 'check' },
  build: { label: 'Build · capstone', icon: 'tool' },
  stretch: { label: 'Stretch · optional', icon: 'flame' },
}

let content = null
let steps = []
let current = 0

start()

async function start() {
  const { content: root, tools } = await mountShell({ page: 'day', week: meta.week })
  document.title = `Day ${n} · ${meta.title} · ${course.title}`
  content = await loadDay(n)
  store.touchDay(n)
  if (!content) {
    root.append(h('div', { class: 'read' }, heroBlock(null), h('div', { class: 'card', html: '<h2>Content coming</h2><p class="muted">This day has no content file yet. Add <code>content/days/day-XX.js</code> and run <code>npm run validate</code>.</p>' })))
    return
  }
  const focusBtn = h('button', { class: 'icon-btn', type: 'button', title: 'Focus mode: one card at a time. Shortcut: F', 'aria-pressed': 'false', html: `${icon('focus')}<span class="timer-label">Focus</span>` })
  focusBtn.addEventListener('click', () => setFocus(!document.body.classList.contains('focus')))
  tools.append(focusBtn)

  const main = h('div', { class: 'stack-lg', id: 'day-main' })
  const layout = h('div', { class: 'day-layout' }, railLeft(), main, railRight())
  root.append(layout)

  main.append(
    step('intro', 'Overview', h('div', { class: 'stack' }, heroBlock(content), bridgeBlock(), tldrBlock(), mapBlock())),
    ...content.sections.map((s, i) => step(`sec-${s.id}`, s.title, sectionCard(s, i))),
    step('quiz', 'Final round', quizCard()),
    step('practice', 'Practice', practiceBlock()),
    step('reflect', 'Reflect', h('div', { class: 'stack' }, reflectCard(), resourcesCard(), completeCard())),
  )
  steps = $$('.step', main)

  const focusBar = h(
    'div',
    { class: 'focus-bar', role: 'navigation', 'aria-label': 'Focus mode steps' },
    h('button', { class: 'btn btn-sm', type: 'button', onclick: () => go(current - 1), html: `${icon('left')} Back` }),
    h('div', { class: 'focus-dots', id: 'focus-dots' }),
    h('button', { class: 'btn btn-sm btn-primary', type: 'button', onclick: () => go(current + 1), html: `Next ${icon('right')}` }),
    h('button', { class: 'btn btn-sm btn-ghost', type: 'button', onclick: () => setFocus(false), text: 'Exit' }),
  )
  document.body.append(focusBar)

  await hydrateSnippets(main)
  observeActive()
  refresh()
  store.on(refresh)

  let focusPref = false
  try {
    focusPref = localStorage.getItem('aep.focus') === '1'
  } catch {
    focusPref = false
  }
  if (focusPref) setFocus(true, firstIncompleteStep())

  // Diagrams change layout height, so render them before restoring a position.
  await renderDiagrams(main)
  const scrollKey = `aep.scroll.${n}`
  if (location.hash) {
    document.getElementById(location.hash.slice(1))?.scrollIntoView()
  } else if (!focusPref) {
    let y = 0
    try {
      y = Number(localStorage.getItem(scrollKey) || 0)
    } catch {
      y = 0
    }
    if (y > 200) window.scrollTo(0, y)
  }
  let scrollTimer
  window.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTimer)
      scrollTimer = setTimeout(() => {
        try {
          localStorage.setItem(scrollKey, String(Math.round(window.scrollY)))
        } catch {
          // Scroll memory is a convenience only.
        }
      }, 300)
    },
    { passive: true },
  )

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      setFocus(!document.body.classList.contains('focus'))
    } else if (document.body.classList.contains('focus') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault()
      go(current + (e.key === 'ArrowRight' ? 1 : -1))
    }
  })
}

/* ---------- Blocks ---------- */

function step(id, label, node) {
  return h('div', { class: 'step', id: `step-${id}`, dataset: { label } }, node)
}

function heroBlock(c) {
  const d = scheduleDate(n, store.get().settings.startDate)
  const isToday = iso(d) === todayISO()
  const select = h(
    'select',
    { class: 'field', 'aria-label': 'Jump to day', style: { width: 'auto', padding: '6px 10px' } },
    course.days.map((x) => h('option', { value: x.n, selected: x.n === n ? true : null, text: `Day ${x.n} · ${x.title}` })),
  )
  select.addEventListener('change', () => (location.href = dayUrl(Number(select.value))))
  const ring = h('div', { class: 'ring hero-ring', id: 'day-ring' })
  return h(
    'header',
    { class: 'hero' },
    h(
      'div',
      { class: 'eyebrow' },
      h('span', { class: 'dot' }),
      `Week ${week.n} · ${week.name}`,
      h('span', { class: 'sep', text: '/' }),
      `${fmtDate(d, 'weekday')}${isToday ? ' · today' : ''}`,
      h('span', { class: 'sep', text: '/' }),
      `Day ${n} of ${course.days.length}`,
    ),
    h(
      'div',
      { class: 'hero-grid' },
      h(
        'div',
        {},
        h('h1', { text: meta.title }),
        c ? h('p', { class: 'hook', html: inline(c.hook) }) : null,
        c
          ? h(
              'div',
              { class: 'hero-meta' },
              h('span', { class: 'pill', html: `${icon('clock')} ${c.minutes.learn} min learn` }),
              h('span', { class: 'pill', html: `${icon('quiz')} ${c.quiz.length} questions` }),
              h('span', { class: 'pill', html: `${icon('tool')} ${c.minutes.practice} min practice` }),
            )
          : null,
      ),
      c ? ring : null,
    ),
    h(
      'div',
      { class: 'chips', id: 'agenda-chips', style: { marginTop: '4px' } },
      meta.agenda.map((a, i) =>
        h('a', { class: 'chip', href: c ? `#step-sec-${c.sections[i]?.id}` : '#', 'data-sec': c?.sections[i]?.id || '' }, h('span', { class: 'dot' }), a.title),
      ),
    ),
    h('div', { class: 'row', style: { marginTop: '14px' } }, select, h('span', { class: 'spacer' }), pagerMini()),
  )
}

function pagerMini() {
  const prev = n > 1 ? h('a', { class: 'btn btn-sm btn-ghost', href: dayUrl(n - 1), html: `${icon('left')} Day ${n - 1}` }) : null
  const next = n < course.days.length ? h('a', { class: 'btn btn-sm btn-ghost', href: dayUrl(n + 1), html: `Day ${n + 1} ${icon('right')}` }) : null
  return h('div', { class: 'row' }, prev, next)
}

function bridgeBlock() {
  return h(
    'div',
    { class: 'bridge' },
    h('div', { class: 'card' }, h('div', { class: 'kicker', text: 'You already' }), h('p', { style: { marginTop: '6px' }, html: inline(content.anchor) })),
    h('div', { class: 'card plus' }, h('div', { class: 'kicker', text: '+1 today' }), h('p', { style: { marginTop: '6px' }, html: inline(content.plusOne) })),
  )
}

function tldrBlock() {
  return h(
    'div',
    { class: 'card tldr' },
    h('div', { class: 'card-title' }, h('h2', { text: 'TL;DR' }), h('span', { class: 'kicker', text: '30 seconds' })),
    h('ul', {}, content.tldr.map((t) => h('li', { html: inline(t) }))),
    h('hr'),
    h('div', { class: 'kicker', style: { marginBottom: '8px' }, text: 'By the end you can' }),
    h('ul', { class: 'outcomes-list' }, content.outcomes.map((t) => h('li', { html: inline(t) }))),
  )
}

function mapBlock() {
  if (!content.map) return null
  return h(
    'figure',
    { class: 'card visual', style: { margin: 0 } },
    h('div', { class: 'card-title' }, h('h2', { text: content.map.title || 'The big picture' })),
    h('div', { html: mermaidBlock(content.map.mermaid) }),
    content.map.caption ? h('figcaption', { html: inline(content.map.caption) }) : null,
  )
}

function sectionCard(s, i) {
  const done = !!store.peekDay(n)?.sections?.[s.id]
  const agenda = meta.agenda[i]
  const gotIt = h('button', { class: `btn btn-sm got-it${done ? ' is-done' : ''}`, type: 'button', 'aria-pressed': String(done), html: done ? `${icon('check')} Got it` : 'Got it' })
  gotIt.addEventListener('click', () => {
    const now = !store.peekDay(n)?.sections?.[s.id]
    store.setSection(n, s.id, now)
    if (now) advanceFrom(`step-sec-${s.id}`)
  })
  const card = h(
    'section',
    { class: `card sec${done ? ' is-done' : ''}`, id: `sec-${s.id}`, 'data-sec': s.id },
    h(
      'header',
      { class: 'sec-h' },
      h('span', { class: 'sec-num', text: String(i + 1).padStart(2, '0') }),
      h('div', {}, h('h2', { text: s.title }), h('p', { class: 'lead', html: inline(s.lead) }), agenda ? h('p', { class: 'tiny muted', style: { marginTop: '4px' }, text: agenda.line || agenda.topics.join(', ') }) : null),
      gotIt,
    ),
    h(
      'dl',
      { class: 'bites' },
      s.bites.map(([term, body]) => h('div', { class: 'bite' }, h('dt', { html: inline(term) }), h('dd', { html: inline(body) }))),
    ),
    visualBlock(s.visual),
    (s.callouts || []).map(calloutBlock),
    s.deeper ? deeperBlock(s.deeper) : null,
  )
  const checks = content.quiz.filter((q) => q.section === s.id)
  if (checks.length) {
    card.append(h('div', { class: 'check' }, checks.map((q) => quizItem(q, 'Quick check'))))
  }
  return card
}

function visualBlock(v) {
  if (!v) return null
  let inner = ''
  if (v.mermaid) inner = mermaidBlock(v.mermaid)
  else if (v.table) inner = tableHtml(v.table.head, v.table.rows)
  else if (v.md) inner = `<div class="md">${md(v.md)}</div>`
  return h('figure', { class: 'visual' }, h('div', { html: inner }), v.caption ? h('figcaption', { html: inline(v.caption) }) : null)
}

function calloutBlock(c) {
  const kinds = { example: ['EX', 'Example'], pitfall: ['!', 'Pitfall'], pro: ['✓', 'Pro move'], note: ['i', 'Note'] }
  const [glyph, label] = kinds[c.type] || kinds.note
  return h(
    'aside',
    { class: `callout callout-${c.type || 'note'}` },
    h('div', { class: 'callout-h' }, h('span', { class: 'ico', text: glyph }), c.title ? `${label}: ${c.title}` : label),
    h('div', { class: 'md', html: md(c.body) }),
  )
}

function deeperBlock(d) {
  return h(
    'details',
    { class: 'deeper' },
    h('summary', {}, h('span', { class: 'plus-one', text: '+1' }), h('span', { text: d.title || 'Go deeper' }), h('span', { class: 'chev', html: icon('chev') })),
    h('div', { class: 'deeper-body md', html: md(d.body) }),
  )
}

function quizItem(q, label) {
  const prior = store.peekDay(n)?.quiz?.[q.id]
  return mcq({
    question: q,
    seed: `${n}:${q.id}`,
    prior,
    label,
    onAnswer: (picked, correct) => store.answer(n, q.id, picked, correct),
  })
}

function quizCard() {
  const final = content.quiz.filter((q) => !q.section)
  const score = h('div', { class: 'score-strip', id: 'quiz-score' })
  const reset = h('button', { class: 'btn btn-sm btn-ghost', type: 'button', text: 'Retake all questions' })
  reset.addEventListener('click', () => {
    if (!confirm('Clear your answers for today? Missed questions stay in your review deck.')) return
    store.resetQuiz(n)
    location.reload()
  })
  return h(
    'section',
    { class: 'card', id: 'quiz' },
    h('div', { class: 'card-title' }, h('h2', { text: 'Final round' }), h('span', { class: 'kicker', text: `${final.length} questions` })),
    h('p', { class: 'muted small', style: { marginTop: '-6px', marginBottom: '16px' }, html: 'Scenario questions across the whole day. First attempt counts. Keys <kbd>1</kbd> to <kbd>4</kbd> work once a question has focus.' }),
    final.map((q, i) => quizItem(q, `Question ${i + 1}`)),
    h('hr'),
    h('div', { class: 'row' }, score, h('span', { class: 'spacer' }), reset),
  )
}

function practiceBlock() {
  return h(
    'section',
    { class: 'stack', id: 'practice' },
    h('div', { class: 'card-title', style: { marginBottom: 0 } }, h('h2', { text: 'Practice', style: { fontSize: '1.4rem' } }), h('span', { class: 'kicker', text: 'Do at least the quick win' })),
    h('div', { class: 'tasks' }, content.tasks.map(taskCard)),
  )
}

function taskCard(t) {
  const ds = store.peekDay(n)
  const done = !!ds?.tasks?.[t.id]
  const lvl = LEVEL[t.level] || LEVEL.quick
  const toggle = h('button', { class: 'check-toggle', type: 'button', 'aria-pressed': String(done) }, h('span', { class: 'box' }), done ? 'Done' : 'Mark done')
  toggle.addEventListener('click', () => {
    const now = !store.peekDay(n)?.tasks?.[t.id]
    store.setTask(n, t.id, now)
    toggle.setAttribute('aria-pressed', String(now))
    toggle.lastChild.textContent = now ? 'Done' : 'Mark done'
    if (now) toast(t.level === 'build' ? 'Capstone milestone logged' : 'Nice. Logged.')
  })
  const evidence = h('input', { class: 'field', type: 'text', placeholder: t.level === 'build' ? 'Evidence: PR, commit, or file link' : 'Evidence or a one-line note (optional)', 'aria-label': `Evidence for ${t.title}` })
  evidence.value = ds?.evidence?.[t.id] || ''
  let timer
  evidence.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(() => store.setEvidence(n, t.id, evidence.value), 400)
  })

  const prompts = (t.prompts || (t.prompt ? [t.prompt] : [])).map((p) => {
    const text = Array.isArray(p) || typeof p === 'string' ? p : p.text
    const label = typeof p === 'object' && !Array.isArray(p) && p.label ? p.label : 'Prompt for Claude Code or Codex'
    const body = Array.isArray(text) ? text.join('\n') : String(text)
    return h('div', { class: 'prompt-block', html: codeBlock(body, 'prompt', label) })
  })
  const codes = (t.code || []).map((c) =>
    c.file
      ? h('div', { 'data-snippet': c.file, 'data-lang': c.lang || 'text', 'data-title': c.title || c.file, html: codeBlock('Loading…', c.lang || 'text', c.title || c.file) })
      : h('div', { html: codeBlock((c.lines || []).join('\n'), c.lang || 'text', c.title || c.lang || '') }),
  )

  return h(
    'article',
    { class: `card task level-${t.level}`, id: `task-${t.id}` },
    h('div', { class: 'task-top' }, h('span', { class: 'level', html: `${icon(lvl.icon)} ${lvl.label}` }), h('span', { class: 'pill', html: `${icon('clock')} ~${t.minutes} min` })),
    h('h3', { html: inline(t.title) }),
    h('p', { class: 'goal', html: inline(t.goal) }),
    t.steps?.length ? h('ol', { class: 'steps' }, t.steps.map((s) => h('li', { html: inline(s) }))) : null,
    prompts,
    codes,
    h(
      'div',
      { class: 'kv' },
      t.minimum ? h('div', { html: `<b>Minimum</b> ${inline(t.minimum)}` }) : null,
      t.done ? h('div', { html: `<b>Done when</b> ${inline(t.done)}` }) : null,
    ),
    h('div', { class: 'task-foot' }, toggle, h('div', { class: 'evidence' }, evidence)),
  )
}

function reflectCard() {
  const ds = store.peekDay(n)
  const notes = h('textarea', { class: 'field', placeholder: 'What clicked, what is fuzzy, what you will try tomorrow. Autosaves.', 'aria-label': 'Notes for today' })
  notes.value = ds?.notes || ''
  const saved = h('span', { class: 'tiny muted', text: '' })
  let timer
  notes.addEventListener('input', () => {
    saved.textContent = 'Saving…'
    clearTimeout(timer)
    timer = setTimeout(() => {
      store.setNotes(n, notes.value)
      saved.textContent = 'Saved'
      refresh()
    }, 500)
  })
  const rating = h(
    'div',
    { class: 'rating', role: 'group', 'aria-label': 'Confidence from 1 to 5' },
    [1, 2, 3, 4, 5].map((v) => h('button', { type: 'button', 'aria-pressed': String(ds?.rating === v), 'data-v': v, text: String(v) })),
  )
  rating.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]')
    if (!b) return
    store.setRating(n, Number(b.dataset.v))
    rating.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  })
  return h(
    'section',
    { class: 'card', id: 'reflect' },
    h('div', { class: 'card-title' }, h('h2', { text: 'Reflect' }), saved),
    h('ol', { class: 'reflect-prompts' }, content.reflect.map((r) => h('li', { html: inline(r) }))),
    notes,
    h('div', { class: 'row', style: { marginTop: '14px' } }, h('span', { class: 'small ink-2', text: 'How solid does today feel?' }), rating, h('span', { class: 'tiny muted', text: '1 shaky · 5 could teach it' })),
  )
}

function resourcesCard() {
  const gloss = content.glossary?.length
    ? h(
        'details',
        { class: 'deeper', style: { marginTop: '14px' } },
        h('summary', {}, h('span', { class: 'plus-one', text: 'Aa' }), h('span', { text: `Glossary for today (${content.glossary.length})` }), h('span', { class: 'chev', html: icon('chev') })),
        h('div', { class: 'deeper-body' }, h('dl', { class: 'gloss-list' }, content.glossary.map(([t, d]) => h('div', { class: 'gloss-item' }, h('dt', { html: inline(t) }), h('dd', { html: inline(d) }))))),
      )
    : null
  return h(
    'section',
    { class: 'card' },
    h('div', { class: 'card-title' }, h('h2', { text: 'Sources and further reading' })),
    h(
      'ul',
      { class: 'resources' },
      content.resources.map((r) => h('li', {}, h('a', { href: r.url, target: '_blank', rel: 'noopener noreferrer', text: r.title }), r.note ? h('span', { class: 'note', html: inline(r.note) }) : null)),
    ),
    gloss,
  )
}

function completeCard() {
  const btn = h('button', { class: 'btn btn-primary btn-lg', type: 'button', id: 'complete-btn' })
  btn.addEventListener('click', () => {
    const done = !!store.peekDay(n)?.completedAt
    store.completeDay(n, !done)
    if (!done) toast(n < course.days.length ? `Day ${n} complete. Day ${n + 1} is ready when you are.` : 'Course complete. Map your evidence on the Outcomes page.', 3200)
  })
  const next =
    n < course.days.length
      ? h('a', { class: 'next', href: dayUrl(n + 1) }, h('small', { text: 'Next' }), `Day ${n + 1} · ${getDay(n + 1).title}`)
      : h('a', { class: 'next', href: url('outcomes.html') }, h('small', { text: 'Finish' }), 'Map your outcomes')
  const prev = n > 1 ? h('a', { href: dayUrl(n - 1) }, h('small', { text: 'Previous' }), `Day ${n - 1} · ${getDay(n - 1).title}`) : h('a', { href: url('index.html') }, h('small', { text: 'Back' }), 'Dashboard')
  return h(
    'section',
    { class: 'card', id: 'complete' },
    h('div', { class: 'complete-bar' }, h('ul', { class: 'checklist', id: 'checklist' }), btn),
    h('div', { class: 'pager', style: { marginTop: '16px' } }, prev, next),
  )
}

function railLeft() {
  return h(
    'aside',
    { class: 'rail', 'aria-label': 'Day outline' },
    h('div', { class: 'rail-title', text: `Day ${n} outline` }),
    h('ol', { id: 'rail-list' }),
  )
}

function railRight() {
  return h(
    'aside',
    { class: 'rail rail-right', 'aria-label': 'Day stats' },
    h('div', { class: 'rail-title', text: 'Today' }),
    h('div', { id: 'rail-stats' }),
  )
}

/* ---------- Snippets ---------- */

async function hydrateSnippets(root) {
  await Promise.all(
    $$('[data-snippet]', root).map(async (el) => {
      try {
        const text = await fetchText(el.dataset.snippet)
        el.innerHTML = codeBlock(text.replace(/\n$/, ''), el.dataset.lang, el.dataset.title)
      } catch (err) {
        el.innerHTML = `<div class="error-box small">${esc(err.message)}</div>`
      }
    }),
  )
}

/* ---------- Live state ---------- */

function refresh() {
  if (!content) return
  const ds = store.peekDay(n) || {}
  const p = dayProgress(content, n)

  const ring = $('#day-ring')
  if (ring) ring.innerHTML = `${ringSvg(p.fraction)}<div class="ring-label"><div><b>${pct(p.fraction)}</b><span>today</span></div></div>`

  for (const s of content.sections) {
    const done = !!ds.sections?.[s.id]
    const card = document.getElementById(`sec-${s.id}`)
    if (card) {
      card.classList.toggle('is-done', done)
      const b = card.querySelector('.got-it')
      b.classList.toggle('is-done', done)
      b.setAttribute('aria-pressed', String(done))
      b.innerHTML = done ? `${icon('check')} Got it` : 'Got it'
    }
    $$(`[data-sec="${s.id}"].chip`).forEach((c) => c.classList.toggle('is-done', done))
  }

  const [qDone, qTotal] = p.parts.quiz
  const score = $('#quiz-score')
  if (score) {
    score.innerHTML = qDone
      ? `<b>${p.parts.quizRight}/${qDone}</b><span class="muted small">correct on first attempt${qDone < qTotal ? `, ${qTotal - qDone} left` : ''}</span>`
      : `<span class="muted small">${qTotal} questions today, including quick checks in each section.</span>`
  }

  const list = $('#checklist')
  if (list) {
    const items = [
      [`Sections ${p.parts.sections[0]}/${p.parts.sections[1]}`, p.parts.sections[0] === p.parts.sections[1]],
      [`Questions ${qDone}/${qTotal}`, qDone === qTotal],
      [`Tasks ${p.parts.tasks[0]}/${p.parts.tasks[1]}`, p.parts.tasks[0] === p.parts.tasks[1]],
      ['Notes', !!p.parts.notes],
    ]
    list.innerHTML = items.map(([t, ok]) => `<li class="${ok ? 'ok' : ''}">${esc(t)}</li>`).join('')
  }
  const btn = $('#complete-btn')
  if (btn) {
    const done = !!ds.completedAt
    btn.innerHTML = done ? `${icon('check')} Day ${n} complete` : `Mark day ${n} complete`
    btn.classList.toggle('is-done', done)
  }

  const railList = $('#rail-list')
  if (railList) {
    railList.innerHTML = ''
    for (const el of steps) {
      const id = el.id
      let done = false
      if (id.startsWith('step-sec-')) done = !!ds.sections?.[id.slice(9)]
      else if (id === 'step-quiz') done = content.quiz.filter((q) => !q.section).every((q) => ds.quiz?.[q.id])
      else if (id === 'step-practice') done = p.parts.tasks[0] === p.parts.tasks[1]
      else if (id === 'step-reflect') done = !!ds.completedAt
      else if (id === 'step-intro') done = !!ds.startedAt
      railList.append(h('li', {}, h('a', { href: `#${id}`, class: done ? 'is-done' : '', 'data-step': id, onclick: (e) => railJump(e, id) }, h('span', { class: 'tick' }), el.dataset.label)))
    }
  }

  const stats = $('#rail-stats')
  if (stats) {
    stats.innerHTML = [
      ['Progress', pct(p.fraction)],
      ['Quiz', qDone ? `${p.parts.quizRight}/${qDone}` : 'Not started'],
      ['Tasks', `${p.parts.tasks[0]}/${p.parts.tasks[1]}`],
      ['Plan', `${content.minutes.learn} + ${content.minutes.practice} min`],
    ]
      .map(([k, v]) => `<div class="mini-stat"><span class="tiny muted">${k}</span><b>${v}</b></div>`)
      .join('')
  }
  renderDots()
}

function railJump(e, id) {
  if (!document.body.classList.contains('focus')) return
  e.preventDefault()
  go(steps.findIndex((s) => s.id === id))
}

function observeActive() {
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) {
        if (!en.isIntersecting) continue
        $$('#rail-list a').forEach((a) => a.classList.toggle('is-active', a.dataset.step === en.target.id))
      }
    },
    { rootMargin: '-35% 0px -60% 0px' },
  )
  steps.forEach((s) => io.observe(s))
}

/* ---------- Focus mode ---------- */

function firstIncompleteStep() {
  const ds = store.peekDay(n) || {}
  const idx = steps.findIndex((el) => el.id.startsWith('step-sec-') && !ds.sections?.[el.id.slice(9)])
  return idx === -1 ? 0 : idx
}

function setFocus(on, at = current) {
  document.body.classList.toggle('focus', on)
  $$('#page-tools .icon-btn').forEach((b) => b.setAttribute('aria-pressed', String(on)))
  try {
    localStorage.setItem('aep.focus', on ? '1' : '0')
  } catch {
    // Preference only.
  }
  if (on) go(at)
  else steps.forEach((s) => s.classList.remove('is-current'))
}

function go(i) {
  if (!steps.length) return
  current = Math.max(0, Math.min(steps.length - 1, i))
  steps.forEach((s, j) => s.classList.toggle('is-current', j === current))
  renderDots()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function renderDots() {
  const dots = $('#focus-dots')
  if (!dots) return
  const ds = store.peekDay(n) || {}
  dots.innerHTML = steps
    .map((el, j) => {
      const done = el.id.startsWith('step-sec-') && ds.sections?.[el.id.slice(9)]
      return `<span class="${j === current ? 'is-current' : done ? 'is-done' : ''}" title="${esc(el.dataset.label)}"></span>`
    })
    .join('')
}

function advanceFrom(stepId) {
  const idx = steps.findIndex((s) => s.id === stepId)
  if (idx < 0) return
  if (document.body.classList.contains('focus')) {
    go(idx + 1)
  } else {
    steps[idx + 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
