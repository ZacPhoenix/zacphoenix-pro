# Audit scratch notes — lowcountrytech.com

Run date: 2026-08-05/06. Operator: Zac. Business type (inferred): managed IT
services provider (MSP) + VoIP + alarm monitoring + structured cabling.
Service area (inferred): Savannah GA metro + SC Lowcountry (Rincon HQ).

**Deviation from AUDIT_WORKFLOW.md, on operator instruction:** the operator
explicitly requested dollar quantification with market pricing. The workflow's
"never invent dollar amounts" rule is satisfied by routing every number
through `revenue_model.py` — named assumptions, cited benchmarks, low/high
ranges, gate-tested. No point estimates presented as fact.

## Technical baseline (not report material — site is healthy)

- HTTP/2, TTFB 122ms, HSTS, www→apex and http→https 301s. WordPress.com
  (Atomic) hosting, nginx, Batcache HIT. No performance blocker to conversion.
- robots.txt sane; sitemap_index with post/page/category sitemaps.
- 429 rate-limiting kicks in on fast sequential fetches (crawl politely).

## Inventory (13 pages crawled)

| URL | Purpose | Primary CTA | Phone visible |
|---|---|---|---|
| / | Home | "Schedule a Consultation" → /contact/ | y (header, tel:) |
| /services/ | Services hub | — none — | y (text only) |
| /managed-it-services/ | MSP service | "Contact Us" | y |
| /managed-it-services-savannah-ga/ | MSP + city landing | "Call (912) 335-0175", "Free Consultation" | y |
| /voip-and-unified-communications/ | VoIP service | "Get 3CX Now" | y |
| /alarm/ | Alarm service | "Contact Us" + segmented options | y |
| /network-and-cabling-solutions/ | Cabling service | "Contact Us" | y |
| /warehouse-logistics-it-services/ | Vertical page | "Request a Site Survey" | y |
| /about/ | About | "View Our Services" (+ stray comment form) | y |
| /contact/ | Contact | 4-field form + phone + email | y |
| /it-support-savannah-metro/ | Service-area hub | "Call…", "Contact Us" | y |
| /it-services-bluffton-sc/ | Location page | "Call…", "Free Consultation" | y |
| /it-services-pooler-ga/ | Location page | "Call…", "Free Consultation" | y |

Also in sitemap: 9 more location pages, 28 blog posts (active through 2026),
policies. **No dedicated cybersecurity service page exists** — cybersecurity
appears only in body copy and blog posts.

Services offered: managed IT, cybersecurity, VoIP (3CX), network/low-voltage
cabling, monitored alarm/camera systems ($29.99/mo advertised), warehouse/
logistics IT.

## Five leak checks

### Check 1 — Unclear offer: PASS (strong)
H1 "Managed IT Services for Savannah & Beyond"; subhead lists all five lines +
"One local partner for everything that plugs in." Area named. No finding.

### Check 2 — Weak trust signals: mostly PASS
- Trustindex widget embeds real attributed Google reviews (Kim Glenn, Ashley
  Doyle…) on home/contact/service pages. Schema AggregateRating 5.0, 23
  reviews. BBB A+ referenced with explanation. Founded 2020, Rincon office
  named, "not a call center, not a chatbot" copy.
- Gaps (minor): no guarantee/warranty/SLA language anywhere
  (`guarantee_mentions: 0` on all 13 pages); About page carries a blog-style
  comment form (WordPress comments left enabled) — polish issue.
- No stale copyright (footer shows none at all), nav links all resolve.

### Check 3 — Buried CTAs: FINDINGS
- **Mobile homepage:** header ~330px + 4-line H1 push "Schedule a
  Consultation" ~2 screens below the fold (375×812 render, screenshots
  taken). First screen offers only the tappable phone number. Desktop is fine
  (CTA above fold).
- **/services/ hub:** zero CTA buttons in body (extractor: `ctas: []`),
  phone only as header text. Main-nav page that dead-ends.
- **VoIP page:** sole conversion button reads "Get 3CX Now" — vendor jargon
  a "business phone systems" searcher doesn't recognize.
- tel: links present site-wide (`+19123350175`) — that part is right.

### Check 4 — Missing service pages: FINDING
- Cybersecurity: named second in the homepage subhead, meta description, and
  blog strategy ("How to Choose a Cybersecurity Company in Savannah" post),
  but no service page. Buyers searching cyber terms land on blog posts or
  competitors. Location pages exist and are good (FAQ schema, city copy).
- Pricing: managed-IT meta promises "Flat monthly per-user pricing … See
  exactly what is included in Lowcountry Technologies managed IT plans" but
  no page publishes any number (only alarm shows $29.99/mo). FAQ answers
  "How is managed IT priced?" with model, not range.

### Check 5 — Slow quote path: FINDINGS
- Form itself is good: 4 visible fields (name, email, phone, message) +
  honeypot; phone + email beside it; expectation copy ("Most calls answered
  live", "what happens next" list). PASS on form design.
- **No scheduler:** "Schedule a Consultation" and "Free IT Assessment" both
  land on the generic form; nothing lets a visitor pick a time. After-hours
  visitors must wait for a reply.
- **No urgent path:** homepage never says 24/7 or "urgent issue?" — the
  crisis-switcher (server down, ransomware) sees no fast lane. 24/7 appears
  only on the managed-IT page body/meta.
- No SMS/text option.

## Dollar model

See `revenue_model.py` (run it for the table) and `test_revenue_model.py`
(12 gate tests). Structure: leads_lost/yr × close rate × annual client value,
low/high bounds, per-finding fix cost at market rates, worst-case payback.

Benchmark sources:
- MSP pricing $100–175/user/mo SMB; 25-person shop $2.5k–7.5k/mo:
  petronellatech.com, mydatapath.com, mspcompanies.us (2026 guides)
- Avg NA MSP MRR/client $1,850 (2023): gitnux.org MSP statistics
- Min viable engagement ~$1,200/mo: tacticsmarketing.com
- Client 5-yr worth $25k–75k net: jakenequities.com
- Visitor→lead: IT/managed services ~1.5% median, top 3–5%: zeliq.com,
  gogreymatter.com
- 57% local searches mobile: sagapixel.com; 84% for "near me"
- 43% SMB calls after hours (CallRail 2024): agentzap.ai roundup
- 78% of B2B buyers pick first responder; 21x conversion within 5 min:
  marketbetter.ai, kixie.com
- Verified externals: BBB A+ profile (bbb.org), 5.0 Google rating, Yelp
  listing, founded 2020 (cloudtango profile)

Assumption to revisit with real data: 400–900 visits/mo (used only as a
sanity ceiling — implied lost-lead total is 0.1–0.7% of assumed traffic,
far below the 1.5–5% conversion band, i.e. the model is not overclaiming).

## Quality pass

- All quoted strings grep-verified against local page copies (scratchpad
  `lct/pages/`); all cited URLs returned 200 on 2026-08-05/06.
- Report contains no operator services, pricing, or pitch.
- Screenshots (desktop hero, mobile hero, mobile CTA position) observed in
  session; report is markdown-only per workflow.
