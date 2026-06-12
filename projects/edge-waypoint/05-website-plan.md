# Edge Waypoint - Website Plan

A three-page site with one job: get a discovery call on the calendar. Everything that doesn't move a visitor toward that gets cut. Target: a visitor understands what you do, what working with you feels like, and books - in under 3 minutes.

---

## The funnel logic

**One CTA, everywhere, always the same words:** `Book a discovery call →`

Recommendation: make the web CTA a **20-minute fit call**, not the 90-minute workshop. Cold web visitors won't commit 90 in-person minutes to a stranger, but 20 minutes on the phone is easy - and the workshop is *your* pitch to make on that call, where your personal touch actually works. (Referral-partner traffic can skip straight to the workshop; that conversation happens in person anyway.)

Every page ends at the same booking block. No newsletter, no "contact form," no second ask. One door.

---

## Design system

**The blaze motif:** a single orange rectangle or chevron mark - like a trail blaze painted on a tree - used as the brand mark, section markers, and list bullets. It ties the name to the visual identity without a logo project.

| Element | Spec |
|---|---|
| Background | White `#FFFFFF` (primary), black `#0A0A0A` for one full-bleed band per page |
| Text | Near-black `#1A1A1A` on white; white on black bands |
| Orange | One orange only - blaze orange `#FF5A00` (or safety orange `#FF6700`). Used for: CTA buttons, the blaze mark, link hover, one highlighted stat per page. **Nothing else.** Orange works because it's scarce; if everything is orange, nothing is |
| Type | One family, two weights. A grotesque sans (Inter, or Söhne-style) - bold for headlines, regular for body. Big headline sizes, generous whitespace. The restraint IS the design |
| Imagery | Your face (real photo, good light, local backdrop) and real local photos if any. No stock photos of robots, brains, or blue circuit boards - that's the AI-agency costume you're refusing to wear |
| Tone | Plain English, short sentences, numbers where possible. Sounds like the workshop feels |

---

## Page 1: Home - "the promise"

| Section | Content |
|---|---|
| **Hero** (white) | Headline: **"Find the problems worth solving. Fix them with the smallest thing that works."** Subline: "Edge Waypoint helps {city/region} businesses put a dollar figure on their operational headaches - then fixes the ones worth fixing. Sometimes that's automation or AI. Sometimes it's a $40/month tool. We'll tell you which, honestly." CTA button. Your photo or the blaze mark, nothing busy |
| **The honesty hook** (black band) | The differentiator, big type, white text, orange highlight on the key phrase: "Most of what we diagnose **doesn't need us to build anything.** That's why people trust us with the things that do." |
| **How it works, in 3 steps** (white) | Blaze-marked steps: ① **Talk** - a 20-minute call, then a 90-minute on-site workshop. ② **Map** - two weeks: where your hours go, what each problem costs per year, what we'd do about each. ③ **Fix** - one fix at a time, four weeks, fixed price, measured against a baseline. "If it doesn't beat the old way, we tell you to kill it - in writing." One line each; details live on page 2 |
| **Who it's for** (white) | One sentence + a short row: "Owner-led businesses in {region}, 5-50 people - trades, clinics, professional services, distributors." Locality is a feature; say the place names |
| **Proof** (white) | Launch version: one testimonial from your rehearsal workshops, or the talk you've given. Later: case study stats with the orange highlight ("Quote turnaround: 5 days → 1") |
| **Booking block** (black band) | Headline: "Worth 20 minutes?" Embedded Cal.com/Calendly. This exact block ends all three pages |

## Page 2: How it works - "what you're in for"

This page de-risks the call. A visitor should finish it thinking "I know exactly what happens if I engage these people, and what it costs."

| Section | Content |
|---|---|
| **The method in one line** | "Outcome first, capability second, tool last. We never start with the technology." |
| **The Solution Ladder** (the centerpiece) | The 6-rung ladder as a simple vertical graphic - the blaze mark climbing. One plain-English line per rung, with the key message visually emphasized: AI is rung 5 of 6, and most problems resolve lower. This single graphic does more positioning work than any paragraph on the site |
| **The engagement path, with prices** | The four products as a simple table: Workshop (free, 90 min, on site) → Waypoint Map (${X}, 2 weeks) → Edge Pilot (${X}, 4 weeks) → Waypoint Watch (${X}/mo). **Show real prices.** Price transparency is rare in consulting; it signals confidence, pre-qualifies callers, and kills the "what's this going to cost me" anxiety that stops bookings |
| **What you walk away with** | Named artifacts, shown not told: a thumbnail/screenshot of a (sanitized) Waypoint Brief, the scorecard, the decision one-pager. "Every engagement ends in a document you own and a decision in writing" |
| **The kill clause** (black band) | Quote it verbatim from the proposal: "If the pilot doesn't beat your baseline by week 4, we recommend killing it - in writing - and tell you what we'd do instead." This is the most credibility-generating sentence you have; give it a whole band |
| **Short FAQ** (5 max) | "Do I need to be technical?" / "Is this an AI thing?" ("Only when AI is honestly the answer - see the ladder") / "Who owns what you build?" ("You do - your accounts, your keys, documented in your workspace") / "What if we're too small?" / "What does the workshop cost?" |
| **Booking block** | Same as home |

## Page 3: About + Book - "the person"

For a local, in-person business, the about page is a conversion page - people book *you*.

| Section | Content |
|---|---|
| **You** | Real photo, first-person, 150 words max: who you are, why local, why you'd rather recommend a $40 tool than sell a build. One personal line (the thing a neighbor would know about you) - this is the page where the personal touch is the product |
| **Principles, plainly** | Three blaze-marked lines: "Smallest thing that works." / "Fixed prices, named deliverables." / "A kill recommendation is a deliverable, not a failure." |
| **Service area** | Map or plain list of the towns/region you cover. Reinforces the local moat and helps local SEO |
| **The big booking block** | Full embedded scheduler, plus phone and email rendered as plain text for the owners who'd rather just call - in trades especially, "he answers the phone" is a feature |

---

## Build and launch notes

- **Stack:** static and boring on purpose - Astro/Eleventy/plain HTML on Netlify or GitHub Pages, or Carrd/Framer if you want it live this afternoon. A 3-page brochure site needs no CMS. (And it's a rung-2/3 problem by your own ladder - don't build a custom site.)
- **Local SEO from day one:** `{City} business automation consultant` shaped title/meta on every page, Google Business Profile linked, LocalBusiness schema markup, real address area. Reviews on the Business Profile will out-convert the website itself - ask for one after every shipped pilot.
- **Footer (all pages):** phone, email, service area, LinkedIn. No social icons you won't maintain.
- **Measurement:** one metric only - booked calls per week. A privacy-light analytics tool (Plausible/Fathom) to see which page sends them to the booking block. Ignore everything else.
- **Anti-checklist:** no chatbot (an AI-skeptic-friendly consultancy with a chatbot pop-up is an own-goal), no stock AI imagery, no "solutions" mega-menu, no blog at launch (the case studies become the content later), no second CTA.

**Launch order:** Page 1 alone is a viable launch - ship it with the booking block, add pages 2 and 3 the following week. Calendar first, polish second.
