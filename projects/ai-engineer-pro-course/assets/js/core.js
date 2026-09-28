// Shared helpers: paths, DOM building, a small safe Markdown renderer, dates, icons, toasts.

import { course, dayFile } from '../../content/course.js'

export { course }
export const ROOT = new URL('../../', import.meta.url)
export const url = (path) => new URL(path, ROOT).href
export const dayUrl = (n) => url(`days/${dayFile(n)}.html`)

/* ---------- DOM ---------- */

export function h(tag, props, ...kids) {
  const el = document.createElement(tag)
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || value === false) continue
    if (key === 'class') el.className = value
    else if (key === 'html') el.innerHTML = value
    else if (key === 'text') el.textContent = value
    else if (key === 'dataset') Object.assign(el.dataset, value)
    else if (key === 'style' && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value)) {
        if (prop.startsWith('--')) el.style.setProperty(prop, String(v))
        else el.style[prop] = v
      }
    }
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value)
    else el.setAttribute(key, value === true ? '' : String(value))
  }
  appendKids(el, kids)
  return el
}

function appendKids(el, kids) {
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue
    el.append(kid instanceof Node ? kid : String(kid))
  }
}

export const $ = (sel, root = document) => root.querySelector(sel)
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel))

export function html(markup) {
  const t = document.createElement('template')
  t.innerHTML = markup.trim()
  return t.content
}

/* ---------- Markdown (trusted course content, escaped before formatting) ---------- */

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function inline(src) {
  const codes = []
  let out = esc(src).replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c)
    return `\u0000${codes.length - 1}\u0000`
  })
  out = out
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\w)/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => {
      const external = /^https?:/i.test(href)
      return `<a href="${href}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`
    })
  return out.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[Number(i)]}</code>`)
}

const toLines = (src) => (Array.isArray(src) ? src.join('\n') : String(src ?? '')).split('\n')

export function md(src) {
  const lines = toLines(src)
  const out = []
  let i = 0
  let para = []
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`)
    para = []
  }
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) { flush(); i++; continue }
    const fence = trimmed.match(/^```\s*([\w+-]*)\s*(.*)$/)
    if (fence) {
      flush()
      const lang = fence[1] || 'text'
      const title = fence[2] || ''
      const body = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) body.push(lines[i++])
      i++
      if (lang === 'mermaid') out.push(mermaidBlock(body))
      else out.push(codeBlock(body.join('\n'), lang, title))
      continue
    }
    if (trimmed.startsWith('|')) {
      flush()
      const rows = []
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(lines[i++].trim())
      out.push(tableFromPipes(rows))
      continue
    }
    if (/^[-*] /.test(trimmed)) {
      flush()
      const items = []
      while (i < lines.length && /^[-*] /.test(lines[i].trim())) items.push(lines[i++].trim().slice(2))
      out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`)
      continue
    }
    if (/^\d+[.)] /.test(trimmed)) {
      flush()
      const items = []
      while (i < lines.length && /^\d+[.)] /.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+[.)] /, ''))
      out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`)
      continue
    }
    if (trimmed.startsWith('> ')) {
      flush()
      const quote = []
      while (i < lines.length && lines[i].trim().startsWith('> ')) quote.push(lines[i++].trim().slice(2))
      out.push(`<blockquote>${inline(quote.join(' '))}</blockquote>`)
      continue
    }
    const heading = trimmed.match(/^(#{3,4}) (.+)$/)
    if (heading) {
      flush()
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      i++
      continue
    }
    para.push(trimmed)
    i++
  }
  flush()
  return out.join('\n')
}

function tableFromPipes(rows) {
  // Supports \| inside a cell for a literal pipe.
  const cells = (r) =>
    r
      .replace(/\\\|/g, '\u0001')
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim().replace(/\u0001/g, '|'))
  const isSeparator = (r) => r.includes('-') && r.replace(/[|:\-\s]/g, '') === ''
  const [head, ...rest] = rows.filter((r) => !isSeparator(r))
  return tableHtml(cells(head), rest.map(cells))
}

export function tableHtml(head, rows) {
  const th = head.map((c) => `<th>${inline(c)}</th>`).join('')
  const tr = rows.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')
  return `<div class="table-wrap"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`
}

export function codeBlock(code, lang = 'text', title = '') {
  const label = title || lang
  return `<div class="codeblock"><div class="codeblock-h"><span>${esc(label)}</span><span class="spacer"></span><button class="copy-btn" type="button" data-copy>Copy</button></div><pre><code class="lang-${esc(lang)}">${esc(code)}</code></pre></div>`
}

export function mermaidBlock(lines) {
  const src = Array.isArray(lines) ? lines.join('\n') : String(lines)
  return `<div class="diagram" data-mermaid="${esc(src)}"><div class="diagram-fallback">${esc(src)}</div></div>`
}

/* ---------- Dates ---------- */

const pad = (n) => String(n).padStart(2, '0')
export const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const todayISO = () => iso(new Date())

export function parseISO(s) {
  const [y, m, d] = String(s).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, 12)
}

export function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

// Day n lands on the nth weekday counted from the start date (weekends skipped).
export function scheduleDate(n, startISO) {
  let d = parseISO(startISO || course.defaultStart)
  while (d.getDay() === 0 || d.getDay() === 6) d = addDays(d, 1)
  let count = 1
  while (count < n) {
    d = addDays(d, 1)
    if (d.getDay() !== 0 && d.getDay() !== 6) count++
  }
  return d
}

export function fmtDate(d, style = 'short') {
  if (style === 'weekday') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (style === 'long') return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function daysBetween(aISO, bISO) {
  return Math.round((parseISO(bISO) - parseISO(aISO)) / 86400000)
}

/* ---------- Content loading ---------- */

const cache = new Map()
export function loadDay(n) {
  if (!cache.has(n)) {
    cache.set(
      n,
      import(url(`content/days/${dayFile(n)}.js`))
        .then((m) => m.default)
        .catch(() => null),
    )
  }
  return cache.get(n)
}

export async function loadAllDays() {
  const list = await Promise.all(course.days.map((d) => loadDay(d.n)))
  return new Map(course.days.map((d, i) => [d.n, list[i]]))
}

export async function fetchText(path) {
  const res = await fetch(url(`content/snippets/${path}`), { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Missing snippet: ${path}`)
  return res.text()
}

/* ---------- Icons (inline SVG, stroke-based) ---------- */

const paths = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  focus: '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><circle cx="12" cy="12" r="3"/>',
  timer: '<circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M9 2h6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  quiz: '<path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/><circle cx="12" cy="12" r="9"/>',
  tool: '<path d="M14.7 6.3a4 4 0 0 0 5 5L22 13.6 13.6 22l-2.3-2.3a4 4 0 0 0-5-5L2 10.4 10.4 2z"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  chev: '<path d="m6 9 6 6 6-6"/>',
  play: '<path d="m7 4 13 8-13 8z"/>',
  pause: '<path d="M7 4h3v16H7zM14 4h3v16h-3z"/>',
  reset: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  download: '<path d="M12 3v12m0 0-4-4m4 4 4-4M4 21h16"/>',
  upload: '<path d="M12 21V9m0 0-4 4m4-4 4 4M4 3h16"/>',
  flame: '<path d="M12 2s5 5 5 10a5 5 0 0 1-10 0c0-2 1-3.5 2-4.5 0 2 1 3 2 3 0-3-1-5.5 1-8.5z"/>',
}

export function icon(name, cls = '') {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`
}

/* ---------- Feedback ---------- */

let toastHost
export function toast(message, ms = 1800) {
  if (!toastHost) {
    toastHost = h('div', { class: 'toast-host', role: 'status', 'aria-live': 'polite' })
    document.body.append(toastHost)
  }
  const t = h('div', { class: 'toast', text: message })
  toastHost.append(t)
  setTimeout(() => t.remove(), ms)
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } })
    ta.value = text
    document.body.append(ta)
    ta.select()
    const ok = document.execCommand('copy')
    ta.remove()
    return ok
  }
}

// One delegated listener handles every [data-copy] button on the page.
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-copy]')
  if (!btn) return
  const block = btn.closest('.codeblock')
  const code = block?.querySelector('code')
  if (!code) return
  if (await copyText(code.textContent)) {
    btn.textContent = 'Copied'
    btn.classList.add('copied')
    setTimeout(() => {
      btn.textContent = 'Copy'
      btn.classList.remove('copied')
    }, 1400)
  }
})

export function pct(x) {
  return `${Math.round((x || 0) * 100)}%`
}

export function ringSvg(fraction, size = 92, stroke = 9) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const off = c * (1 - Math.max(0, Math.min(1, fraction || 0)))
  return `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/><circle class="fill" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}"/></svg>`
}
