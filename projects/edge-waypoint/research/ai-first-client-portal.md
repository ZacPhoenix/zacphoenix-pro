# The Best Client Portal in an AI-First, MCP-Enabled World

Follow-up to `notion-alternatives.md` and `dev-docs-portal-tools.md`. The question: **what is the best client-portal tool now that agents (Claude/Codex) and MCP are the center of gravity?**

The answer reframes "best." In an AI-first world, a portal's value is no longer just *how polished and white-labeled the client view is* — it's *how completely an AI agent can read and write the portal's state*. Most incumbent portals are excellent at the former and almost useless at the latter. Only a handful clear both bars.

*Research date: June 2026, from parallel deep-dives on each product plus an MCP-native architecture/auth pass. MCP and AI features are moving monthly — verify before committing. Sources cited inline.*

---

## TL;DR

- **The reframe:** "best portal" = (agent-drivability via official MCP / broad API) × (branded client sharing) × (turnkey portal capability). Branding is table stakes; **programmability is the new differentiator.**
- **Most incumbents fail the AI test.** SuiteDash, Moxo, and Notch all have strong-to-excellent white-label and **no MCP server**, with APIs that are narrow, gated to Enterprise, rate-throttled, or effectively undocumented. They are portals you *resell*, not portals your agents *run*.
- **Three genuine AI-first winners emerged:**
  - **Copilot / Assembly** — the strongest turnkey pick. Full white-label portal with an **official hosted MCP server (beta, April 2026)** that exposes the *entire* Platform API to Claude — **read, write, and delete** across clients, tasks, messages, files, invoices, contracts, forms — over OAuth. MCP/API gated to Professional ($149/mo); full de-brand to Advanced ($399/mo).
  - **Wayfront (formerly Service Provider Pro)** — the only *other* dedicated portal with a first-party MCP server (OAuth 2.1, **on every plan**, Feb 2026) plus an official Claude Skill. MCP is **read + message-write only** today (full write via CLI/REST). Best fit **if you sell productized services**.
  - **Zoho** — the **most programmable** option overall (first-party MCP *platform* across 40+ apps + native agentic AI), but it's a federated toolkit you assemble, not a cohesive turnkey portal.
- **Emerging but unproven:** genuinely agent-native startups (**Emerjent**, explicitly MCP-on-Claude, design-partner stage; **HyperScale Ai**, launched Apr 2026) — promising positioning, thin track record. Horizontal platforms now ship real agent infra too (**Notion Custom Agents + External Agents API/MCP**; **Klient** MCP for Salesforce PSA).
- **The purist AI-first answer: build your own** — Next.js + Supabase (Postgres + RLS) + a *custom, scoped* MCP server + magic-link/Clerk auth. Most flexible, truly agent-native, true multi-tenancy; weeks of work.
- **Critical architecture rule:** MCP is your **internal agent plane only**. Official database/Notion/Supabase MCP servers run with operator permissions and explicitly **must not be exposed to clients**. The client-facing portal always needs its own scoped auth layer.
- **My pick for Edge Waypoint** (small, AI-first, MCP-savvy, prefers own infra): **buy Wayfront to ship this quarter, and build a Supabase + custom-MCP + Next.js portal as the owned, differentiated product.** Reasoning in [Recommendation](#recommendation).

---

## Scorecard

"Agent-drivability" is the criterion that matters most here — how completely Claude/Codex can read and write portal state.

| Tool | White-label | Portal capability | **Agent-drivability (MCP/API)** | Hosting | Cost signal |
|---|---|---|---|---|---|
| **Copilot / Assembly** | Full (Advanced tier) | Strong (msg/files/pay/e-sign/CRM) | **Official hosted MCP (full read/write/delete), OAuth, Node SDK, 25+ webhooks** — 9/10 | Cloud | $39–399/mo; API+MCP need Pro $149 |
| **GoHighLevel** | Strong + **resell/SaaS mode** | Full marketing-ops OS | **Official hosted MCP (36 tools), free on higher tiers; deep native AI** — 9/10 | Cloud | $97 / $297 / $497 flat |
| **Wayfront** (ex-SPP) | Excellent | Productized-agency OS | **Official MCP (read + msg-write), Claude Skill, REST+CLI** — 8/10 | Cloud | $99–249/mo; REST API +$300/mo |
| **Zoho** | Good (via Creator) | Federated (assemble) | **First-party MCP platform, 40+ apps, Zia agents** — 9/10 | Cloud | ~$37/employee (Zoho One) |
| **SuiteDash** | Excellent (cheap) | Very broad all-in-one | No MCP; narrow API; 20k calls/**mo** cap — 4/10 | Cloud | $19–99/mo flat |
| **Moxo** | Strong | Workflow-centric | No MCP; broad API but Enterprise-gated — 5/10 | Cloud/private | ~$1,000/mo for white-label |
| **Notch** | Partial (can't fully de-brand) | Proposals + onboarding | No MCP; "API" undocumented — 2/10 | Cloud | $19–39/user/mo |
| **Build-your-own** (Supabase+MCP+Next.js) | Total (you own it) | Whatever you build | **Custom scoped MCP, full control** — 10/10* | Self/own infra | ~$15–60k build + auth/infra |

*Build-your-own scores 10 on *potential* agent-drivability because you design the MCP surface — but you have to build it.

---

## Why most incumbent portals fail the AI-first test

This was the consistent, slightly surprising finding across the deep-dives: the dominant client-portal products have invested in white-label polish, not programmability.

- **SuiteDash** — best-in-class white-label at the lowest price (from $19/mo, unlimited clients), great onboarding "FLOWs." But **no MCP server exists** (zero on GitHub/npm/registry), the "Secure API" covers only contacts/companies/projects (no confirmed write for tasks/invoices/files/messages — invoice-write is still an open feature request), and rate limits are **monthly** (20k/mo even at the top tier), which makes tight agent read-write loops impractical. "SuiteAI" is closed, UI-bound content generation with no API. Programmability ~4/10. ([Secure API](https://help.suitedash.com/article/550-secure-api), [invoice-write request](https://vote.suitedash.com/b/api-integrations/create-update-invoices/))
- **Moxo** — strong white-label (custom domain, branded native apps) and a genuinely broad API surface (workspaces, files, messages, tasks, transactions, e-sign — visible via its Zapier app). But **no MCP**, the API is **Enterprise-only + sales-gated + not self-serve documented**, and its "AI agents" are closed in-product agents with no bring-your-own-LLM. White-label needs ~$1,000/mo; API needs Enterprise. Programmability ~5/10. ([Moxo AI](https://www.moxo.com/ai), [Zapier app](https://zapier.com/apps/moxo/integrations))
- **Notch** — polished, modern proposal + onboarding + e-sign experience, but **cannot fully remove its own branding**, has **no MCP**, an "API access" bullet with **no developer docs to back it**, no webhooks, and no native in-product AI. Worst-fit of the set for an agent-driven pipeline. Programmability ~2/10. ([Notch docs index — no API pages](https://docs.notch.so/llms-full.txt))

The lesson: don't shortlist a portal on its marketing screenshots. Ask "does an agent have a documented, high-throughput, broad read/write surface?" — and for almost all of them in mid-2026, the answer is no.

---

## The genuine AI-first options

### GoHighLevel — the most production-hardened MCP, and resellable

The other co-leader. GoHighLevel is a full agency marketing-ops OS (CRM, pipelines, calendars, conversations across SMS/email/chat, payments/invoicing, forms/funnels, memberships/client portal) with a uniquely **resellable SaaS mode** — you rebrand the entire platform, put it on your own domain and branded app, and resell to client sub-accounts. ([MCP docs](https://marketplace.gohighlevel.com/docs/other/mcp/))

- **Official hosted MCP server** at `https://services.leadconnectorhq.com/mcp/`, HTTP transport, bearer-token (Private Integration Token) auth, **36 tools** across contacts, conversations, calendars, opportunities, and payments — works with Claude/Cursor/n8n/LangGraph, and is the most production-ready (not beta) MCP of the whole set. **Included free on Unlimited ($297) and SaaS Pro ($497) plans.** Plus deep native AI ("AI Employee," Conversation AI, AI Studio). ([HighLevel MCP support](https://help.gohighlevel.com/support/solutions/articles/155000005741-how-to-use-the-highlevel-mcp-server))
- **Trade-off:** GHL is a busy, marketing-centric "everything platform," not a boutique client portal. The client-facing surface is less elegant than Assembly's. But if you want a resellable, agent-driven agency OS with the most mature MCP, it's the strongest option — and arguably the best margins (flat pricing, unlimited sub-accounts).

**Verdict:** Co-leader with Assembly. Pick GHL if resell/SaaS-mode white-labeling and the most battle-tested MCP matter more than client-facing polish; pick Assembly if a beautiful boutique portal matters more and you can live with its MCP being beta.

### Wayfront (formerly Service Provider Pro) — the productized-services frontrunner

The other dedicated portal with a native MCP server. SPP rebranded to **Wayfront** in 2026 and shipped an **official, native, remote MCP server** — `https://[workspace].wayfront.com/mcp`, Streamable HTTP, **OAuth 2.1, on every plan** (launched Feb 24 2026), plus an **official Claude Skill** (`clawhub install wayfront`, June 2026) and a built-in Workspace AI agent. ([changelog](https://wayfront.com/changelog), [MCP KB](https://wayfront.com/help/knowledgebase/mcp))

- **Read scope is broad:** orders, statuses, tasks, messages, tickets, invoices, clients, services, subscriptions, activity logs — permission-scoped ("if you can see it, your AI can; if you can't, neither can the AI").
- **Write scope is currently narrow by design:** the agent can **send messages on orders/tickets** (with staff-only visibility option), but **create/update/delete of business objects via MCP is not yet supported** — full write lives in the **CLI** or the **REST Integration API** (a **$300/mo Pro add-on**, or included on Plus).
- **White-label is excellent:** custom domain, per-client drag-and-drop dashboards, remove-badge on Pro, own-Stripe billing with no transaction fees. Purpose-built for **productized/recurring services** (not flexible sprint/Gantt PM).
- **Verdict:** the most MCP-ready client-portal *product* in its category today. Your agents can already observe and triage an entire client workspace and communicate autonomously; full agentic write-back needs the CLI/REST layer. Pilot on Base (~$99–129/mo).

### Zoho — the most programmable, but federated

Zoho is, by a wide margin, the most agent-ready *platform* in the agency-OS class: a **first-party MCP product** (`zoho.com/mcp`) that generates OAuth-scoped MCP servers across **40+ apps** (CRM, Projects, Creator, Books, Sign, WorkDrive…), **scoped CRM MCP servers** usable from Claude/Cursor today, an **official open-source MCP repo** (analytics), mature REST APIs, and native **Zia agentic AI** with 100+ prebuilt agents. Programmability ~9/10. ([Zoho MCP](https://www.zoho.com/mcp/), [CRM MCP](https://www.zoho.com/crm/developer/mcp.html), [analytics MCP](https://github.com/zoho/analytics-mcp-server))

The catch: **there is no single "Zoho client portal."** You assemble it from Projects (project visibility) + Books/Invoice (billing portal) + Forms (intake) + Sign (e-sign) + Creator (custom branded front-end). Only Creator delivers a truly white-labeled client experience, and unifying it all is real integration work. Choose Zoho if you value openness, automation depth, and bundle economics (~$37/employee/mo for Zoho One) over out-of-the-box client-facing polish.

### Copilot / Assembly — the strongest turnkey AI-first portal

Copilot rebranded to **Assembly** (`assembly.com`) in Sept 2025. It's a **fully white-labeled** portal (custom domain, branded email, logo/fonts/colors) covering the whole client lifecycle out of the box — CRM, tasks, files, real-time messaging, invoicing/subscriptions, contracts + e-sign, and intake forms — and it is, on the deep-dive, **one of the very few client portals with a genuine native MCP server, not just an agent-drivable API.**

- **Official hosted MCP server (beta, launched April 15 2026):** `https://mcp.assembly.com` (Streamable HTTP), **OAuth** via your admin credentials (not a pasted key), with per-app revoke in settings. It "can access **any resource available in the Platform API**" — confirmed **read + write + delete** across clients, companies, invoices, messages, tasks, forms, and files. Works with **Claude (web, desktop, Claude Code)**, ChatGPT, and Cursor. Example agent flows: pre-call client briefings, find overdue invoices, bulk-message clients by tier, generate invoices. Admin-only; clients never exposed. ([MCP beta announcement](https://community.assembly.com/t/assembly-mcp-now-in-beta/621), [MCP guide](https://assembly.com/guide/mcp), [docs](https://docs.assembly.com/page/mcp))
- **Full-CRUD REST API + official Node SDK (`copilot-node-sdk`) + 25+ signed webhooks + Zapier/Make**, with `llms.txt` + OpenAPI shipped explicitly "for AI agents." Plus a **Custom Apps platform**: fork a base template, embed your own web app via iframe that receives an **AES-128 encrypted session token identifying the client user**. ([API intro](https://docs.assembly.com/reference/getting-started-introduction), [Custom Apps](https://docs.assembly.com/docs/custom-apps-overview))
- **Native AI:** "Assembly Assistant" — an internal AI colleague with full client context (notes, files, message history) for briefings, drafting, and summaries.
- **Gating to watch:** API + MCP require **Professional ($149/mo)**; full removal of "Powered by Assembly" requires **Advanced ($399/mo)**. Cloud-only, no self-host. MCP is **early beta** — "may be slow and make mistakes," so keep it off unsupervised critical paths for now. Task/PM is lightweight (not deep Gantt). ([pricing](https://assembly.com/pricing))

**Verdict:** For an agency that wants Claude to actually *operate* the client portal — read and write the whole object model — Assembly's full-CRUD MCP edges Wayfront's read+message-write MCP, and it's more turnkey than building your own. The trade-off vs Wayfront: API/MCP sit behind the $149/mo Professional tier (Wayfront ships MCP on every plan), and it's tuned for general professional services rather than productized retainers.

---

## Build-your-own: the purist AI-first architecture

For an agency that is itself AI-native and happy on its own infra, the most powerful answer is to **compose the portal**, because you get to design the exact MCP surface your agents need and own the client experience end-to-end.

**The stack the industry converged on in 2026:** Next.js + Postgres (Supabase/Neon) + Stripe + Clerk/Auth.js + Vercel/Railway.

**The architecture, with the one rule that matters most:**

> **MCP is your internal agent plane, NOT a client path.** Every official DB MCP server (Supabase, Postgres, Notion) runs under broad operator/developer permissions and the vendors explicitly warn: *"Don't connect to production, don't give to your customers."* The Supabase/Postgres MCP runs as the service role and **bypasses Row-Level Security**. So agents drive the backend via MCP on one path; clients reach a separate, RLS-scoped, branded front-end on another.

- **Backend / data layer:** Supabase (Postgres) with **Row-Level Security** — every table gets a `tenant_id`/`org_id`, policies compare it to a JWT claim, enforced in the database so app bugs can't leak across clients. ([Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security))
- **Agent layer:** the **official Supabase/Postgres MCP** for your internal dev/agent loop (read-only mode for safety), and a **custom, narrow MCP** for any client-facing agent — stand it up *inside* your Next.js app with **Vercel's `mcp-handler`** so you expose only your own scoped tools and auth, never the raw DB. ([Supabase MCP](https://supabase.com/docs/guides/getting-started/mcp), [mcp-handler](https://github.com/vercel/mcp-handler))
- **Client front-end:** a branded Next.js app showing each client their scoped projects/tasks/deliverables.
- **Auth:** **magic-link login + one Organization per client.** On Supabase, use Supabase Auth magic links + RLS (cheapest, you own scoping). For the smoothest org/invite UX, **Clerk Organizations** (watch its US-only data residency); reserve **WorkOS** for the day a client demands SSO/SCIM. ([Clerk Orgs](https://clerk.com/docs/guides/organizations/overview), [WorkOS](https://workos.com/pricing))
- **Effort:** a custom client portal that scales is roughly **$15k–$60k-class / 4–24 weeks** (AI tooling cutting 30–45% of that), plus ~$20k–$50k/yr maintenance — versus days-to-value for buying Wayfront/Copilot. ([build-vs-buy](https://appinventiv.com/blog/build-vs-buy-software/))

This is the only path that scores a true 10/10 on agent-drivability *and* gives total branding/multi-tenancy control — at the cost of building and maintaining it.

---

## Recommendation

The honest framing for Edge Waypoint is **build *and* buy**, sequenced:

1. **Buy to ship now — Copilot / Assembly** (Professional tier, $149/mo for API + MCP; Advanced $399/mo for full de-brand). It's the best-aligned turnkey product: a beautiful, fully white-labeled portal clients love **and** an official hosted MCP server that lets Claude read *and write* the entire object model (clients, tasks, messages, files, invoices, contracts). Treat the MCP as promising-but-beta — don't put it on an unsupervised critical path yet. **If you want the most production-hardened MCP and a resellable SaaS-mode platform, GoHighLevel** ($297 Unlimited, MCP free) is the co-leader, at the cost of a busier, less boutique client experience. **If your work is productized/recurring retainers, Wayfront** (MCP on every plan from ~$99/mo) is the niche-best, accepting its MCP is read + message-write until you add the CLI/REST layer.

2. **Build to differentiate and own — Supabase + custom scoped MCP + Next.js + magic-link/Clerk.** This aligns with your stated preference to run on your own infra and with an automation agency's actual skill set. It's the genuinely "AI-first, MCP-enabled" answer: you design the exact tools your agents call, get true per-client multi-tenancy via RLS, and the client sees a 100%-your-brand portal. Keep the official DB MCP servers strictly internal; expose only a narrow custom MCP.

3. **If you'd rather not build or commit to a single turnkey product — Zoho** gives you the most programmable surface (first-party MCP platform + Zia agents) under one cheap bundle, accepting that you assemble the client portal from Creator + Projects + Books + Sign rather than getting it turnkey.

**One-line answer to "what's the best client portal in an AI-first, MCP world?"** Today, **Copilot / Assembly** is the best *off-the-shelf* answer (polished white-label portal + official full-CRUD MCP), with **GoHighLevel** the co-leader for the most mature MCP + resell economics; a **self-built Supabase + custom-MCP + Next.js portal** is the best *strategic* answer for an agency that wants to own an agent-native client experience. Avoid choosing on white-label alone — that's exactly the trap the incumbents (SuiteDash/Moxo/Notch) are betting you'll fall into.

---

## Next steps

- [ ] Decide build-vs-buy posture: ship-now (Assembly / GoHighLevel / Wayfront) vs own-it (custom Supabase stack) vs both-sequenced (recommended).
- [ ] Pilot the buy option: connect Claude Code to a test Assembly workspace via its hosted MCP (OAuth), and run an agent through a real client flow (pre-call briefing, overdue-invoice chase, status update). Confirm the MCP's current write coverage and GA status in the demo.
- [ ] Spike the build path: a Supabase project with RLS + a tiny custom MCP via `mcp-handler` + a one-client Next.js portal with magic-link auth — measure effort honestly before committing.
- [ ] Confirm the write-back gap matters: list the portal mutations you actually want agents to perform, and check each against Assembly MCP (full CRUD, beta) vs GHL MCP (36 tools) vs Wayfront MCP (read/msg) vs custom build.
- [ ] Lock the security rule into any design: official DB MCP = internal only; client path = RLS-scoped + own auth.

---

*Compiled June 2026 from per-product deep-dives (Copilot/Assembly, GoHighLevel, Wayfront/SPP, Zoho, SuiteDash, Moxo, Notch, Plutio, and others) plus an MCP-native architecture + auth pass and an agent-native-startups scan (Emerjent, HyperScale, Notion Agents, Klient). MCP availability, write-scopes, and pricing are changing monthly across this category — re-verify the specific capabilities above before committing.*
