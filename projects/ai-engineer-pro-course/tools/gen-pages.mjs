#!/usr/bin/env node
// Generates the HTML shells: one page per day plus the app pages.
// Run after adding a day or renaming a title: node tools/gen-pages.mjs

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { course, dayFile } from '../content/course.js'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0b0b0b"/><text x="32" y="41" font-family="system-ui,-apple-system,sans-serif" font-size="26" font-weight="800" fill="#fcfcfb" text-anchor="middle">AE</text></svg>',
  )

function page({ title, entry, rel = '', attrs = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${title}</title>
  <link rel="icon" href="${favicon}">
  <script>try{var t=localStorage.getItem('aep.theme');if(t&&t!=='system')document.documentElement.setAttribute('data-theme',t)}catch(e){}</script>
  <link rel="stylesheet" href="${rel}assets/css/app.css">
</head>
<body${attrs}>
  <div id="app"><div class="loading">Loading…</div></div>
  <script>
    if (location.protocol === 'file:') {
      document.getElementById('app').innerHTML = '<div class="read" style="padding:48px 16px"><div class="card"><h2>Start the local server</h2><p style="margin-top:10px">Browsers block this course when it is opened as a file. In a terminal, run <code>npm start</code> inside the course folder (or double-click <code>Start Course.command</code> on macOS), then open the printed localhost address.</p></div></div>';
    }
  </script>
  <noscript><div class="read" style="padding:48px 16px"><p>This course needs JavaScript. Run <code>npm start</code> and open the printed localhost address.</p></div></noscript>
  <script type="module" src="${rel}assets/js/${entry}.js"></script>
</body>
</html>
`
}

const appPages = [
  { file: 'index.html', title: `${course.title} · Dashboard`, entry: 'dashboard', page: 'dashboard' },
  { file: 'review.html', title: `Review deck · ${course.title}`, entry: 'review', page: 'review' },
  { file: 'outcomes.html', title: `Outcomes · ${course.title}`, entry: 'outcomes', page: 'outcomes' },
  { file: 'capstone.html', title: `Capstone · ${course.title}`, entry: 'capstone', page: 'capstone' },
  { file: 'rosetta.html', title: `Claude Code and Codex Rosetta · ${course.title}`, entry: 'rosetta', page: 'rosetta' },
  { file: 'glossary.html', title: `Glossary · ${course.title}`, entry: 'glossary', page: 'glossary' },
]

await mkdir(join(ROOT, 'days'), { recursive: true })

for (const p of appPages) {
  await writeFile(join(ROOT, p.file), page({ title: p.title, entry: p.entry, attrs: ` data-page="${p.page}"` }))
}

for (const d of course.days) {
  await writeFile(
    join(ROOT, 'days', `${dayFile(d.n)}.html`),
    page({
      title: `Day ${d.n} · ${d.title} · ${course.title}`,
      entry: 'day',
      rel: '../',
      attrs: ` data-page="day" data-day="${d.n}" data-week="${d.week}"`,
    }),
  )
}

console.log(`Wrote ${appPages.length} app pages and ${course.days.length} day pages.`)
