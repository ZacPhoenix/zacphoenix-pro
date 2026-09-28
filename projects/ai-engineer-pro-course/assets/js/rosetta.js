// Rosetta: Claude Code and Codex side by side, plus dual-harness patterns.

import { h, url, inline, md } from './core.js'
import { mountShell } from './shell.js'

const { content: root } = await mountShell({ page: 'rosetta' })

let data = null
try {
  data = (await import(url('content/rosetta.js'))).default
} catch {
  data = null
}

if (!data) {
  root.append(h('div', { class: 'card', html: '<h2>Rosetta not written yet</h2><p class="muted">Add <code>content/rosetta.js</code>.</p>' }))
} else {
  const search = h('input', { class: 'field', type: 'search', placeholder: `Filter ${data.rows.length} concepts`, 'aria-label': 'Filter concepts' })
  const tbody = h('tbody')
  const paint = () => {
    const q = search.value.trim().toLowerCase()
    tbody.innerHTML = ''
    const rows = data.rows.filter((r) => !q || Object.values(r).join(' ').toLowerCase().includes(q))
    for (const r of rows) {
      tbody.append(h('tr', {}, h('td', { html: `<strong>${inline(r.concept)}</strong>` }), h('td', { html: inline(r.claude) }), h('td', { html: inline(r.codex) }), h('td', { html: inline(r.gap || '') })))
    }
    if (!rows.length) tbody.append(h('tr', {}, h('td', { colspan: '4', class: 'muted', text: 'No matches.' })))
  }
  search.addEventListener('input', paint)

  root.append(
    h(
      'div',
      { class: 'stack-lg' },
      h(
        'section',
        { class: 'card' },
        h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), `Reference · checked ${data.updated}`),
        h('h1', { style: { fontSize: '1.9rem', margin: '8px 0 8px' }, text: 'Claude Code and Codex, side by side' }),
        h('div', { class: 'md ink-2', html: md(data.intro) }),
      ),
      h(
        'section',
        { class: 'card' },
        h('div', { class: 'card-title' }, h('h2', { text: 'Concept map' })),
        search,
        h('div', { class: 'table-wrap', style: { marginTop: '14px' } }, h('table', {}, h('thead', {}, h('tr', {}, h('th', { text: 'Concept' }), h('th', { text: 'Claude Code' }), h('th', { text: 'Codex' }), h('th', { text: 'Gap or gotcha' }))), tbody)),
      ),
      h('div', { class: 'card-title', style: { marginBottom: '-10px' } }, h('h2', { text: 'Dual-harness patterns', style: { fontSize: '1.35rem' } })),
      data.patterns.map((p) =>
        h(
          'section',
          { class: 'card' },
          h('h3', { style: { fontSize: '1.1rem' }, html: inline(p.title) }),
          h('p', { class: 'ink-2', style: { marginTop: '6px' }, html: inline(p.why) }),
          h('div', { class: 'md', style: { marginTop: '10px' }, html: md(p.body) }),
        ),
      ),
      data.notes?.length ? h('section', { class: 'card' }, h('div', { class: 'card-title' }, h('h2', { text: 'Caveats' })), h('div', { class: 'md', html: md(data.notes) })) : null,
    ),
  )
  paint()
}
