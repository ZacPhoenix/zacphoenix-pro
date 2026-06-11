---
name: score-opportunities
description: Score and rank a client's Friction Census on the Opportunity Scorecard, place items on the impact/effort 2x2, and attach solution-ladder hypotheses. Use during brief drafting and Map week 2.
argument-hint: score-opportunities clients/acme-hvac
---

# Score Opportunities

Input: a client folder containing `03-census.md` (Friction Census rows).

## Step 1: Score

For each census row, score 1-5 on the six axes from `playbook/03-analyst-frameworks.md` §3b, applying the weights exactly: **Impact ×3, Frequency ×2, Feasibility ×2, Ownership ×2, Simplicity ×1, Risk-inverse ×1** (max 55).

Rules:
- Justify each axis score in ≤10 words, citing census evidence. A score you cannot justify from the census gets the midpoint (3) and a `VERIFY:` flag.
- Ownership: score 5 only if a named person appears in the census as feeling this pain daily. "The office" is not an owner - score ≤2 and flag.
- Simplicity: requires a solution-ladder hypothesis first (Step 2 informs this; iterate if needed).
- Risk-inverse: anything customer-facing, regulated, or money-moving scores ≤2.

## Step 2: Ladder hypotheses

For each item, walk the Solution Ladder bottom-up (frameworks §4): eliminate → standardize → configure-what-they-own → SaaS → low-code glue → AI-assisted step → agentic. Use the problem-type mapping table as the starting hypothesis. For each item state: the rung, the one-sentence justification for every rung you skipped, and named candidate tools (check the client's existing stack from the census/intake FIRST - rung 2 beats everything if the capability already exists in something they pay for).

For any rung-5 hypothesis, run the AI-fit checklist (frameworks §5) and show the green/red light results. Any red light demotes or reshapes the item.

## Step 3: Rank and place

Output to `{client}/03-census.md` (append a `## Scorecard` section):

1. Ranked table: item, weighted score, annual cost, ladder rung, candidate approach
2. 2x2 placement: Quick wins / Strategic bets / Fill-ins / Money pits
3. **Pilot candidate recommendation:** the single ≥40-scoring quick-win you would stake the firm's reputation on, with: the baseline that must be measured during the Map, the likely success threshold, the named operator (or the flag that none exists - which blocks the pilot per CLAUDE.md principle 3), and the top failure risk from the pre-mortem lens (no owner / no baseline / wrong problem / no monitoring / data not ready)
4. **Honest exclusions:** items we recommend NOT building and why, including any money pits to name in the readout - these lines build more trust than the recommendation does

## Step 4: Verification block

End the chat response with the `VERIFY:` flags, any data-readiness-gate failures (frameworks §6) that need scoping as separate line items, and the axis scores most sensitive to estimate error. The founder adjudicates before the scorecard reaches a client document.
