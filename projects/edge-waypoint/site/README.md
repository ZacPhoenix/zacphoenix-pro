# Edge Waypoint - the site

Three static pages, no framework, no build step. Open `index.html` in a browser and it works. Deploy by dragging this folder into [Netlify Drop](https://app.netlify.com/drop), or push to a repo and enable GitHub Pages.

## Before you launch (the swap list)

Everything that needs your real details is marked in the HTML with `<span class="swap">` - it renders with a dotted orange underline so you can't miss one. Search each file for `class="swap"`:

| Placeholder | Where |
|---|---|
| Name, town, city/county, service radius | all pages |
| Audit / fix / retainer prices | `how-it-works.html` |
| Phone number (also in the `tel:` links!) | all pages, booking blocks + footer |
| Email (also in the `mailto:` links) | footers |
| About-page bio - **write this yourself**, the comment in the file explains the shape | `about.html` |
| Your photo (replaces the dashed placeholder box) | `about.html` |
| Calendar embed: replace each `cal-slot` div with your Cal.com/Calendly snippet | all pages |

When a swap is done, remove the `class="swap"` (and `title`) so the dotted underline disappears.

## Launch checklist

- [ ] All swaps done, no dotted underlines left on any page
- [ ] Calendar embed tested - book a slot yourself
- [ ] `tel:` and `mailto:` links carry your real number/address
- [ ] Page `<title>` and `<meta name="description">` updated with your city (this is most of your local SEO)
- [ ] Google Business Profile created and linked
- [ ] Optional: add [Plausible](https://plausible.io) or [Fathom](https://usefathom.com) - one script tag - and watch exactly one number: booked calls per week

## Design notes (so future edits stay on-brand)

- **The orange is scarce on purpose.** It appears only as: blaze marks, CTA buttons, the calculator's shadow + result, link underlines. If a new element "needs" orange, something else should give its orange up.
- **No soft shadows, no rounded corners, no gradients.** The look is print-shop: hairlines, hard offset shadows, dashed rules. That's what keeps it from looking like every AI-generated landing page.
- **Type:** Fraunces for headlines, Public Sans for body, IBM Plex Mono for labels/numbers/prices. Don't add fonts.
- **The calculator** (`assets/site.js`) uses the same formula as your workshop time-math: minutes × times/week × 48 weeks × hourly rate × 1.35 loaded-cost multiplier. If you change the multiplier in your frameworks, change it here too.
- **Voice:** anything you add must pass the read-aloud test (see `../06-website-copy-v2.md`). One CTA, same words everywhere.
