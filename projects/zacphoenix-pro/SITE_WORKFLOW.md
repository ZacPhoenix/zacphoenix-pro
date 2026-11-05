# ZacPhoenix.pro — Site Workflow

## Where things are

- **Source:** `projects/zacphoenix-pro/site/` (static HTML/CSS/vanilla JS, no build step)
  - `index.html` — the single page
  - `assets/site.css` — design system (tokens, layout, breakpoints)
  - `assets/badges/` — Credly badge images + `manifest.json`
  - `assets/zac-avatar-640.webp` / `zac-avatar.png` — headshot (original 2048px at `../avatar-original-2048.png`)
- **Live:** https://zacphoenix.pro (GitHub Pages, `gh-pages` branch of `ZacPhoenix/zacphoenix-pro`, path `/`, HTTPS enforced)
- **Legacy:** `projects/zacphoenix-pro/index.html` and the Hex images are the retired old site. Not deployed.

## Edit and preview

```bash
npx serve projects/zacphoenix-pro/site -l 4321
```

Open http://localhost:4321. (Claude Code: `.claude/launch.json` entry `zacphoenix-site`.)
Don't use port 8787, which is the Linear OAuth callback.

After CSS changes, bump the `?v=` query on the stylesheet link in `index.html`
so returning visitors don't get a cached stylesheet.

## Deploy

```bash
bash projects/zacphoenix-pro/deploy.sh
```

It copies `site/` into a temp dir, adds `CNAME` (`zacphoenix.pro`) and `.nojekyll`,
and force-pushes it as `gh-pages`. Live in 1–3 minutes. Check status:

```bash
gh api repos/ZacPhoenix/zacphoenix-pro/pages --jq .status
```

**Never deploy without the CNAME file.** That's what keeps the custom domain attached.

## Design rules (keep unless intentionally changed)

- White / ink `#281C2C` / orange `#FB4704` (sampled from the avatar). Archivo Black display, Inter body. Hard edges, bold uppercase.
- One page, no subpages. Outbound links: LinkedIn, Cushman & Wakefield, email alias only.
- Copy: bulleted, short, outcomes over responsibilities. No em dashes in body copy. "Resume" without accents.
- Credly badges: all full color; "Valid to YYYY" signals inactive. Never say "expired".
- Verify at 320/375/768/1024/1440 widths: no horizontal overflow, testimonial height constant.
