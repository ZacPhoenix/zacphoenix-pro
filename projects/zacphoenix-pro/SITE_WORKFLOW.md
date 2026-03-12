# ZacPhoenix.pro — Site Workflow

This is the working playbook for updating and deploying the Zac Phoenix personal site.

## Repo + Publish Setup

- **Workspace repo:** `/Users/zacphoenix/clawd`
- **Site source files:** `/Users/zacphoenix/clawd/projects/zacphoenix-pro/`
- **GitHub repo:** `https://github.com/ZacPhoenix/zacphoenix-pro`
- **Live site:** `https://zacphoenix.github.io/zacphoenix-pro/`
- **Pages source:** `gh-pages` branch, path `/`

## Important Architecture Note

The site files live **inside the larger `clawd` workspace repo**, but GitHub Pages is published from a **separate `gh-pages` branch** on the standalone GitHub repo.

That means:
- normal edits + commits happen in the main workspace repo
- deployment is a separate step that copies the site directory and force-pushes it to `gh-pages`

## File That Matters Most

Primary page:
- `projects/zacphoenix-pro/index.html`

Main assets currently used:
- `projects/zacphoenix-pro/splash1.png`
- `projects/zacphoenix-pro/zac-avatar.png`
- `projects/zacphoenix-pro/hex2.png`
- `projects/zacphoenix-pro/hexappic-logo.jpg`

## Working Style

### 1. Edit locally
Make changes directly in:
- `projects/zacphoenix-pro/index.html`

### 2. Preview locally
Open the file directly on Mac for quick checks:
```bash
open /Users/zacphoenix/clawd/projects/zacphoenix-pro/index.html
```

If browser automation or screenshots are needed, serve the folder locally:
```bash
cd /Users/zacphoenix/clawd/projects/zacphoenix-pro
python3 -m http.server 8765
```

Then open:
- `http://127.0.0.1:8765/index.html`

## Visual QA Rule

Do **not** trust CSS changes blindly.
Always visually inspect the page after meaningful layout or styling changes.

Best practice:
- make change
- open page
- screenshot full page if needed
- evaluate spacing, readability, hierarchy, and balance
- then commit

## Commit Workflow

Commits happen in the main workspace repo:
```bash
cd /Users/zacphoenix/clawd
git add projects/zacphoenix-pro/index.html
git commit -m "Describe the site change"
```

## Deployment Workflow

Because the live site is published from `gh-pages`, deploy like this:

```bash
TMPDIR=$(mktemp -d)
cp -R /Users/zacphoenix/clawd/projects/zacphoenix-pro/. "$TMPDIR/"
cd "$TMPDIR"
git init -b gh-pages
git add .
git commit -m "Deploy GitHub Pages site"
git remote add origin https://github.com/ZacPhoenix/zacphoenix-pro.git
git push -f origin gh-pages
```
```

This force-pushes the **contents of the site folder only** to the Pages branch.

## Check Pages Status

```bash
gh api repos/ZacPhoenix/zacphoenix-pro/pages
```

Useful fields:
- `status`
- `html_url`
- `source.branch`
- `source.path`

Current expected output shape:
- source branch = `gh-pages`
- source path = `/`

## Expected Publish Time

Usually:
- **1–3 minutes** after pushing `gh-pages`

Sometimes:
- up to **5+ minutes** if Pages/build/cache is slow

## Current Content/Design Principles

These were established during this session and should be preserved unless intentionally changed:

### Top intro section
- Static layout, no scroll gimmicks
- Splash art used as the background behind the day/night content
- Day/night text presented in **small rounded bars**, not frosted glass cards
- Day side uses white bars
- Night side uses black bars
- Art should remain visible behind the content

### Hex section
- Cleaner, character-first layout
- Strong intro headline for Hex
- Left column: intro + explanation cards
- Right column: Hex portrait + "What I handle" section
- Hexappic logo lives at the right side of the capabilities header

### Copy style
- Avoid em dashes on the page
- Prefer periods, commas, or simple sentence rewrites
- Short, human, founder-forward copy beats over-explained copy

## If Deploying Future Changes

Use this checklist:

1. Edit `projects/zacphoenix-pro/index.html`
2. Preview visually
3. Commit in `/Users/zacphoenix/clawd`
4. Copy site folder to temp dir
5. Force-push temp dir contents to `gh-pages`
6. Check Pages status
7. Wait 1–3 minutes
8. Verify live site

## If Something Looks Broken Live

Check in this order:
1. Did the local page actually look right before deploy?
2. Did `gh-pages` get updated successfully?
3. Does Pages status show `building` or `built`?
4. Is the browser showing cached content?
5. Hard refresh the live site

## Improvement Opportunity

Current deployment works, but it is manual.
A future improvement would be a small deployment script or GitHub Action so future updates can be published with one command.
