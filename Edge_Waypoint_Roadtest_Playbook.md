# Edge Waypoint Road-Test Playbook

**Purpose:** End-to-end engagement playbook for road-testing the Edge Waypoint methodology with a free SMB pilot client.
**Use when:** First field trial of the methodology with a willing, low-risk client. You are optimizing for *two* outcomes simultaneously: real value for the client, and validated learning about the methodology itself.
**Engagement shape:** ~2-3 calendar weeks, ~30-50 hours of your actual work, one Outcome taken end-to-end through a Walking Skeleton Build.

---

## What this playbook is — and isn't

This is a **compressed and opinionated subset** of the full Field Guide. It removes ceremonies that exist for paying-client politics, drops the multi-Outcome roadmap discipline (you'll deliver one Outcome, well), and folds in the six high-ROI additions from the pressure test:

1. TOC constraint question at Ring 2
2. **Cost** in place of **Reach** in the needs taxonomy
3. One-page business case for the chosen Outcome
4. ADKAR pre-assessment for affected stakeholders
5. Day 30 / 90 / 180 Care Plan checkpoint template
6. Pre-mortem at kickoff

Two layers of objectives run in parallel:

| Layer | Goal |
|---|---|
| **Client layer** | Ship one well-scoped Solution that meets a measurable Target by handoff |
| **Methodology layer** | Pressure-test every artifact, script, and decision under real conditions; capture what worked and what didn't |

Carry both objectives through every phase. A silent retrospective at the end is what converts this from a free favor into capital you can use on paying engagements.

---

## Engagement timeline at a glance

```
PHASE 0      PHASE 1            PHASE 2       PHASE 3            PHASE 4       PHASE 5
SETUP    →   DIAGNOSE       →   DECIDE   →    BUILD          →   HANDOFF   →   CHECKPOINTS
~3 days      ~5 days            ~2 days       ~5-8 days          ~1 day        Day 30 / 90

Pre-read     Five Rings         Solution      Walking Skeleton   Verification  Adoption health
Access       interviews         Composition   Iterate to         Care Plan     Methodology
Pre-mortem   Shadowing          Business      acceptance         setup         learning
ADKAR        Six-Move flow      case          Train champion                   capture
```

You can compress this to 2 weeks if the chosen Outcome is small (a single workflow automation), or stretch to 3-4 weeks if it's larger (e.g., a no-code stack involving Brain + Nerves + Skin). Don't stretch past 4 weeks — at that point you're road-testing engagement-management, not the methodology.

---

# Phase 0 — Setup (~3 days before kickoff)

## What to do

### 0.1 Set the road-test contract clearly

Have a 30-minute conversation with the client. Use these exact framings:

- "I'm doing this for free because I'm road-testing a methodology I've built. Your job is to be a real client. My job is to deliver real value *and* learn what works."
- "We'll go end-to-end on **one** problem you have. Not three. Not a roadmap. One Outcome, one Solution, shipped."
- "I need three things from you: an hour of your time twice a week, access to talk to 2-3 people who actually do the work, and honest feedback on what's clicking and what isn't."
- "If at any point this isn't valuable to you, tell me, and we stop."

Send a follow-up email with these four points in writing. This is your "contract." It does the work of an SOW for a free engagement.

### 0.2 Send the pre-read

Two attachments:
1. A one-pager describing the diagnostic shape (you can adapt the doc's *How to read this guide* page).
2. A short questionnaire for the sponsor:
   - Top three places where you lose time, money, or sleep
   - Three people whose work I should observe
   - Two recent failures or near-misses worth understanding
   - Tools currently in use (just a list, no tour)

### 0.3 Get access

Read-only access to: the CRM, the shared drive, the financial system, the project tracker (whatever exists). If you can't get this in Phase 0, your first kickoff agenda item is to fix it.

## Why this matters

The "free" framing changes client behavior in two ways: they over-give politeness ("yes, that's helpful!" when it isn't) and under-give time ("I'm too busy this week"). The explicit road-test contract counters both. You're licensing them to be honest and obligating them to give time.

The pre-read does work the kickoff would otherwise do — by the time you sit down on Day 1, you've already absorbed the surface layer and can spend the kickoff on what only the kickoff can do (rapport, ADKAR signal, pre-mortem).

## Methodology learning to capture

- Did the road-test framing land? (yes/no — and what reaction did it get?)
- Did the pre-read get answered? (count of questions answered honestly vs. skipped)
- What was wrong about your assumptions before kickoff?

---

# Phase 1 — Diagnose (~5 days)

## Day 1: Kickoff + sponsor interview + pre-mortem (~3 hours)

### Kickoff (45 min)
- Restate the road-test contract.
- Confirm timeline and the single-Outcome scope.
- Confirm who you'll talk to (2-3 names).
- Set a standing 30-min sync (twice weekly).

### Sponsor interview (60 min) — Five Rings, modified
Use the doc's 60-minute interview structure, but **with three edits**:

1. **At Ring 2 (Unit Economics), add the TOC constraint question explicitly:**
   > *"If you doubled your sales tomorrow, what would break first? Where would the work pile up? Who would be drowning?"*
   
   That answer names your system constraint. Write it down word-for-word.

2. **At Ring 3, when classifying the friction by need, use the modified taxonomy:** Capacity, Speed, Quality, Visibility, Knowledge, **Cost** (not Reach). Cost catches "margins are squeezed" or "we're not making enough" cleanly; the original Reach category will pull you toward marketing problems you don't want to solve in this engagement.

3. **End with:** *"What did I forget to ask?"* and *"What were you hoping I'd ask but I haven't?"*

### Pre-mortem (20 min) — at the end of the kickoff
> *"Imagine it's three weeks from now and this engagement has failed. We're having an awkward conversation about what went wrong. What's the most likely reason?"*

Write down every reason they offer. Add your own. The top 2-3 become your **engagement risk register** — one line each, monitored weekly.

## Day 2-3: Role interviews and shadowing (~6-8 hours)

Two role interviews (30-45 min each) with the people the sponsor named. Same modified Five Rings, compressed. **The killer question is non-negotiable:**

> *"Walk me through yesterday from the moment you sat down at your desk."*

Follow each interview with **30-60 minutes of silent shadowing**. Record what you see using the table from §7.2 of the Field Guide (tab count, copy-paste events, manual retyping, interruptions, workarounds, decision bottlenecks).

### ADKAR pre-assessment — embed in the role interviews
Before ending each interview, ask these five quick questions and score 1-5 silently afterward:

| ADKAR stage | Question | What you're listening for |
|---|---|---|
| Awareness | "Has [the sponsor] talked to you about why we're working on this?" | Do they know change is coming, and why? |
| Desire | "If we ended up changing how [their workflow] runs, would that be welcome or unwelcome for you personally?" | Are they personally motivated, neutral, or resistant? |
| Knowledge | "If we asked you to use a new tool tomorrow, what would you need to know first?" | Skill gap depth |
| Ability | "When you've adopted new tools in the past, how did it go?" | Past patterns predict future ones |
| Reinforcement | "Six months after you adopt something new, does it usually stick or does it drift back?" | Cultural pattern of stickiness |

Record each person on a 5×N grid (5 stages × N stakeholders). The lowest cells are your **Adoption Aspect's actual scope of work**. Don't invent training where Knowledge is already at 4-5; don't skip champion-building where Desire is at 1-2.

## Day 4: Synthesis + Six-Move flow on top friction (~3 hours)

By Day 4 you should have a messy list of 8-15 friction points. Don't try to clean them all. **Pick the single biggest one** — the one that:
- Maps to the system constraint named on Day 1, OR
- Got the loudest emotional reaction in interviews, OR
- Connects most clearly to a number the sponsor cares about

Run the Six-Move Diagnostic Flow on this single friction:

1. **Sharpen** the friction in precise language
2. **Test** the underlying need (Capacity / Speed / Quality / Visibility / Knowledge / Cost — pick one primary)
3. **Find** the consequence (operational + financial)
4. **Walk** the Goal Decomposition Ladder (Aspiration → Metric → Baseline → Target → Timeframe → Testable State)
5. **Anti-criteria** check ("If we hit the Target but X also happened, would it count as success?")
6. **Trace-down** test ("Can I imagine a Solution that would move this Target?")

Output: one well-formed Outcome record. Use the template from §9.8 of the Field Guide.

## Day 5: Validate the Outcome with the sponsor (~60 min)

Show them the Outcome record. Read it aloud word-for-word. Three questions:

1. "Is this what you actually meant?"
2. "If we hit the Target by [date], would that genuinely change the business?"
3. "Anything missing from the anti-criteria?"

Iterate live. Walk out with a sponsor-confirmed Outcome.

## Why Phase 1 matters

The whole methodology stands or falls on whether the Outcome is well-formed. If you over-invest anywhere, invest here. The compressed Five Rings still produces enough signal for one Outcome — it would not produce enough for ten, which is why you're not trying.

The TOC constraint question is the single highest-leverage edit because it prevents the most common failure mode: a beautifully scoped Solution that addresses a non-constraint and produces no system-level change.

The ADKAR pre-assessment is what tells you whether your Adoption Aspect is real work or theater. Most consulting failures are adoption failures dressed as build failures; this is your earliest warning system.

## Methodology learning to capture

- Did the modified Ring 2 question (constraint) produce a different answer than business-as-usual? (yes/no, with notes)
- Did **Cost** pull up frictions that **Reach** would have missed? (yes/no, with examples)
- How long did the Six-Move flow actually take? (minutes — the doc claims 15-20; check it)
- What ADKAR scores predicted what behavior? (worth checking again at handoff)

---

# Phase 2 — Compose & Decide (~2 days)

## Day 6: Solution Composition Canvas + business case (~3 hours)

### Solution Composition Canvas (90 min)
Fill out the Canvas from §11.2 of the Field Guide. **All five Aspects, even if minimal.** For a road-test engagement you'll likely scope:

| Aspect | Typical road-test scope |
|---|---|
| **Build** | One Walking Skeleton — narrowest end-to-end slice that proves the pattern. Default stack: Airtable + Make + (Softr only if a portal is needed) |
| **Process** | One updated workflow doc, written as bullets, not BPMN |
| **Adoption** | Whatever the lowest ADKAR cells told you to do. If everyone's at 4-5 across the board, mark this "minimal" with a note |
| **Measurement** | One number you'll re-measure at handoff. Same number, same source, same method as the baseline |
| **Governance** | Named internal owner; you on call for 30 days |

Mark any Aspect "minimal" or "deferred" with a *documented reason* (this is the key discipline). Don't N/A everything to make life easy — that's the road-test failing.

### One-page business case (60 min)

Single page. Three sections:

**1. The math**
- Baseline cost (today's): hours × hourly rate, or revenue lost, or errors × cost per error
- Target cost (after Solution): same calc
- Annualized savings: (Baseline − Target) × frequency × 12
- Implementation cost: rough hours × what you'd charge if this were paid

**2. The payback period**
- Implementation cost ÷ monthly savings = months to payback
- For a road-test you can use your would-be paid rate; this gives the sponsor real ROI math even though they're not paying

**3. The sensitivity range**
- Pessimistic case: half the savings, double the implementation cost
- Optimistic case: 1.5× the savings, on-time implementation
- Most likely: best-guess

Don't model in a spreadsheet — write it on a single page. The discipline is in *naming* the numbers, not in their precision.

## Day 7: Sponsor decision meeting (~60 min)

Walk through:
1. The Outcome (5 min)
2. The Solution Composition Canvas (15 min)
3. The business case (10 min)
4. The risk register from the Day-1 pre-mortem, updated (5 min)
5. Decision: build it, change scope, or kill it (15 min)

If they say go, **lock the Target as the acceptance criterion**. Read it aloud. Get verbal agreement: "If we hit this number by this date and don't trigger any anti-criteria, this engagement is a success and you'll say so." This sentence prevents 80% of dispute risk later.

## Why Phase 2 matters

The Canvas forces you to scope all five Aspects, which is the methodology's biggest contribution to the field. The business case forces you to convert qualitative confidence into a number — which converts client conversation from "do I trust this consultant?" to "is the math right?" The latter is the one that converts.

For a free road-test, the business case might feel performative ("they're not paying anyway"). It isn't. You're road-testing whether you can produce one in 60 minutes; whether the sponsor finds it credible; whether the math feels honest. All three are critical for paid engagements.

## Methodology learning to capture

- Did the Canvas reveal an Aspect you would have skipped without it? (yes/no, which one)
- How long did the business case actually take? (60 min target; honest count)
- Did the sponsor's reaction change after seeing the math? (note the before/after)
- Did anyone object to a number? (which one; why)

---

# Phase 3 — Build the Walking Skeleton (~5-8 days)

## What a Walking Skeleton is

The narrowest end-to-end slice that proves the whole pattern works. For an SMB no-code build:

- Brain → one Airtable base, one or two tables, ~5-10 fields
- Nerves → one Make scenario, ~3-5 modules, manually triggered first then automated
- Skin → either Airtable Interfaces (free, fast) or skip if a portal isn't needed
- Intelligence → one Claude API call if applicable, with a tested prompt

Ship the skeleton in 3-5 days. Then iterate.

## Daily inner loop

```
Morning:    Build for 2-3 hours
Mid-day:    Test against the Target / acceptance criterion
End of day: 15-min written update to sponsor (Slack / email)
            "Today: X. Tomorrow: Y. Blocker: Z (or 'none')."
```

The end-of-day update is non-negotiable. It does three things: forces you to declare progress honestly, prevents week-end surprises, and creates a written record for the methodology retrospective.

## Aspect-by-Aspect, in order

### Build (the technical artifact)
1. Schema first. One Airtable base, lock the data model before building anything else.
2. Walking Skeleton end-to-end. Manual trigger. No polish.
3. Automate. Make scenario or Airtable automations.
4. Edge cases. Whatever broke during testing.

### Process (the workflow change)
1. Write the new workflow as bullets in a Google Doc. Five to fifteen lines max.
2. Walk it with the affected role(s) live. Edit in front of them.
3. Save as a one-page SOP in the shared drive.

### Adoption (the people change)
1. **One-hour training session** with affected users. Don't slide-deck it; demo live, then have *them* demo back to you.
2. **Designate the internal champion** — usually whoever asked the best questions in the role interviews. Tell them they're the champion, in writing. Give them edit access and your phone number.
3. **Resistance handling** — if anyone showed up at ADKAR 1-2 on Desire, schedule a 1:1 with them and the sponsor before training, not after.

### Measurement (the verification mechanism)
1. Baseline measurement was taken in Phase 1. Reuse the exact same method to re-measure.
2. Build the re-measurement into the system if you can (a view, a report, a query). Don't rely on humans remembering to measure.

### Governance (the stewardship)
1. Named internal owner: written in the Outcome record, in the SOP, in the system itself if possible.
2. Care Plan setup (covered in Phase 4-5). Schedule the Day 30 / 90 / 180 checkpoints *before* handoff, not after.

## Verification at handoff

Walk through every Target with the sponsor and the affected users. Each one is a checkbox.

For each Target:
1. State the Target out loud.
2. Show the evidence that it passes (number on a screen, demo, before/after data).
3. Get verbal "yes."
4. Move to the next.

If a Target doesn't pass, use the doc's three-option matrix from §12.6 (renegotiate / iterate / escalate). For a road-test, leaning toward "iterate within the engagement" is fine since the cost is your time.

## Why Phase 3 matters

Most consulting failures happen here, not in the diagnostic. The Walking Skeleton discipline is what prevents the "we're 80% done" phenomenon (in which you're actually 30% done because nothing yet works end-to-end).

Insisting on all five Aspects — even when scoped minimally — is what differentiates Edge Waypoint from "AI consultancies that ship a tool and disappear." The road-test is testing whether you can pull this off as a solo operator, not just describe it in a Field Guide.

## Methodology learning to capture

- Did the Walking Skeleton pattern hold? (yes/no — what broke?)
- Which Aspect was hardest to scope minimally without over- or under-shooting?
- How accurate was your time estimate? (compare hours actually spent vs. business-case estimate)
- Did the daily updates to the sponsor change their behavior? (note any interventions they made because of an update)

---

# Phase 4 — Handoff + Care Plan setup (~1 day)

## The handoff session (~90 min)

Three sections:

### 1. Verification walkthrough (30 min)
- Run the Target verification described above
- The sponsor confirms "this engagement is a success"

### 2. Operational handover (30 min)
- Walk the internal champion through every part of the system
- Hand over: Airtable base ownership (transfer billing if applicable), Make scenario credentials, SOP location, this engagement's Outcome record
- Show them how to make three common edits (add a record, change a workflow step, see the metric)

### 3. Care Plan setup (30 min)
- Schedule the **Day 30 check-in** in their calendar, right now
- Schedule the **Day 90 check-in** in their calendar, right now
- Schedule the **Day 180 check-in** in their calendar, right now
- Each check-in is 30 minutes, free during the road-test (this is part of the methodology you're testing)
- Send them the Care Plan checkpoint template (see Cheat Sheet 3 below) so they know what to expect

## Case study capture (45 min, can be a separate session)

Even though this is free, **capture the case study now**, while details are fresh:

- Before / after numbers (the Target, baseline vs. final)
- One quote from the sponsor about what changed
- One quote from an affected user
- Photo of one screen or artifact (with permission)
- Estimated hours invested vs. estimated value delivered

This is your primary deliverable from the road-test for *your* business. Without it, the engagement was charity.

## Why Phase 4 matters

The handoff is the most professional moment of the engagement. Most consulting handoffs are vague ("here's what I built, hope you like it"); yours is concrete ("here's the Target we agreed to, here's evidence each line passes").

Scheduling the Day 30 / 90 / 180 checkpoints *during* the handoff is a methodology hack: the calendar invites do the work that nagging emails would otherwise have to do. By the time Day 30 comes, the meeting is already on both your calendars.

## Methodology learning to capture

- Did the verification walkthrough produce any objections? (where; why)
- Did the champion seem ready, or did they need more support than you scoped? (this informs the Adoption Aspect for next time)
- Did the case study assemble cleanly, or did you discover you should have collected something during the engagement that you didn't?

---

# Phase 5 — Day 30 / 90 / 180 checkpoints (~30 min each)

## The checkpoint template

For each checkpoint, ask the same five questions in the same order:

| # | Question | Why |
|---|---|---|
| 1 | Is the Solution still in active use? Show me. | Adoption health (lead indicator) |
| 2 | What's the current measurement against the Target? | Outcome integrity (lag indicator) |
| 3 | What's broken or annoying? | Decay surface |
| 4 | What's been added or changed since handoff? | Drift surface |
| 5 | What would you change about the engagement, in hindsight? | Methodology learning |

Score each on a 1-5 scale and track across checkpoints. **A drop of 2 or more between checkpoints is your intervention trigger** — schedule a save call within 7 days.

## Why Phase 5 matters

Most consulting "value" evaporates between Day 0 and Day 90 because nobody audits. The Care Plan checkpoint discipline is what catches decay before it becomes embarrassment. For paying engagements this is what justifies the recurring revenue line; for the road-test it's what produces honest data on whether the methodology actually delivers durable value, or just a launch-day high.

## Methodology learning to capture

- Did the Solution survive Day 30 intact? (yes/partial/no — what eroded?)
- Did the champion stay engaged or drift? (this is the canary)
- What would you have built differently knowing what you know at Day 90?

---

# Phase 6 — Methodology Retrospective (you, alone, ~2 hours)

After the Day 30 checkpoint, sit down with all your captured notes and answer:

## Section A: What worked
- Which artifacts (Outcome record, Canvas, business case, ADKAR grid, Care Plan template) actually got used by the client vs. only by you?
- Which conversations produced the most signal per minute?
- What surprised you about the methodology in a good way?

## Section B: What didn't
- Which steps felt ceremonial?
- Which deliverables did the client ignore?
- Where did you have to improvise because the playbook had a gap?
- What did you skip and not regret skipping?

## Section C: What to change for paying engagements
- What would you charge for this engagement if it had been paid? (Be honest with yourself.)
- What would the SOW look like?
- Which artifacts deserve a template you can reuse?
- Which one experiment from this road-test do you want to run again on a paying engagement?

## Section D: What to change in the Field Guide
- Three concrete edits to the v5.0 doc, with section references
- One thing the pressure test recommended that you tried and now disagree with
- One thing the pressure test missed

Save this as `roadtest_retrospective_[client_name].md`. This document is the actual ROI of the road-test for your business.

---

# Cheat sheets

## Cheat Sheet 1 — Modified Five Rings (60-min interview)

```
Min 0-5      Rapport
Min 5-15     Ring 1: how do you make money?
Min 15-25    Ring 2: unit economics
             ★ ADD: "If you doubled sales tomorrow, what would break first?"
Min 25-45    Rings 3 & 4: walk me through yesterday
             Use modified taxonomy: Capacity / Speed / Quality / Visibility / Knowledge / COST
Min 45-55    Ring 5: tools, copy-paste, spreadsheets running the business
Min 55-60    What did I forget to ask? Who else should I talk to?
             ★ For role interviews: silently score ADKAR 1-5 right after
```

## Cheat Sheet 2 — Pre-mortem script (20 min)

> "Imagine it's three weeks from now and this engagement has failed. We're sitting here having an awkward conversation about what went wrong.
>
> What's the most likely reason?
>
> What else?
>
> What's the worst-case version of that?
>
> If you knew that risk was real today, what would you want us to do about it?"

Output: 3-5 risks. Top 2-3 go on a one-page risk register, reviewed weekly.

## Cheat Sheet 3 — Care Plan checkpoint template

```
CHECKPOINT: Day [30 / 90 / 180]
CLIENT: [name]
SOLUTION: [name]
TARGET: [the Outcome's Target]
BASELINE: [from Phase 1]
HANDOFF MEASUREMENT: [from Phase 4]
TODAY'S MEASUREMENT: [today]

QUESTIONS:
1. Solution still in active use? (1-5): __
2. Current Target measurement: __
3. What's broken or annoying: __
4. What's been added or changed: __
5. What would you change about the engagement, in hindsight: __

DRIFT SCORE (sum of 1+2 vs. last checkpoint): __
INTERVENTION TRIGGER (drop of 2+): [yes/no]

NEXT CHECKPOINT: [date]
```

## Cheat Sheet 4 — One-page business case template

```
OUTCOME: [Outcome statement]
TARGET: [Target with date]

BASELINE COST TODAY:
  Driver: [hours / errors / lost revenue]
  Math:   [calc]
  Annualized: $X

TARGET COST AFTER SOLUTION:
  Math: [calc]
  Annualized: $Y

ANNUAL SAVINGS: $X - $Y = $Z

IMPLEMENTATION COST:
  My hours estimate: __ hrs × $__ rate = $__
  Tool licenses (Year 1): $__
  Total: $__

PAYBACK PERIOD: __ months

SENSITIVITY:
  Pessimistic (½ savings, 2× cost): __ months payback
  Most likely:                      __ months payback
  Optimistic (1.5× savings):        __ months payback

ASSUMPTIONS WORTH FLAGGING:
  - [one]
  - [two]
```

## Cheat Sheet 5 — ADKAR scoring grid

```
                  Awareness  Desire  Knowledge  Ability  Reinforcement
[Stakeholder 1]      __        __       __        __         __
[Stakeholder 2]      __        __       __        __         __
[Stakeholder 3]      __        __       __        __         __

LOWEST CELLS = your Adoption Aspect's actual scope
1 = "no signal"  3 = "neutral"  5 = "fully there"
```

---

# Anti-patterns specific to road-test engagements

| Anti-pattern | Why it fails the road-test |
|---|---|
| **Over-delivering to compensate for "free"** | You stop testing the methodology and start testing your endurance |
| **Letting scope creep because it's free** | You're road-testing the *single-Outcome* discipline; if you let it bloat to three Outcomes, you've validated nothing |
| **Skipping artifacts because they feel formal** | The artifacts (business case, Canvas, ADKAR grid) are exactly what you're testing |
| **Not capturing case study because the client isn't a "real" reference** | Nearly every client objection to your methods is the same — your free pilot will surface them |
| **Believing the sponsor's politeness** | They will say it's great because you're free. Believe the *measurements*, not the kind words |
| **Skipping the Day 30 / 90 checkpoints because the Build looks fine on Day 0** | This is where the methodology either earns its keep or doesn't |

---

# Final note

The whole point of this road-test is to discover *what doesn't work* about the methodology under real conditions. Treat every artifact that fails as data, not failure. The Field Guide is on v5.0; this engagement, run honestly, is what turns it into v6.0.

If you finish the road-test and don't have at least three concrete edits to the Field Guide and one thing to drop entirely, you haven't been honest enough with yourself.

---

*Edge Waypoint Road-Test Playbook*
*Companion to the Field Guide v5.0*
