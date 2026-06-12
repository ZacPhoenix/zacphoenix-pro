# Edge Waypoint - Analyst Frameworks

The diagnostic toolkit. These frameworks are the product: they're how you triage high-value problems fast and arrive at the *minimum viable architecture* - the smallest set of components that enables the capabilities that drive the outcome the client actually wants.

The chain that runs through everything:

> **Outcome → Capability → Solution.** Never start with tools. Define the business outcome, decompose it into the capability gaps blocking it, then pick the lowest solution-ladder rung that closes each gap.

---

## §1. The Outcome-Capability-Solution (OCS) chain

Every engagement artifact maps backward to an outcome the owner said out loud.

1. **Outcome** - a business result with a number and a timeframe. "Quote jobs in 24 hours instead of 5 days." "Free up 10 admin hours/week." "Stop losing leads that come in after 5pm." If you can't state it with a number, you're not done asking.
2. **Capability** - what the business must be *able to do* for the outcome to happen, stated tool-free. "Capture site measurements digitally at the visit." "Generate a draft quote from a standard pricing model." "Route after-hours inquiries to next-morning follow-up automatically."
3. **Solution** - the cheapest, simplest thing that provides each capability (see the Solution Ladder, §4).

**The MVA test:** for each component in a proposed solution, ask "which capability does this enable, and which outcome does that capability drive?" A component with no answer gets cut. This single question kills most over-engineering, including most AI.

Worked example:
- Outcome: quotes out in 24h (currently 5 days; ~2 lost jobs/month attributed to slow quotes ≈ $90K/yr)
- Capabilities: (a) capture job details digitally on site, (b) standard pricing model instead of "Dave does it in his head", (c) draft generation, (d) owner approval step
- Solutions: (a) a form app they already have in Microsoft 365 → rung 2; (b) a structured spreadsheet built with Dave → rung 1; (c) template + merge, *possibly* LLM-drafted free-text sections → rung 1 or 5; (d) an approval email → rung 1
- MVA: mostly process and configuration. The only AI candidate is the free-text drafting, and only if (c) proves slow without it. That's the answer the client can't get from an AI agency.

---

## §2. The Friction Census (problem capture)

Run in the workshop, deepened in the audit. For every recurring task, capture one row:

| Field | Prompt |
|---|---|
| Task | What's the work, in one sentence? |
| Who | Role(s) that touch it |
| Frequency | Per day/week/month |
| Time per occurrence | Honest estimate, include the context-switch |
| Failure modes | What breaks, gets retyped, gets forgotten, gets chased? |
| Downstream cost | What does it delay or put at risk? (cash, jobs, customers, compliance) |
| Workarounds | The spreadsheet/sticky-note system that grew around it (workarounds mark the real process and the real pain) |

**Elicitation technique:** "Walk me through Tuesday" beats "what are your problems?" People don't report friction they've normalized. Listen for: "we always have to...", "I just retype it...", "I chase him every week for...", "only Dave knows how to...". Each is a census row.

**The second probe that earns its keep** (stolen verbatim from [@Timur_Yessenov's reply to @lukepierceops](https://x.com/lukepierceops)): **"Where does work currently die here - somebody's inbox, a spreadsheet, a CRM field, or waiting on an approval?"** The four options make it answerable on the spot, and the answer does double duty: *where* it dies points at the job to be done, and *what it dies in* tells you the client's delivery mode (§4b). The answer is very often the first pilot.

---

## §3. Triage: the time-math and the Opportunity Scorecard

### 3a. Baseline time-math (do this arithmetic in the room)

```
Annual cost = hours per occurrence × occurrences per week × 48 × loaded hourly rate
Loaded hourly rate ≈ (salary × 1.35) / 2000        (or: hourly wage × 1.35)
```

Quick anchors: an admin at $22/hr loads to ~$30/hr; an owner's hour is worth $100-200+ in opportunity cost. A "small" task at 45 min/day for one admin ≈ **$5,400/yr**. Quote-chasing at 5 hrs/week of the owner's time ≈ **$36,000/yr**. Add hard downstream costs where claimable (lost jobs × average margin, error rework, late fees). Use ranges; precision theater erodes trust.

### 3b. Opportunity Scorecard (rank the census)

Score each candidate 1-5 on six axes:

| Axis | 5 means | 1 means | Weight |
|---|---|---|---|
| **Impact** | >$50K/yr value (time + revenue + risk) | <$5K/yr | ×3 |
| **Frequency** | Many times daily | Quarterly or rarer | ×2 |
| **Feasibility** | Data digital and accessible; process stable; 0-1 systems to integrate | Paper/tribal knowledge; process changes monthly; 3+ systems | ×2 |
| **Ownership** | A named person feels the pain daily and wants it fixed | "Someone should..." (nobody owns it) | ×2 |
| **Simplicity** | Solvable at ladder rung 1-3 | Requires rung 5-6 | ×1 |
| **Risk-inverse** | Internal-only, low stakes if wrong | Customer-facing, regulated, money-moving | ×1 |

Max score 55. **≥40 = pilot candidate. 28-39 = roadmap. <28 = park it** (revisit at the quarterly re-scan). The weights encode the failure research: Ownership and Feasibility are weighted because "no owner" and "data not ready" are the two most common pilot killers, not because the math demands it.

### 3c. The 2x2 (for the workshop wall)

Impact (annualized $) vs. Effort (ladder rung + integration surface):

- **High impact, low effort → Quick wins.** Pilot here first; momentum compounds trust
- **High impact, high effort → Strategic bets.** Roadmap, after data-readiness work, never as a first engagement
- **Low impact, low effort → Fill-ins.** Bundle into Watch retainer work
- **Low impact, high effort → Money pits.** Name them in the readout and say why you won't touch them. Saying it builds more credibility than any sale

---

## §4. The Solution Ladder (minimum viable architecture)

For each capability gap, start at rung 0 and **justify every step up in writing.** The client pays for the lowest rung that delivers the capability.

| Rung | Class | Default cost shape | Choose when |
|---|---|---|---|
| 0 | **Eliminate** - stop doing the task | Free | The task exists for a reason nobody can name ("we've always sent that report" - to whom? why?) |
| 1 | **Simplify/standardize** - checklist, template, SOP, renegotiated handoff | Hours of your time | Variance and tribal knowledge are the problem, not labor volume |
| 2 | **Configure what they own** - unused features of tools already paid for (M365/Google Workspace, QuickBooks, their CRM/FSM, their e-comm platform) | $0 incremental | The capability ships in something they already pay for. *Check this rung explicitly every time* - SMBs use ~20% of what they buy |
| 3 | **Off-the-shelf SaaS** - a purpose-built tool | $20-200/mo | A mature category solves it whole (scheduling, e-sign, forms, review management, phone systems) |
| 4 | **Low/no-code glue** - n8n/Make/Zapier connecting existing systems | $50-100/mo + build effort | The problem is *data moving between systems* or rule-based routing/notification. The biggest single class of SMB friction lives here |
| 5 | **AI-assisted step inside a workflow** - an LLM doing one job (classify, extract, draft, summarize) inside a rung-4 pipeline, with human review where it faces outward | API costs + build effort | The input is unstructured (emails, PDFs, photos, voice) or the step needs judgment-like processing at volume. See the AI-fit checklist, §5 |
| 6 | **Agentic / custom build** - multi-step autonomous systems, custom apps | Significant build + ongoing care | Volume, complexity, and proven ROI from a rung-5 success justify it. Almost never a first engagement |

**Ladder rules:**

- "Configure before buy, buy before glue, glue before AI, and never agentic before an AI-assisted step has already paid for itself."
- A rung-5 solution is an LLM **inside** a workflow, not a workflow inside an LLM. The pipeline is deterministic; the model does one bounded job with a defined input and output. This is what makes SMB AI maintainable.
- Mixed answers are normal: one outcome usually decomposes into capabilities at different rungs (see the §1 worked example).

**Problem-type → default rung mapping** (diagnosis shortcuts; verify, don't assume):

| Census pattern | Problem type | Default solution class |
|---|---|---|
| "We retype it from X into Y" | Data transfer | Rung 4 (integration), check rung 2 first (native sync often exists) |
| "Where is that job/order/file?" | Visibility | Rung 2/3 (shared source of truth, dashboard) |
| "We write the same document over and over" | Repetitive creation | Rung 1 (template) → rung 5 (LLM drafting) only at volume |
| "Stuff comes in and sits until someone sorts it" | Triage/routing | Rung 4 (rules) → rung 5 (AI classification) only if input is unstructured |
| "We process emails/PDFs/photos by hand" | Unstructured input | Rung 5 (extraction) - the strongest honest AI case in SMB |
| "Scheduling is chaos" | Coordination | Rung 3 (mature SaaS category, don't build) |
| "Only Dave knows" | Knowledge concentration | Rung 1 (document it) → rung 5 (retrieval/Q&A) later |
| "We just don't have enough hands" | Capacity | Not an automation conversation - hiring/outsourcing/pricing. Say so |

---

## §4b. The whole menu: four jobs, three delivery modes

A practitioner heuristic worth adopting wholesale - from [@lukepierceops](https://x.com/lukepierceops) (June 2026, after "systems for 85+ companies"): *"People starting AI agencies think they need to learn 50 different services... You're only ever doing 4 things for a client... 4 services with 3 delivery modes. That's the entire menu. The complexity people are scared of doesn't exist."* It compresses everything Edge Waypoint sells into a grid you can hold in your head mid-conversation.

### The four jobs (the order IS the methodology)

| # | Job | In Pierce's words | Ladder rungs | Edge Waypoint fit |
|---|---|---|---|---|
| 1 | **Process improvement** | "Find what's broken, fix it before touching a tool" | 0-1 | Workshop + Map findings; often the free advice in the Brief |
| 2 | **Workflow automation** | "Remove the manual steps that eat your team's week" | 2-4 | The bread-and-butter Edge Pilot |
| 3 | **Data structure** | "Centralize everything so the business has one source of truth" | the §6 gate, *promoted to a service* | A billable fixed-price engagement in its own right - see below |
| 4 | **AI integration** | "Layer intelligence on top of the clean foundation you built" | 5-6 | Only pilots that pass §5, and never before jobs 1-3 are sound |

**The upgrade this gives the kit:** §6 treats data readiness as a *gate* - a precondition that blocks pilots. The menu reframes it as a *product*. When the gate fails, don't bury it as a caveat in the readout - **quote it**. Data-structure work (centralizing the job records, deduplicating the customer list, making the spreadsheet-that-acts-like-a-system into an actual system) is low-risk, visibly valuable on its own (the owner finally gets one source of truth), and it makes every later automation and AI engagement both possible and stickier. For messy-systems clients it is usually the correct *first paid project*, ahead of any automation.

### The three delivery modes (classify every client during the Map)

| Mode | You'll recognize it by | Scoping and sequencing implication |
|---|---|---|
| **Full custom** | Still on Excel sheets and shared folders | Greenfield: discovery is fast (nothing to untangle) but jobs 1-3 all need doing before job 4 is discussable. Longest roadmap; start with the smallest win |
| **Fix and implement** | Infrastructure exists but it's messy | This is where §6's 2-3x discovery multiplier lives. Job 3 (data structure) is the natural first engagement; automation rides on the cleaned foundation |
| **AI layer** | Stack is solid, data is clean | The rare client where a rung-5 pilot is a legitimate first project. Fastest payback, shortest engagement - and the easiest mode to misdiagnose, so verify the foundation before believing the owner's description of it |

The mode drives price as much as scope: full-custom clients buy a sequence, fix-and-implement clients buy cleanup-then-build, AI-layer clients buy speed. Saying the mode out loud in the readout ("you're a fix-and-implement shop - the honest first project is the data, not the robot") is itself a credibility move: it tells the owner you've seen enough businesses to know the pattern theirs fits.

---

## §5. The AI-fit checklist (when AI actually is the answer)

Run only for capabilities that survived to rung 5. **All of the green-light conditions, none of the red lights:**

**Green lights (need all):**
- [ ] Input is unstructured or semi-structured (free text, documents, images, voice)
- [ ] The step is judgment-*like* but describable: a competent temp could do it with a one-page instruction sheet (if you can't write that sheet, you can't prompt it either)
- [ ] Volume is real: the step happens 10+ times/week (below that, a human with a template wins on total cost)
- [ ] Output is verifiable: a human can check it quickly, or errors are cheap and reversible
- [ ] A measurable baseline exists (time, error rate, throughput)

**Red lights (any one kills or reshapes it):**
- [ ] Deterministic computation in disguise (pricing math, tax, payroll) - that's rungs 1-4, never an LLM
- [ ] Zero error tolerance with no review step possible (money movement, compliance filings, medical/legal advice)
- [ ] Customer-facing in a regulated context without human sign-off (the liability chain is live: courts are holding deployers responsible for AI output)
- [ ] The needed data isn't digitized or accessible (fix that first - it's its own roadmap item, see §6)
- [ ] The client wants "AI" for board/marketing optics with no owned workflow attached (decline gracefully; sell the Map instead)

**Default architecture for anything customer-facing: draft-and-review.** AI writes, a named human approves and sends. End-customer AI fatigue is real and measurable; "indistinguishable from a careful human, with a human escape hatch" is the bar. Internal back-office automation carries none of this risk, which is one more reason the best first pilots are internal.

---

## §6. The data readiness gate

Before any rung 4-6 recommendation reaches a proposal, score the data it depends on:

| Check | Pass | Fail consequence |
|---|---|---|
| Digitized? | It exists as files/records, not paper or memory | Digitization becomes a roadmap line item *before* the pilot |
| Accessible? | Export, API, or integration exists and the client controls credentials | Vendor lock-in workaround needed - cost it honestly |
| Clean enough? | A sample of 20 records: would a human reliably do the task from them? | Cleanup is scoped and *priced* as its own line - unscoped data debt is the #1 silent pilot killer |
| Stable? | Format/process hasn't changed in 6 months | Stabilize the process (rung 1) before automating it |

Rule of thumb from the field: ~5 SaaS tools with clean spreadsheets ≈ a week of stack analysis; 10+ tools with homegrown databases ≈ 2-3x. **Price discovery by integration surface, not headcount.**

---

## §7. Baseline, success thresholds, and the kill discipline

- **Baseline before build, in the proposal:** current cycle time, frequency, error/rework rate, hours consumed, measured or estimated-with-method during the Map. No baseline, no pilot.
- **Success threshold:** the specific delta that justifies scaling (e.g., "quote turnaround ≤24h on 80% of quotes" / "≥6 admin hours/week recovered, measured over weeks 3-4"). Set it *with* the owner so the week-4 decision is theirs as much as yours.
- **Kill criteria, in writing, in the proposal:** "If the pilot does not beat baseline by {threshold} by the end of week 4, Edge Waypoint will recommend terminating it, in writing, and will say what we'd do instead." This sentence wins deals - every owner has read about or lived a zombie pilot.
- **Week-4 decision one-pager:** original baseline, measured result, cost to run, binary recommendation (scale / kill), and if kill: root cause + alternative. Extension is allowed only for a named external blocker with a new fixed date - "needs more tweaking" is a kill wearing a costume.

---

## §8. Field-rapid versions (for live use)

**The 5-question triage** (when an owner corners you at a chamber lunch):
1. What's the task? 2. How often, how long, who? (→ do the time-math out loud) 3. What system does the information start in and end in? 4. Who'd own the fix day-to-day? 5. What happens when it's done wrong?
Then: "That sounds like roughly ${X}/year. It's probably a {rung-class} fix. Worth a workshop?"

**The two-question AI filter** (when anyone asks "could AI do this?"):
1. "Is the input messy - emails, PDFs, photos, calls?" (No → it's automation or configuration, cheaper and more reliable.)
2. "Could a smart temp do it with a one-page instruction sheet?" (No → it's not ready for AI either.)

**The MVA mantra** (for your own design reviews): *every component must name its capability; every capability must name its outcome; anything that can't, goes.*
