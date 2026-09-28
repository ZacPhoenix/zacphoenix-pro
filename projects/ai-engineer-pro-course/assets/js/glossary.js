// Glossary: every term defined across the course, searchable, with links back to lessons.

import { course, h, dayUrl, inline, loadAllDays } from './core.js'
import { mountShell } from './shell.js'

const { content: root } = await mountShell({ page: 'glossary', width: 'read' })
const days = await loadAllDays()

const terms = new Map()
for (const d of course.days) {
  const c = days.get(d.n)
  for (const [term, def] of c?.glossary || []) {
    const key = term.toLowerCase().replace(/[`*]/g, '')
    if (!terms.has(key)) terms.set(key, { term, def, days: [] })
    terms.get(key).days.push(d.n)
  }
}
const all = Array.from(terms.values()).sort((a, b) => a.term.replace(/[`*]/g, '').localeCompare(b.term.replace(/[`*]/g, ''), 'en', { sensitivity: 'base' }))

const search = h('input', { class: 'field', type: 'search', placeholder: `Search ${all.length} terms`, 'aria-label': 'Search the glossary' })
const list = h('div', { id: 'gloss' })

function paint() {
  const q = search.value.trim().toLowerCase()
  const shown = q ? all.filter((t) => t.term.toLowerCase().includes(q) || t.def.toLowerCase().includes(q)) : all
  list.innerHTML = ''
  if (!shown.length) {
    list.append(h('p', { class: 'muted', style: { padding: '20px 0' }, text: all.length ? 'No matches.' : 'Glossary terms appear here as day content is added.' }))
    return
  }
  let letter = ''
  for (const t of shown) {
    const first = t.term.replace(/[`*]/g, '')[0].toUpperCase()
    if (first !== letter && !q) {
      letter = first
      list.append(h('div', { class: 'letter-h', text: letter }))
    }
    list.append(
      h(
        'dl',
        { class: 'gloss-item', style: { margin: 0 } },
        h('dt', { html: inline(t.term) }),
        h('dd', {}, h('span', { html: inline(t.def) }), h('span', { class: 'from muted' }, t.days.map((n, i) => [i ? ', ' : '', h('a', { href: dayUrl(n), text: `Day ${n}` })]))),
      ),
    )
  }
}

search.addEventListener('input', paint)
root.append(
  h(
    'div',
    { class: 'stack-lg' },
    h('section', { class: 'card' }, h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), 'Reference'), h('h1', { style: { fontSize: '1.9rem', margin: '8px 0 12px' }, text: 'Glossary' }), search),
    h('section', { class: 'card' }, list),
  ),
)
paint()
search.focus()
