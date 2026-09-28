# AI Engineer Pro

A local, self-paced 20-day course that takes you from using coding agents to engineering systems of them. One page per day, short bites, quick checks, a final quiz, and three sizes of hands-on task. Progress is tracked on your own disk.

Built for a dual Claude Code and Codex setup, with TypeScript for everything you build.

## Start it

Requires Node.js 18 or newer. No `npm install` is needed: the app has zero dependencies.

```bash
cd projects/ai-engineer-pro-course
npm start
```

The server prints `http://localhost:4747/` and opens it in your browser. If that port is busy it picks the next free one.

On macOS you can also double-click `Start Course.command`.

Stop the server with `Ctrl+C`. Your progress is already on disk.

## What is inside

| Page | What it does |
|---|---|
| Dashboard | Where you are, what is next, week progress, streak, activity heatmap, and outcome coverage |
| Day 1 to Day 20 | One page per day: TL;DR, one card per agenda block, quick checks, a final round, tasks, notes |
| Review | Spaced repetition over the questions you missed (Leitner boxes at 1, 2, 4, 8, and 16 days) |
| Outcomes | The nine end-of-course capabilities, with self-rating, evidence, and coverage from related days |
| Capstone | The Agent Forge arc: setup checklist, repo map, conventions, and 20 milestones |
| Rosetta | Claude Code and Codex side by side, with dual-harness patterns |
| Glossary | Every term defined across the course, searchable |

## The daily loop

1. Read the TL;DR, then the section cards. Tap **Got it** on each card. Open **+1** panels only when curious.
2. Answer the quick check at the end of each card, then the final round. First attempts count. Misses go to the review deck.
3. Do the **Quick win** (about 10 minutes). Do the **Build** task to grow the capstone repo. **Stretch** is optional.
4. Write two lines of notes, rate your confidence, and mark the day complete.

Focus mode (`F`) shows one card at a time. The focus timer (`T`) runs across pages. `,` opens settings.

## Where progress lives

- With `npm start`, progress saves to `data/progress.json`, with one backup per day in `data/backups/` (the last 21 are kept). Both are gitignored, so pulling course updates never touches them.
- Every change is also mirrored to your browser's local storage, and open tabs stay in sync.
- Settings has **Export** and **Import** for moving progress between machines, and **Reset**.
- If you serve the folder with another static server (for example `python3 -m http.server`), the course still works, but progress stays in that browser only. The footer shows which mode you are in.
- The server listens on `127.0.0.1` only, so nothing is exposed to your network.

## Schedule

The plan runs Monday October 26 to Friday November 20, 2026, one lesson per weekday. Change the start date in Settings and every date shifts. Nothing is locked: work ahead or catch up freely.

## Offline

Everything runs locally, including diagrams (Mermaid is vendored in `assets/vendor/`). The only network links are optional sources and further reading.

## Folder map

```text
ai-engineer-pro-course/
  server.mjs            zero-dependency static server plus the progress API
  index.html            dashboard (other app pages sit beside it)
  days/                 day-01.html to day-20.html
  assets/css/app.css    design system, light and dark
  assets/js/            store, shell, day renderer, quiz, dashboard, review, and the other pages
  assets/vendor/        mermaid.min.js (MIT)
  content/course.js     the spine: weeks, agenda, outcomes, capstone arc
  content/days/         one lesson file per day
  content/snippets/     code and templates the tasks reference
  content/rosetta.js    Claude Code and Codex concept map
  content/AUTHORING.md  the contract for writing or editing lessons
  tools/validate.mjs    checks schema, agenda coverage, quiz integrity, and style rules
  tools/gen-pages.mjs   regenerates the HTML page shells
  data/                 your progress (gitignored)
```

## Editing lessons

Lessons are plain JavaScript data files. Edit one, then check it:

```bash
npm run validate              # whole course
node tools/validate.mjs --day 7
```

The validator confirms every agenda topic is covered, every quiz question is well formed, snippets exist, and prose has no em dashes, semicolons, or stock phrases. If you rename a day or add one, run `node tools/gen-pages.mjs`.

## Freshness

Facts were researched and checked against primary sources as of late September 2026. Model names, prices, and flags move fast. Where a lesson names a volatile detail it says "as of Sep 2026". Recheck those against the linked docs when you reach them.
