# Phase 1 Research Notes — Indie iOS Team Operating Models

_Date: 2026-03-12_

## Working question
What do successful small indie iOS teams actually do, and what can Hexappic replicate locally with agents without copying corporate theater?

## Initial source signals

### 1) Solo / very small teams are normal
- Indie iOS success stories skew heavily toward **solo** or **micro-team** setups.
- The Astro Photons Apps writeup describes an 11-year independent iOS app portfolio business built largely solo, emphasizing that an indie iOS developer becomes a **business owner**, not just a programmer.
- Signal: small size is not a handicap if scope is tight and iteration is consistent.

### 2) Speed to market beats perfection
- Multiple Indie Hackers stories emphasize **fast iteration**, portfolio thinking, and shipping repeatedly rather than polishing forever.
- Signal: the operating model should privilege fast decision cycles, small tickets, and continuous release.

### 3) Distribution matters as much as code
- Indie Hackers examples repeatedly call out **marketing validation, existing audience, and distribution** as leverage.
- Signal: PM and Research roles matter. Pure engineering teams underperform if nobody owns validation or distribution.

### 4) Successful teams compress roles
Common patterns across indie teams:
- Product + PM often merged with founder
- Design often lightweight or founder-led
- Engineering often 1 person
- Marketing/growth sometimes part-time but crucial
- Signal: Hexappic should start with 3 active roles, not 6-8 ceremonial ones.

### 5) Lightweight async systems dominate
Observed / inferred common stack across small successful builders:
- Git for source of truth
- Simple issue tracking (GitHub issues / Linear / notes)
- Docs close to execution, not in a separate process-heavy silo
- Signal: local markdown + tickets + comments is directionally right.

## Proven patterns worth copying

### Pattern A — One clear owner per function
Human indie teams work when ownership is obvious.
- Product owner decides scope
- Builder decides implementation
- Researcher validates evidence

**Translation for Hexappic:**
- PM Agent: backlog, scope, prioritization, sponsor communication
- Dev Agent: implementation plans, execution, technical challenge
- Research Agent: customer evidence, market sanity checks, solution gap analysis

### Pattern B — Shared written artifacts
Successful small teams rely on:
- tickets
- release notes
- changelogs
- rough docs
- customer notes

They do **not** rely on memory or constant meetings.

**Translation for Hexappic:**
All work should leave behind artifacts:
- ticket
- linked doc
- decision note
- test evidence

### Pattern C — Minimal process, maximum clarity
Small teams fail when they install enterprise process.
They win when they keep only:
- backlog
- current work
- done
- release decisions
- customer evidence

**Translation for Hexappic:**
No fake ceremonies. No standup theater. No overbuilt states.
Recommended ticket states:
- Backlog
- Ready
- In Progress
- Review
- Done
- Blocked

### Pattern D — Scope is the real strategy
Successful indie builders cut aggressively.
The winning skill is not "build more" but "ship the smallest thing people pay for."

**Translation for Hexappic:**
PM must force every ticket to answer:
- What user pain does this solve?
- Why now?
- What is the smallest acceptable version?
- What can be cut?

### Pattern E — Validation before depth
Indies that survive check whether users care before they overbuild.

**Translation for Hexappic:**
Research Agent must challenge tickets with:
- evidence of pain
- evidence current solutions are weak or frustrating
- evidence target users spend money

## Anti-patterns to avoid

### Anti-pattern 1 — Fake multi-agent theater
Multiple agents that simply agree with each other add latency, not value.

**Rule:** every specialist role must have a distinct mandate to challenge assumptions.

### Anti-pattern 2 — Corporate workflow cargo cult
Jira complexity, too many states, too many docs, too many roles.

**Rule:** Hexappic should feel like a sharp 3-person indie shop, not a PMO.

### Anti-pattern 3 — Docs detached from execution
Knowledge bases that don’t link to tickets rot quickly.

**Rule:** docs and tickets must cross-link by ID.

### Anti-pattern 4 — Done without evidence
Small teams often get away with loose validation; agents should not.

**Rule:** ticket completion requires Gherkin scenario evidence.

## Initial operating model recommendation

### Minimum viable team
1. **CEO / Sponsor (Zac)**
   - sets direction, approves major bets
2. **PM Agent (Hex)**
   - owns backlog, scope, priorities, cross-role synthesis
3. **Dev Agent**
   - challenges feasibility, implements, documents technical constraints
4. **Research Agent**
   - validates pain, customer demand, competitor weakness

### Optional later role
5. **UX Agent**
   - only add when UI/flow work becomes a real bottleneck

## Initial workflow recommendation
1. Research creates or updates a problem brief
2. PM converts it into ticket(s)
3. Dev reviews and challenges technical scope
4. PM revises or approves
5. Work executes
6. Gherkin acceptance criteria are validated
7. Ticket closes with links to evidence

## Tooling implications
The local platform should support:
- ticket creation/editing
- comments by role
- status transitions
- links to KB docs
- per-ticket acceptance criteria
- test evidence
- local-first storage

## Preliminary conclusion
The best model to replicate is **not** a larger team. It is a **compressed, artifact-driven micro-team** with strong ownership, lightweight async communication, and ruthless scope control.

That is the model Hexappic should implement first.

## Source notes
- Astro Photons Apps — long-running solo iOS business; emphasizes indie = business owner, solo viability, persistence
- Indie Hackers stories — recurring themes: speed to market, iteration, portfolio approach, distribution leverage, validation over perfection
