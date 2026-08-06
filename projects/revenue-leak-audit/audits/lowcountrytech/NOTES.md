# Audit Working Notes — lowcountrytech.com

**Audited:** 2026-08-06
**Business:** Lowcountry Technologies LLC (LCT) — Managed Service Provider / IT services
**Location:** 595 Towne Park Dr W, Suite 100, Rincon, GA 31326
**Phone:** (912) 335-0175 · contact@lowcountrytech.com
**Service area:** Savannah, Pooler, Rincon/Effingham, Richmond Hill, Statesboro, Hinesville, Bluffton, Hilton Head, Beaufort, Hardeeville, Ridgeland
**Platform:** WordPress + GenerateBlocks, Jetpack forms, Trustindex review widget

---

## Phase 1 — Site Inventory

**Sitemap:** 23 pages, 28 blog posts. Latest post `2026-07-29` (8 days before audit — blog is current).

### Pages fetched and analyzed

| URL | Purpose | Body CTA | tel: links | Google reviews widget |
|---|---|---|---|---|
| `/` | Homepage | Schedule a Consultation | 3 (header/footer) | Yes |
| `/services/` | Services hub | **NONE** | 3 (header/footer) | **No** |
| `/managed-it-services/` | Flagship service (in nav) | Contact Us | 3 (header/footer) | Yes |
| `/managed-it-services-savannah-ga/` | Same service, **not in nav** | Call (912) + Free Consultation | 6 | Yes |
| `/voip-and-unified-communications/` | VoIP service | **Get 3CX Now → offsite** | 3 (header/footer) | Yes |
| `/network-and-cabling-solutions/` | Cabling service | Contact Us | 3 (header/footer) | Yes |
| `/alarm/` | Alarm service | Contact Us | 3 (header/footer) | Yes |
| `/warehouse-logistics-it-services/` | Vertical page | Call (912) + Request a Site Survey | 5 | Yes |
| `/it-services-pooler-ga/` | Location page | Call (912) + Free Consultation | 6 | Yes |
| `/about/` | Trust page | View Our Services | 3 (header/footer) | **No** |
| `/contact/` | Conversion page | Submit (form) | 4 | Yes |
| `/it-support-savannah-metro/` | Metro hub (title/h1 only) | — | — | — |

**Location pages (10):** Pooler, Bluffton SC, Hardeeville/Ridgeland SC, Beaufort SC, Hilton Head SC, Hinesville GA, Statesboro GA, Richmond Hill GA, Rincon/Effingham GA, Savannah metro.

### Services claimed on site
Managed IT, Cybersecurity, VoIP/Unified Comms, Network & Low-Voltage Cabling, Alarm & Monitoring, Warehouse/Logistics IT, IT Support & Helpdesk, Security Assessments, Endpoint Protection, Business Continuity, Access Control, IT Strategy & Planning, Security Cameras.

---

## Phase 2 — Leak Check Results

### Check 1 — Unclear offer: **MOSTLY PASS, one real issue**

**Passing:** Homepage H1 is clear and geo-specific — "Managed IT Services for Savannah & Beyond". Subhead names all five service lines and closes with a genuinely strong differentiator line: *"One local partner for everything that plugs in."* Service area is listed on the homepage and in the footer.

**Issue found:** The single best piece of positioning on the whole site is buried on `/about/`, paragraph 3:
> "Lowcountry Technologies, or LCT as our clients call us, is locally owned and operated in Rincon, Georgia. Not a franchise, not a branch office, and not a white-labeled front for somebody else's help desk."
> "...a team that picks up the phone, already knows your network, and can be at your door quickly because we work and live here too."

This sits *below* two paragraphs of generic filler ("empower businesses to thrive in the digital age", "Unwavering Focus on Cybersecurity"). Meanwhile the homepage's three feature blocks are generic — "Proactive Cybersecurity Measures", "Tailored IT Solutions", "Infrastructure Enhancements" — with vague CTA labels "Explore Now", "Experience the difference", "Discover More Solutions".

**Minor:** `/about/` says "based in the heart of Savannah, Georgia" while the same page and the address say Rincon.

---

### Check 2 — Weak trust signals: **STRONG OVERALL, two gaps**

**Passing — genuinely good:**
- BBB A+ accredited since September 2021, linked to the real BBB profile.
- 5.0-star Google rating with a live Trustindex widget pulling real, attributed reviews (jimmy davis, Ben Williams — "These guys are miracle workers. Nick is a Genius.").
- Vendor partner badges: 3CX, Huntress, Ironscales, Ubiquiti, ThreatLocker, Axis (authorized partner).
- Blog current (last post 2026-07-29).
- "Locally owned, not a franchise" + named local office.

**Gap 1 — review widget missing on two key pages.** Widget markup (`trustindex-google-widget-html`) present on home, managed IT, VoIP, alarm, cabling, contact. **Absent on `/services/` and `/about/`** — only the loader script reference is present, no widget. About is the page visitors open specifically to decide whether to trust the company.

**Gap 2 — no real photography.** All imagery is stock or generated:
- `charles-forerunner-3fPXt37X6UQ-unsplash.jpg` (Unsplash)
- `photo-1680691257251-5fead813b73e-scaled.jpg` (Unsplash ID format, on `/about/`)
- `assets_task_01jz76jqk1f4s8a38v98ffwee4_1751514778_img_1.webp` (AI-generated asset naming)

No photos of the team, the Rincon office, vehicles, or completed installs — on a site whose core claim is "we're local and we show up."

---

### Check 3 — Buried calls to action: **PASS on phone, FAIL on page-level CTAs**

**Passing — better than most local sites:** Phone is in a sticky header CTA block on **every** page, tap-to-call (`href="tel:+19123350175"`), with a matching "Free IT Assessment" button. Phone also repeats in the footer. No leak here.

**Issue 1 — `/services/` has zero body CTAs.** No `gb-button` and no `wp-block-button` in the page body. It does link to the five service pages under "Start With the Service You Need", but offers no way to call or contact from the page itself beyond the header.

**Issue 2 — core service pages are weaker than location pages.** Clear two-tier pattern:

| Page tier | CTA pattern |
|---|---|
| Location/vertical pages (Pooler, warehouse, Savannah-GA) | Hero **"Call (912) 335-0175"** button + **"Free Consultation"** / **"Request a Site Survey"**, repeated call button lower down |
| Core service pages (managed IT, cabling, alarm) | Single generic **"Contact Us"** at page bottom |
| `/services/` hub | Nothing |

The newer geo pages are well built; the flagship service pages have not been brought up to the same standard.

**Issue 3 — vague homepage CTA labels.** "Explore Now", "Experience the difference", "Discover More Solutions" — three of the five homepage buttons describe browsing, not acting.

---

### Check 4 — Missing service pages: **FAIL — largest structural gap**

`/services/` describes **nine** services as `<h4>` blocks. Verified: **none of the nine link anywhere** (checked 400 chars before / 700 after each heading — only "Structured Cabling" had a nearby link, to the warehouse page).

| Service described on `/services/` | Dedicated page? |
|---|---|
| VoIP Phone Systems | Yes |
| Structured Cabling | Yes (network-and-cabling) |
| IT Support & Helpdesk | **No** |
| Security Assessments | **No** |
| Endpoint Protection | **No** |
| Business Continuity | **No** |
| Access Control Systems | **No** |
| IT Strategy & Planning | **No** |
| Security Systems (cameras) | **No** |

**Cybersecurity has no page at all** despite being mentioned 9× on the homepage, 4× on About, 6× on the Pooler page, and named in the main homepage subhead. For an MSP this is typically the highest-value search term after "managed IT".

**Access control and security cameras** are high-ticket, high-intent local searches. Both are described on `/services/`, both appear on `/alarm/`, neither has a page.

**Also — duplicate/competing managed IT pages.** `/managed-it-services/` (in the nav) and `/managed-it-services-savannah-ga/` (not in the nav) both target managed IT. The one *not* in the nav is substantially the better page — see Check 5 note below.

---

### Check 5 — Slow quote path: **MOSTLY PASS, two gaps**

**Passing — the contact page copy is the best on the site:**
> "Reach out and you'll talk to a real person from our Rincon office, not a call center, not a chatbot."
> "What happens next: a short conversation about your environment, a free assessment if it's a fit, and a fixed-price proposal in plain English. No pressure, no jargon, no obligation."
> "Most calls answered live. On-site across the Savannah metro when remote isn't enough."

Form is short and appropriate — 4 fields: Name (required), Email (required), Phone (required), Message. Not submitted (per workflow rules); assessed by inspection only. Jetpack form with Akismet honeypot.

**Gap 1 — no response-time commitment.** The page explains *what* happens next but never *when*. Zero occurrences of a timeframe. Phone is a required field, which adds friction for someone who prefers email contact.

**Gap 2 — the after-hours question is unanswered, and the site contradicts itself.**

| Page | Claim |
|---|---|
| `/managed-it-services/` | "...or providing **24/7 support**, our goal is to deliver exceptional service" |
| `/managed-it-services/` | "**Around-the-clock** monitoring of servers, workstations, and network equipment" |
| `/it-services-pooler-ga/` | "Around-the-clock monitoring..." **and** "Monday–Friday, 8:00 AM–5:00 PM" on the same page |
| `/contact/` | "Hours: **Monday–Friday, 8:00 AM–5:00 PM**" |

`/contact/` contains **zero** occurrences of "emergency", "after-hours", or "24/7". A prospect asking "what happens when our server dies Saturday night?" cannot answer that question from this site.

*(Note: the `/alarm/` page's "24/7 Professional Monitoring" is central-station alarm monitoring — that claim is legitimate and separate from the IT-support hours issue.)*

---

## Phase 3 — Prioritization

| # | Finding | Impact | Effort |
|---|---|---|---|
| 1 | Nav points to the weaker of two managed IT pages | High | Quick win |
| 2 | VoIP page's only CTA sends visitors to 3cx.com | High | Quick win |
| 3 | "24/7 support" vs M–F 8–5, no after-hours answer | High | Quick win |
| 4 | Seven described services have no page; no cybersecurity page | High | Project |
| 5 | Core service pages have weaker CTAs than location pages | Medium | Quick win |
| 6 | Google reviews missing from `/services/` and `/about/` | Medium | Quick win |
| 7 | No response-time promise on the contact form | Medium | Quick win |
| 8 | Strongest positioning buried on About page | Medium | Quick win |
| 9 | Stock/AI imagery only — no team, office, or job photos | Medium | Project |

**Minor (rolled into "Also Worth Noting"):** footer service list omits Warehouse & Logistics IT; "heart of Savannah" vs Rincon inconsistency; vague homepage button labels.

**Checks with no findings:** tap-to-call phone placement (passes on all 12 pages), blog freshness, BBB/review credentials, contact form length.

---

## Evidence files

Raw HTML saved in this folder: `raw-*.html` (12 pages), `sitemap.xml`.
