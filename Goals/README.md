# 🎯 Goals — Quarterly Life Review

A small, colorful, click-to-fill tool that makes you sit down four times a year and
answer the questions most people avoid until it's too late — about your **goals,
health, relationships, personal life, and the legacy you're building.**

Inspired by Allie Miller's quarterly "goal tracking loop," but deliberately stripped
down to the part that's actually *fun to do*. No Drive sync, no cron, no email plumbing —
just one beautiful file you open and answer.

## Open it

Double-click **`review.html`** (or drag it into any browser). That's the whole app.

- **Auto-saves** every keystroke to your browser (localStorage) — private, nothing uploaded.
- **Progress ring** fills as you answer; hit 100% and you get confetti. 🎉
- **Questions marked `Avoid`** are the ones you'll be tempted to skip. Don't.
- **⬇ Export** drops a clean Markdown file — keep a record, or paste it into Claude
  for a deeper read on your gaps and next-quarter plan.
- Each quarter gets its own saved copy automatically (keyed `Q3 2026`, etc.).

## The five areas

| | Area | The real question underneath |
|---|---|---|
| 🎯 | **Goals** | What actually moved — not what you planned? |
| 🌿 | **Health** | How's your energy, honestly? |
| ❤️ | **Relationships** | Who did you neglect? |
| ☀️ | **Personal Life** | What did you do purely for joy? |
| 🏛️ | **Legacy & Rules** | Would you be proud of this quarter? |

## The simple cadence

The tool fires (in your head, not a server) on the **1st of Jan / Apr / Jul / Oct**.
The header shows the next date. The loop is meant to stay dead simple:

1. On the 1st, open `review.html` and block ~90 minutes.
2. Answer honestly — start where it stings.
3. Export the Markdown when you're done.
4. *(Optional)* paste the export into Claude: _"Here's my quarterly review — where are
   the gaps, and what's the one thing for next quarter?"_

That's it. No mystery cron to maintain later.

## Make it yours

All the areas and questions live in the `AREAS` array near the top of the `<script>` in
`review.html`. Edit the text, swap emojis, change accent colors, add or remove questions —
it re-renders itself. Colors reuse the zacphoenix-pro palette so it feels like home.
