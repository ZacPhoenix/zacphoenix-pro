# Open-Source, Self-Hostable Client Portals

Follow-up to `ai-first-client-portal.md`. The prior reports concluded the best AI-first portals were mostly **closed SaaS**. This one maps the **genuinely open-source, self-hostable** layer — scored on real external-client portal capability, white-label, self-host effort, license (true OSI vs open-core / source-available traps), GitHub health, and (given the thread) AI/MCP/API drivability.

*Research date: June 2026, from parallel per-product deep-dives across four categories: OSS ERP/CRM suites, OSS project-management tools, purpose-built OSS client portals, and composable OSS building blocks. GitHub stars/versions drift — verify before committing. Sources cited inline.*

---

## TL;DR

- **There is no mature all-in-one OSS portal that rivals SuiteDash/Copilot.** But the open landscape is richer than expected, and for an *AI automation* agency the most powerful path is **MCP-native: compose a branded shell over OSS pieces your own agents can operate.**
- **Best single-tool OSS picks (deploy one thing):**
  - **Leantime** — the only PM tool *architected around clients* (client companies, projects assigned to clients, per-client roles), AGPL, trivial PHP/MySQL Docker, and an **official MCP server**. Best "clients log in and see only their projects/status" with minimal ops.
  - **AgencyOS** (directus-labs) — a real self-serve client portal (project/file visibility + Stripe invoice pay) inside a full agency OS, **MIT-licensed and extendable**.
  - **Atrium** — the closest purpose-built single portal (projects + files + invoicing + white-label + custom domain w/ auto-SSL), but **Elastic License v2 (source-available, not OSI)** and very early.
  - **ERPNext + Frappe Helpdesk** — the most complete *fully-open* backbone (tickets + KB + invoices + projects), official Frappe MCP. Heavier stack; no first-party e-sign.
  - **EspoCRM** — lightest native customer portal in an AGPLv3 core + free ~47-tool MCP; portal is utilitarian (Cases + KB).
- **Best compose-your-own stack (the AI-first answer):** a branded shell (**AgencyOS/MIT** or a thin Next.js app you own) wrapping **Documenso** (e-sign), **Cal.com / Cal.diy** (scheduling), **Outline** (client docs), plus an OSS CRM/billing back-office (**ERPNext / Invoice Ninja / Dolibarr**). The trio **Documenso + Cal.com + Outline are all MCP-drivable**, so your agents can run onboarding, contracting, and scheduling end-to-end.
- **Clear avoid-for-this-goal:** **Bitrix24 on-prem** (not OSS — proprietary paid), **Crater** (abandoned since 2023), **SuiteCRM** portal (paid third-party, legacy v7 only), **Twenty CRM** (no portal), **Kanboard / Plane / OpenProject / Huly** (internal-only; guests aren't a real client portal), and **Odoo Community** for this use case (open-core trap — Documents/Sign/Helpdesk are Enterprise-gated).
- **My recommendation:** lead with the **MCP-native compose-your-own stack** (it's a demonstrable differentiator for an automation agency); if you want one deployable tool first, start with **Leantime** or **AgencyOS**. Reasoning in [Recommendation](#recommendation).

---

## Scorecard

"Client portal" = genuine scoped external-client access. "Agent-drivability" = how well Claude/Codex read/write via MCP/API.

### Single-tool portals / backbones

| Tool | Real client portal? | White-label | Self-host | License | Agent-drivability | GitHub health |
|---|---|---|---|---|---|---|
| **Leantime** | **Yes** — client companies + per-client roles | Logo/colors (not full WL) | **Easy** PHP/MySQL Docker | **AGPL-3.0 — open** | **Official MCP** + API — 8/10 | 10.1k★, v3.9.5 (Jun 2026) |
| **AgencyOS** (directus-labs) | **Yes** — project/file visibility + Stripe pay | "100% hackable", you build it | Docker + Postgres (Nuxt+Directus) | **MIT — open** | REST+GraphQL (Directus); no MCP — 6/10 | ~951★, active |
| **Atrium** (Vibra-Labs) | **Yes** — status + files + invoices, hidden internal notes | **Strong** — custom domain + auto-SSL, multi-tenant | Pre-built Docker, single container | **Elastic License v2 — source-available, NOT OSI** | No API/MCP yet — 3/10 | ~36★, v1.8 (May 2026), early |
| **ERPNext + Frappe Helpdesk** | **Yes** — tickets + KB + invoices/projects | Free, built-in (+whitelabel app) | Docker/bench; more moving parts | **GPLv3 / MIT / AGPL — fully open** | **Official Frappe MCP + scoped community MCPs** — 9/10 | 36k★, v16 (Jun 2026) |
| **EspoCRM** | **Yes** — Cases + KB native | Logo/theme; footer removal not official | **Easy**, official Docker, light | **AGPLv3** (+ commercial) | Free ~47-tool community MCP — 8/10 | 3.1k★, v9.3.8 (Jun 2026) |
| **ProjectSend** | Files only (per-client) | Logo/colors/themes | PHP/MySQL; installers | **GPL-2.0 — open** | None — 2/10 | ~1.9k★, mature (since 2011) |
| **Invoice Ninja** | **Yes** — pay, quotes, deliverable docs | Custom domain/logo; **$40/yr de-brand** | Mature, official Docker | **Elastic License v2 — not OSI** | Best REST API + community MCP — 8/10 | 9.8k★, active |
| **Odoo Community** | Partial — orders/invoices/tasks; **no e-sign/docs/tickets** | 3rd-party module to de-brand | Easy, official Docker | **LGPLv3 core but OPEN-CORE** | RPC (deprecating ~2028) + community MCP — 7/10 | 52k★, v19 |
| **Bitrix24 on-prem** | Yes (Extranet + CRM) | Strong (source-editable) | Heavy PHP/BitrixVM | **NOT OSS — proprietary paid** | REST + official doc-MCP + community MCPs — 8/10 | Closed; $3.5k–25k+ |

### PM tools (mostly internal — weak as client portals)

| Tool | Client portal? | License | Agent-drivability | Note |
|---|---|---|---|---|
| **Taiga** | Partial — External User role + public projects | MPL/AGPL — open | REST + community MCPs — 7/10 | One project per client, manual perms |
| **Vikunja** | Thin — no-account public link shares | AGPL — open, no gating | REST + community MCP — 6/10 | Lightest host; no branding |
| **Plane** | **No** — Guest is intake-only | AGPL core, **open-core** | **Official MCP (100+ tools)** — API 9/10 | Great internal tool, not client-facing |
| **OpenProject** | **No** — members, no client model | GPL core, **open-core** | **Official MCP (Enterprise-only)** — 7/10 | Branding + MCP both paywalled |
| **Huly** | **No** — guest seats only | EPL-2.0 — open | Community MCP — 6/10 | Heaviest to run; pre-1.0 |
| **Kanboard** | **No** — anon link or full account | MIT — open, no gating | JSON-RPC + community MCPs — 8/10 | Use as internal AI backend |

### Composable building blocks (compose-your-own)

| Piece | Function | License | MCP / Claude-drivable | GitHub |
|---|---|---|---|---|
| **Documenso** | E-signature | **AGPL-3.0 — open** | ✅ Community MCP (Composio, 17+ tools) | 13.5k★, v2.13 (Jun 2026) |
| **Cal.com** | Scheduling | AGPLv3 core, **open-core** (`/ee`); **Cal.diy = MIT** | ✅ **Official hosted MCP** (`mcp.cal.com`, ~34 tools) | flagship, very active |
| **Outline** | Client docs / KB | **BSL 1.1 — source-available** | ✅ **Built-in MCP** + community MCPs | 39k★, active |
| **Chatwoot** | Client messaging / shared inbox | MIT core, **branding removal = paid EE** | ➖ REST only (wrap it) | 33.1k★, v4.15 (Jun 2026) |
| **Dolibarr** | ERP/CRM/invoicing back-office | **GPL-3.0+ — open** | ➖ REST+SOAP, no MCP | 7.3k★, v23 (May 2026) |
| **Ever Gauzy** | Agency business mgmt | **AGPLv3 + commercial — open, not gated** | ➖ REST, no MCP | ~3.5k★, active |

---

## Purpose-built OSS client portals

These are actually built to *be* client portals (not internal tools with guests bolted on):

- **Atrium (Vibra-Labs)** — the closest single-tool match to a SaaS agency portal: branded place for clients to track project status (custom pipelines), share files, view/pay invoices via Stripe, with internal notes hidden. Magic-link auth, **custom domain + auto-SSL, multi-tenant org isolation**. Modern TS stack (NestJS/Next.js/Postgres), pre-built Docker single container. **Caveat: Elastic License v2 (source-available, not OSI)** — fine for internal agency use, can't resell as a managed service. Very early (~36★, but active, v1.8.0 May 2026), and **no API/MCP yet**. ([Atrium](https://github.com/Vibra-Labs/Atrium))
- **AgencyOS (directus-labs)** — a full agency OS (CRM, projects, CMS site) with a genuine **private self-serve client portal**: project/task/file visibility, Stripe invoice payment, client task assignment via templates. **MIT-licensed** and "100% hackable", Nuxt 3 + Directus, Docker + Postgres. ~951★, actively maintained. The best **fully-MIT** base to extend into your own branded portal. ([AgencyOS](https://github.com/directus-labs/agency-os))
- **ProjectSend** — rock-solid but narrow: a per-client **file-sharing** portal with logo/colors/themes. The most mature here (~1.9k★, maintained since 2011, GPL-2.0). No scheduling/e-sign/projects, no API. Good if "securely deliver files to each client" is the whole job. ([ProjectSend](https://github.com/ProjectSend/ProjectSend))
- **Frappe Helpdesk** — a true dual agent/**customer portal** (ticket submission/tracking, SLAs, knowledge base), fully open GPLv3, Docker easy-install, integrates with ERPNext. Support-centric rather than deliverables/invoicing. ([Frappe Helpdesk](https://github.com/frappe/helpdesk))
- Weaker/early leads from the GitHub `client-portal` topic: **FlowEngine** (white-label automation-agency portal, ~11★, very early), **Pnlcs** (WHMCS-style billing portal, PHP), **Leadflow-CRM**.

---

## Single-tool backbones (fully researched)

### Leantime — best OSS PM tool with a real client persona

The only PM tool here architected around the client relationship: you create **client companies**, assign users to a client, and assign **projects to that client**; users see only their projects, with per-project roles (Owner/Admin/Company Manager/Editor/Commenter/Read-Only). It's slightly coarse (a dedicated single-client "Client Manager" role is an open community request), but it's the only one not retrofitting a guest seat. **AGPL-3.0**, simplest stack here (PHP/MySQL, official Docker Compose, one command), ~10.1k★, v3.9.5 (Jun 2026). Crucially it ships an **official MCP server/bridge** (`Leantime/leantime-mcp`, multiple auth + SSE) — a real differentiator for Claude/Codex automation. ([Leantime](https://github.com/Leantime/leantime), [Leantime MCP](https://github.com/Leantime/leantime-mcp))

### ERPNext + Frappe Helpdesk — the most complete fully-open backbone

Three un-paywalled client-facing layers: the ERPNext Customer Portal (orders/status, paid & unpaid invoices, payments, raise/track issues, project-from-portal) and the modern Frappe Helpdesk SPA (tickets, SLA, KB). Fully open (GPLv3/MIT/AGPL), free white-label on self-host, and the **best AI story**: auto-generated REST API + webhooks, the **official `frappe/mcp`**, and rich community servers like **`buildswithpaul/Frappe_Assistant_Core`** (24 tools, OAuth2+PKCE, every call scoped to Frappe roles + audit log). Heavier Frappe/bench stack; no first-party e-sign (pair Documenso); classic portal UI is dated. ([ERPNext portal](https://docs.frappe.io/erpnext/customer-portal), [Frappe MCP](https://github.com/frappe/mcp))

### EspoCRM — the lightweight native-portal pick

Native customer portal is a **core AGPLv3 feature** (portal-specific roles with `own/account/contact` scoping, multiple portals), surfacing Cases + KB natively. PHP 8 / MySQL, **official Docker, light and easy** — the simplest strong option. Full REST API + free community MCP **`zaphod-black/EspoMCP`** (~47 tools). Weak spots: utilitarian UI; invoices/projects/e-sign need custom entities; footer branding not officially removable. ([EspoCRM portal](https://docs.espocrm.com/administration/portal/), [EspoMCP](https://github.com/zaphod-black/espomcp))

### Invoice Ninja — the billing + paid-deliverables piece

Best OSS client portal for money + file delivery: clients pay invoices online, one-click approve quotes (→ invoice → payment), and a Documents tab selectively shares deliverables. **Elastic License v2** (source-available; can't resell as managed service) and **~$40/yr to de-brand** client pages. Best-documented REST API of the invoicing tools + working community MCP (`Fuciuss/invoice-ninja-mcp`, 26 tools). ([client portal docs](https://invoiceninja.github.io/docs/user-guide/client-portal))

---

## OSS PM tools as portals (reality check)

Most are **internal team tools** — outsiders are limited "guest" seats, not a scoped client portal. Ranked by external-client fit:

1. **Leantime** — see above; the one genuinely client-architected option.
2. **Taiga** — a real built-in **External User** role + public projects give clients scoped read/interaction, fully open (MPL/AGPL), good API + community MCPs. But no client entity (one project per client, manual perms) and a heavier Django+Angular stack. ([Taiga permissions](https://taiga.pm/the-permissions-section/))
3. **Vikunja** — no client concept, but genuinely useful **no-account public link shares** (view/edit by URL); lightest/cheapest to host (single Go binary), AGPL no gating. No branding. Good for a quick "here's your status link," not a branded portal. ([Vikunja sharing](https://vikunja.io/help/sharing-and-teams/))
4. **Plane** — huge community (52k★) and a strong **official MCP (100+ tools)**, but Guests are intake-only and it's open-core. Great *internal* delivery tool + AI automation, not client-facing. ([Plane MCP](https://github.com/makeplane/plane-mcp-server))
5. **OpenProject** — enterprise PM with the best branding and a native MCP — but **both are Enterprise (paid) add-ons** and there's no client model. ([OpenProject MCP](https://www.openproject.org/docs/system-admin-guide/integrations/mcp-server/))
6. **Huly** — most powerful all-in-one (Linear/Jira/Slack/Notion), but guest-only externals, no white-label, heaviest to run, pre-1.0. Great internal workspace, wrong tool for clients.

---

## Composable building blocks + the compose-your-own stack

Because Edge Waypoint sells AI automation, prioritize **MCP-native** pieces so agents can *operate* the portal, not just sit behind it. The standouts:

- **Documenso** (e-sign, AGPL-3.0) — self-host DocuSign alternative, no per-doc fees; **community MCP (Composio, 17+ tools)** documented for Claude Code/Cursor to create docs, send for signature, manage templates. ([Documenso](https://github.com/documenso/documenso), [Composio MCP](https://composio.dev/toolkits/documenso/framework/claude-code))
- **Cal.com** (scheduling) — white-label by design, own domain; **official hosted MCP** at `mcp.cal.com` (OAuth 2.1, ~34 tools). Core AGPLv3 is open-core (`/ee` commercial); the **Cal.diy fork is fully MIT** if you want zero gating. ([Cal.com MCP](https://cal.com/docs/mcp-server), [Cal.diy](https://github.com/calcom/cal.diy))
- **Outline** (client docs/KB) — fast collaborative wiki with a **built-in first-party MCP** + community MCPs. **BSL 1.1** (source-available; internal use fine). ([Outline](https://github.com/outline/outline))
- **Chatwoot** (client messaging) — mature shared inbox + embeddable web widget, MIT core; **branding removal is a paid Enterprise feature** and there's no MCP yet (wrap the REST API). ([Chatwoot](https://github.com/chatwoot/chatwoot))
- **Dolibarr** (GPL-3.0+) / **Ever Gauzy** (AGPLv3 + commercial, not feature-gated) — back-office CRM/invoicing; REST APIs, no MCP. Dolibarr's external client portal is plugin-dependent.

**Recommended compose-your-own stack:**

| Layer | Pick | MCP-drivable? |
|---|---|---|
| Branded shell / client login | **AgencyOS (MIT)** or a thin Next.js portal you own | you control it |
| E-signature | **Documenso** (AGPL) | ✅ community MCP |
| Scheduling | **Cal.com** (or **Cal.diy** MIT) | ✅ official MCP |
| Client docs / KB | **Outline** (BSL) | ✅ built-in MCP |
| Client messaging | **Chatwoot** (MIT core) | ➖ REST (wrap) |
| CRM / billing back-office | **ERPNext** / **Invoice Ninja** / **Dolibarr** | ✅ ERPNext MCP / IN MCP |

The trio **Documenso + Cal.com + Outline** gives three MCP-drivable surfaces out of the box — your agents can run client onboarding, contracting, and scheduling end-to-end behind your brand.

---

## What to avoid (and why)

- **Bitrix24 on-prem** — capable, but **not open source** (proprietary, paid perpetual license ~$3.5k–$25k+ + maintenance).
- **Crater** — attractive AGPL + free white-label, but **unmaintained since 2022–23**. Don't be fooled by mobile-app version numbers or the unrelated `crater.financial`.
- **SuiteCRM** — **no native portal**; the "Customer Portal" is a paid third-party stuck on legacy v7.x.
- **Twenty CRM** — excellent AI-drivable *internal* CRM, but ships **zero client portal**.
- **Kanboard / Plane / OpenProject / Huly** — internal team tools; "guest" access is not a scoped, branded client portal.
- **Odoo Community** — open-core trap for this use case: **Documents, Sign, Helpdesk, Studio are Enterprise-only**.
- **Akaunting** — most monetized (BSL core + paid app store; branding removal paywalled; no MCP).
- License watch-outs (source-available, not OSI — fine to self-host, restricted for resale-as-service): **Atrium (ELv2), Invoice Ninja (ELv2), Outline (BSL)**. Open-core (commercial EE / paid branding): **Cal.com, Chatwoot, Plane, OpenProject**.

---

## Recommendation

For an AI-first agency that wants to **own its infra** and have agents drive the portal, the open-source answer is a **branded shell + MCP-native pieces**, with a single-tool option if you want to start fast.

1. **Lead with the MCP-native compose-your-own stack** — a branded shell (**AgencyOS/MIT** or a thin Next.js app) over **Documenso + Cal.com (Cal.diy/MIT) + Outline**, with **ERPNext or Invoice Ninja** as the billing/CRM back-office. This is the genuinely differentiated path for an *automation* agency: three+ MCP-drivable surfaces means your own Claude/Codex agents can run onboarding, contracting, scheduling, and billing end-to-end behind your brand. It's more assembly, but every piece is self-hostable and most are cleanly licensed.

2. **If you want one deployable tool first:**
   - **Leantime** — the only OSS PM tool with a real client persona + an official MCP + the easiest self-host. Best for "clients log in and see only their projects/status."
   - **AgencyOS** — MIT, purpose-built agency portal you can extend (and reuse as the shell in option 1).
   - **ERPNext + Frappe Helpdesk** — the most complete fully-open backbone (tickets + KB + invoices + projects) with the official Frappe MCP, if you'll run the heavier stack.
   - **Atrium** — the closest single purpose-built portal (status + files + invoicing + custom domain), if you accept its Elastic License and early-stage maturity.

3. **Fill the e-sign gap with Documenso** regardless of which backbone you pick (ERPNext/EspoCRM/Leantime have no first-party e-sign).

**One-line answer:** the best *genuinely open-source, self-hostable* approach for an AI automation agency is a **branded shell over MCP-native OSS pieces (Documenso + Cal.com + Outline + ERPNext/Invoice Ninja)**; if you want a single tool, **Leantime** (client-architected + official MCP) or **AgencyOS** (MIT purpose-built portal) are the standouts, with **ERPNext + Frappe Helpdesk** as the heavyweight backbone. Avoid the open-core traps (Odoo CE) and the not-actually-OSS options (Bitrix24).

---

## Next steps

- [ ] Decide posture: single tool now (Leantime / AgencyOS / ERPNext) vs the compose-your-own MCP stack (more power, more assembly).
- [ ] Pilot the MCP stack: self-host Documenso + Cal.com (Cal.diy) + Outline, wire each MCP into Claude Code, and have an agent run a mock client onboarding (send contract → book kickoff → publish a client doc).
- [ ] Alternatively pilot Leantime: stand it up via Docker, connect its official MCP, and run an agent through a client project + status flow.
- [ ] Choose the branded shell: extend AgencyOS (MIT) vs a thin Next.js portal you own (ties to the build-your-own architecture in `ai-first-client-portal.md`).
- [ ] Validate license obligations for your deployment: AGPL pieces (Documenso/Leantime/ERPNext-Helpdesk) trigger source-disclosure only if you modify *and* offer them as a network service; ELv2/BSL pieces (Atrium/Invoice Ninja/Outline) are fine self-hosted but not resaleable as a managed service.

---

*Compiled June 2026 from per-product deep-dives across OSS ERP/CRM suites (ERPNext/Frappe, EspoCRM, SuiteCRM, Odoo CE, Twenty, Bitrix24, Dolibarr, Ever Gauzy), OSS PM tools (Leantime, Taiga, Vikunja, Plane, OpenProject, Huly, Kanboard), purpose-built OSS portals (Atrium, AgencyOS, ProjectSend, Frappe Helpdesk), and composable pieces (Documenso, Cal.com, Outline, Chatwoot, Invoice Ninja, Akaunting, Crater). Licenses, gating, and MCP availability change — re-verify before committing.*
