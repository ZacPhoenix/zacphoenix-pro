# 09 — Setup checklist (do this in order)

Stand the whole system up. Each step links to the chapter with the detail.
Check the boxes as you go.

## Phase 1 — Configure Linear (30–60 min)

- [x] **Create the workspace/team** you'll run agents in (or use an existing
      one). — *Zac Phoenix (`ZAC`)*
- [x] **Enable Triage** for the team: *Settings → Triage*. New/captured issues
      land here untriaged. ([02](02-triage-inbox.md))
- [ ] **Set up capture routes** into Triage: mobile, email-to-Linear, Slack, and
      the agent MCP — all arriving **unassigned + untriaged**. ([02](02-triage-inbox.md))
- [x] **Create labels:** `source:human-capture`, `source:agent`, and a `blocked`
      / escalation label. ([02](02-triage-inbox.md), [07](07-human-escalation-standard.md))
- [ ] **Decide your outcome-tree mapping:** Initiative → Project → Issue →
      Sub-issue. Create at least one root Initiative and Project so agents have a
      tree to attach to. — *root project `Foundation` exists; add an Initiative
      above it if/when you want one.* ([01](01-outcome-hierarchy.md))
- [x] **Create a "Sessions" project** (or external store) to hold agent-session
      records + transcripts. ([06](06-agent-session-lifecycle.md))
- [x] **Confirm statuses:** Triage → Backlog → Todo → In Progress → In Review →
      Done, plus **Blocked**. Blocked is mandatory for escalations. ([06](06-agent-session-lifecycle.md), [07](07-human-escalation-standard.md))

## Phase 2 — Ticket standards (20 min)

- [ ] Adopt the **ticket contract** template (Goal / Why / Outcomes /
      Implementation / Verifications). ([03](03-ticket-contract.md),
      [`templates/ticket-template.md`](templates/ticket-template.md))
- [ ] Adopt the **verification standard** (Automated / Manual / Visual; no
      unchecked box may close). ([04](04-verification-checklists.md))
- [ ] Save the **ticket intake guidelines** prompt for turning triage items into
      standard tickets. ([`prompts/ticket-intake.md`](prompts/ticket-intake.md))

## Phase 3 — Agent connection & identity (30–60 min)

- [ ] Connect a harness to the **stock Linear MCP** and confirm read/create/move
      works. ([08](08-linear-mcp-setup.md))
- [ ] Create a Linear **OAuth app / bot actor** for agents — step-by-step in
      [`scripts/README.md`](scripts/README.md) (uses `actor=app`, no extra seat).
      ([08](08-linear-mcp-setup.md), fix 2)
- [ ] Stand up (or configure) a **custom MCP** authenticated as that app, with:
  - [ ] `get_issue` returning full context (comments + sub-issues + PRs). (fix 3)
  - [ ] `update_issue_description_patch` (diffs only; protects Verifications). (fix 1)
  - [ ] No full-overwrite description tool. (fix 1)
- [ ] Point **all** harnesses (Claude Code, Codex, Cursor, Antigravity) at the
      app-authenticated MCP. ([08](08-linear-mcp-setup.md))

## Phase 4 — Rules & hooks (30–60 min)

- [x] Install [`templates/agent-rules.md`](templates/agent-rules.md) into each
      harness (CLAUDE.md / equivalent). — *root `CLAUDE.md` committed.*
- [ ] Install hooks ([`templates/hooks/`](templates/hooks/)):
  - [ ] `block-askuser` — no mid-batch questions. ([05](05-batches-and-workstreams.md))
  - [ ] `require-session` — session must be registered before work. ([06](06-agent-session-lifecycle.md))
  - [ ] `verify-checkboxes` — all boxes ticked, none deleted, before Done. ([04](04-verification-checklists.md))
  - [ ] `require-merged-pr` — merged + deployed PR before Done. ([06](06-agent-session-lifecycle.md))
  - [ ] `session-closeout` — postconditions + transcript before session complete. ([06](06-agent-session-lifecycle.md))
- [x] Add the **human escalation standard** to the rules. — *included in
      `CLAUDE.md`.* ([07](07-human-escalation-standard.md),
      [`prompts/human-escalation.md`](prompts/human-escalation.md))

## Phase 5 — Run your first batch (ongoing)

- [ ] Drop a handful of things into **Triage**. ([02](02-triage-inbox.md))
- [ ] Run the **workstream update** to process triage and emit 3–5 prompts.
      ([05](05-batches-and-workstreams.md),
      [`prompts/workstream-update.md`](prompts/workstream-update.md))
- [ ] **Paste each prompt** into a separate harness window — one workstream each,
      non-overlapping code areas. ([05](05-batches-and-workstreams.md))
- [ ] Let the batch run **unsupervised**. Come back and **review + kick off the
      next batch in one sitting**. ([05](05-batches-and-workstreams.md))
- [ ] Aim for **2–4 batches/day**. ([05](05-batches-and-workstreams.md))

## Phase 6 — Later, when you outgrow the hacks

- [ ] Replace hooks with a real **workflow/state machine** (API-invoked agents).
- [ ] Add **metrics**: completion rate, defect rate, variance.
- [ ] Add **evals**: same task under different guidance, run weekly.

  ([08](08-linear-mcp-setup.md) roadmap, [README](README.md))

---

### Minimum viable version

If you want to try the smallest useful slice today, do just these: enable
**Triage**, adopt the **ticket contract** + **verification checklist**, install
the **agent rules** with the **completion contract** and **AskUser block**, and
run **one workstream update → paste into 3 windows**. Add identity, custom MCP,
and hooks once the basic loop feels good.
