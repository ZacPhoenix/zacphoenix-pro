# Edge Waypoint - Client Engagement Guide

The stage-by-stage operating playbook, from first contact to renewal. Templates referenced here live in [starter-kit/templates/](starter-kit/templates/).

---

## Stage 0: Outreach

**Goal:** a 90-minute Waypoint Workshop on the calendar. Nothing else. You never sell audits, pilots, or AI in outreach - you offer the workshop.

**Weekly rhythm:** 10 personalized outreach touches + 1 networking event + 1 referral-partner coffee. Track all of it in the CRM (see accelerators doc); outreach you don't track didn't happen.

### Cold email / LinkedIn script (adapt per vertical)

> Subject: 90 minutes, your team's most expensive annoyances
>
> Hi {first name} - I run Edge Waypoint, a local consultancy here in {area}. I do one thing: help businesses like {company} find which operational headaches are actually worth fixing, and which aren't.
>
> I run a 90-minute working session with owners and their key people. We map where the hours actually go, put a dollar figure on the worst of it, and you leave with a written brief of your top three problems and what I'd do about each - which is often "buy a $40/month tool," not "hire me."
>
> {Personalized line: something specific about their business - a review mentioning slow quotes, a job posting for an admin role, growth news.}
>
> It's free, on site, and useful even if we never speak again. Worth 90 minutes in the next few weeks?

### Referral partner script (for accountants, MSPs, bookkeepers)

> You see inside more local businesses than anyone, and I'd bet you get asked "should we be doing something with AI?" weekly. I give your clients a straight answer - including "no" when that's the truth. I run a free 90-minute session that maps their operational friction and puts numbers on it. If something's worth fixing, I fix it with the smallest thing that works. If a client of yours could use that, I'd love an intro - and I send work back: every audit I do surfaces bookkeeping and systems gaps I can't and shouldn't touch.

### Qualification (before booking)

Confirm: owner or GM will personally attend; 5+ employees; they can name at least one recurring frustration unprompted. If the owner won't attend, don't book - workshops without the decision-maker produce briefs nobody acts on.

---

## Stage 1: The Waypoint Workshop (90 minutes, on site)

**Goal:** produce raw material for a Waypoint Brief that makes the audit feel inevitable - and build the personal trust that is your actual moat.

### Pre-work (send 3 days ahead)

The 6-question intake (template: `intake-questionnaire.md`). Two minutes of their time; it primes them to think in problems, not tools, and tells you which staff to ask for.

### Agenda

| Time | Segment | What you do |
|---|---|---|
| 0:00-0:10 | Frame | Who you are, the ground rule ("we're hunting problems today, not buying anything - and some of what we find won't need me at all"), consent to record/transcribe for your notes |
| 0:10-0:30 | Outcomes | Ask the owner: "If one part of this business ran itself flawlessly, which would you pick?" and "What stops you taking on 20% more business next quarter?" Capture verbatim. These are the *outcomes*; everything later maps back to them |
| 0:30-1:00 | **Friction Census** | The core. Go role by role: "Walk me through Tuesday." For every recurring task capture: what it is, who does it, how often, how long, what breaks, what it delays. Sticky notes or a shared sheet. Push past the first answers - the expensive friction is usually the stuff they've stopped noticing ("oh, we always retype that") |
| 1:00-1:15 | Live scoring | Put the census items up. Score the top candidates together on Impact and Effort (the simple 2x2 from the frameworks doc). Doing this *with* them transfers ownership of the conclusions |
| 1:15-1:30 | Next waypoint | Name the top 3 candidates aloud. Tell them what the Waypoint Brief will contain and that it arrives within 48 hours. If energy is high, describe the Map (the audit) plainly, price included. Do not push; the Brief sells |

### Facilitation rules

- **You write, they talk.** Aim for 80% client airtime in the middle hour.
- **Chase numbers in the room:** "How many quotes a week? How long does each take? Who does it?" Ballpark numbers captured live become the Brief's dollar figures.
- **Never name a tool in the workshop.** The moment you say "n8n" or "Claude," the conversation becomes about technology instead of their business. Solutions live in the Brief.
- **Record with consent**, transcribe after. The transcript feeds the `/discovery-debrief` skill (see starter kit).

### Follow-up (within 48 hours - this deadline is sacred)

Send the **Waypoint Brief** (2 pages, generated with the `/discovery-debrief` skill, then edited by you):

1. What we heard (their words, their outcomes)
2. Friction Census table with annualized cost estimates (the time-math from the frameworks doc)
3. Top 3 problems with a one-line *capability* statement for each and a preliminary solution-ladder guess ("likely a configuration of {tool they own}," "likely a light automation," "possibly an AI-assisted step - needs the audit to confirm")
4. The recommendation: a Waypoint Map covering the top 3, fixed price, two weeks, deliverables named

The Brief is free consulting and it's deliberately good. It demonstrates the product, and the "this one probably doesn't need me" lines do more selling than any pitch.

---

## Stage 2: The Waypoint Map (audit, 2 weeks)

**Goal:** turn the top 3 problems into scored, costed, solution-matched recommendations with one clear pilot candidate.

### Week 1 - Evidence

- **Kickoff (30 min):** confirm scope, name the client-side contact, book all week-1 interviews on the spot
- **Shadow and interview** the 2-4 people who live inside the top-3 workflows. Watch the actual work; "show me, don't tell me." Capture the workaround spreadsheets - they mark the real process
- **Stack and data inventory:** every system touched, what they pay for it (owners are routinely shocked), where the data lives, what's clean vs. garbage. Apply the **data readiness gate** (frameworks doc §7) to anything that might become a build
- **Baseline measurement:** for each candidate, document current cycle time, frequency, error/rework rate, and who touches it. No baseline, no pilot - this is non-negotiable and you say so

### Week 2 - Analysis and readout

- Run each problem through the full framework chain (frameworks doc): problem type → capability statement → Solution Ladder → AI-fit checklist where relevant → MVA sketch
- **Classify the client's delivery mode** (frameworks §4b): full custom, fix-and-implement, or AI layer. The mode shapes the whole readout - and if the data readiness gate failed, the readout proposes the data-structure cleanup as its own fixed-price engagement, not as a buried caveat. Say the mode out loud in the readout: "you're a fix-and-implement shop; the honest first project here is the data, not the robot"
- Score everything on the Opportunity Scorecard; rank
- **Readout meeting (60-90 min, in person):** walk the owner through the Map. Lead with their words from the workshop, then the numbers, then the recommendations. End on the one pilot candidate you'd stake your reputation on - and the proposal for it

### Map deliverables (every one named in the proposal)

1. Current-state workflow maps (the 2-3 that matter, one page each)
2. Friction Census, costed and ranked (Opportunity Scorecard)
3. Per-problem recommendation: solution-ladder rung, named tools/approach, rough cost to implement and run, and explicitly which problems do NOT need a build
4. 90-day roadmap (sequence, dependencies, data-readiness work flagged)
5. Edge Pilot proposal for candidate #1 (template: `proposal-pilot.md`)

**Map rules:** if the audit reveals all three problems resolve at ladder rungs 1-3 (process fixes and off-the-shelf tools), say so plainly and charge nothing extra for the honesty. You've earned a referral machine and a Watch client - the relationship outlasts the project. This outcome is a *win*, and it will happen often.

---

## Stage 3: The Edge Pilot (4 weeks, hard stop)

**Goal:** one workflow live in production, beating its baseline, with a trained client-side operator - or a clean, honest kill.

### Preconditions (all four, or the start date moves)

1. **Named operator** on the client side - the person who runs the workflow daily, not the owner. They attend the weekly check-ins
2. **Baseline documented** and agreed in writing (it's in the proposal)
3. **Success threshold and kill criteria** agreed in writing (also in the proposal: "we recommend killing this if it doesn't beat baseline by X")
4. **Access ready:** accounts, API keys (in *their* names/tenancy), data samples, before day 1

### The four weeks

| Week | Theme | Output |
|---|---|---|
| 1 | Build the spine | Thinnest end-to-end version of the workflow working on real data, however ugly. No polish |
| 2 | Real volume | Operator starts using it in parallel with the old way. You watch failure cases and fix the top ones |
| 3 | Harden + handoff | Error handling, monitoring/alerts, the runbook. Operator runs it with you watching, not the reverse |
| 4 | Measure + decide | Compare against baseline. Produce the **Pilot Decision One-Pager** (template). Decision meeting with the owner: scale, extend-with-cause, or kill |

### Cadence and rules

- **Weekly 30-minute check-in** with operator + owner, same slot every week. Agenda: what shipped, what's measured so far, what's blocked, what's next. Send a 5-line written summary after (generated with `/weekly-update`, see starter kit)
- **The change rule:** anything new discovered mid-pilot is logged as a *future waypoint*, never absorbed. "Great idea - that's waypoint #4, I'll add it to the roadmap" protects the four-week box
- **No extension theater.** "It just needs another couple of weeks of tweaking" is the documented death spiral (78% of SMB pilots die in exactly this purgatory). Extensions happen only for named, bounded causes (e.g., a vendor API approval), with a new fixed end date
- **A kill is a deliverable.** If it doesn't beat baseline, the one-pager says so, says why, and says what you'd do instead. You will lose the scale-up revenue and gain a client for life. This is the reputation trade that builds a local consultancy

---

## Stage 4: Waypoint Watch (retainer) and expansion

- Pitch Watch in the pilot decision meeting as the default next step, not an upsell: "Deployed systems drift - models change, APIs change, volumes change. Watch is how this keeps working." Include the first month in the pilot price if it closes the deal
- **Monthly:** drift/error review, cost report (their AI/tool spend, with anomalies flagged), small fixes and iterations within a defined hours cap, one-page metrics summary in plain English
- **Quarterly:** a 60-minute re-scan against the 90-day roadmap - which is the natural origin of the next Map or Pilot. Expansion at existing clients will outpace new logos by month 6; protect the quarterly rhythm
- **Annual:** refresh the Friction Census. Businesses change; last year's rung-3 answer may be this year's rung-5 opportunity

## The relationship layer (the actual moat)

- Every deliverable lands **in person or on a call first**, document second. Never let a PDF do the talking
- Quarterly client lunches with no agenda. Note personal details in the CRM (kids' teams, the boat, the new hire) - small-town consulting runs on remembering
- Introduce clients to each other when it helps them. Being the node in the local network is worth more than any campaign
- Ask for the referral at the moment of demonstrated value (the pilot decision meeting where you beat baseline - or honorably killed), with a specific shape: "Who else do you know who's drowning in {the problem you just solved}?"
