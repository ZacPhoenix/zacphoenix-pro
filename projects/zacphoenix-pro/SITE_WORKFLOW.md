# ZacPhoenix.pro — Site Workflow

This is the working playbook for updating and deploying the Zac Phoenix personal site.

> **Environment note:** this workflow was originally written on macOS and has been adapted for the current Windows dev environment. All shell snippets below assume **Git Bash** on Windows (the default shell Claude Code uses here). PowerShell equivalents are called out where relevant.

## Repo + Publish Setup

- **Workspace repo (Windows):** `C:\Users\zaclu\Desktop\WebsiteRedesign` (Git Bash: `/c/Users/zaclu/Desktop/WebsiteRedesign`)
- **Site source files:** `projects/zacphoenix-pro/`
- **GitHub repo:** `https://github.com/ZacPhoenix/zacphoenix-pro`
- **Live site:** `https://zacphoenix.pro` (also `https://zacphoenix.github.io/zacphoenix-pro/`)
- **Pages source:** `gh-pages` branch, path `/`

## v2 Setup (current)

The workspace has been restructured for v2 development:

- **Active branch:** `v2-dev` — all v2 work happens here. `main` stays frozen at v1.
- **Git tag `v1`:** points to commit `a9b802b` on `main` — v1 source state (pushed to origin).
- **Git tag `v1-live`:** points to gh-pages tip `e17dd52` — v1 *live-site* state, including the `index-v2..v5.html` experiments that only ever existed on `gh-pages` (pushed to origin).
- **Local source archive:** `C:\Users\zaclu\Desktop\WebsiteRedesign-v1-archive\` — frozen copy of the v1 workspace (includes `.git`).
- **Local live-site archive:** `C:\Users\zaclu\Desktop\WebsiteRedesign-v1-live-archive\` — clone of the `gh-pages` branch only.

Recovery cheatsheet:
- v1 source: `git checkout v1` (from any clone) or read `WebsiteRedesign-v1-archive/`
- v1 live site: `git checkout v1-live` or read `WebsiteRedesign-v1-live-archive/`

## Important Architecture Note

The site files live **inside a larger workspace repo**, but GitHub Pages is published from a **separate `gh-pages` branch** on the standalone GitHub repo.

That means:
- normal edits + commits happen on `v2-dev` (and eventually `main`) in the workspace repo
- deployment is a separate step that copies the site directory and force-pushes it to `gh-pages`

## File That Matters Most

Primary page:
- `projects/zacphoenix-pro/index.html`

Main assets currently in source on `v2-dev`:
- `projects/zacphoenix-pro/splash1.png`
- `projects/zacphoenix-pro/hex2.png`
- `projects/zacphoenix-pro/hexappic-logo.jpg`

Note: `zac-avatar.png` and `hex-portrait.png` appear on the live `gh-pages` branch but are not currently in source on `v2-dev`. If v2 needs them, recover from `WebsiteRedesign-v1-live-archive/`.

## Working Style

### 1. Edit locally
Make changes directly in:
- `projects/zacphoenix-pro/index.html`

### 2. Preview locally

Quick open in the default browser (Git Bash):
```bash
start /c/Users/zaclu/Desktop/WebsiteRedesign/projects/zacphoenix-pro/index.html
```

PowerShell equivalent:
```powershell
Start-Process "C:\Users\zaclu\Desktop\WebsiteRedesign\projects\zacphoenix-pro\index.html"
```

If browser automation or a local server is needed:
```bash
cd /c/Users/zaclu/Desktop/WebsiteRedesign/projects/zacphoenix-pro
python -m http.server 8765
```

(On Windows the launcher is typically `python` or `py`, not `python3`.)

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

Commits happen in the workspace repo on `v2-dev`:
```bash
cd /c/Users/zaclu/Desktop/WebsiteRedesign
git add projects/zacphoenix-pro/index.html
git commit -m "Describe the site change"
git push origin v2-dev
```

Merge to `main` only when a v2 milestone is ready to become the new canonical source.

## Deployment Workflow

Because the live site is published from `gh-pages`, deploy like this (Git Bash):

```bash
TMPDIR=$(mktemp -d)
cp -R /c/Users/zaclu/Desktop/WebsiteRedesign/projects/zacphoenix-pro/. "$TMPDIR/"
cd "$TMPDIR"
git init -b gh-pages
git add .
git commit -m "Deploy GitHub Pages site"
git remote add origin https://github.com/ZacPhoenix/zacphoenix-pro.git
git push -f origin gh-pages
```

This force-pushes the **contents of the site folder only** to the Pages branch. The temp dir is disposable.

**Important:** force-pushing `gh-pages` erases whatever was there (including the `index-v2..v5.html` experiments). That history is preserved in the `v1-live` tag and the local live-site archive, but the branch itself will be overwritten.

**Custom domain reminder:** the live branch also contains a `CNAME` file (`zacphoenix.pro`). The current source folder does **not** include a `CNAME` — if you deploy without one, the custom domain may be unset. Before the first v2 deploy, add `CNAME` to `projects/zacphoenix-pro/` (content: `zacphoenix.pro`) or copy it into the temp dir before pushing.

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

## Current Content/Design Principles (v1)

These were established in the v1 design pass. Preserve unless v2 intentionally breaks from them:

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
3. Commit + push on `v2-dev`
4. (When ready to go live) copy site folder to temp dir, including a `CNAME` file
5. Force-push temp dir contents to `gh-pages`
6. Check Pages status
7. Wait 1–3 minutes
8. Verify live site at `https://zacphoenix.pro`

## If Something Looks Broken Live

Check in this order:
1. Did the local page actually look right before deploy?
2. Did `gh-pages` get updated successfully?
3. Does Pages status show `building` or `built`?
4. Is the custom domain still set (`CNAME` present on `gh-pages`)?
5. Is the browser showing cached content? Hard refresh.

## Improvement Opportunity

Current deployment works, but it is manual.
A future improvement would be a small deployment script (bash or PowerShell) or GitHub Action so future updates can be published with one command. If scripted, the script should handle the `CNAME` copy and confirm before force-pushing.
