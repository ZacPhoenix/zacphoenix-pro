# Edge Waypoint - Accelerators

The assets, skills, tools, prompts, and Claude-based systems that compress your time-to-revenue and your cost-to-deliver. Ordered by when you'll need them. The principle from the market research applies to you too: **your own operations are the demo.** Every client-visible process Edge Waypoint runs should be quietly excellent, because "how does he run *his* shop?" is the first credibility test.

---

## 1. The Claude Code back office (build first - this is your leverage)

You already know Claude Code. Used deliberately, it's your analyst, proposal writer, project manager, and report generator - the "component tasks around expertise" that AI made cheap, which is exactly how solos now compete with firms.

**Set up one private repo (`edge-waypoint-ops`) as your operating system:**

```
edge-waypoint-ops/
├── CLAUDE.md                  ← encodes your frameworks (starter version in starter-kit/)
├── .claude/skills/            ← your custom skills (two starters provided)
├── playbook/                  ← copies of docs 01-03 from this kit (so Claude can cite them)
├── templates/                 ← intake, proposal, decision one-pager, etc.
├── clients/
│   └── {client-slug}/
│       ├── 00-intake.md           ← their questionnaire answers
│       ├── 01-workshop-transcript.md
│       ├── 02-waypoint-brief.md
│       ├── 03-census.md           ← friction census rows + scores
│       ├── 04-map/                ← audit working files and deliverables
│       ├── 05-pilot/              ← baseline, build notes, weekly updates, decision one-pager
│       └── notes.md               ← relationship notes (kids' teams, the boat)
└── pipeline.md                ← simple CRM: every lead, stage, next action, date
```

Why this beats a SaaS stack at the start: every artifact is plain markdown, every client's full history is in context when you ask Claude anything, and the frameworks in CLAUDE.md mean Claude *applies your methodology* instead of generic consulting slop. Version control gives you an audit trail for free.

**The five skills to build (two are provided in starter-kit/, build the rest as you go):**

| Skill | Input → Output | When |
|---|---|---|
| `/discovery-debrief` ✅ provided | Workshop transcript + intake → Friction Census rows + draft Waypoint Brief | Within 24h of every workshop |
| `/score-opportunities` ✅ provided | Census rows → Opportunity Scorecard with weighted scores, 2x2 placement, solution-ladder hypotheses | During Brief drafting and Map week 2 |
| `/draft-proposal` | Scored census + chosen candidate → Edge Pilot proposal from template, baseline and kill criteria included | Map readout prep |
| `/weekly-update` | This week's notes + last update → 5-line client status in your voice | Every pilot Friday |
| `/pilot-decision` | Baseline + measured results → draft decision one-pager (scale/kill + reasoning) | Pilot week 4 |

Each skill is an hour to write and saves that hour weekly forever. Build `/draft-proposal` the day you book your first Map.

**Claude Code as delivery tool, not just back office:** during Maps and Pilots, use it for stack research ("what integrations does ServiceTitan expose?"), n8n workflow JSON generation and debugging, data-sample cleaning and analysis during audits, and writing the runbooks you hand operators. Your delivery cost is your margin; this is where the margin lives.

## 2. Client acquisition assets (build in week 1-2)

- **One-page website:** positioning paragraph, the four-rung service ladder with prices visible (price transparency is rare in consulting and signals confidence), workshop booking link, your face. Local SEO basics: city name in the title tag, Google Business Profile from day one (you're a local service - reviews there will out-convert the website)
- **The Workshop one-pager (PDF + print):** what happens in 90 minutes, what they leave with, the "sometimes the answer is a $40 tool, not me" line. This is what referral partners forward; make it forwardable
- **The talk deck:** "The Five Operations Problems Every {Vertical} Has - and Why Only One Needs AI." 25 minutes, the Solution Ladder as the centerpiece, two local-flavored worked examples, workshop offer at the end. One deck, re-skinned per vertical
- **Case study template (one page):** Problem (with the annual cost) → What we did (with the ladder rung, including "what we deliberately didn't build") → Numbers after → Owner quote. Write one after every pilot, no exceptions; ask for the quote in the decision meeting while the win is fresh
- **Email sequences:** the outreach scripts (engagement guide) plus a 3-touch follow-up for workshop attendees who didn't convert (day 3: the Brief; day 14: a relevant case study; day 45: "still seeing {their #1 problem}?")

## 3. The tool stack (keep it under $300/month)

| Job | Pick | Why / note |
|---|---|---|
| CRM / pipeline | `pipeline.md` in the ops repo → graduate to [Attio](https://attio.com) or HubSpot Free when >20 active leads | Don't buy a CRM before you have a pipeline problem; that's a rung-2 violation of your own ladder |
| Scheduling | [Cal.com](https://cal.com) or Calendly | Booking link in every signature; removes a full email round-trip per workshop |
| Workshop capture | Phone voice memo + [Whisper](https://github.com/openai/whisper) locally, or Granola/Otter | Always with consent; the transcript feeds `/discovery-debrief`. Local transcription = cleaner data-handling story |
| Delivery / automation | [n8n](https://n8n.io) (self-hosted or starter cloud) | Your rung-4 workhorse. Per-execution pricing (~$50/mo) beats per-operation platforms 10x at AI-workflow volumes, and **self-hosting is a sales feature** for data-sensitive clients. 6,900+ community templates = never start from zero |
| AI components | Claude API (+ client-owned keys where possible) | Rung-5 steps inside n8n workflows. Put API keys in the *client's* account/tenancy: clean handoff, clean liability, no hostage dynamics |
| Proposals / e-sign | [Documenso](https://documenso.com) (open source) or PandaDoc free tier | Fixed-price proposals signed same-week |
| Client-visible project tracking | A shared Notion page or Trello board per pilot, 5 columns max: Backlog / This week / Blocked / Done / Decisions | Visible motion between weekly check-ins kills the "what am I paying for?" anxiety. Keep YOUR system in the ops repo; the client board is a *view*, generated from your notes |
| Async updates | [Loom](https://loom.com) free tier | 3-minute "here's what your workflow does now" videos get forwarded around the client's office - it's marketing they do for you |
| Invoicing / books | Wave (free) or QuickBooks | Invoice the day the milestone lands |
| Insurance | E&O + general liability **before the first pilot** | ~$1-2K/yr. Non-negotiable given the AI-output liability direction (deployers are being held responsible) |

**Dogfood targets (your first three internal automations - each becomes a demo):**
1. Workshop booking → intake questionnaire sent → reminder day before → transcript filed to `clients/{slug}/` (n8n)
2. Friday pipeline review: Claude reads `pipeline.md` and `clients/*/notes.md`, drafts your Monday outreach list with suggested personal touches
3. Pilot telemetry → weekly metrics snippet → drafted client update for your review (n8n + Claude API + `/weekly-update`)

## 4. Prompts that earn their keep (use inside skills or ad hoc)

**The transcript miner** (core of `/discovery-debrief`):
> From this workshop transcript, extract every recurring task mentioned or implied. For each: task, who does it, frequency, time per occurrence (mark estimates as such), failure modes, downstream cost, workarounds mentioned. Quote the speaker's exact words where they reveal pain ("I just retype it", "I chase him every week"). Then list each stated business outcome with the owner's verbatim phrasing. Do NOT propose solutions.

**The ladder challenger** (your design-review devil's advocate):
> Here is a capability gap and my proposed solution: {X}. Argue that it should be solved one rung LOWER on this ladder: eliminate / standardize / configure-what-they-own / off-the-shelf SaaS / low-code glue / AI-assisted step / agentic. Check specifically: unused features in {their named tools}, mature SaaS categories, and whether a template + human beats automation at this volume ({N}/week). Only if the lower rungs genuinely fail, confirm my rung and state the justification in one sentence I can put in the audit.

**The pre-mortem** (before any pilot proposal goes out):
> This pilot failed in week 6. Using these failure modes - no owner, no baseline, wrong problem, no monitoring, data not ready, scope creep, novelty decay - write the three most likely post-mortems for THIS specific pilot: {scope, operator, baseline, client context}. For each: the earliest warning sign and the cheapest prevention I can add to the proposal now.

**The plain-English translator** (every client-facing artifact):
> Rewrite for a busy business owner with no technical background. Cut jargon, keep every number, lead with what it means for their money or time. One page maximum. Do not be condescending - simple, not stupid.

## 5. Skills to develop in yourself (the non-tool accelerators)

1. **Facilitation** - the workshop IS the product's front door. Practice the "walk me through Tuesday" elicitation and comfortable silence. Two rehearsal workshops before the first real one
2. **Reading financial statements (lightly)** - turning friction into P&L language ("this is 1.5 points of margin") is what makes owners move. Your accountant referral partners can teach you over the coffees you're already buying
3. **n8n depth** - error handling, retries, queue patterns, webhook security. The gap between demo-grade and production-grade automation is exactly the gap between rung-4 cowboys and you
4. **Eval/monitoring basics for LLM steps** - golden test sets, spot-check sampling, drift alarms. This is the technical backbone of Waypoint Watch, your recurring revenue
5. **Pricing nerve** - the discipline to quote fixed prices without flinching and raise them after every 2-3 wins. Practice the number out loud; the research says buyers are coached to *expect* boutique rates

## 6. Sequencing (what to build when)

| When | Build |
|---|---|
| Before first outreach | Ops repo + CLAUDE.md + templates; website one-pager; booking link; insurance quote requested |
| Before first workshop | `/discovery-debrief` skill; intake form; transcription pipeline; rehearsal done |
| Before first Map | `/score-opportunities` + `/draft-proposal`; stack-research prompt patterns |
| Before first pilot | n8n production patterns (error handling, alerting); client project board template; E&O active |
| Before fifth client | Dogfood automations 1-3; case studies 1-2 published; first talk booked |
| Month 6 | Revisit: CRM graduation, pricing raise, whether Watch tooling (dashboards, automated metrics) deserves a build sprint |

The trap to avoid: building all of this before talking to anyone. The kit above is deliberately front-loaded toward *acquisition* assets. Workshops on the calendar come first; tooling exists to serve them.
