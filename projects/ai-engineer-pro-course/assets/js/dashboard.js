// Dashboard: where you are, what is next, and how the whole course is going.

import { course, h, url, dayUrl, inline, icon, loadAllDays, scheduleDate, fmtDate, todayISO, iso, addDays, parseISO, pct, esc } from './core.js'
import { mountShell } from './shell.js'
import * as store from './store.js'
import { dayProgress, courseStats, weekProgress, nextDay, outcomeCoverage } from './progress.js'

const { content: root } = await mountShell({ page: 'dashboard' })
const days = await loadAllDays()

function render() {
  root.innerHTML = ''
  const s = store.get()
  const start = s.settings.startDate
  const stats = courseStats(days)
  const next = nextDay(days)
  const nextMeta = course.days[next - 1]
  const today = todayISO()
  const scheduled = course.days.map((d) => ({ n: d.n, date: iso(scheduleDate(d.n, start)) }))
  const todays = scheduled.find((x) => x.date === today)
  const expected = scheduled.filter((x) => x.date <= today).length
  const diff = stats.daysDone - expected
  const firstDate = scheduleDate(1, start)
  const lastDate = scheduleDate(course.days.length, start)
  document.body.dataset.week = String(nextMeta.week)

  let planLine
  if (today < scheduled[0].date) planLine = `Starts ${fmtDate(firstDate, 'long')}. Working ahead is encouraged.`
  else if (diff === 0) planLine = 'Right on plan.'
  else if (diff > 0) planLine = `${diff} day${diff > 1 ? 's' : ''} ahead of plan.`
  else planLine = `${-diff} day${diff < -1 ? 's' : ''} behind plan. Pick up where you are, not where the calendar is.`

  const due = store.dueCards().length

  const hero = h(
    'section',
    { class: 'dash-hero' },
    h(
      'div',
      { class: 'card', style: { borderTop: '4px solid var(--accent)' } },
      h('div', { class: 'eyebrow' }, h('span', { class: 'dot' }), `Week ${nextMeta.week} · ${course.weeks[nextMeta.week - 1].name}`, h('span', { class: 'sep', text: '/' }), `Day ${next} of ${course.days.length}`),
      h('h1', { text: stats.daysDone === course.days.length ? 'Course complete' : todays && todays.n !== next ? `Scheduled today: Day ${todays.n}` : `Up next: ${nextMeta.title}` }),
      h('p', { class: 'ink-2', text: course.tagline }),
      h(
        'div',
        { class: 'row', style: { marginTop: '18px' } },
        h('a', { class: 'btn btn-primary btn-lg', href: dayUrl(next), html: `${stats.daysDone ? 'Continue' : 'Start'} Day ${next} ${icon('right')}` }),
        todays && todays.n !== next ? h('a', { class: 'btn btn-lg', href: dayUrl(todays.n), text: `Open Day ${todays.n}` }) : null,
        h('a', { class: 'btn btn-lg btn-ghost', href: url('review.html'), text: due ? `Review ${due} due` : 'Review deck' }),
      ),
    ),
    h(
      'div',
      { class: 'card' },
      h('div', { class: 'kicker', text: 'Course progress' }),
      h('div', { class: 'hero-figure', style: { margin: '10px 0 14px' } }, pct(stats.overall).replace('%', ''), h('small', { text: '% complete' })),
      h('div', { class: 'meter', role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': String(Math.round(stats.overall * 100)), 'aria-label': 'Course progress' }, h('i', { style: { width: pct(stats.overall) } })),
      h('p', { class: 'small ink-2', style: { marginTop: '12px' }, text: `${stats.daysDone} of ${course.days.length} days complete. ${planLine}` }),
      h('p', { class: 'tiny muted', text: `Schedule: ${fmtDate(firstDate, 'weekday')} to ${fmtDate(lastDate, 'weekday')}. Change the start date in Settings.` }),
    ),
  )

  const streak = store.streak()
  const kpis = h(
    'section',
    { class: 'kpis', 'aria-label': 'Key numbers' },
    stat('Days complete', `${stats.daysDone}/${course.days.length}`, 'Marked complete'),
    stat('Capstone milestones', `${stats.builds}/${course.days.length}`, 'Build tasks done'),
    stat('Quiz accuracy', stats.accuracy == null ? 'None yet' : pct(stats.accuracy), stats.answered ? `${stats.answered} answered, first attempts` : 'First attempts only'),
    stat('Streak', `${streak} day${streak === 1 ? '' : 's'}`, 'Consecutive active days'),
    h('a', { class: 'card stat', href: url('review.html'), style: { textDecoration: 'none', color: 'inherit' } }, h('div', { class: 'label', text: 'Review due' }), h('div', { class: 'value', text: String(due) }), h('div', { class: 'sub', text: deckLine() })),
  )

  const weeks = h('section', { class: 'weeks' }, course.weeks.map((w) => weekCard(w, start, today)))

  root.append(
    h(
      'div',
      { class: 'stack-lg' },
      hero,
      kpis,
      h('div', {}, h('div', { class: 'card-title' }, h('h2', { text: 'The four weeks', style: { fontSize: '1.35rem' } }), h('a', { class: 'small', href: url('capstone.html'), text: 'Capstone arc' })), weeks),
      heatmapCard(start),
      outcomesCard(),
      howCard(),
    ),
  )
}

function deckLine() {
  const count = store.reviewCards().filter((c) => !c.retired).length
  return `${count} card${count === 1 ? '' : 's'} in deck`
}

function stat(label, value, sub) {
  return h('div', { class: 'card stat' }, h('div', { class: 'label', text: label }), h('div', { class: 'value', text: value }), h('div', { class: 'sub', text: sub }))
}

function weekCard(w, start, today) {
  const list = course.days.filter((d) => d.week === w.n)
  const wp = weekProgress(days, w.n)
  const from = scheduleDate(list[0].n, start)
  const to = addDays(scheduleDate(list[list.length - 1].n, start), 2)
  return h(
    'article',
    { class: 'card week-card', 'data-week': String(w.n) },
    h('div', { class: 'week-head' }, h('span', { class: 'kicker', text: `Week ${w.n}` }), h('h2', { text: w.name }), h('span', { class: 'spacer' }), h('span', { class: 'small muted', text: `${fmtDate(from)} to ${fmtDate(to)}` })),
    h('p', { class: 'week-goal', text: w.goal }),
    h('div', { class: 'progression', 'aria-label': 'Progression' }, w.progression.flatMap((p, i) => [i ? h('span', { 'aria-hidden': 'true', text: '→' }) : null, h('span', { class: 'step', text: p })])),
    h('div', { class: 'row', style: { gap: '10px' } }, h('div', { class: 'meter meter-sm', style: { flex: '1' } }, h('i', { style: { width: pct(wp) } })), h('span', { class: 'small muted', style: { fontVariantNumeric: 'tabular-nums' }, text: pct(wp) })),
    h(
      'ul',
      { class: 'day-list' },
      list.map((d) => {
        const p = dayProgress(days.get(d.n), d.n)
        const date = scheduleDate(d.n, start)
        const cls = p.status === 'done' ? 's-done' : p.status === 'progress' ? 's-progress' : ''
        return h(
          'li',
          {},
          h(
            'a',
            { class: `day-row${iso(date) === today ? ' is-today' : ''}`, href: dayUrl(d.n) },
            h('span', { class: `status-dot ${cls}`, style: { '--p': Math.round(p.fraction * 100) }, 'aria-label': p.status === 'done' ? 'Complete' : p.status === 'progress' ? 'In progress' : 'Not started' }),
            h('span', { class: 'when' }, h('b', { text: `Day ${d.n}` }), h('span', { text: `${d.weekday} ${fmtDate(date)}` })),
            h('span', { class: 't', text: d.title }),
            h('span', { class: 'pct', text: p.fraction ? pct(p.fraction) : '' }),
          ),
        )
      }),
    ),
    h('p', { class: 'promise', html: `<strong>Promise:</strong> ${inline(w.promise)}` }),
  )
}

/* ---------- Activity heatmap (sequential single hue, hover + table view) ---------- */

function level(count) {
  if (!count) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 10) return 3
  if (count <= 20) return 4
  return 5
}

function heatmapCard(start) {
  const act = store.get().activity
  const courseDates = new Map(course.days.map((d) => [iso(scheduleDate(d.n, start)), d.n]))
  const todayD = parseISO(todayISO())
  const weekBefore = addDays(scheduleDate(1, start), -7)
  const from = todayD < weekBefore ? todayD : weekBefore
  const monday = addDays(from, -((from.getDay() + 6) % 7))
  const end = addDays(scheduleDate(course.days.length, start), 2)
  const last = todayD > end ? todayD : end
  const weeksCount = Math.floor((last - monday) / (7 * 86400000)) + 1

  const grid = h('div', { class: 'heatmap', role: 'grid', 'aria-label': 'Daily activity' })
  const tip = h('div', { class: 'tooltip', hidden: true })
  const rows = []
  for (let wk = 0; wk < weeksCount; wk++) {
    for (let dow = 0; dow < 7; dow++) {
      const d = addDays(monday, wk * 7 + dow)
      const key = iso(d)
      const count = act[key] || 0
      const dayN = courseDates.get(key)
      if (count) rows.push([key, count, dayN])
      const label = `${fmtDate(d, 'weekday')} · ${count} action${count === 1 ? '' : 's'}${dayN ? ` · Day ${dayN} scheduled` : ''}`
      const cell = h('div', {
        class: `cell${dayN ? ' is-course' : ''}${key === todayISO() ? ' is-today' : ''}`,
        'data-l': String(level(count)),
        tabindex: '0',
        role: 'gridcell',
        'aria-label': label,
      })
      const show = (e) => {
        tip.hidden = false
        tip.innerHTML = `<b>${count}</b> action${count === 1 ? '' : 's'}<br>${esc(fmtDate(d, 'weekday'))}${dayN ? ` · Day ${dayN}` : ''}`
        const r = e.target.getBoundingClientRect()
        tip.style.left = `${Math.min(window.innerWidth - 170, r.left + r.width / 2 - 60)}px`
        tip.style.top = `${r.top - 52}px`
      }
      cell.addEventListener('pointerenter', show)
      cell.addEventListener('focus', show)
      cell.addEventListener('pointerleave', () => (tip.hidden = true))
      cell.addEventListener('blur', () => (tip.hidden = true))
      grid.append(cell)
    }
  }

  const table = h(
    'div',
    { class: 'table-wrap', hidden: true, style: { marginTop: '12px' } },
    h(
      'table',
      {},
      h('thead', {}, h('tr', {}, h('th', { text: 'Date' }), h('th', { class: 'num', text: 'Actions' }), h('th', { text: 'Scheduled' }))),
      h('tbody', {}, rows.length ? rows.map(([k, c, dn]) => h('tr', {}, h('td', { text: fmtDate(parseISO(k), 'weekday') }), h('td', { class: 'num', text: String(c) }), h('td', { text: dn ? `Day ${dn}` : '' }))) : h('tr', {}, h('td', { colspan: '3', text: 'No activity yet.' }))),
    ),
  )
  const toggle = h('button', { class: 'btn btn-sm btn-ghost', type: 'button', text: 'Table view' })
  toggle.addEventListener('click', () => {
    table.hidden = !table.hidden
    toggle.textContent = table.hidden ? 'Table view' : 'Hide table'
  })
  const legend = h('div', { class: 'heat-legend' }, 'Less', [0, 1, 2, 3, 4, 5].map((l) => h('i', { style: { background: `var(--seq-${l})` } })), 'More')
  return h(
    'section',
    { class: 'card' },
    h('div', { class: 'card-title' }, h('h2', { text: 'Activity' }), toggle),
    h('p', { class: 'small muted', style: { marginTop: '-6px', marginBottom: '14px' }, text: 'Each square is a day, Monday at the top. Outlined squares are scheduled course days. Actions count sections, answers, tasks, and reviews.' }),
    h('div', { class: 'heatmap-wrap' }, h('div', { class: 'heat-row' }, h('div', { class: 'heat-days', 'aria-hidden': 'true' }, ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'].map((t) => h('span', { text: t }))), grid)),
    h('div', { class: 'row', style: { marginTop: '12px' } }, legend),
    table,
    tip,
  )
}

function outcomesCard() {
  return h(
    'section',
    { class: 'card' },
    h('div', { class: 'card-title' }, h('h2', { text: 'The nine outcomes' }), h('a', { class: 'small', href: url('outcomes.html'), text: 'Rate yourself and log evidence' })),
    course.outcomes.map((o) => {
      const cov = outcomeCoverage(days, o)
      const lvl = store.outcome(o.n).level || 0
      return h(
        'div',
        { class: 'outcome-row' },
        h('span', { class: 'outcome-num', text: String(o.n).padStart(2, '0') }),
        h('div', {}, h('div', { style: { fontWeight: '600' }, text: o.title }), h('div', { class: 'tiny muted', text: `Built on days ${o.days.join(', ')} · Self-rating: ${course.levels[lvl]}` })),
        h('div', { class: 'meter-cell' }, h('div', { class: 'meter meter-sm meter-good', 'aria-label': `Coverage ${pct(cov)}` }, h('i', { style: { width: pct(cov) } })), h('div', { class: 'tiny muted', style: { marginTop: '4px', textAlign: 'right' }, text: `${pct(cov)} of related days` })),
      )
    }),
  )
}

function howCard() {
  return h(
    'details',
    { class: 'card deeper', style: { padding: 0 } },
    h('summary', {}, h('span', { class: 'plus-one', text: '?' }), h('span', { text: 'How to use this course' }), h('span', { class: 'chev', html: icon('chev') })),
    h(
      'div',
      { class: 'deeper-body md' },
      h('ol', {}, [
        h('li', { html: '<strong>Read the TL;DR</strong>, then work through each section card. Tap <em>Got it</em> when a card makes sense. Each card has one quick check.' }),
        h('li', { html: '<strong>Open +1 only when curious.</strong> The core path stays short. The stretch lives behind the +1 toggles.' }),
        h('li', { html: '<strong>Take the final round.</strong> First attempts count. Misses go to your review deck and come back on a Leitner schedule (1, 2, 4, 8, 16 days).' }),
        h('li', { html: '<strong>Do the quick win</strong> every day. Do the <em>Build</em> task to grow the capstone repo. Stretch tasks are optional.' }),
        h('li', { html: '<strong>Write two lines of notes</strong> and rate your confidence. Then mark the day complete.' }),
      ]),
      h('p', { html: 'Focus mode (<kbd>F</kbd>) shows one card at a time. The timer (<kbd>T</kbd>) runs focus blocks across pages. Progress saves to <code>data/progress.json</code> when you run <code>npm start</code>.' }),
    ),
  )
}

render()
store.on(render)
