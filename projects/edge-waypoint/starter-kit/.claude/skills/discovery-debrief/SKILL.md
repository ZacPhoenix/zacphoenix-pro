---
name: discovery-debrief
description: Turn a Waypoint Workshop transcript + intake answers into Friction Census rows and a draft Waypoint Brief. Use within 24h of every workshop.
argument-hint: discovery-debrief clients/acme-hvac
---

# Discovery Debrief

Input: a client folder path containing `00-intake.md` and `01-workshop-transcript.md`.

## Step 1: Mine the transcript

Read the intake and transcript. Extract every recurring task mentioned or implied. For each, produce a Friction Census row with the fields defined in `playbook/03-analyst-frameworks.md` §2: task, who, frequency, time per occurrence, failure modes, downstream cost, workarounds. Rules:

- Quote the speaker's exact words where they reveal pain ("I just retype it", "I chase him every week for that"). Verbatim quotes go in the census row and later in the brief - they are the most persuasive content we have.
- Mark every estimated number as `(est.)`. Where frequency or duration was not stated, write `ASK:` followed by the question to send the client. Never fill gaps with invented numbers.
- Capture every stated business outcome with the owner's verbatim phrasing in a separate "Outcomes" list.
- Do NOT propose solutions in this step.

Write the result to `{client}/03-census.md`.

## Step 2: Annualize

For each census row with sufficient data, compute the annual cost using the time-math from frameworks §3a: `hours × occurrences/week × 48 × loaded rate`. Use the loaded-rate anchors from the frameworks doc unless the intake gives actual wages. Show the arithmetic inline so the founder can check it. Use ranges where inputs were estimates.

## Step 3: Draft the Waypoint Brief

From `templates/waypoint-brief.md` structure, draft `{client}/02-waypoint-brief.md`:

1. **What we heard** - outcomes in the owner's own words, 3-4 sentences
2. **Where the hours go** - the census table, costed, sorted by annual cost
3. **Top 3 problems** - for each: one-line capability statement (tool-free), the annual cost, and a *preliminary* solution-ladder hypothesis hedged appropriately ("likely a configuration of {tool they already own}", "likely a light automation between {X} and {Y}", "possibly an AI-assisted step - the audit would confirm"). At least one of the three should usually resolve below rung 5; if all three look like AI, re-check the ladder per CLAUDE.md principle 2.
4. **Recommended next step** - the Waypoint Map, scoped to these 3 problems, fixed price, two weeks, deliverables named.

Tone: plain English, owner-facing, warm and direct, no jargon, no em-dashes. Two pages maximum.

## Step 4: Verification block

End your chat response (NOT the brief) with:
- Every number used and its source (transcript / intake / estimate)
- All `ASK:` items that need client answers
- Anything in the transcript that sounded like a disqualifier (financial distress, magic-employee expectations, no possible operator)

The founder reviews and edits before anything is sent. Never present the draft as send-ready.
