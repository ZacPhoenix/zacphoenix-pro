// Capstone: the Agent Forge arc. Milestone status comes from each day's Build task.

import { course, h, dayUrl, inline, mermaidBlock, codeBlock, loadAllDays, scheduleDate, fmtDate, esc, toast } from './core.js'
import { mountShell } from './shell.js'
import * as store from './store.js'
import { renderDiagrams } from './diagrams.js'

const { content: root } = await mountShell({ page: 'capstone', width: 'read' })
const days = await loadAllDays()
const cap = course.capstone

function capState() {
  return store.get().capstone || { setup: {}, repo: '' }
}

function setCap(patch, opts) {
  store.mutate((s) => {
    s.capstone = { ...capState(), ...patch }
  }, opts)
}

function buildTaskId(n) {
  return days.get(n)?.tasks.find((t) => t.level === 'build')?.id || 'build'
}

function setupCard() {
  const st = capState()
  const repo = h('input', { class: 'field', type: 'url', placeholder: 'https://github.com/you/agent-forge', value: st.repo || '', 'aria-label': 'Your agent-forge repository URL' })
  let timer
  repo.addEventListener('input', () => {
    clearTimeout(timer)
    timer = setTimeout(() => setCap({ repo: repo.value.trim() }, { activity: false, silent: true }), 400)
  })
  const list = h(
    'ul',
    { class: 'resources' },
    cap.setup.map((item, i) => {
      const done = !!st.setup?.[i]
      const b = h('button', { class: 'check-toggle', type: 'button', 'aria-pressed': String(done), style: { width: '100%', justifyContent: 'flex-start', textAlign: 'left' } }, h('span', { class: 'box' }), h('span', { html: inline(item) }))
      b.addEventListener('click', () => {
        const now = !capState().setup?.[i]
        setCap({ setup: { ...capState().setup, [i]: now } })
        b.setAttribute('aria-pressed', String(now))
        if (now && cap.setup.every((_, j) => capState().setup?.[j])) toast('Setup complete. You are ready for Day 1.')
      })
      return h('li', { style: { borderBottom: '0', padding: '4px 0' } }, b)
    }),
  )
  return h(
    'section',
    { class: 'card' },
    h('div', { class: 'card-title' }, h('h2', { text: 'Setup checklist' }), h('span', { class: 'kicker', text: 'Before Day 1' })),
    list,
    h('div', { class: 'setting', style: { marginTop: '14px' } }, h('label', { class: 'small', style: { fontWeight: '650', display: 'block', marginBottom: '6px' }, text: 'Your repo' }), repo),
  )
}

function timeline() {
  const start = store.get().settings.startDate
  const byWeek = course.weeks.map((w) => ({ w, items: cap.milestones.filter((m) => course.days[m.day - 1].week === w.n) }))
  return byWeek.map(({ w, items }) =>
    h(
      'section',
      { class: 'card', 'data-week': String(w.n), style: { borderTop: '4px solid var(--accent)' } },
      h('div', { class: 'card-title' }, h('span', { class: 'kicker', text: `Week ${w.n}` }), h('h2', { text: w.name })),
      h('p', { class: 'ink-2 small', style: { marginTop: '-6px', marginBottom: '8px' }, text: w.goal }),
      h(
        'ol',
        { class: 'timeline' },
        items.map((m) => {
          const ds = store.peekDay(m.day)
          const tid = buildTaskId(m.day)
          const done = !!ds?.tasks?.[tid]
          const ev = ds?.evidence?.[tid]?.trim()
          return h(
            'li',
            { class: done ? 'is-done' : '' },
            h('span', { class: 'node', text: String(m.day) }),
            h(
              'div',
              {},
              h('div', { class: 'meta', text: `Day ${m.day} · ${fmtDate(scheduleDate(m.day, start), 'weekday')} · ${course.days[m.day - 1].title}` }),
              h('h3', {}, h('a', { href: `${dayUrl(m.day)}#task-${tid}`, style: { color: 'inherit' }, text: m.title })),
              h('p', { class: 'deliv', html: inline(m.deliverable) }),
              h('p', { class: 'tiny muted', style: { marginTop: '4px' }, html: `<strong>Minimum:</strong> ${inline(m.minimum)}` }),
              ev ? h('p', { class: 'tiny', style: { marginTop: '4px' }, html: `<strong>Evidence:</strong> ${esc(ev).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')}` }) : null,
            ),
          )
        }),
      ),
    ),
  )
}

function render() {
  root.innerHTML = ''
  const doneCount = cap.milestones.filter((m) => store.peekDay(m.day)?.tasks?.[buildTaskId(m.day)]).length
  root.append(
    h(
      'div',
      { class: 'stack-lg' },
      h(
        'section',
        { class: 'card' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), `Capstone · ${doneCount} of ${cap.milestones.length} milestones`),
        h('h1', { style: { fontSize: '2rem', margin: '8px 0 8px' }, text: cap.name }),
        h('p', { class: 'ink-2', html: inline(cap.pitch) }),
        h('p', { class: 'small muted', style: { marginTop: '10px' }, html: `Repository name: <code>${esc(cap.repo)}</code>. Each day's <strong>Build</strong> task adds one milestone. Every milestone has a minimum version, so a short day still moves the repo forward.` }),
      ),
      h('section', { class: 'card' }, h('div', { class: 'card-title' }, h('h2', { text: 'Why this capstone' })), h('ul', { class: 'outcomes-list' }, cap.why.map((w) => h('li', { html: inline(w) })))),
      h('figure', { class: 'card visual', style: { margin: 0 } }, h('div', { class: 'card-title' }, h('h2', { text: 'Where it ends up' })), h('div', { html: mermaidBlock(cap.architecture) }), h('figcaption', { text: 'Inputs flow into Triage. Proposals wait in the Inbox, and only approved ones reach GitHub. Decisions feed evals, and evals drive improvements to the control plane that configures both harnesses.' })),
      h('section', { class: 'card' }, h('div', { class: 'card-title' }, h('h2', { text: 'Stack' })), h('ul', { class: 'outcomes-list' }, cap.stack.map((s) => h('li', { html: inline(s) })))),
      h(
        'section',
        { class: 'card' },
        h('div', { class: 'card-title' }, h('h2', { text: 'Repo map at Day 20' })),
        h('p', { class: 'small muted', style: { marginTop: '-6px' }, text: 'Every build task uses these paths, so each day lands where the next one expects it.' }),
        h('div', { html: codeBlock(cap.layout.join('\n'), 'text', 'agent-forge') }),
        h('div', { class: 'kicker', style: { margin: '16px 0 8px' }, text: 'Conventions' }),
        h('ul', { class: 'outcomes-list' }, cap.conventions.map((c) => h('li', { html: inline(c) }))),
      ),
      setupCard(),
      timeline(),
    ),
  )
  renderDiagrams(root)
}

render()
