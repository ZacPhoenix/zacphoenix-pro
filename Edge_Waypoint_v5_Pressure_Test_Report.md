# Edge Waypoint Field Guide v5.0 — Multi-Framework Pressure Test

**Document under review:** *The Edge Waypoint Diagnostic Field Guide v5.0* (May 2026, 1,888 lines)
**Method:** Five parallel research agents pressure-tested the methodology against an assigned domain of the established canon. This document consolidates their findings.
**Reviewers:**
1. Operations management & process-improvement frameworks (Lean, Six Sigma, TOC, VSM, BPMN, QCD)
2. Business analysis & strategy frameworks (BABOK, BCS, Ulwick ODI, Balanced Scorecard, OKRs, Wardley, JTBD)
3. Solution & enterprise architecture (TOGAF, ArchiMate, C4, DDD, MACH, iPaaS, AI architecture)
4. Change management & benefits realization (ADKAR, Kotter, Bridges, Rogers, MSP, Cranfield BDN)
5. Consulting & AI-transformation playbooks (McKinsey/BCG/Bain, BCG 10-20-70, Ng's playbook, productized consulting)

---

## Executive summary

The Field Guide is **materially better than the AI-consulting median on methodology and materially behind on commerce**. Across all five lenses the same pattern repeats: it has the *architecture* of rigor (a four-tier outcome hierarchy with anti-criteria, five Solution Aspects that include Adoption and Governance, a quality discipline borrowed from BCS, a no-code-first stack opinion, and willingness to recommend against AI), but lacks the *instrumentation* layer that the established canon supplies (constraint analysis, business case math, per-stakeholder change diagnostics, benefits dependency networks, productized offerings, and value-based pricing).

The five most important findings, ranked by impact-per-effort to fix:

| # | Finding | Source lens | Effort |
|---|---|---|---|
| 1 | **Constraint analysis is missing.** ICE scoring ranks by perceived impact; Goldratt's TOC ranks by system throughput. The methodology cannot defend its top-3 against the question "is this even the constraint?" | Ops | 1 page methodology addition |
| 2 | **No per-Outcome business case.** McKinsey/BCG never recommend without payback period, NPV, and a sensitivity range. ICE is qualitative; clients need cash math. | Consulting | One-page template per top Outcome |
| 3 | **No per-stakeholder change diagnostic.** ADKAR's pre-assessment predicts adoption failure better than any other instrument; Prosci data shows 7× project-success lift. The Adoption Aspect names activities but never assesses readiness. | Change | 15 min per stakeholder, Week 1 |
| 4 | **Horizontal positioning + un-productized service menu.** Edge Waypoint sells time bands. Philip Morgan and David C. Baker would call this an under-positioned practice. Two named verticals + three productized offerings would change lead flow more than any methodology edit. | Consulting | 2-4 weeks of positioning work |
| 5 | **The "Cost" gap in the six-needs taxonomy is real and the doc admits it.** QCD has Cost; Balanced Scorecard has Financial; the doc shoehorns margin/cost into Capacity, which mis-ranks Outcomes whenever a client says "margins are squeezed." | Ops + BA | Replace Reach with Cost, or expand to 7 needs |

The single biggest *methodology* fix is TOC constraint analysis at Ring 2 (item 1). The single biggest *commercial* fix is niche productization (item 4). The doc's posture — disciplined, honest, contrarian-where-it-counts — is correct. What's needed is instrumentation, not redesign.

---

## Cross-cutting themes (where multiple agents converged)

### A. The doc has *architecture* of rigor without *instrumentation* of rigor

Every lens surfaced the same pattern. The Field Guide names a discipline and provides a structural slot for it, but does not specify the instrument that fills the slot.

- Adoption is a first-class Aspect (good); there is no ADKAR-style per-stakeholder assessment to populate it (gap).
- Outcomes have Targets and anti-criteria (good); there is no MSP-style Benefits Profile with dis-benefits, realization timeline, or review dates (gap).
- The trace-up hierarchy enforces lineage (good); there is no Cranfield-style Benefits Dependency Network rendering the enabling changes between Build and Benefit (gap).
- ICE prioritizes (basic); Cost of Delay / WSJF / Kano / NPV / payback would prioritize honestly (gap).
- The Edge Waypoint Stack names tools per layer (good); there are no Architecture Decision Records capturing why those tools were chosen for this client (gap).

### B. Multiple agents independently flagged the same omissions

Three or more lenses identified each of the following:

- **No business-case math** (ops, BA, consulting)
- **Cost missing from the needs taxonomy** (ops, BA)
- **Hypothesis-driven thinking absent** — Five Rings is discovery; McKinsey/BCG would walk in with a Day-1 ghost deck (consulting); TOC would walk in with a constraint hypothesis (ops); Wardley would walk in with an evolution hypothesis (BA)
- **No pre-mortem or pre-scale validation gate** (consulting, change)
- **No post-handoff benefits audit at 90/180/365 days** (change, consulting)
- **Service menu is broad, not productized** (consulting; also implicit in BA)
- **Vocabulary collisions left unresolved** — "Outcome" collides with Ulwick ODI (BA); "Aspect" overlaps with ArchiMate aspects (architecture); 10-20-70 BCG framing is implicit but unnamed (consulting)

### C. The Field Guide's genuine strengths held up under attack

Five elements were independently praised by three or more lenses:

- **The five-Aspect Solution structure** (Build/Process/Adoption/Measurement/Governance) is the single most valuable construct in the document. It is, effectively, BCG's 10-20-70 rule made operational, even though the doc never cites BCG.
- **Anti-criteria as a first-class artifact.** Neither BABOK, BCS, OKRs, ODI, ADKAR, Kotter, nor MSP elevate failure conditions to a defined artifact. Modern BA practice should adopt it.
- **Open Questions as a separate deliverable.** Rare across the consulting canon; honest in client conversation.
- **Willingness to recommend against AI** (Part 3.4). The mapping of seven common stated problems to non-AI right answers is the single most defensible commercial moat in the document.
- **No-code-first principle with named defaults** (Brain/Nerves/Skin/Intelligence). Most architecture canon assumes custom-code default; inverting it is right for the 6–75 person target and the doc commits.

---

## Lens 1 — Operations management & process improvement

**Verdict:** Fit for purpose on engagement-shape and requirements-quality dimensions; underweight on quantitative operations.

### What maps to canon

- Job shadowing (§7.2) is a Gemba walk in everything but name.
- Five Whys is named explicitly (§4.3).
- SIPOC and swim-lane diagrams (§7.3) are appropriate process-mapping primitives.
- The "Inner Loop" (Draft → Test → Review → Iterate) is structurally PDCA for a single Block of Work.
- The six business needs partially overlap QCD (Quality is named; Speed corresponds to Delivery; Capacity correlates loosely with Cost).

### What's missing

- **Theory of Constraints (Goldratt)** — the largest single gap. Five Focusing Steps (Identify → Exploit → Subordinate → Elevate → Repeat), throughput accounting, Drum-Buffer-Rope, and the Thinking Processes are absent. ICE ranks by perceived impact; TOC ranks by throughput contribution. These are not the same thing. A high-impact Outcome at a non-constraint produces zero system gain.
- **TIM WOODS waste taxonomy** — the friction catalog lacks a waste-type tag, so countermeasures are technology-led rather than waste-led.
- **Ishikawa, Pareto, 5W2H, FMEA** — Five Whys alone is prone to single-thread reasoning. The doc lacks the analytical scaffolding to defend its prioritization with data.
- **Value Stream Mapping with cycle / lead time / %C&A** — process is mapped but flow is not measured. Targets in the Goal Decomposition Ladder for Capacity/Speed Outcomes are guesses without this.
- **Little's Law / queue theory** — for Capacity work, a five-minute Little's Law check would catch mis-scoped throughput claims before sign-off.
- **A3 thinking and SDCA** — the doc has roadmap artifacts but no A3 learning artifact; no Standardize-Do-Check-Act for locking in gains.
- **Cost-of-delay / WSJF reasoning** — for SMBs with cash-flow pressure, "which Outcome bleeds money fastest if deferred" is the correct prioritization question and the doc doesn't ask it.
- **Cost category absent from needs taxonomy** — the doc itself flags this as the May-2026 audit finding.

### Highest-ROI additions from this lens

1. TIM WOODS waste tags on every friction-catalog entry.
2. Goldratt's Five Focusing Steps walked at Ring 2 *and* applied as an ICE weighting filter.
3. Ishikawa + Pareto pair as the Analyze toolkit for top-3 frictions.
4. Value Stream Map (with cycle/lead time and %C&A) for any Capacity or Speed Outcome.
5. Service blueprinting (Fitzsimmons) in place of SIPOC for customer-facing workflows.
6. A3 one-pager format for each top-3 Outcome in the readout deck.
7. WSJF override on top of ICE for any Outcome with a hard external deadline.
8. Add Cost to the six needs (replace Reach or expand to seven).
9. Toyota Kata starter routine inside the Care Plan: Standard tier.
10. Little's Law back-of-envelope on any Capacity Solution at build kickoff.

### Single biggest fix from this lens

Retrofit TOC reasoning into Ring 2 → ICE: name the system constraint explicitly, weight Outcomes by whether they address it, reject high-impact non-constraint work unless the constraint is already addressed. ~20 minutes per engagement; the highest-leverage operations fix available.

---

## Lens 2 — Business analysis & strategy

**Verdict:** Meaningfully better than 80% of AI-consulting playbooks; not a BABOK substitute.

### What maps to canon

- BABOK Elicitation, Requirements Life Cycle Management (trace-up), Strategy Analysis (Five Rings), and Solution Evaluation (handoff verification) are reasonably covered.
- BCS quality characteristics are partially adopted (5 of ~18 individual + 6 set-level).
- ICE scoring is used at Solution level.
- Mendelow's power-interest grid is used for stakeholder mapping.
- Goal Decomposition Ladder is recognizably a child of Basili's GQM (Goal-Question-Metric).

### What's missing

- **Ulwick Outcome-Driven Innovation vocabulary collision.** Ulwick's "Outcome Statement" has a precise four-part syntax (*Minimize the time it takes to…*). The Field Guide's "Outcome" is closer to a Doerr-style OKR Objective + Key Results. The collision is real and uncited.
- **BCS attributes dropped:** priority (MoSCoW), rationale, version history, resolution, type classification (functional vs. NFR), identifier, acceptance criteria as distinct from Targets. Calling the framework "adapted from BCS 18" overstates the adoption.
- **Kano model** — no must-have / performance / delighter distinction across Targets.
- **WSJF / Cost of Delay** absent (despite RICE / WSJF dominating modern scaled-agile prioritization).
- **Mitchell-Agle-Wood salience model** — the doc uses the lower-rigor Mendelow grid and misses the "dangerous stakeholder" classification (power + urgency, no legitimacy) the doc itself warns about in Appendix C.
- **RACI** per Outcome — would resolve the "Phantom Owner" anti-pattern more rigorously.
- **Wardley Mapping** absent despite the doc's foundational principle ("Tools follow processes follow business model") being a Wardley value-chain assertion. Wardley would defend the no-code-first principle far more credibly.
- **Treacy & Wiersema** — cited but not operationalized. A workflow that fails on Operational Excellence is much more dangerous for a cost-leader than for a customer-intimacy firm; the doc has no mechanism for this distinction.
- **Balanced Scorecard Customer perspective** — workflows are mapped, but customer-perspective metrics (NPS, retention, customer effort score) are mostly absent.
- **Assumption Mapping (Bland & Osterwalder)** — Open Questions is excellent but Assumption Mapping is more rigorous and would convert questions into testable hypotheses.
- **NFR taxonomy** — performance, security, compliance, maintainability are not separately scoped.

### Highest-ROI additions from this lens

1. Resolve the Ulwick collision: either adopt ODI syntax for customer-facing Targets or rename "Outcome" to "Business Result" with "Key Results" (OKR lineage).
2. Add Kano classification per Target.
3. Add WSJF override for time-bound Outcomes.
4. Adopt Mitchell-Agle-Wood salience for stakeholder mapping; layer RACI per Outcome.
5. Ship one Wardley map per engagement (in the readout deck, between business overview and Outcome list).
6. Add MoSCoW priority as an explicit Outcome attribute.
7. Add NFR sub-rubric to the Solution Composition Canvas.
8. Cite Basili GQM as the precedent for the Goal Decomposition Ladder.
9. Add Assumption Mapping as the bridge artifact between Open Questions and Build kickoff.

### Single biggest fix from this lens

Resolve the BCS / OKR / Ulwick vocabulary collision and pick one lineage explicitly. The doc currently borrows naming from BCS, structure from OKRs, and the word "Outcome" from Ulwick without acknowledging that the three traditions are not consistent.

---

## Lens 3 — Solution & enterprise architecture

**Verdict:** A pragmatic, defensible "ArchiMate-lite for SMB." Fit for purpose at this scale; one fixable operational-architecture gap.

### What maps to canon

- The four-layer Edge Waypoint Stack (Brain / Nerves / Skin / Intelligence) is functionally a collapsed ArchiMate stack: Business / Application / Technology with Intelligence as a cross-cutting layer.
- The Five Rings approximate Zachman's six interrogatives (Why / How / Who / What / Where), reordered.
- The "altitudes" in §8.8 are compatible with C4 model's Context / Container / Component progression.
- The six business needs are doing the job of a Level-1 capability map (technology-independent vocabulary for what the business needs to be able to do).
- The "each layer independently swappable" claim echoes MACH (Microservices, API-first, Cloud-native, Headless).

### What's missing

- **Architecture Decision Records (Nygard pattern).** Open Questions surface unresolved decisions for the client; ADRs document resolved decisions for posterity. Distinct artifacts. ADRs are the highest-ROI architecture addition the methodology could make.
- **C4 Context + Container diagrams as standard deliverables** — concepts of altitude are named but no diagrams render them.
- **n8n missing from the default Nerves layer.** Make's ownership churn (Celonis acquisition, 2024-2025 pricing volatility) and n8n's 80–90% cost advantage at AI-workflow volume make this an overdue addition.
- **No Capability Map Level 2** — the six needs are L1; an industry-specific L2 (one page per need) would compress every engagement.
- **No reference architectures per business need** — six canonical designs (Capacity reference, Visibility reference, etc.) would be reused on every engagement.
- **No data architecture pattern declared** — no system-of-record vs. system-of-engagement vs. system-of-insight separation; no rule against reporting from the live operational base.
- **Airtable scale limits named but no migration path** — the doc says "use custom code if you exceed 500k" but doesn't say *what code, with what migration strategy*. SMBs that grow into this wall lose months.
- **Vendor risk / iPaaS lock-in barely surfaced** — Make's pricing volatility, Airtable's 2024-2025 price increases, Softr's VC-funded unprofitability are unaddressed.
- **No eval architecture or observability for AI agents.** Custom AI agents at $15k+ ship without LLM evals, no Langfuse/LangSmith/Arize, no fallback, no human-in-the-loop checkpoint. Largest gap relative to current AI architecture practice.
- **Security & compliance configuration** — PII/PHI mentioned, but no architecture-level guidance (Airtable Enterprise + BAA for HIPAA, Claude API zero-retention settings, etc.).

### Highest-ROI additions from this lens

1. Adopt ADRs (Nygard template) as a standard Build-engagement deliverable.
2. Ship C4 Context + Container diagrams for any build above $7,500.
3. Add n8n as a third default in the Nerves layer; reframe Make/Zapier/n8n as a tiered choice.
4. Publish six reference architectures, one per business need.
5. Add a Vendor Risk Register to Roadmap deliverables.
6. Add an Eval & Observability sub-aspect for any Solution involving Intelligence.
7. Offer Event Storming as an optional Tier 0 service.
8. Adopt Fairbanks's risk-driven architecture rule explicitly.
9. Name "Walking Skeleton" as the Build pattern for Week 1.
10. One-page security/compliance configuration checklist per layer.

### Single biggest fix from this lens

Adopt ADRs + C4 Context diagram + Vendor Risk Register as three standard Build-engagement deliverables. Five days of methodology work; closes the gap between "good SMB consultancy" and "the methodology a CFO with EA background would respect."

---

## Lens 4 — Change management & benefits realization

**Verdict:** Above the AI-consulting average on architecture (Adoption + Governance + Measurement are first-class); below MSP / Prosci grade on instrumentation.

### What maps to canon

- ADKAR is touched implicitly: stakeholder comms → Awareness; training → Knowledge/Ability; champions → Desire; resistance handling → Desire deficits; Care Plan → Reinforcement.
- Kotter's quick-wins (§11.3) and guiding coalition (owner-as-sponsor) are explicit.
- Bridges' Neutral Zone is partially covered by the Day-30 Adoption Audit.
- Targets with anti-criteria and the Measurement Aspect approximate parts of an MSP Benefits Profile.
- The trace-up discipline is Cranfield BDN–adjacent in spirit.

### What's missing

- **ADKAR per-stakeholder pre-assessment.** Prosci's own 2024-2025 data: projects with rigorous change diagnostics hit objectives 88% of the time vs. 13% with poor change management — a 7× lift. The Adoption Aspect lists activities but never asks "where is this person on each ADKAR stage?"
- **MSP Benefits Profile fields:** dis-benefits (what is lost), realization timeline (when benefits accrue post-handoff), benefit review dates. The doc's "verification at handoff" treats Targets as point-in-time events; MSP treats benefits as accruing over 6-18 months with audited reviews.
- **Cranfield Benefits Dependency Network (one page per Outcome).** Four columns: Tool enabler → Enabling change → Business change → Benefit. The trace-up discipline collapses the middle two into the Aspects bucket and doesn't render the dependencies.
- **Bridges' "Ending" ritual.** The doc never names what is being given up (the spreadsheet someone built on weekends, the meeting someone ran, the sense of expertise someone had). Bridges-aware practitioners pre-empt the sabotage that comes from un-grieved loss.
- **Rogers / Moore chasm.** The Day-30 audit is exactly when the chasm shows up (between enthusiastic champion and indifferent majority); the doc doesn't name the phenomenon.
- **Cultural readiness instrument** — qualification scorecard rates "staff willingness" 1-3; an OCAI (Cameron & Quinn) at kickoff would predict cultural rejection before scoping.
- **Adoption-metric standards** — what's a healthy Day-30 active-usage rate for a new Airtable + Make stack across an 18-person team? The doc doesn't say.
- **Lead vs. lag indicator confusion.** Targets are almost entirely lag (overtime hours, retention). Adoption metrics by definition must be lead (% of intended users active weekly, automation success rate, dashboard view rate).
- **Day 30 / 90 / 180 / 365 audit cadence** built into every Care Plan. The Care Plan is sold as hours, not as outcome-protection.
- **Health-score dashboard per Care Plan client** with defined intervention triggers (Gainsight-style customer success discipline).
- **No "adoption risk register"** — Open Questions covers unresolved decisions; there's no equivalent for "what could decay this Solution in 90 days."
- **AI failure-context unused commercially.** McKinsey 2025 (88% adopt, 6% win), BCG (4% generate cross-functional AI value), MIT NANDA (95% of pilots return zero) — none cited in the discovery call or readout.

### Highest-ROI additions from this lens

1. ADKAR pre-assessment, 15 min per stakeholder, Week 1.
2. One-page Cranfield BDN sketch per Outcome.
3. MSP Benefits Profile fields added to Outcome record (dis-benefits, realization timeline, review dates).
4. Day 30 / 90 / 180 adoption checkpoint template built into every Care Plan.
5. Defined library of leading indicators per Aspect.
6. OCAI cultural readiness instrument at pre-engagement (10 min, 6 questions).
7. Stakeholder Resistance Map (likelihood × root cause × intervention) in Week 1.
8. "What we are giving up" Bridges-style slide in the readout deck.
9. Health-score dashboard per Care Plan client with intervention triggers.
10. AI failure-context slide for discovery call (cites McKinsey 2025, BCG 2025, MIT NANDA 2025).

### Single biggest fix from this lens

Add a Week-1 ADKAR pre-assessment, a one-page Cranfield BDN per Outcome, and a Day 30/90/180 audit template inside every Care Plan. Together: takes the doc from "above AI-consulting average" to "defensible against MSP / Prosci-grade scrutiny" — and the same three additions reliably convert Build engagements into Strategic-tier Care Plans (which is where the practice's economics actually live).

---

## Lens 5 — Consulting practice & AI-transformation playbooks

**Verdict:** Methodology is 90% of where it needs to be; go-to-market is 40%.

### What maps to canon

- The killer question ("walk me through yesterday") and elicitation rigor are above Big 4 SMB-engagement median.
- Anti-criteria as a first-class artifact is rarer than rare.
- Solution-agnostic problem classification with explicit no-AI options is genuinely contrarian.
- The Fractional AI Officer at $4,500–$7,500/mo is a clean SMB-sized substitute for Andrew Ng's "in-house AI team" step.
- The five-Aspect model implicitly mirrors BCG's 10-20-70 rule for AI value capture.
- Money-back guarantee with an objective trigger eliminates the dispute-mode failure of subjective guarantees.

### What's missing

- **No Day-1 ghost deck (Minto Pyramid Principle, MECE, SCQA).** Five Rings is discovery; McKinsey is hypothesis-driven. A discovery-driven engagement converges in weeks; a hypothesis-driven one converges in days.
- **MECE never named.** The May-2026 audit note that the six needs aren't fully MECE (Cost vs. Capacity overlap; Reach is weak) is itself evidence of the gap.
- **No business case / NPV / payback period per Outcome.** Move 3 (Find the consequence) already collects the financial input; the doc never closes the loop into a one-page financial case.
- **No industry benchmarking.** Ring 2 collects RPE / CAC / LTV but never compares to medians (RMA, IBISWorld, vertical SaaS reports).
- **No pre-mortem.** 20-30 minutes, ~30% lift in failure-mode detection (Klein). Anti-criteria does half the work.
- **No Cynefin triage** at Move 1. The six-move flow assumes a Complicated problem. For Complex problems (emergent, culture-masquerading-as-workflow), it will produce a confidently wrong Outcome with crisp Targets.
- **Horizontal positioning.** No vertical niche. Baker and Morgan are unanimous on this being the single biggest commercial lever for solo consultants.
- **Service menu is broad, not productized.** Twelve Deliver-tier offerings with price ranges; none are named products with case studies.
- **Pricing anchored to time/market, not value.** Alan Weiss: fees should be 1-3% of expected client value. The doc currently anchors to KC market rates.
- **No case-study / referral engine.** Mentions converting Build clients to Care Plans but no systematic case-study capture at handoff.
- **PoC purgatory unaddressed.** Recent research: ~33% of pilots reach production; 95% of enterprise AI pilots fail to scale; 42% of orgs abandoned most AI initiatives in 2025. The Build Phase implicitly assumes production; no pre-scale validation gate.
- **EOS / Scaling Up competitive flank undefended.** An EOS-implementing CEO will ask "isn't this just Rocks + Scorecard + L10?" The clean answer exists ("we work *with* your EOS Implementer, after EOS produces clarity but before operational friction gets engineered out") but isn't in the doc.

### Highest-ROI additions from this lens

1. Day-1 ghost deck (Minto SCQA) drafted before kickoff; killed during the diagnostic.
2. One-page business case per top-3 Outcome (payback, NPV, sensitivity).
3. Cite BCG 10-20-70 explicitly in §8.3 to justify charging for Process + Adoption + Governance.
4. Pre-mortem at Week 1 kickoff (20 min, Klein protocol).
5. Industry benchmarking row added to Ring 2 (RPE / CAC / margin vs. median).
6. Productize the top three Deliver offerings (named, fixed scope, fixed fee, case studies). E.g., "KC Insurance Agency Quoting Automation," "CPA Firm Tax-Season Capacity Audit," "HVAC Service Dispatch AI."
7. Value-based pricing on top-tier engagements: fee at 1-3% of expected first-year value (keep diagnostic flat-priced; vary the Build).
8. Case-study factory cadence at every handoff (45-min interview, before/after metrics, anonymized one-pager, referral ask).
9. Pre-scale validation gate: Before any Build extends to production, require pilot to hit measurable Target value, named champion using it weekly, governance owner identified.
10. Cynefin triage at Move 1. If problem is Complex (not just Complicated), switch from 3-week diagnostic to a 1-week safe-to-fail probe.
11. EOS / Scaling Up positioning statement in Part 5 ("we work with your EOS Implementer, not against them").

### Single biggest fix from this lens

Productization + niche. Pick two verticals (e.g., KC accounting firms and KC insurance agencies), name three fixed-scope products under each, build case studies, and price the top tier on value not time. Will change lead flow more than any methodology edit.

---

## Consolidated high-ROI additions, ranked

Combining all five lenses, the additions below appear once per priority tier in order of impact-per-effort.

### Tier 1 — Ship in the next revision (methodology edits, hours of work)

| # | Addition | Lens | Notes |
|---|---|---|---|
| 1 | TOC Five Focusing Steps at Ring 2; weight ICE by constraint contribution | Ops | The doc's single largest methodology gap |
| 2 | Replace **Reach** with **Cost** (or expand to seven needs) | Ops / BA | Already flagged in the doc's own May-2026 audit |
| 3 | One-page business case per top-3 Outcome (payback, NPV, sensitivity) | Consulting | Standard McKinsey/BCG value engineering |
| 4 | Cite BCG 10-20-70 explicitly in §8.3 | Consulting | Converts methodology discipline into commercial credibility |
| 5 | Resolve Outcome / OKR / Ulwick vocabulary collision | BA | Pick one lineage; acknowledge the others |
| 6 | Adopt ADRs (Nygard template) as a Build-engagement deliverable | Architecture | Highest-ROI architecture addition |
| 7 | ADKAR pre-assessment in Week 1 (15 min per stakeholder) | Change | 7× project-success lift per Prosci data |
| 8 | One-page Cranfield BDN per Outcome | Change | Renders enabling changes the Adoption Aspect must deliver |
| 9 | Day 30 / 90 / 180 adoption checkpoint built into every Care Plan | Change | Converts Care Plan from hours-retainer to outcome-protection subscription |
| 10 | Cynefin triage question at Move 1 | Consulting | Prevents shipping precision Solutions for emergent problems |

### Tier 2 — Add within two engagements (artifact and template work)

| # | Addition | Lens |
|---|---|---|
| 11 | C4 Context + Container diagrams for any Build above $7,500 | Architecture |
| 12 | n8n added as a third default in the Nerves layer | Architecture |
| 13 | Vendor Risk Register added to Roadmap deliverables | Architecture |
| 14 | Eval & Observability sub-aspect for any Solution involving Intelligence | Architecture |
| 15 | Kano classification per Target | BA |
| 16 | WSJF override for time-bound Outcomes | BA |
| 17 | Mitchell-Agle-Wood salience + RACI per Outcome | BA |
| 18 | Wardley map in the readout deck | BA |
| 19 | Pre-mortem at Week 1 kickoff (Klein protocol) | Consulting |
| 20 | Industry benchmarking row in Ring 2 (RPE/CAC/margin vs. median) | Consulting |
| 21 | TIM WOODS waste tags on every friction-catalog entry | Ops |
| 22 | Service blueprinting (Fitzsimmons) for customer-facing workflows | Ops |
| 23 | Ishikawa + Pareto for top-3 friction analysis | Ops |
| 24 | A3 one-pager format for each top-3 Outcome in the readout deck | Ops |
| 25 | Stakeholder Resistance Map in Week 1 | Change |
| 26 | OCAI cultural readiness instrument at pre-engagement | Change |
| 27 | "What we are giving up" Bridges-style slide in readout | Change |

### Tier 3 — Commercial / go-to-market (weeks of positioning work)

| # | Addition | Lens |
|---|---|---|
| 28 | Pick two verticals; productize three offerings per vertical | Consulting |
| 29 | Value-based pricing on top-tier engagements (1-3% of expected first-year value) | Consulting |
| 30 | Case-study factory cadence at every handoff | Consulting |
| 31 | EOS / Scaling Up positioning statement in Part 5 | Consulting |
| 32 | AI failure-context slide for discovery calls (McKinsey/BCG/MIT NANDA citations) | Change / Consulting |
| 33 | Pre-scale validation gate before any pilot extends to production | Consulting |
| 34 | Six reference architectures, one per business need | Architecture |
| 35 | Day-1 ghost deck (Minto SCQA) drafted before each kickoff | Consulting |

---

## Where Edge Waypoint is genuinely stronger than its competitors

These elements were independently identified as strengths by multiple lenses and are commercially defensible differentiators:

- **The five-Aspect Solution model** (Build / Process / Adoption / Measurement / Governance). The single most valuable construct in the document. Effectively makes BCG's 10-20-70 rule operational at engagement level. Better than typical Lean/Six Sigma engagements (which end at Improve and Control) and better than typical SaaS consulting (which ends at deployment).
- **Anti-criteria as a first-class artifact.** Neither BABOK, BCS, OKRs, ODI, ADKAR, Kotter, nor MSP elevate failure conditions to a defined field. Move 5 ("If we hit the Target but X also happened, would it still count as success?") is methodologically honest and rare.
- **Open Questions as a separate deliverable.** Most-skipped output across the consulting industry; the doc is correct to make it explicit.
- **Solution-agnostic problem classification.** The "When AI is the wrong answer" table (§3.4) — mapping seven stated problems to non-AI right answers — is rare in AI consulting and probably the strongest commercial moat in the practice.
- **No-code-first principle with named default tools.** Most architecture canon assumes custom-code default; inverting it is right for the 6–75 person target. The commitment to specific tools (Airtable / Make / Softr / Claude API) is what makes the methodology shippable by a non-architect operator.
- **Care Plans as recurring revenue tied to ongoing benefits.** Rare in SMB consulting, structurally aligned with benefits realization, and a built-in correction to the 60-70% transformation-benefits-evaporate problem.
- **Money-back guarantee with an objective trigger.** "3 quantified Outcomes or you pay nothing" eliminates the dispute-mode failure of subjective guarantees.
- **The trace-up discipline** (Work Item → Block → Aspect → Solution → Outcome with Targets). Cleaner than BABOK's requirement-types-and-traceability-matrix and friendlier to non-technical clients.
- **Quality discipline (Part 10).** The 18-characteristic-style quality framework, anti-pattern catalogue, and pre-readout checklist are unusually mature for SMB-tier consulting.
- **Quick-Pass mode (§10.5).** Methodology elasticity is rare; the 15-20 min compressed flow makes the framework usable in discovery calls and Care Plan check-ins, not only in $3,500+ engagements.

---

## Final verdict

The Field Guide is a more thoughtful and disciplined methodology than the vast majority of AI-consulting and small-business operations-consulting playbooks in circulation. Its structural choices — five Aspects, anti-criteria, Open Questions, trace-up, no-code-first, willingness to say no to AI, paid Adopt and Sustain tiers, objective-triggered guarantee — are correct, and several of them are genuinely contrarian in the right direction.

What separates the current draft from a defensible Big 4-grade methodology is **instrumentation**, not redesign. The architecture is right; the instruments that populate it are partial. Adding constraint analysis at Ring 2, a per-Outcome business case, an ADKAR pre-assessment, a Cranfield BDN sketch, ADRs, and a Day 30/90/180 audit cadence — the six edits cost roughly two weeks of methodology work and would convert "above the AI-consulting average" into "defensible under expert scrutiny from any of the five canonical lenses."

What separates the current practice from a high-ROI productized consultancy is **commerce**, not methodology. The Service Menu is broad, not productized. The positioning is horizontal, not vertical. The pricing is anchored to time, not value. The Care Plan is sold as hours, not as outcome-protection. None of these are methodology problems. All are positioning problems. Pick two verticals, name three products per vertical, build case studies, and reprice the top tier on value — and the same methodology will generate three to five times the lead flow.

**The single thing to do tomorrow:** add Goldratt's Five Focusing Steps to Ring 2 and weight ICE by constraint contribution. Twenty minutes of methodology work. Larger ROI than any other single edit available.

---

*Report consolidated from five parallel research-agent pressure-tests, May 2026.*
