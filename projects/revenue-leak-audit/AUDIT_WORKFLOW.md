# Website Revenue-Leak Audit — Agent Implementation Plan

**Purpose:** A repeatable workflow for an AI agent (Claude Code) to audit a local business website, find the places where the site is losing potential revenue, and produce a polished markdown report the operator can hand to the business. The report is a free "tripwire" deliverable — it must demonstrate real value on its own.

**How the operator runs it:** Point Claude Code at this document plus a website URL, e.g.:

> Read `projects/revenue-leak-audit/AUDIT_WORKFLOW.md` and run the full audit on `https://example-plumbing.com`. Business type: plumbing. Service area: Savannah, GA.

Everything the agent needs is in this document. No other context is required.

---

## 1. Context for the Agent

You are auditing the website of a small local business (plumber, dentist, landscaper, gym, law office, restaurant, etc.). These businesses live or die by whether a stranger who lands on their site picks up the phone, fills out a form, or books an appointment. Most local business sites leak revenue in predictable ways — the audit's job is to find those leaks, explain them in plain business language, and rank what to fix first.

**Who reads the output:** The business owner. Not a developer, not a marketer. They skim. They care about money, customers, and phone calls — not bounce rates, semantic HTML, or Core Web Vitals jargon. Every finding must connect to a lost customer or a lost dollar.

**Tone rules:**
- Direct but respectful. You are pointing out leaks, not insulting their site. Never mock the design or the copy.
- Concrete over abstract. "A customer looking for emergency service has to scroll past three paragraphs to find your phone number" beats "CTA placement is suboptimal."
- Quote and cite their actual site. Every finding references a real page and, where useful, real text from that page. Findings without evidence get cut.
- No web-industry jargon in the report body. If a technical term is unavoidable, explain it in one plain clause.
- Do not pitch services, mention pricing, or reference the operator's paid offers anywhere in the report. The report ends with a short "what to fix first" roadmap and nothing else. The upsell happens outside this document.

**Scope guardrails:**
- Audit only the target business's own website (and its pages/subdomains). Do not audit competitors, do not probe for security issues, do not submit real inquiries through their contact forms.
- This is a marketing/conversion audit, not a technical or SEO audit. Page speed, mobile behavior, and search presence are only mentioned when they directly block a customer from converting.
- If the site is fully broken or unreachable, stop and report that to the operator instead of fabricating an audit.

---

## 2. Inputs

Required from the operator:

| Input | Example | Notes |
|---|---|---|
| Website URL | `https://example-plumbing.com` | The only hard requirement |
| Business type | plumbing, dental, HVAC… | Infer from the site if not given, and state your inference |
| Service area | Savannah, GA | Infer if not given |

Optional: anything the operator knows about the business's priorities (e.g., "they want more emergency calls"). Fold it into prioritization if provided; never invent it if not.

---

## 3. Workflow

Run the phases in order. Keep working notes in a scratch file; only the final report is the deliverable.

### Phase 0 — Setup

1. Create a working folder for this audit: `projects/revenue-leak-audit/audits/<business-slug>/` (slug from the domain, e.g. `example-plumbing`).
2. Confirm the site is reachable (fetch the homepage). If it isn't, retry once, then stop and tell the operator.

### Phase 1 — Site inventory

Goal: know what pages exist and what the business actually sells.

1. Fetch the homepage. Extract: business name, tagline, phone number(s), primary navigation links, footer links.
2. Fetch `/sitemap.xml` and `/robots.txt` if they exist; otherwise build the page list from nav + footer + in-page links.
3. Crawl the key pages — cap at ~15 pages, prioritized in this order: homepage, services/offerings pages, about, contact, pricing, reviews/testimonials, booking/quote pages, location pages. Skip blog posts unless the site has almost nothing else.
4. Write an inventory table to your scratch notes: URL, page purpose, primary CTA on the page (if any), phone number visible (y/n).
5. List the services the business appears to offer, based on the site. You'll need this list for the missing-service-pages check.

**Tooling notes:** Use `WebFetch` for page content. If the site is JavaScript-rendered and `WebFetch` returns an empty shell, use Playwright with the pre-installed Chromium to render pages and extract text. If you use Playwright, also grab a full-page screenshot of the homepage for your evidence file — but the report itself is markdown-only.

### Phase 2 — The five leak checks

Run each check against the inventoried pages. For every check, record in your scratch notes: **pass/fail per page, the evidence (quoted text or described observation, with URL), and a severity guess.** A check with no evidence is a pass — do not manufacture findings to fill a category.

#### Check 1 — Unclear offer

Can a first-time visitor answer, within the first screen of the homepage: *What does this business do, for whom, and where?*

Look for:
- Homepage headline that is vague, clever, or generic ("Quality You Can Trust") instead of stating the service and area ("Emergency Plumbing in Savannah — Same-Day Service").
- No mention of the service area on the homepage.
- Services described in insider language the average customer wouldn't search for.
- Competing messages: multiple unrelated offers fighting for the same real estate.
- No indication of what makes them different from the next result on Google (speed, guarantee, specialization, price transparency — anything).

#### Check 2 — Weak trust signals

A local customer is about to let this business into their home, mouth, or finances. What on the site tells them it's safe?

Look for (absence of any of these is a potential finding):
- Reviews or testimonials on the site — and whether they're specific and attributed ("Mike fixed our water heater same-day" — J.R., Pooler) vs. generic and anonymous.
- Google review count/rating referenced or embedded.
- Licenses, certifications, insurance, professional association badges — where legally or commercially relevant for this business type.
- Real photos of the team, trucks, storefront, or completed work vs. obvious stock photography.
- Years in business, "locally owned," named owner/staff.
- Guarantees or warranties.
- Signs of neglect that erode trust: copyright year stale by 2+ years, dead links in main nav, "coming soon" pages, blog last updated years ago.

#### Check 3 — Buried calls to action

When a visitor decides to act, how much work is it to actually do it?

Look for:
- Phone number not visible in the header on every page (for call-driven businesses this is the #1 leak).
- Phone number present but not tap-to-call (`tel:` link) — most local traffic is mobile.
- No clear primary CTA above the fold on the homepage and service pages ("Call Now," "Get a Free Quote," "Book Online").
- CTA exists but is visually buried, ambiguous ("Learn More," "Submit"), or only appears at the very bottom of long pages.
- Pages that dead-end: service pages, about page, or blog posts with no CTA at all.
- Multiple weak CTAs instead of one obvious next step.

#### Check 4 — Missing service pages

Compare the list of services the business offers (from Phase 1, plus what a typical business of this type offers) against the pages that exist.

Look for:
- Services mentioned only as a bullet on a combined "Services" page, with no dedicated page. (A plumber with no "Water Heater Repair" page can't rank for or convert water-heater searches.)
- High-intent service categories for this business type that the site never mentions at all — flag these as questions, not findings ("If you offer emergency service, the site never says so"), since the business may genuinely not offer them.
- Service pages that exist but are thin: one paragraph, no pricing guidance, no photos, no CTA, no FAQ.
- No location/service-area page when the business serves multiple towns.

#### Check 5 — Slow quote path

Walk the actual path a customer takes from "I want a quote/appointment" to done. Count the steps and note every point of friction.

Look for:
- Contact/quote form with excessive fields (more than ~5 for an initial inquiry).
- Form asks for information a customer can't easily provide, or that signals a slow reply ("describe your issue in detail").
- No statement of response time ("we reply within 1 business hour") — silence after a form submission is where leads die.
- No alternative channels: no phone number next to the form, no text/SMS option, no online booking where the industry norm supports it (dental, gyms, salons).
- Quote path requires a download, an email address hunt, or navigating 3+ pages.
- Broken or suspicious form behavior you can observe without submitting (missing form action, obvious error states). **Never submit a live form** — assess it by inspection only.

### Phase 3 — Score and prioritize

Convert findings into a ranked list. For each finding assign:

- **Revenue impact (High / Medium / Low):** How directly does this leak lose a ready-to-buy customer? A hidden phone number on a plumbing site is High. A stale copyright year is Low.
- **Effort to fix (Quick win / Project):** Quick win = text, link, or layout change doable in a day. Project = new pages, new booking system, restructure.

Priority order for the report: **High-impact quick wins first**, then high-impact projects, then medium, then low. Cap the report at the **top 7–10 findings** — a report with 25 findings gets ignored. Fold minor observations into a short "also worth noting" list.

Sanity check before writing: for each finding, ask "if the owner fixed this, would a specific kind of customer stop falling through?" If you can't name the customer and the moment, cut or demote the finding.

### Phase 4 — Write the report

Write the deliverable to `projects/revenue-leak-audit/audits/<business-slug>/REPORT.md` using the template in Section 4. Rules:

- Every finding follows the three-part structure: **the leak → why it costs money → the fix.** Keep each finding to ~120 words max.
- Use the business's real name, real page URLs, and real quoted text.
- Numbers only where honest: you may reason about likelihood ("most visitors on a phone will…") but never invent statistics, traffic figures, or dollar amounts.
- The "Fix First" roadmap at the end lists 3–5 items max, in order, phrased as actions.

Also save your scratch notes as `NOTES.md` in the same folder (inventory table, full check results, evidence). The operator may want the raw material later; it is not part of the deliverable.

### Phase 5 — Quality pass and handoff

Before finishing:

1. Re-read the report as the business owner. Cut anything that reads as filler, jargon, or insult.
2. Verify every URL cited in the report actually resolves and every quote actually appears on the cited page.
3. Confirm the report contains **zero** mention of the operator's services, pricing, or next-step pitch.
4. Report back to the operator with: path to `REPORT.md`, a 3-sentence summary of the biggest leaks, and anything you couldn't assess (e.g., "couldn't render their booking widget").
5. Commit the audit folder if the operator's session conventions call for it.

---

## 4. Report Template

Use this structure verbatim. Placeholders in `{braces}`.

```markdown
# Website Revenue-Leak Audit
## {Business Name} — {domain}

**Prepared:** {date}
**Pages reviewed:** {n} pages including {homepage, key pages}

---

### The Short Version

{2–4 sentences. What the site does well (one honest sentence — find something),
where the biggest leaks are, and the single most valuable fix. This is the only
part some owners will read.}

**Leaks found:** {n} &nbsp;|&nbsp; **Quick wins:** {n} &nbsp;|&nbsp; **Biggest leak:** {one phrase}

---

### Where Revenue Is Leaking

{Findings in priority order. Repeat this block per finding:}

#### {n}. {Plain-language title, e.g. "Your phone number disappears on every page except Contact"}
**Impact: {High/Medium/Low} · Fix difficulty: {Quick win / Project}**

**What's happening:** {The observation, with page URL and quoted evidence.}

**Why it costs you customers:** {The specific customer and moment being lost.}

**The fix:** {Concrete, plain-language action. What good looks like.}

---

### Also Worth Noting

{Bulleted minor observations, one line each. Omit section if empty.}

---

### What to Fix First

{Numbered roadmap, 3–5 items, ordered by impact-per-effort. One line each:
the action and the payoff.}

1. {Action} — {payoff}
2. …

---

*This audit reviewed {domain} as a first-time customer would experience it
on {date}. Findings are based on the live site on that date.*
```

---

## 5. Definition of Done

The run is complete when all of these are true:

- [ ] `audits/<business-slug>/REPORT.md` exists and follows the template
- [ ] `audits/<business-slug>/NOTES.md` contains the inventory and full check evidence
- [ ] 7–10 findings max, each with evidence, impact, effort, and a concrete fix
- [ ] All five leak categories were checked (a category with no findings is fine — say so in NOTES, not in the report)
- [ ] Every cited URL and quote verified
- [ ] No operator services, pricing, or pitch anywhere in the report
- [ ] Operator received the summary and file path

---

## 6. Notes for Future Iterations (operator-facing)

- The markdown report is designed to convert cleanly into a branded asset (PDF/HTML) later — headings, one-line stats row, and self-contained finding blocks map directly onto a designed template. Keep the template structure stable so that conversion can be automated.
- After a few runs, consider adding a per-industry checklist appendix (dental vs. trades vs. restaurants weight the five checks differently). Don't build it speculatively — grow it from real audits.
