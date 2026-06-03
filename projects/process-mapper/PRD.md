# Product Requirements Document — Live Process-Mapping & Opportunity Workshop Tool

> **Working codename:** *Cartographer* (placeholder — rename freely)
> **Status:** Approved for build (v1)
> **Document type:** Exhaustive, self-contained PRD intended to be handed to an implementing agent in a fresh repository with **no access to the originating conversation**. Everything needed to build v1 is in this document.
> **Last updated:** 2026-06-03

---

## 0. How to read this document

This PRD is deliberately long and self-contained. If you are the implementing agent, read it top to bottom once before writing any code. The most important sections for *understanding what to build and why* are **§1–§3** (business context). The most important sections for *how to build it* are **§7–§13**. The single riskiest piece of engineering is the Excalidraw round-trip in **§10** — read it twice.

Terms like *value stream*, *PCE*, *%C&A*, *lead time* are defined in the Glossary (**§20**). If a term is unfamiliar, check there first.

---

## 1. Executive summary

**Cartographer is a Claude Code skill that turns a live consulting workshop into a sellable solution proposal.**

A solution-architecture consultant runs a workshop with a small/medium business (SMB) client. They feed Cartographer the raw material of that engagement — a meeting transcript plus supporting documents (PDFs, Word docs) — and Cartographer:

1. **Extracts** the client's current business processes into a structured internal model (the "IR").
2. **Projects** that model onto a live, self-hosted **Excalidraw** canvas that the whole room can see and edit in real time.
3. Lets the consultant and client **annotate, move, add, and rewire** the map live during the workshop — changes on the fly.
4. **Reads the edited canvas back**, reconciles the human changes into the model, and uses Claude's judgment to interpret freeform annotations.
5. Generates a polished, self-contained **HTML report** that documents the current state, presents 2–3 named future-state scenarios, quantifies the improvement of each, **and — critically — identifies concrete, sellable solutions** the consultant can implement and maintain for the client.

The report is simultaneously the workshop artifact *and* a soft proposal / statement-of-work generator. **The commercial purpose of the tool is to win the consultant follow-on implementation and ongoing support/maintenance contracts.** Everything in this product serves that purpose.

---

## 2. Business context & rationale (the "why")

> This section is the most important context for the implementing agent. Build decisions throughout the document only make sense in light of the commercial motion described here.

### 2.1 Who uses this and what business they run

The primary user is an **independent solution-architecture consultant** (or a very small consultancy) who advises **small-to-medium businesses (SMBs)**. Their business model has four stages:

1. **Discover** — Run a workshop with the client to understand how their business actually works today (their processes / value streams) and where the pain is (bottlenecks, rework, manual toil, delays).
2. **Demonstrate** — *Live, in the room*, show the client a clear visual map of their own processes, and collaboratively refine it on the fly as the client reacts ("no, that step actually happens before this one", "that approval takes three days, not three hours"). This live, responsive demo is a major part of how the consultant builds trust and demonstrates value.
3. **Propose** — Produce a professional report that (a) documents the current state, (b) shows future-state scenarios, and (c) **identifies specific solutions** to the client's problems.
4. **Sell & deliver** — The solutions identified in the report are things the consultant can then **build and sell back** to the client, plus **ongoing support and maintenance** (recurring revenue).

### 2.2 What "solutions" means here — the sell-back catalog

This is the commercial heart of the product. When Cartographer identifies an improvement opportunity, that opportunity should map to a **deliverable the consultant can actually sell**. The catalog of deliverable types:

| Deliverable type | What it is | Consultant's revenue |
|---|---|---|
| **Process change** | Reorganise/eliminate/reorder steps, no new tech | Advisory / facilitation fee |
| **No-code automation** | Airtable, Zapier, Make, n8n, Google Apps Script, etc. wiring up existing tools to remove manual work | Build fee + monthly maintenance/support retainer |
| **Custom Claude build** | A small bespoke app, agent, or Claude Code skill that automates a judgement-heavy step (drafting, classification, extraction, triage) | Build fee + maintenance/support retainer + possible per-seat/usage |
| **Off-the-shelf product adoption** | Recommend and integrate an existing SaaS product that fits the need | Selection/integration fee + ongoing admin/support |
| **Integration / data plumbing** | Connect systems that don't currently talk to each other | Build fee + maintenance |

**Every improvement opportunity Cartographer surfaces must be tagged with one of these deliverable types** (see §12). The report then frames each opportunity as something the consultant delivers — implementation plus ongoing support — with an ROI justification drawn from the process metrics (see §11). In effect, the report's "Opportunities" section is a menu of follow-on engagements the consultant can sell.

### 2.3 Why a live workshop tool (and not a static deliverable)

The consultant's edge is responsiveness *in the room*. SMB stakeholders are not process-modelling experts; they recognise their business when they see it drawn, and they correct it instinctively. Capturing those corrections **live** (rather than "we'll send you a revised version next week") is what makes the workshop feel like a high-value, collaborative session rather than an interview. This is why the live, editable **Excalidraw** canvas is core to v1 and not a later add-on — the live demo + on-the-fly change capability *is* the product's differentiator.

### 2.4 Why it identifies sellable solutions (and not just documents process)

Plenty of tools draw process maps. Cartographer's reason to exist is that it closes the loop from *"here is your problem"* to *"here is the specific thing I can build for you to fix it, here's what it's worth, and here's what it costs to run."* That is what converts a workshop into recurring revenue. An implementing agent that builds a beautiful process mapper but omits the opportunity-identification and sell-back framing has **missed the point of the product.**

### 2.5 Why it runs as a Claude Code skill on the consultant's subscription

The consultant already pays for a Claude Pro/Max subscription. Building this as a Claude Code **skill** (rather than a standalone app calling the metered Anthropic API) means the LLM work runs on that existing subscription with no per-token billing to manage, and the consultant's sensitive client data stays local. (See §14.1 for the hard constraint that makes this the chosen path.)

---

## 3. Goals & non-goals

### 3.1 Goals (v1)

- G1. Ingest a workshop transcript plus supporting documents (PDF, Word) and extract the client's current-state processes into a structured model.
- G2. Project that model onto a live, self-hosted Excalidraw canvas the room can edit in real time.
- G3. Read the edited canvas back and reconcile human changes into the model, using Claude to interpret freeform annotations.
- G4. Compute classic value-stream metrics deterministically for the current state and each scenario.
- G5. Generate 2–3 named, consultant-editable future-state scenarios.
- G6. **Identify and tag improvement opportunities by sellable deliverable type, with ROI justification.**
- G7. Produce a single self-contained HTML report that doubles as a soft proposal.
- G8. Run entirely as a Claude Code skill on the consultant's subscription, local-first.

### 3.2 Non-goals (explicitly out of scope for v1)

- N1. **Not** a hosted/multi-tenant SaaS. No accounts, no server infra, no shared backend.
- N2. **Not** a metered-API application. (See §14.1.)
- N3. **Not** a generic diagramming tool — the canvas exists to serve the value-stream model, not freeform drawing for its own sake.
- N4. **Not** a real-time simulation engine. Scenarios are pre-computed named future-states, not a live "drag a slider and watch numbers move" simulator. (This was explicitly decided; see §6, decision 8.)
- N5. **Not** an automated proposal/quote *pricing* engine. Cartographer identifies opportunities and their deliverable types and ROI; it does **not** set the consultant's prices. (Pricing is the consultant's call; the report leaves space for it.)
- N6. **No** automatic implementation of the identified solutions. Cartographer recommends; the consultant builds separately.

---

## 4. Personas & users

- **Primary — The Consultant (operator).** Runs the tool. Technically comfortable (can run a Claude Code skill, self-host Excalidraw). Wants: fast extraction, a credible live demo, a professional report that wins follow-on work. This is the *only* user who operates the tool.
- **Secondary — The Client stakeholders (workshop participants).** SMB owners/managers/staff. **Not** technical. They never operate the tool; they only look at and edit the **Excalidraw canvas** during the workshop (drag boxes, add sticky notes). The canvas must be legible to non-experts.
- **Tertiary — The Report reader (post-workshop).** Whoever at the client receives the report afterwards (often a decision-maker who wasn't in the room). The report must stand alone and make the case for the proposed work without the consultant present.

---

## 5. End-to-end workflow (user journey)

The canonical flow of a single engagement:

1. **Before/after the workshop conversation**, the consultant collects a **transcript** of the discovery session and any **supporting docs** (an existing SOP PDF, an org chart, a spreadsheet exported to PDF, a Word process description).
2. The consultant drops these files into the skill's input folder and invokes the skill.
3. **Stage 1 — Ingest.** Claude reads the transcript + docs and produces the **IR** (current-state value stream) as JSON.
4. **Stage 2 — Project.** The deterministic engine converts the IR into Excalidraw elements and pushes them to a **live local Excalidraw board** via the Excalidraw MCP server. The consultant opens the board in a browser and shares the screen / display in the workshop room.
5. **Stage 3 — Workshop (live).** The consultant walks the client through their own process map. The client reacts; the consultant (and/or client) **edits the board live** — moving steps, fixing sequence, adding sticky notes for pain points, correcting timings, adding/removing steps. These edits sync in real time.
6. **Stage 4 — Reconcile.** When the map is agreed, the consultant triggers read-back. The engine diffs the board against the IR for tracked elements; Claude interprets untracked freeform additions (sticky notes, new boxes, hand-drawn arrows). The IR is updated. Claude also generates 2–3 named future-state **scenarios** and tags **opportunities** by sellable deliverable type.
7. **Stage 5 — Review & report.** The consultant reviews/edits the reconciled IR and scenarios (the safety valve). The engine then renders the **self-contained HTML report**. The consultant presents it live and/or sends it afterwards as the proposal.

> Stages 2–4 may loop: the consultant can re-project a revised IR back onto the canvas for another round of live editing before generating the report.

---

## 6. Product principles — the 12 locked design decisions

These twelve decisions were made deliberately during design and are **settled**. Do not relitigate them in v1; build to them. Each includes its rationale so you understand the constraint.

1. **Deterministic layered engine.** Layout, metric math, diffing, and rendering are done by a **deterministic script**, never improvised by the LLM. Same IR in → identical output out, every time. *Rationale: trust and reproducibility — a consultant cannot present numbers that change between runs.*
2. **Architect-led workshops.** The tool is operated by the consultant, designed around a facilitated workshop, not self-serve by the client. *Rationale: matches the actual business motion (§2).*
3. **Own IR → Mermaid (for the report) and → Excalidraw (for the canvas).** The product owns an internal representation (IR); diagrams are *projections* of it. *Rationale: one source of truth, multiple render targets.*
4. **Improvement + intervention-type tagging.** Every improvement is tagged both by the *kind of improvement* and by the *sellable deliverable type* (§2.2, §12). *Rationale: the commercial purpose — opportunities must map to things the consultant can sell.*
5. **Multi-process value stream.** The model supports multiple interconnected processes/value streams, not a single linear flow. *Rationale: real SMBs have several interacting processes.*
6. **Narrative + context files → LLM extraction.** Input is natural-language transcript plus documents; Claude does the extraction into structure. *Rationale: consultants capture messy human input, not pre-structured data.*
7. **Classic VSM core metrics.** Use the established Value Stream Mapping metric set (process time, lead time, wait time, %C&A, PCE — see §11). *Rationale: credible, industry-standard, defensible numbers.*
8. **2–3 pre-baked named scenarios, consultant-editable.** Future states are a small number of named, curated bundles (e.g. "Quick Wins", "Automate the Core", "Transform"), not a live toggle simulator. The consultant can edit them before the report. *Rationale: simpler to build, more presentable, and the consultant retains judgement/safety-valve control.*
9. **Self-contained HTML report.** The durable deliverable is one self-contained HTML file (Mermaid + metrics + opportunities), viewable offline, that is both shown live and circulated afterward. *Rationale: one artifact, portable, durable, no hosting.*
10. **Claude Code skill, runs on the consultant's subscription.** Not a standalone app; not the metered API. *Rationale: cost + privacy + the hard policy constraint in §14.1.*
11. **Live annotate-and-read-back canvas loop is core to v1.** The Excalidraw round-trip ships in v1, not as a later phase. *Rationale: the live, responsive demo is the product's differentiator (§2.3).*
12. **Excalidraw canvas + Node/TypeScript engine.** Excalidraw is the live collaborative surface (self-hostable, official MCP, ships as a Claude Code skill). The deterministic engine is Node/TS because Excalidraw's element format and ecosystem are JS-native. *Rationale: keeps the round-trip in one language and keeps client data local.*

---

## 7. Solution architecture

### 7.1 The spine: IR as single source of truth

The **IR (Intermediate Representation)** is a JSON document modelling the client's value stream(s). Everything else is either an *input that updates the IR* or a *projection of the IR*:

```
① INGEST    transcript + PDFs/Word  ──Claude──▶  IR (current-state value stream, JSON)
                                                      │
② PROJECT   IR ──engine (deterministic)──▶ Excalidraw elements ──MCP──▶ live local canvas
                 (each element tagged with its IR node id via element customData)
                                                      │
③ WORKSHOP  consultant + room: drag nodes, add sticky notes, flag bottlenecks,
            rewire flows, correct timings  ──live, real-time, on the Excalidraw canvas──
                                                      │
④ RECONCILE read board back ──MCP──▶  • deterministic diff on id-tagged elements
                                        (moved / edited / deleted)
                                      • Claude interprets untagged freeform additions
                                        (a sticky note near a step = a pain point/opportunity)
                                                      │
                                                      ▼
                              updated IR  +  2–3 named scenarios  +  tagged opportunities
                                                      │
⑤ REPORT    engine (deterministic) ──▶ Mermaid diagrams + VSM metric deltas
                                     ──▶ self-contained HTML report (process map + proposal)
```

### 7.2 The judgment / computation split

This split is fundamental and must be preserved:

- **Claude (LLM judgment)** does: reading transcripts & documents; extracting structure; interpreting freeform human annotations; designing the named scenarios; proposing which deliverable type fits each opportunity; writing the narrative prose in the report.
- **The deterministic engine (Node/TS code)** does: layout; all metric arithmetic; the diff between board and IR for tracked elements; Mermaid generation; HTML report assembly. **No metric or layout is ever computed by the LLM.**

### 7.3 Runtime topology (workshop setup)

- **Claude Code** (running the skill, on the consultant's subscription) — the orchestrator.
- **Excalidraw MCP server** — self-hosted locally, exposes the canvas to the skill (project out / read back). See §14.4.
- **Excalidraw canvas in a browser** — what the room looks at and edits; syncs in real time with the MCP server.
- **The engine** — Node/TS modules invoked by the skill.
- **Output** — a single `.html` file on the consultant's machine.

All of this runs on the consultant's local machine / LAN. No client data leaves the environment except the LLM calls inherent to Claude Code.

---

## 8. The IR data model (proposed schema)

> This is a **proposed** schema. The implementing agent may refine field names and shapes, but must preserve the concepts: multiple processes, steps with VSM metrics, flows between steps, improvement opportunities tagged by deliverable type, and named scenarios. Keep it JSON and keep stable IDs (the round-trip depends on stable IDs — §10).

```jsonc
{
  "meta": {
    "client": "Acme Plumbing Supplies",
    "engagementDate": "2026-06-03",
    "consultant": "…",
    "sourceFiles": ["transcript.md", "current-sop.pdf"],
    "irVersion": 1                     // bumped each reconcile round
  },

  "processes": [                        // decision 5: multiple interconnected processes
    {
      "id": "proc_order_to_cash",
      "name": "Order to Cash",
      "description": "From customer order received to payment cleared.",
      "steps": [
        {
          "id": "step_001",            // STABLE id — survives round-trips (§10)
          "name": "Receive order (email/phone)",
          "role": "Sales admin",
          "description": "…",
          "metrics": {                 // decision 7 — see §11 for definitions
            "processTimeMin": 8,       // value-adding work time per item
            "waitTimeMin": 240,        // delay/queue before this step
            "pctCompleteAccurate": 70, // %C&A: % usable without rework
            "fte": 1,
            "demandPerDay": 35         // optional throughput/volume
          },
          "painPoints": [              // captured from workshop / annotations
            "Orders arrive in 3 channels, manually re-keyed"
          ],
          "isValueAdded": true,        // for PCE: does this step add customer value?
          "canvasElementId": "exc_abc123"  // link to Excalidraw element (§10)
        }
        // … more steps
      ],
      "flows": [                       // edges between steps (can cross processes)
        {
          "id": "flow_001",
          "fromStepId": "step_001",
          "toStepId": "step_002",
          "type": "sequential",        // sequential | conditional | rework-loop | handoff
          "label": "if in stock"
        }
      ]
    }
    // … more processes; flows may reference steps in other processes
  ],

  "opportunities": [                   // decision 4 + §12 — the commercial core
    {
      "id": "opp_001",
      "targetStepIds": ["step_001"],
      "title": "Unify order intake",
      "problem": "Orders re-keyed from 3 channels; 30% have errors.",
      "improvementType": "eliminate-waste",   // see §12.1
      "deliverableType": "no-code-automation", // see §12.2 — what consultant sells
      "proposedSolution": "Airtable form + automation to consolidate intake.",
      "estimatedImpact": {
        "waitTimeDeltaMin": -180,
        "pctCompleteAccurateDelta": +25,
        "processTimeDeltaMin": -5
      },
      "complexity": "S",              // S | M | L — build effort
      "sellBack": {
        "build": "Airtable base + intake automations",
        "ongoing": "Monthly support & iteration retainer"
      }
    }
    // … more opportunities
  ],

  "scenarios": [                       // decision 8: 2–3 named future states
    {
      "id": "scn_quick_wins",
      "name": "Quick Wins",
      "narrative": "Low-effort changes deliverable in 2–3 weeks.",
      "opportunityIds": ["opp_001", "opp_004"]   // a curated bundle of opportunities
    },
    {
      "id": "scn_automate_core",
      "name": "Automate the Core",
      "narrative": "…",
      "opportunityIds": ["opp_001", "opp_002", "opp_003"]
    }
    // optional 3rd: "Transform"
  ]
}
```

Notes:
- A **scenario's metrics are computed**, not stored: the engine applies the bundled opportunities' `estimatedImpact` deltas to the baseline and recomputes the rollups (§11). This keeps decision 1 (deterministic) intact.
- `improvementType` (the lean/waste lens) and `deliverableType` (the sellable lens) are **both** required on every opportunity — that dual tag is decision 4.

---

## 9. Functional requirements

Numbered for traceability. **MUST** = required for v1.

**Ingest (Stage 1)**
- FR-1 (MUST): Accept a folder of input files containing at least one transcript (markdown/txt) and zero or more PDFs and/or Word docs.
- FR-2 (MUST): PDFs are passed to Claude natively (document content blocks) so layout/tables are preserved. Word (`.docx`) is converted to text first (e.g. via `pandoc` or `mammoth`) — `.docx` is not natively ingestible. (See §14.3.)
- FR-3 (MUST): Produce a valid IR JSON (per §8) of the current-state value stream(s), including steps, metrics where stated, flows, and an initial pass at pain points.
- FR-4 (SHOULD): Where metrics are not stated in the source, mark them as estimated/unknown rather than inventing precise numbers; surface these gaps for the consultant to fill during the workshop.

**Project to canvas (Stage 2)**
- FR-5 (MUST): Convert the IR deterministically into Excalidraw elements: one labelled node per step (with its key metrics shown), arrows for flows, visual grouping per process (frames/containers), and a legend.
- FR-6 (MUST): Tag every generated element with its originating IR id (via Excalidraw element `customData` or an equivalent stable mapping) so it can be reconciled later (§10).
- FR-7 (MUST): Push elements to a live Excalidraw board via the Excalidraw MCP server, and surface the board URL to the consultant.
- FR-8 (SHOULD): Visually distinguish bottlenecks / low %C&A / high wait-time steps (e.g. colour) so the room can see the pain.

**Workshop (Stage 3)**
- FR-9 (MUST): Support the consultant/client editing the live board (move, edit text, add elements, add sticky notes, delete) with real-time sync — provided natively by Excalidraw + its MCP. No custom UI required.

**Reconcile (Stage 4)**
- FR-10 (MUST): Read the current board state back via the MCP.
- FR-11 (MUST): Deterministically diff id-tagged elements against the IR to detect: moved, text-edited, and deleted steps/flows.
- FR-12 (MUST): Use Claude to interpret untagged (human-added) elements — sticky notes, new boxes, hand-drawn arrows, free text — and propose how each maps to the IR (a new step, a pain point on a nearby step, a new flow, an annotation, or a new opportunity).
- FR-13 (MUST): Produce an updated IR (incrementing `irVersion`) merging deterministic diffs and interpreted additions.
- FR-14 (MUST): Generate/refresh 2–3 named scenarios (decision 8) and the tagged opportunities (§12) from the reconciled IR.

**Review & report (Stage 5)**
- FR-15 (MUST): Present the reconciled IR + scenarios + opportunities to the consultant for review/edit *before* report generation (the safety valve — decision 8). Editing the IR JSON directly is acceptable for v1.
- FR-16 (MUST): Deterministically compute VSM metrics (§11) for the current state and each scenario.
- FR-17 (MUST): Generate Mermaid diagrams from the IR (current state + each scenario).
- FR-18 (MUST): Render a single self-contained HTML report (§13) with `mermaid.js` bundled inline so it renders offline.

---

## 10. The Excalidraw round-trip contract (the riskiest piece)

> Read this twice. Going *out* (IR → canvas) is easy. Coming *back* (canvas → IR) is where fidelity is lost if you are not careful. This contract is how we keep it manageable.

### 10.1 Out: IR → Excalidraw

- Each IR **step** becomes one Excalidraw rectangle (or labelled container) carrying, in `customData`, its `step.id` and `irVersion`.
- Each IR **flow** becomes one Excalidraw arrow bound to the two step elements, carrying `flow.id`.
- Each **process** becomes a frame/visual group.
- Metrics are rendered as text inside or beside each step's node.
- A persistent **ID-map** (IR id ↔ Excalidraw element id) is maintained by the engine so the relationship survives even if `customData` is stripped by an edit.

### 10.2 Back: Excalidraw → IR (reconciliation)

Classify every element on the board into one of three buckets:

1. **Tracked & matched** (has our `customData`/is in the ID-map): handle **deterministically**.
   - Position changed → record layout intent (may inform process grouping; the report's own layout is still engine-owned and deterministic).
   - Text changed → update the step's name/metric (parse known metric patterns; ambiguous text goes to Claude).
   - Element deleted → mark the step/flow removed.
2. **Untracked additions** (no id — a human added it): handle with **Claude's judgment** (FR-12). Claude proposes a mapping; the consultant confirms in review (Stage 5).
   - Sticky note near step X → a `painPoint` on step X, or a candidate `opportunity`.
   - New box → a new step (Claude infers name/role from its text and position).
   - New arrow → a new flow (infer from/to by endpoints).
   - Free text not near anything → a general note on the process.
3. **Tracked but ambiguous** (matched but heavily mutated): surface to the consultant for a decision rather than guessing.

### 10.3 Fidelity expectations (be honest)

- Round-trip is **not** lossless and is **not** fully deterministic on the return leg — freeform human input cannot be. This is acceptable **because** of the Stage 5 review safety valve (FR-15): Claude *proposes* the reconciliation, the consultant *approves* it before anything reaches the report.
- Stable IDs are the linchpin. If IDs are lost, the engine must fall back to fuzzy matching (by text + position proximity) and flag low-confidence matches for review.

---

## 11. Metrics specification (classic VSM core — decision 7)

All metrics are computed **deterministically** by the engine. Definitions and formulas:

**Per-step metrics (inputs, from IR):**
- **Process Time (PT)** — value-adding work time to process one item at the step. (`processTimeMin`)
- **Wait Time (WT)** — delay/queue time before the step. (`waitTimeMin`)
- **% Complete & Accurate (%C&A)** — percent of items arriving at the step that are usable without correction/rework. (`pctCompleteAccurate`)
- **FTE** — people assigned to the step. (optional)
- **Demand/Volume** — items per period. (optional)

**Rolled-up / derived metrics (computed):**
- **Total Lead Time (LT)** = Σ(PT) + Σ(WT) across the value stream. The total elapsed time from start to finish.
- **Total Process Time** = Σ(PT). Time actually spent working.
- **Total Value-Added Time** = Σ(PT for steps where `isValueAdded = true`).
- **Process Cycle Efficiency (PCE)** = (Total Value-Added Time ÷ Total Lead Time) × 100. *The headline efficiency number — typically shockingly low for unimproved SMB processes, which makes the case for change.*
- **Rolled %C&A** = product of each step's (%C&A ÷ 100), expressed as a percentage. *Shows how quality compounds across handoffs.*

**Scenario computation (decision 8):** for a scenario, start from the baseline per-step metrics, apply the `estimatedImpact` deltas of each bundled opportunity to the affected steps (and add/remove steps where an opportunity does so), then recompute all rolled-up metrics. The report shows **baseline vs each scenario** as before/after deltas (e.g. "Lead time 6.2 days → 1.4 days; PCE 4% → 18%").

> These metric deltas are the **ROI justification** for the sell-back (§2.2): the value of an opportunity is expressed in time saved and quality gained, which the consultant uses to justify the implementation fee.

---

## 12. Intervention taxonomy & opportunity mapping (the commercial core — decision 4)

Every opportunity carries **two** tags: an *improvement type* (the lean/operational lens) and a *deliverable type* (what the consultant sells). This dual tagging is what turns analysis into a sales pipeline.

### 12.1 Improvement type (operational lens)

- `eliminate-waste` — remove a non-value-adding step or activity.
- `reduce-wait` — cut queue/delay time between steps.
- `improve-quality` — raise %C&A, reduce rework loops.
- `automate-manual` — replace manual toil with automation.
- `consolidate` — merge duplicated/fragmented steps or systems.
- `reorder` — resequence steps for better flow.
- `augment-with-ai` — add an LLM/Claude capability to a judgement-heavy step.

### 12.2 Deliverable type (the sellable lens — see §2.2)

- `process-change` — advisory only, no tech.
- `no-code-automation` — Airtable / Zapier / Make / n8n / Apps Script.
- `custom-claude-build` — bespoke app/agent/skill.
- `off-the-shelf-product` — recommend & integrate existing SaaS.
- `integration` — connect existing systems.

### 12.3 The opportunity → proposal mapping

For each opportunity, the report must present:
- The **problem** (from the map/annotations).
- The **proposed solution** and its **deliverable type**.
- The **quantified impact** (metric deltas → ROI).
- The **complexity** (S/M/L) as a rough effort signal.
- The **sell-back framing**: what the consultant *builds* and what *ongoing support/maintenance* looks like.

The report deliberately leaves **pricing blank** (N5) — the consultant fills it in. Cartographer's job is to make every opportunity look like a concrete, justified, buildable engagement.

---

## 13. The report specification (decision 9)

A **single self-contained `.html` file**, `mermaid.js` inlined so it renders offline with no network. Sections, in order:

1. **Cover / executive summary** — client, date, the headline finding (e.g. "Order-to-cash runs at 4% efficiency; we identified 6 improvements worth ~22 hours/week").
2. **Current-state map** — Mermaid diagram of the current value stream(s), with the baseline metrics table (per §11) and PCE called out.
3. **Pain points** — the bottlenecks/rework/manual-toil identified, drawn from the workshop annotations.
4. **Future-state scenarios** — for each of the 2–3 named scenarios (decision 8): a Mermaid diagram of that future state, a **before/after metrics comparison table**, and the narrative.
5. **Opportunities / recommended solutions** — the heart of the proposal. For each opportunity: problem, proposed solution + deliverable type, quantified impact (ROI), complexity, and the sell-back framing (build + ongoing support). Grouped/orderable by scenario.
6. **Next steps** — a soft call to action inviting the client to engage the consultant to implement, with space for pricing/scoping the consultant adds.
7. **Appendix** — assumptions, data gaps/estimates, source files.

Design: clean, professional, presentable both on-screen live and as a circulated PDF-printable HTML. Must look like a credible consulting deliverable, because it *is* the proposal.

---

## 14. Tech stack, runtime & hard constraints

### 14.1 Subscription vs metered API — a hard constraint (not negotiable)

Anthropic **does not permit** third-party apps to authenticate with a personal Claude Pro/Max subscription (claude.ai login / OAuth). Per the Agent SDK docs: *"Unless previously approved, Anthropic does not allow third party developers to offer claude.ai login or rate limits for their products, including agents built on the Claude Agent SDK. Please use the API key authentication methods described in this document instead."*

**Consequence:** to use the consultant's subscription (rather than paying metered API), the tool **must be built as a Claude Code skill** and run *inside* Claude Code — not as a standalone app embedding the API/SDK. This is the reason for decision 10 and shapes the entire architecture. Do not attempt to embed subscription OAuth in a custom app; it is against policy and will not be supported.

### 14.2 Stack

- **Host/runtime:** Claude Code (the skill is invoked from, and orchestrated by, Claude Code).
- **Skill:** a `SKILL.md` (orchestration instructions) plus supporting scripts.
- **Engine:** **Node.js / TypeScript** (decision 12). Manipulates Excalidraw's JSON element schema and Mermaid; emits the HTML report.
- **Canvas:** **Excalidraw**, self-hosted, via its official MCP server / Claude Code skill (see §14.4).
- **Diagram libs:** Mermaid (report), Excalidraw element schema (canvas).

### 14.3 File ingestion

- **PDF:** passed to Claude natively as document content blocks (Claude Code can read PDFs) — preserves tables/layout.
- **Word `.docx`:** **not** natively ingestible by the model; convert to text first (`pandoc` preferred, or `mammoth` in Node) as part of Stage 1.
- **Transcript:** plain markdown/text, read directly.

### 14.4 Excalidraw MCP

- Use the official Excalidraw MCP integration (Anthropic-supported; also distributed as a Claude Code skill — see References §21). Self-host the canvas locally so client data stays on the consultant's machine/LAN.
- The MCP provides: create/update/delete elements, real-time bidirectional sync between AI operations and manual edits, and read-back of board state. These cover FR-5 through FR-13.
- Verify the exact tool surface of the chosen Excalidraw MCP build at implementation time and adapt the `excalidraw.ts` module to it.

### 14.5 Local-first & privacy

Everything runs on the consultant's machine/LAN. Client process data (often commercially sensitive) never leaves the local environment except via the LLM calls inherent to Claude Code. No third-party hosting, no shared backend, no client accounts.

---

## 15. Proposed repository / file structure

```
<repo-root>/
  PRD.md                      ← this document
  docs/
    ARCHITECTURE.md           ← §7 diagram + the round-trip contract (§10), expanded
    DECISIONS.md              ← the 12 decisions (§6) with rationale
  skill/
    SKILL.md                  ← orchestration: ingest → project → workshop → reconcile → report
  engine/                     ← Node/TS, the deterministic half
    package.json
    src/
      ir.ts                   ← IR schema/types (§8) + load/save/validate
      ingest.ts               ← file handling: pdf passthrough, docx→text (§14.3)
      metrics.ts              ← VSM metric computations (§11)
      excalidraw.ts           ← IR ⇄ Excalidraw elements: project out + reconcile/diff back (§10)
      mermaid.ts              ← IR → Mermaid (§17/FR-17)
      report.ts               ← Mermaid + metrics + opportunities → self-contained HTML (§13)
      scenarios.ts            ← apply opportunity deltas, compute scenario metrics (§11)
    test/                     ← unit tests, esp. metrics + reconciliation diff
  samples/
    sample-transcript.md      ← worked example input
    sample-ir.json            ← expected IR for the sample
    sample-report.html        ← expected rendered output
```

---

## 16. Build plan / milestones

1. **M1 — IR + metrics + report (no canvas).** Schema (`ir.ts`), metrics (`metrics.ts`), scenarios (`scenarios.ts`), Mermaid (`mermaid.ts`), HTML report (`report.ts`). Prove: sample IR → correct metrics → presentable report. *This delivers standalone value even before the canvas.*
2. **M2 — Ingest.** Transcript + PDF + docx → IR via Claude (`ingest.ts`, SKILL.md stage 1). Prove: sample transcript → reasonable IR.
3. **M3 — Excalidraw out.** IR → canvas elements, push via MCP (`excalidraw.ts` project half, FR-5–8).
4. **M4 — Excalidraw back (the spike).** Read board → deterministic diff + Claude interpretation → updated IR (FR-10–14, §10). *Highest risk; isolate and prove early.*
5. **M5 — Opportunity tagging + sell-back framing.** Dual tags (§12), report Opportunities section (§13.5).
6. **M6 — End-to-end + review safety valve.** Wire Stage 5 review (FR-15), full pipeline, polish report.

> Suggested order if de-risking: do the **M4 Excalidraw round-trip spike** early (even before M1 is polished) since it is the single biggest unknown.

---

## 17. Risks & mitigations

- **R1 — Round-trip fidelity (high).** Freeform canvas edits don't map cleanly back to structured IR. *Mitigation:* stable IDs + deterministic diff for tracked elements; Claude interpretation for additions; **consultant review before report** (FR-15). Accept that the return leg is assisted, not fully automatic.
- **R2 — Excalidraw MCP surface drift.** The MCP tool API may differ from assumptions. *Mitigation:* isolate all MCP interaction in `excalidraw.ts`; verify the actual tool surface at build time (§14.4).
- **R3 — LLM-invented metrics.** Claude might fabricate precise numbers not in the source. *Mitigation:* metrics are computed only by the engine; ingestion marks unknowns as estimates (FR-4); consultant fills gaps live.
- **R4 — Determinism leak.** Layout/metrics accidentally done by the LLM. *Mitigation:* enforce the §7.2 split in code review; engine owns all math/layout/rendering.
- **R5 — Over-promising in the proposal.** The report could over-state achievable impact. *Mitigation:* impacts are consultant-reviewed estimates, framed as projections; pricing left blank (N5).
- **R6 — Subscription policy.** Any drift toward embedding subscription auth in a non-Claude-Code app. *Mitigation:* the §14.1 constraint is hard; keep it a Claude Code skill.

---

## 18. Open questions for the implementer

These are intentionally left to implementation judgement (none block the build):

- Q1. Exact IR field names and whether to normalise steps/flows into separate collections vs nested (per process). §8 is a starting point.
- Q2. How rich the deterministic text-parsing of edited node labels should be before deferring to Claude (§10.2).
- Q3. Whether scenario count is fixed at 3 named tiers ("Quick Wins / Automate the Core / Transform") or chosen per engagement. Default: up to 3, names chosen by Claude per client.
- Q4. Report styling/branding (the consultant will likely want their own brand on it).
- Q5. Whether to persist the ID-map in a sidecar file vs solely in Excalidraw `customData`.

---

## 19. Acceptance criteria (definition of done for v1)

- AC-1. Given the sample transcript + a sample PDF, the skill produces a valid IR.
- AC-2. The IR projects onto a live Excalidraw board with id-tagged elements.
- AC-3. After manual edits on the board (a moved step, an edited timing, an added sticky note, a new step), read-back produces an updated IR that correctly reflects the deterministic changes and presents Claude's interpretation of the additions for review.
- AC-4. The engine computes correct VSM metrics (verified by unit tests against hand-worked numbers) for baseline and scenarios.
- AC-5. 2–3 named scenarios are generated, each a curated bundle of opportunities, each opportunity carrying both an improvement type and a deliverable type.
- AC-6. A single self-contained HTML report renders offline, contains all §13 sections, and the Opportunities section frames each opportunity as a sell-back engagement (build + ongoing support) with ROI from metric deltas and pricing left blank.
- AC-7. The entire flow runs as a Claude Code skill on a Pro/Max subscription with no metered API key required.

---

## 20. Glossary

- **Value Stream Mapping (VSM)** — a lean method for visualising the steps, flows, and timings by which work moves from request to delivery, used to expose waste.
- **Value stream / process** — the end-to-end sequence of steps delivering a result for a customer (e.g. "order to cash").
- **Step** — a single activity/node in a process.
- **Flow** — a directed connection between steps (sequence, conditional branch, rework loop, handoff).
- **Process Time (PT)** — time actively working on one item at a step.
- **Wait Time (WT)** — idle/queue time before a step.
- **Lead Time (LT)** — total elapsed time end-to-end (Σ PT + Σ WT).
- **%C&A (Percent Complete & Accurate)** — share of items arriving at a step that need no rework.
- **PCE (Process Cycle Efficiency)** — value-added time ÷ lead time; the headline efficiency metric.
- **IR (Intermediate Representation)** — Cartographer's internal JSON model of the client's value streams; the single source of truth.
- **Opportunity** — an identified improvement, dual-tagged by improvement type and (sellable) deliverable type.
- **Scenario** — a named future-state bundle of opportunities (e.g. "Quick Wins").
- **Sell-back** — the consulting motion of identifying a solution, then selling its implementation + ongoing support to the client.
- **MCP (Model Context Protocol)** — the protocol by which Claude Code talks to external tools/products (here, Excalidraw).
- **Deliverable type** — the kind of thing the consultant sells to realise an opportunity (process change, no-code automation, custom Claude build, off-the-shelf product, integration).

---

## 21. References

- Excalidraw MCP — official: <https://github.com/excalidraw/excalidraw-mcp> · Claude Code skill build: <https://github.com/yctimlin/mcp_excalidraw> · Excalidraw+ MCP docs: <https://plus.excalidraw.com/docs/mcp>
- Anthropic Agent SDK overview (the third-party subscription-auth restriction, §14.1): <https://code.claude.com/docs/en/agent-sdk/overview>
- Claude Code authentication: <https://code.claude.com/docs/en/authentication>
- Claude PDF / document support (native PDF ingestion, §14.3): <https://platform.claude.com/docs/en/vision/pdf-support>
- Mermaid (report rendering): <https://mermaid.js.org/>
- Background on Value Stream Mapping metrics (PT, LT, %C&A, PCE) — any standard lean/VSM reference.

---

*End of PRD. This document is intended to be sufficient for an implementing agent to build v1 without further context. Where it is silent, prefer the simplest choice consistent with the 12 design decisions (§6) and the commercial purpose (§2).*
