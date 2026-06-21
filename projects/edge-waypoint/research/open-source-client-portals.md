# Open-Source, Self-Hostable Client Portals

Follow-up to `ai-first-client-portal.md`. The prior reports concluded the best AI-first portals were mostly **closed SaaS**. This one maps the **genuinely open-source, self-hostable** layer — scored on real external-client portal capability, white-label, self-host effort, license (true OSI vs open-core traps), GitHub health, and (given the thread) AI/MCP/API drivability.

*Research date: June 2026, from parallel per-product deep-dives. GitHub stars/versions drift — verify before committing. Sources cited inline. **Coverage note:** a batch of agents hit a usage limit mid-run, so several candidates (Plane, Huly, Leantime, OpenProject, Documenso, Cal.com, Chatwoot, Dolibarr, Ever Gauzy, the WordPress "Client Portal" plugin) are listed in [Still to research](#still-to-research) rather than fully evaluated. The products below are fully researched.*

---

## TL;DR

- **There is no perfect open-source "agency client portal" that does everything** (branded deliverables + invoices + e-sign + tickets + projects) out of one box. The realistic move is a **strong open-source backbone + a couple of composable pieces.**
- **Two genuinely-OSS backbones stand out with real native client portals:**
  - **ERPNext + Frappe Helpdesk** — fully open (GPLv3/MIT/AGPL), nothing portal-related paywalled, free white-label on self-host, and the **best AI story** (official Frappe MCP + several permission-scoped community MCP servers). Client portal = tickets + knowledge base + invoices/orders/projects. Weak spot: no first-party e-sign; classic ERPNext portal UI is dated (Helpdesk SPA is modern).
  - **EspoCRM** — a genuine native customer portal **free in the AGPLv3 core**, easy/light Docker self-host, and a free ~47-tool community MCP server. Weak spot: native portal confirms Cases + Knowledge Base (invoices/projects/e-sign need custom entities or paid packs), and you can't officially remove the "© EspoCRM" footer without source edits or a commercial license.
- **Best OSS piece for billing + paid deliverables: Invoice Ninja** — excellent client portal (pay online, approve quotes, selectively share deliverable files), best API + a working community MCP. Caveats: **source-available (Elastic License v2, not OSI)** and **~$40/yr to fully white-label** client-facing pages.
- **Clear "avoid" list for this goal:** **Crater** (abandoned since 2022–23), **SuiteCRM** portal (paid third-party add-on, stuck on legacy v7), **Bitrix24 on-prem** (not open source — proprietary paid license), **Twenty CRM** (no client portal at all), **Kanboard** (internal-only; no real client role), and **Odoo Community** for this use case (open-core trap — Documents, Sign, Helpdesk, Studio are all Enterprise-gated).
- **My recommendation:** **ERPNext + Frappe Helpdesk as the backbone**, add **Invoice Ninja** for billing/paid deliverables and **Documenso** for e-sign (pending confirmation), behind your own branded front-end. Reasoning in [Recommendation](#recommendation).

---

## Scorecard (fully-researched candidates)

"Client portal" = genuine scoped external-client access. "Agent-drivability" = how well Claude/Codex can read/write via MCP/API.

| Tool | Real client portal? | White-label | Self-host | License | Agent-drivability (MCP/API) | GitHub health |
|---|---|---|---|---|---|---|
| **ERPNext + Frappe Helpdesk** | **Yes** — tickets + KB + invoices/projects | Free, built-in | Docker/bench; more moving parts | **GPLv3 / MIT / AGPL — fully open** | **Official Frappe MCP + scoped community MCPs** — 9/10 | 36k★ erpnext, active (v16, Jun 2026) |
| **EspoCRM** | **Yes** — Cases + KB native, custom entities | Logo/theme yes; footer removal not official | **Easy**, official Docker, light | **AGPLv3** (+ commercial option) | Free ~47-tool community MCP (EspoMCP) — 8/10 | 3.1k★, v9.3.8 (Jun 2026), very active |
| **Invoice Ninja** | **Yes** — pay, quotes, deliverable docs | Custom domain/logo; **$40/yr to de-brand** | Mature, official Docker | **Elastic License v2 — source-available, NOT OSI** | Best REST API + community MCP (26 tools) — 8/10 | 9.8k★, v5.13.x (Jun 2026), active |
| **Akaunting** | Good — invoices, payments, history | Branding removal **paywalled (BSL/app store)** | Mature, official Docker | **BSL 1.1 → GPLv3 after 4yr — open-core** | REST API; **no MCP** — 5/10 | 9.9k★, active (Jun 2026) |
| **Odoo Community** | Partial — orders/invoices/tasks; **no e-sign/docs/tickets** | Third-party module to de-brand | Easy, official Docker | **LGPLv3 core but OPEN-CORE** (portal pieces Enterprise) | Solid XML/JSON-RPC (deprecating ~2028); community MCP — 7/10 | 52k★, v19, very active |
| **SuiteCRM** | **No native** — paid 3rd-party, v7-only | n/a (no native portal) | Heavier; v8 still maturing | AGPLv3 | Clunky REST; MCP = CData commercial — 4/10 | v7 5.5k★ / v8 ~260★ |
| **Twenty CRM** | **No** — internal CRM only | n/a | **Easy**, light, Docker | AGPLv3 (+ proprietary EE) | GraphQL+REST; community MCP — API 8/10, **but no portal** | 51k★, v2.14 (Jun 2026), very active |
| **Kanboard** | **No** — anon read-only link or full account | Free branding plugins (internal UI) | **Easiest**, ~80MB RAM, MIT | **MIT — fully open, no gating** | JSON-RPC + several community MCPs — API 8/10, **but no portal** | 9.6k★, v1.2.49 (Jan 2026) |
| **Bitrix24 on-prem** | Yes (Extranet + CRM) | Strong (source-editable) | Heavy PHP/BitrixVM | **NOT open source — proprietary paid** | REST + official doc-MCP + community MCPs — 8/10 | Closed; $3.5k–25k+ license |
| **Crater** | Decent but basic | **Free (AGPL)** | Works but stale | AGPL-3.0 (genuine OSI) | API exists but unmaintained — 2/10 | 8.3k★ but **abandoned since 2023** |

---

## The genuinely-open self-hostable winners

### ERPNext + Frappe Helpdesk — the strongest open backbone

Three client-facing layers, none paywalled: the **ERPNext Customer Portal** (clients log in to see orders/status, paid & unpaid invoices, payments, raise/track issues, and a project-from-portal flow) and **Frappe Helpdesk** — a modern Vue SPA dual portal where clients create tickets, track SLA/status, read agent replies in-thread, and search a built-in knowledge base. ([ERPNext portal](https://docs.frappe.io/erpnext/customer-portal), [Helpdesk portal](https://docs.frappe.io/helpdesk/customer-portal))

- **License — genuinely fully open:** ERPNext core GPLv3, Frappe Framework MIT, Helpdesk/CRM AGPL-3.0. **No open-core paywall** on portal features — Frappe monetizes hosting/support, not modules. (AGPL network-copyleft applies if you modify Helpdesk/CRM and offer them as a hosted service.)
- **White-label:** Built-in Brand settings (name/logo/favicon) plus a community `whitelabel` app to fully remove "Powered by" — free on self-host.
- **Self-host:** Official `frappe_docker`; Helpdesk/CRM ship their own compose quick-starts. Stack is Python + MariaDB + Redis + Vue — more moving parts than EspoCRM/Odoo, ~4GB+ RAM.
- **AI/MCP — best-in-class here:** auto-generated REST API for every DocType + webhooks, plus the **official `frappe/mcp`** (Streamable HTTP, OAuth2; early) and rich community servers — notably **`buildswithpaul/Frappe_Assistant_Core`** (24 tools, OAuth2+PKCE, every call scoped to the user's Frappe roles + audit log). ([Frappe MCP](https://github.com/frappe/mcp), [Assistant Core](https://github.com/buildswithpaul/Frappe_Assistant_Core))
- **Gaps for an agency:** no first-party e-sign (integrate Documenso/DocuSign), and the classic ERPNext portal is less slick than the Helpdesk SPA.

### EspoCRM — the lightweight native-portal pick

EspoCRM's **Portal is a core AGPLv3 feature, not a paid extension**. External clients log into a dedicated portal (separate from the admin UI) with **portal-specific roles** (`not-set/own/account/contact` scoping), a configurable dashboard and nav, and you can run **multiple portals** with different access. Natively surfaces **Cases + Knowledge Base**; other record types require relating custom entities. ([EspoCRM portal](https://www.espocrm.com/features/customer-portal/), [docs](https://docs.espocrm.com/administration/portal/))

- **License:** AGPLv3 core (portal included), commercial license available as the clean path to remove branding/avoid copyleft.
- **White-label:** per-portal logo/theme/custom-URL yes; **removing the "© EspoCRM" footer is not officially supported** (source edit or commercial license).
- **Self-host:** PHP 8 / MySQL/Maria/Postgres, **official Docker, light and easy** — the simplest of the strong options.
- **AI/MCP:** full REST API (`/api/v1/`, API-key + HMAC) and a free **community MCP `zaphod-black/EspoMCP`** (~47 tools, CRUD over core + custom entities). ([EspoMCP](https://github.com/zaphod-black/espomcp))
- **Gaps:** native portal is utilitarian (same SPA framework as admin); invoices/quotes/projects/e-sign aren't first-class portal features.

### Invoice Ninja — the billing + paid-deliverables piece

The strongest OSS *client portal* for money + file delivery: clients view/pay invoices online (Stripe/PayPal/GoCardless), one-click approve quotes (auto-converts to invoice → payment), see payment history, and a **Documents tab** selectively shares deliverables (contracts/SOWs) while internal attachments stay hidden. Every emailed link opens the portal — minimal client onboarding. ([client portal docs](https://invoiceninja.github.io/docs/user-guide/client-portal))

- **License caveat:** v5 is **Elastic License v2 — source-available, NOT OSI**. You may self-host/modify/use freely; you may *not* resell it as a managed service or strip the license-key/white-label. Fine for billing your own clients.
- **White-label:** custom domain + logo/colors, but **removing "Powered by Invoice Ninja" needs a ~$40/yr license** (client-facing pages/PDFs only; admin keeps branding — clients never see admin).
- **Self-host:** mature, official Docker, PHP/Laravel + MySQL, needs a per-minute cron. Light.
- **AI/MCP:** best-documented REST API of the invoicing tools + working community MCP **`Fuciuss/invoice-ninja-mcp`** (26 tools: invoices/clients/products/payments/quotes/expenses). Early-stage; extendable. ([IN MCP](https://github.com/Fuciuss/invoice-ninja-mcp))

---

## What to avoid (and why) for this goal

- **Crater** — attractive AGPL + free white-label, but the self-hosted OSS project is **unmaintained (last release 2022, last commit Feb 2023)**. Don't be fooled by mobile-app version numbers or the unrelated `crater.financial` commercial product.
- **SuiteCRM** — **no native portal**; the "Customer Portal" is a paid third-party (Fynsis, ~$50/mo) that supports only **legacy v7.x**, not the current v8 line. Poor 2026 foundation.
- **Bitrix24 on-prem** — capable client portal (Extranet + CRM), but **not open source**: proprietary, source-available, paid perpetual license (~$3.5k–$25k+) plus ~50%/yr maintenance.
- **Twenty CRM** — excellent modern, AI-drivable *internal* CRM, but it ships **zero client-facing portal** and none is on the roadmap. You'd build the portal yourself on its GraphQL/REST API.
- **Kanboard** — MIT, ultralight, great JSON-RPC API + MCPs, but **no real client role**: only an anonymous read-only whole-board link or giving each client a full internal account. Use as an internal AI-driven backend, not a client portal.
- **Odoo Community** — the **open-core trap** for this exact use case: the portal pieces an agency wants most — **Documents, Sign (e-sign), Helpdesk, Studio** — are **Enterprise-only**. Community portal does orders/invoices/tasks but no e-sign, no document-vault sharing, no ticket portal without third-party add-ons.
- **Akaunting** — fine if you want full accounting, but it's the most monetized: **BSL core + paid app store**, branding removal and key features paywalled, and **no MCP**.

---

## Recommendation

For an AI-first agency that wants to **own its infra** and have agents drive the portal, the open-source path is a **backbone + pieces**, not a single product:

1. **Backbone — ERPNext + Frappe Helpdesk.** It's the only fully-open option with a real, un-paywalled client portal (tickets + KB + invoices + projects), free white-label, and the best AI story (official MCP + permission-scoped, audited community MCP servers). Accept the heavier Frappe/bench stack and the dated classic-portal UI (the Helpdesk SPA is modern). **If you want the lightest, easiest self-host and your client portal needs are mostly support + a knowledge base, EspoCRM** is the leaner alternative.
2. **Billing + paid deliverables — Invoice Ninja.** Best OSS client-facing payment + deliverable-sharing experience and a working MCP. Budget ~$40/yr for white-label and accept ELv2 (source-available) — neither restriction bites an agency billing its own clients.
3. **E-sign — Documenso** (open-source DocuSign; *pending confirmation in the next pass*) to fill the gap ERPNext/EspoCRM leave.
4. **Front-end / branding — your own thin layer.** Since this is an automation agency, the highest-control path remains the one from the prior report: a branded Next.js front-end + a **custom, scoped MCP** for agents, reading from these OSS backends via their APIs — keeping the official/admin MCPs internal and giving each client RLS/role-scoped access.

**One-line answer:** the best *genuinely open-source, self-hostable* client portal today is **ERPNext + Frappe Helpdesk** (fully open, official MCP, real portal), with **EspoCRM** as the lighter alternative and **Invoice Ninja** as the billing/deliverables companion — composed behind your own branded layer. Avoid the open-core traps (Odoo CE) and source-available-marketed-as-OSS (Bitrix24, and to a lesser degree Invoice Ninja/Akaunting).

---

## Still to research

These were queued but not completed before the agents hit a usage limit (resets ~5:50am UTC). Worth a second pass:

- **OSS project-management tools as portals:** Plane, Huly, Leantime, OpenProject, Taiga, Vikunja, Focalboard, Worklenz, WeKan — external-client/guest access quality + MCP/API.
- **Other OSS suites:** Dolibarr (external portal), Ever Gauzy (agency-focused OSS business management).
- **Composable pieces:** Documenso (e-sign), Cal.com (scheduling), Chatwoot / FreeScout / Zammad / Peppermint (client messaging/tickets), Outline (client-facing docs).
- **Purpose-built OSS "client portal" projects:** the WordPress "Client Portal" plugin and any genuine GitHub-native client-portal projects (Laravel/Frappe-based).

---

## Next steps

- [ ] Confirm priority: lightest self-host (EspoCRM) vs most-complete open backbone (ERPNext + Helpdesk).
- [ ] Run the second research pass on the [Still to research](#still-to-research) list — especially Documenso (e-sign), OpenProject, and any purpose-built OSS client portals.
- [ ] Pilot: stand up ERPNext + Frappe Helpdesk via Docker, connect a community MCP (e.g. Frappe_Assistant_Core) to Claude Code, and run an agent through a real client ticket + invoice flow.
- [ ] Decide the e-sign approach (Documenso self-host vs integrate a SaaS) and the front-end/branding layer.
- [ ] Validate AGPL/ELv2 obligations for your specific deployment (modified + network-served = source-disclosure for AGPL pieces).

---

*Compiled June 2026 from per-product deep-dives (ERPNext/Frappe, EspoCRM, SuiteCRM, Odoo CE, Twenty, Bitrix24, Invoice Ninja, Akaunting, Crater, Kanboard). Several PM-tool and composable-piece candidates are pending a second pass (usage limit). Licenses, gating, and MCP availability change — re-verify before committing.*
