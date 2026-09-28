// Page chrome shared by every page: top bar, nav, focus timer, settings, footer, shortcuts.

import { course, h, url, icon, toast, $ } from './core.js'
import * as store from './store.js'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', href: 'index.html' },
  { id: 'review', label: 'Review', href: 'review.html' },
  { id: 'outcomes', label: 'Outcomes', href: 'outcomes.html' },
  { id: 'capstone', label: 'Capstone', href: 'capstone.html' },
  { id: 'rosetta', label: 'Rosetta', href: 'rosetta.html' },
  { id: 'glossary', label: 'Glossary', href: 'glossary.html' },
]

export async function mountShell({ page, week = null, width = 'wrap' } = {}) {
  await store.init()
  if (week) document.body.dataset.week = String(week)
  const app = document.getElementById('app')
  app.innerHTML = ''

  const badge = h('span', { class: 'badge', hidden: true })
  const nav = h(
    'nav',
    { class: 'nav', 'aria-label': 'Main' },
    NAV.map((item) =>
      h('a', { href: url(item.href), 'aria-current': item.id === page ? 'page' : null }, item.label, item.id === 'review' ? badge : null),
    ),
  )

  const timerBtn = h('button', { class: 'icon-btn timer', type: 'button', title: 'Focus timer. Click to start or pause, double-click to reset. Shortcut: T' })
  const themeBtn = h('button', { class: 'icon-btn', type: 'button', title: 'Toggle light or dark', 'aria-label': 'Toggle theme' })
  const settingsBtn = h('button', { class: 'icon-btn', type: 'button', title: 'Settings and progress file', 'aria-label': 'Settings', html: icon('gear') })
  const extra = h('div', { class: 'tools', id: 'page-tools' })

  const topbar = h(
    'header',
    { class: 'topbar' },
    h(
      'div',
      { class: 'wrap topbar-inner' },
      h('a', { class: 'brand', href: url('index.html') }, h('span', { class: 'brand-mark', text: 'AE' }), h('span', {}, course.title, ' ', h('small', { text: 'Pro course' }))),
      nav,
      h('div', { class: 'tools' }, extra, timerBtn, themeBtn, settingsBtn),
    ),
  )

  const content = h('div', { class: width, id: 'content' })
  const main = h('main', { id: 'main' }, content)
  const footer = h(
    'footer',
    { class: 'footer' },
    h(
      'div',
      { class: 'wrap row' },
      h('span', { id: 'storage-line' }),
      h('span', { html: 'Shortcuts: <kbd>T</kbd> timer · <kbd>,</kbd> settings · <kbd>F</kbd> focus mode on day pages' }),
    ),
  )
  app.append(topbar, main, footer, settingsDialog())

  const refreshBadge = () => {
    const due = store.dueCards().length
    badge.hidden = !due
    badge.textContent = String(due)
  }
  const refreshTheme = () => {
    const dark = effectiveTheme() === 'dark'
    themeBtn.innerHTML = icon(dark ? 'sun' : 'moon')
  }
  const refreshStorage = () => {
    const line = $('#storage-line')
    if (!line) return
    line.innerHTML =
      store.storageMode() === 'disk'
        ? '<span class="storage-ok">Saved to disk</span> · data/progress.json'
        : '<span class="storage-local">Browser-only storage</span> · run <code>npm start</code> to save to disk'
  }
  refreshBadge()
  refreshTheme()
  refreshStorage()
  store.on(() => {
    refreshBadge()
    refreshTheme()
  })

  themeBtn.addEventListener('click', () => {
    store.setSetting('theme', effectiveTheme() === 'dark' ? 'light' : 'dark')
    refreshTheme()
  })
  settingsBtn.addEventListener('click', openSettings)
  initTimer(timerBtn)

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e)) return
    if (e.key === ',') {
      e.preventDefault()
      openSettings()
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault()
      if (e.shiftKey) resetTimer()
      else toggleTimer()
    }
  })

  return { content, tools: extra }
}

export function isTyping(e) {
  const t = e.target
  return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
}

export function effectiveTheme() {
  const t = store.get()?.settings?.theme || 'system'
  if (t !== 'system') return t
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/* ---------- Settings dialog ---------- */

function settingsDialog() {
  const s = store.get().settings
  const dlg = h('dialog', { class: 'modal', id: 'settings-dialog', 'aria-labelledby': 'settings-title' })
  const startInput = h('input', { class: 'field', type: 'date', id: 'set-start', value: s.startDate })
  startInput.addEventListener('change', () => {
    if (startInput.value) {
      store.setSetting('startDate', startInput.value)
      toast('Schedule updated')
    }
  })

  const themeSeg = h(
    'div',
    { class: 'seg', role: 'group', 'aria-label': 'Theme' },
    ['system', 'light', 'dark'].map((t) =>
      h('button', { type: 'button', 'aria-pressed': String(s.theme === t), 'data-theme-opt': t, text: t[0].toUpperCase() + t.slice(1) }),
    ),
  )
  themeSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-theme-opt]')
    if (!b) return
    store.setSetting('theme', b.dataset.themeOpt)
    themeSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
  })

  const timerSeg = h(
    'div',
    { class: 'seg', role: 'group', 'aria-label': 'Focus timer length' },
    [15, 25, 45, 60].map((m) => h('button', { type: 'button', 'aria-pressed': String((s.timerMinutes || 25) === m), 'data-min': m, text: `${m} min` })),
  )
  timerSeg.addEventListener('click', (e) => {
    const b = e.target.closest('[data-min]')
    if (!b) return
    store.setSetting('timerMinutes', Number(b.dataset.min))
    timerSeg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)))
    resetTimer()
  })

  const fileInput = h('input', { type: 'file', accept: 'application/json,.json', hidden: true })
  fileInput.addEventListener('change', async () => {
    const f = fileInput.files?.[0]
    if (!f) return
    try {
      await store.importFile(f)
      toast('Progress imported')
      setTimeout(() => location.reload(), 500)
    } catch (err) {
      toast(err.message || 'Import failed', 3200)
    }
    fileInput.value = ''
  })

  const storageNote = h('p', { class: 'hint' })
  storageNote.innerHTML =
    store.storageMode() === 'disk'
      ? 'Progress saves to <code>data/progress.json</code> in the course folder, with a daily backup in <code>data/backups/</code>. A copy also lives in this browser.'
      : 'The local server is not running, so progress saves in this browser only. Start the course with <code>npm start</code> to save to disk. Export regularly if you stay browser-only.'

  dlg.append(
    h('div', { class: 'modal-h' }, h('h2', { id: 'settings-title', text: 'Settings' }), h('button', { class: 'icon-btn', type: 'button', 'aria-label': 'Close', onclick: () => dlg.close(), text: 'Close' })),
    h(
      'div',
      { class: 'modal-b' },
      h('div', { class: 'setting' }, h('label', { for: 'set-start', text: 'Course start date' }), startInput, h('p', { class: 'hint', text: 'Day 1 lands on the first weekday on or after this date. Days 2 to 20 follow on weekdays. Nothing is locked, so you can work ahead or catch up.' })),
      h('div', { class: 'setting' }, h('label', { text: 'Theme' }), themeSeg),
      h('div', { class: 'setting' }, h('label', { text: 'Focus timer' }), timerSeg),
      h(
        'div',
        { class: 'setting' },
        h('label', { text: 'Progress file' }),
        h(
          'div',
          { class: 'row' },
          h('button', { class: 'btn btn-sm', type: 'button', onclick: () => store.exportFile(), html: `${icon('download')} Export` }),
          h('button', { class: 'btn btn-sm', type: 'button', onclick: () => fileInput.click(), html: `${icon('upload')} Import` }),
          h('button', {
            class: 'btn btn-sm btn-ghost',
            type: 'button',
            onclick: () => {
              if (confirm('Reset all progress? Export first if you want a backup. This keeps your settings.')) {
                store.resetAll()
                toast('Progress reset')
                setTimeout(() => location.reload(), 400)
              }
            },
            text: 'Reset',
          }),
          fileInput,
        ),
        storageNote,
      ),
    ),
  )
  return dlg
}

export function openSettings() {
  const dlg = document.getElementById('settings-dialog')
  if (dlg && !dlg.open) dlg.showModal()
}

/* ---------- Focus timer (persists across pages) ---------- */

const TKEY = 'aep.timer'
let timerEl = null
let tick = null

function readTimer() {
  try {
    return JSON.parse(localStorage.getItem(TKEY)) || null
  } catch {
    return null
  }
}

function writeTimer(t) {
  try {
    localStorage.setItem(TKEY, JSON.stringify(t))
  } catch {
    // Timer state is a convenience only.
  }
}

function durationMs() {
  return (store.get()?.settings?.timerMinutes || 25) * 60000
}

function remaining(t) {
  if (!t) return durationMs()
  if (t.running) return Math.max(0, t.endsAt - Date.now())
  return t.remaining ?? durationMs()
}

function fmt(ms) {
  const s = Math.ceil(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

function render() {
  if (!timerEl) return
  const t = readTimer()
  const ms = remaining(t)
  const running = !!t?.running
  timerEl.classList.toggle('running', running)
  timerEl.innerHTML = `${icon(running ? 'pause' : 'timer')}<span>${fmt(ms)}</span>`
  timerEl.setAttribute('aria-label', `Focus timer ${fmt(ms)} ${running ? 'running' : 'paused'}`)
  if (running && ms <= 0) finish()
}

function initTimer(el) {
  timerEl = el
  el.addEventListener('click', (e) => {
    if (e.detail > 1) return
    toggleTimer()
  })
  el.addEventListener('dblclick', resetTimer)
  render()
  clearInterval(tick)
  tick = setInterval(render, 1000)
  window.addEventListener('storage', (e) => e.key === TKEY && render())
}

export function toggleTimer() {
  const t = readTimer()
  if (t?.running) {
    writeTimer({ running: false, remaining: remaining(t) })
  } else {
    const ms = remaining(t) || durationMs()
    writeTimer({ running: true, endsAt: Date.now() + ms })
  }
  render()
}

export function resetTimer() {
  writeTimer({ running: false, remaining: durationMs() })
  render()
}

function finish() {
  writeTimer({ running: false, remaining: durationMs() })
  chime()
  toast('Focus block done. Stand up for five minutes.', 5000)
  const old = document.title
  document.title = 'Time for a break'
  setTimeout(() => (document.title = old), 6000)
}

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[660, 880].forEach((freq, i) => {
      const o = ctx.createOscillator()
      const g = ctx.createGain()
      o.frequency.value = freq
      o.type = 'sine'
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22)
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.22 + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.5)
      o.connect(g).connect(ctx.destination)
      o.start(ctx.currentTime + i * 0.22)
      o.stop(ctx.currentTime + i * 0.22 + 0.55)
    })
  } catch {
    // Audio can be blocked. The toast still shows.
  }
}
