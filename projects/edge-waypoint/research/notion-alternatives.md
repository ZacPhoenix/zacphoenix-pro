# Notion Alternatives for Edge Waypoint: AppFlowy vs AFFiNE vs Anytype

Research report comparing three open-source, local-first Notion alternatives for two jobs:

1. **Internal ops** — running the agency (docs, wikis, project management, databases/boards, tasks, CRM-style tracking).
2. **Branded client portals** — white-label spaces shared with external clients for project visibility and deliverables.

Preference: self-host on our own infra, open to cloud where it earns its place.

*Research date: June 2026. All three projects ship fast (releases every 2 to 3 weeks) and shift pricing and feature gating often. Treat specific numbers as directional and verify in-app before committing. Sources are cited inline throughout the deep-dive sections below.*

---

## TL;DR

- **For internal ops, all three are viable.** The best overall fit is **AppFlowy** (free AGPL self-host, broadest platform coverage, closest to Notion's database UX). Anytype is the strongest on data sovereignty and knowledge modeling. AFFiNE is the pick if the **whiteboard/edgeless canvas** matters.
- **For branded client portals, none of them is a real fit today.** This is the headline finding. All three are built for internal/team knowledge work, not for serving polished, white-labeled, link-shareable portals to external clients. Each fails the portal job for a different reason (licensing-gated branding, broken public links on self-host, or an encryption model that blocks browser access).
- **Recommended path: split the two jobs.** Use one of these tools as the internal source of truth, and pair it with a purpose-built, properly brandable client-portal layer. Do not try to force one tool to do both.

---

## At-a-glance comparison

| Criterion | AppFlowy | AFFiNE | Anytype |
|---|---|---|---|
| **Self-host** | Yes, free, Docker Compose (Rust + Postgres + Redis + S3/MinIO) | Yes, Docker Compose (Postgres + Redis + blob), ops-heavy | Yes, but only the **sync node** (any-sync); clients stay local |
| **Self-host license cost** | Free, AGPL-3.0, core unrestricted | Free **up to ~10 seats/workspace**; backend is **Enterprise-licensed** beyond that | Free; protocols MIT, **client app is source-available (ASLA), not FOSS** |
| **Official cloud** | Free / Pro $10 user/mo | Free / Pro ~$6.75/mo / Team $10 seat/mo (10 min) | Free (~1 GB) / personal tiers / Business $20 editor/mo or $300/mo self-host |
| **External client sharing** | Guest editors (Pro/cloud-gated), account required | Public links **view/comment only**; editing needs a paid seat | Must **install app + create account**; no browser guest access |
| **Public web publishing** | Exists but **broken on self-host** (links point to appflowy.com) | Publish docs to public links (read-oriented) | Single objects as static pages; **no Sets/Collections**, no live DB views |
| **White-label / branding** | None (theming only) | **Enterprise/OEM only** | **None**, and no custom domain for published pages |
| **PM / database depth** | Grid, Board, Calendar, Gallery; relations + formulas; ~80% of Notion | Table + Kanban, shallower than Notion; **whiteboard is the standout** | Types, Sets, Collections; Grid/List/Gallery/Calendar/Kanban (some desktop-only) |
| **Real-time collab** | Yjs CRDT, maturing | Yjs CRDT, core pillar; external collab is the weak spot | Multiplayer shipped 2024, E2EE-preserving, functional |
| **Platforms** | Web, Desktop (Mac/Win/Linux), Mobile (iOS/Android) | Web, Desktop, Mobile (iOS/Android) | Desktop + Mobile only; **no web app, by design** |
| **Local-first / offline** | Yes | Yes (strong) | Yes (strongest; E2EE) |
| **Project health** | ~73k stars, ex-ByteDance team, ~$6.4M seed | ~70k stars, very active, Singapore | ~8k stars (anytype-ts), Series A ~$29M, Berlin |
| **Maturity flag** | Production-usable; collab maturing | Fast-moving; license/seat caveats | Desktop still **alpha-versioned** |
| **Internal-ops verdict** | **Strong** | Good (great if you want a whiteboard) | Strong (best for sovereignty) |
| **Client-portal verdict** | Weak | Poor | Not a fit |

---

## The client-portal reality (read this first)

Every one of these tools is excellent at being a private knowledge base and a weak choice for serving external, branded client portals. The reasons differ, and they all matter:

- **AppFlowy:** Publish-to-web public links are **broken on self-hosted** instances — generated links point at `appflowy.com`, not your domain, and maintainers confirm the feature is not available on self-host. External "guest editor" sharing exists but is **Pro/cloud-gated**, requires the client to have an account, and offers only view/edit (no comment-only, no expiring links). No white-label beyond cosmetic theming.
- **AFFiNE:** Public share links are effectively **read/comment only** — letting a client *edit* without a full paid workspace seat is an open, unimplemented feature request. **White-label (logos, colors, custom branding) is gated to the unreleased Enterprise Edition / OEM license.** No native multi-tenant client separation.
- **Anytype:** The **end-to-end encryption + local-first** design is fundamentally at odds with a browser portal. To collaborate, a client must **install the desktop/mobile app and create an account** — there is no browser guest access (this is a deliberate, permanent stance). The only no-app path, Web Publishing, publishes **single objects as flat, unbranded, unencrypted static pages on an anytype subdomain**, with no Sets/Collections (so no live PM views) and no custom domain.

**Net:** "branded client portal with live project management and deliverables" is not a job any of these three does out of the box in June 2026. Choosing among them should be driven by the **internal-ops** fit, with the portal handled separately.

---

## Deep dive — AppFlowy

**One-liner:** The most Notion-like of the three, free to self-host under AGPL, broadest platform coverage. Best overall internal-ops pick.

**Self-hosting.** Full client and server (AppFlowy Cloud) are open source under **AGPL-3.0**, free to self-host. Stack is a Rust backend via Docker Compose: PostgreSQL, Redis, GoTrue (auth, borrowed from Supabase), and MinIO/S3 for files, plus an optional AI service. Setup: `bash ./run.sh gen-env` then `docker compose up -d`; production needs a reverse proxy + TLS and some hardcoded-URL editing. Minimum ~2 GB RAM, 4 GB recommended; a 2 vCPU / 4 GB VPS handles a small team comfortably.

**Cloud.** Free ($0, 2 members, 5 GB). Pro ($10/user/mo annual: 50 members, unlimited storage, up to 100 guest editors, custom namespace, unlimited AI). AI MAX and local-AI Vault add-ons exist. Data residency not clearly published — a reason to self-host if residency matters.

**Project management.** Multi-view databases — **Grid, Board (Kanban), Calendar, Gallery** over one dataset — with single/multi-select, dates with durations, filters, sorts, grouping, **formula columns and relations**, row comments, and a template library. Covers the everyday 80% of Notion well; weaker on advanced rollups, deep formulas, automations, and third-party integrations.

**Files / deliverables.** S3-compatible storage (bundled MinIO or external); on self-host, limits are whatever you provision. Cloud: 5 GB free, unlimited on Pro. Per-file size caps not clearly documented — verify against your largest deliverables.

**Collaboration & platforms.** Real-time editing on **Yjs (CRDT)**, @mentions, inline + row comments; sync protocol was overhauled in 2025 and is maturing. **Web, Desktop (Mac/Win/Linux), Mobile (iOS/Android)**, genuinely local-first (data on disk, offline-capable, optional sync).

**Health.** ~72.7k stars, releases every 2 to 3 weeks (v0.12.4, June 2026), founded 2021 by ex-ByteDance team, ~$6.4M seed. Paid self-hosted Team/Enterprise tiers add SSO (SAML/OIDC) and support ("contact sales").

**Client-portal gotchas.** No white-label without forking (and AGPL §13 then obligates you to offer clients your modified source). Publish-to-web broken on self-host. Guest editors Pro/cloud-gated and account-based. Coarse permissions (view/edit only).

**Verdict — internal ops: Strong.** Client portals: Weak.

---

## Deep dive — AFFiNE

**One-liner:** Notion + Miro + Airtable in one local-first app. The **edgeless whiteboard** is its differentiator; licensing and external-sharing are its constraints.

**Self-hosting.** Officially supported via Docker Compose: AFFiNE server (Node/TS, GraphQL) + Postgres + Redis + blob storage, CRDT sync via Y.js / y-octo. Minimum ~4 cores / 2 GB RAM. Docs assume you already run servers, reverse proxies, backups, and monitoring — **more ops-heavy than AppFlowy**, with known footguns around persistent storage locations and member-limit confusion. Free self-host is capped at **~10 seats per workspace**.

**Licensing (critical).** Dual-licensed. The editor (BlockSuite), desktop app, and most code are **MIT** (some MPL-2.0), but the **backend server is under the "AFFiNE Enterprise Edition License"** — production use with paid team seats requires a subscription. Practical effect: free for ≤10 seats / internal use; scaling beyond requires a **Team license** with internet license-key validation (or an offline installable license). **Read the license before deploying for paying-client work.**

**Cloud.** Free ($0, 3 members/workspace, 10 GB, 10 MB files). Pro (~$6.75/mo annual, 100 GB). Team ($10/seat/mo, 10-seat min, unlimited members, 500 MB files). Believer ($499 one-time lifetime, personal). Enterprise/OEM (white-label) is custom, contact sales.

**Project management.** The **infinite edgeless canvas** (shapes, connectors, embedded docs, frames, export-to-slides) is a genuine standout Notion can't match. Databases (table/kanban) exist but are **shallower than Notion** — no rollups, limited view types, weaker relations/formulas. Strong block-based docs; built-in AI Copilot (v0.25 added multimodal, Feb 2026).

**Files / collab / platforms.** Self-host documents unlimited blob storage; cloud caps by tier (10/100/500 MB). Multiplayer is CRDT-based, conflict-free, with comments and split-view. **Web, Desktop (Mac/Win/Linux), Mobile (iOS + Android, launched 2025)**, strongly local-first.

**Health.** ~70k stars, very active (v0.26.x, Feb–Mar 2026, 540+ releases), TOEVERYTHING PTE. LTD. (Singapore).

**Client-portal gotchas.** No per-client white-label without Enterprise/OEM. No cheap external guest model (outsiders need paid seats or get read-only public links). No native multi-tenant separation. Public links can't be edited by clients.

**Verdict — internal ops: Good** (great if you want the whiteboard). Client portals: Poor.

---

## Deep dive — Anytype

**One-liner:** The data-sovereignty pick — local-first, end-to-end encrypted, real type system and knowledge graph. The same design that makes it private makes it unusable as a client-facing portal.

**Self-hosting.** Official `any-sync-dockercompose` deploys the full sync network (coordinator + sync nodes + filenode + consensus node + MongoDB + Redis + MinIO). Latest v7.0.1, June 2026, actively maintained. But self-hosting gives you the **sync/backup/storage backbone only** — clients still run locally and do all encryption; you just point them at your network. The official compose is positioned for **personal/small-team** networks (Puppet/Ansible for high load). **Web publishing and memberships stay tied to Anytype's hosted infra — self-hosting does not unlock portal/publishing features.**

**Cloud.** Free (unlimited objects, ~1 GB file sync, E2EE). Personal paid tiers (~$99/yr and ~$299/yr; naming shifts between versions). **Anytype for Business: $20/editor/mo cloud (viewers free) or $300/mo flat self-hosted**, with admin panel, SSO, GDPR/Swiss hosting. Zero-knowledge E2EE throughout — the defining strength and the core portal constraint.

**Project management.** **Types** (object classes), **Relations**, **Sets** (dynamic queries) vs **Collections** (manual groups). Views: Grid, List, Gallery, Calendar, Kanban, Graph — but **Kanban/Calendar/Graph are desktop-only**. Conceptually rigorous (arguably stronger modeling than Notion via a real type system), weaker on formulas/rollups and large-DB performance.

**Files / collab / platforms.** Files are first-class E2EE blob objects, streamed on demand. ~1 GB cloud cap on files (self-host removes it). **Multiplayer shipped in 2024**, real-time co-editing while preserving E2EE and offline-first; comments/presence functional but docs are thin. **Desktop (Mac/Win/Linux) + Mobile (iOS/Android) only — no web app, by deliberate design** (browser security would break E2EE).

**Health & licensing.** Protocols any-sync/any-block are **MIT**, but the **client apps are under the "Any Source Available License 1.0" — source-available, not OSI open-source**, with commercial/redistribution restrictions. Read ASLA before any repackaging. anytype-ts ~8.2k stars, very active, but desktop still ships **alpha-versioned (0.x-alpha)** — expect occasional breaking changes. Berlin-based, founded 2019, Series A ~$29.3M.

**Client-portal gotchas.** Clients must **install the app and make an account** — no browser guest access. Web Publishing is single-object, static, **no Sets/Collections** (so no live PM views), **uploaded unencrypted**, no custom domain, no branding.

**Verdict — internal ops: Strong** (best for sovereignty). Client portals: **Not a fit.**

---

## Self-host vs cloud

- **If data sovereignty / residency is the driver:** self-host. AppFlowy self-hosts the full stack for free; Anytype self-hosts the sync node (and offers a $300/mo flat self-hosted Business tier); AFFiNE self-hosts free up to ~10 seats, then needs a paid license.
- **If you want the least ops burden:** AppFlowy or AFFiNE cloud Pro for a few dollars per user. But note neither cloud offering gives you white-label, so cloud doesn't solve the portal problem.
- **Reality check:** self-hosting buys you ownership and cost control for **internal ops**. It does **not** unlock the client-portal capabilities any of these tools lack — that gap is architectural/licensing, not hosting.

---

## Recommendation

**1. Pick an internal-ops tool and self-host it.**
- **Default choice: AppFlowy self-hosted.** Free under AGPL, closest to Notion's database UX, broadest platform coverage (incl. mobile), runs on a cheap 4 to 8 GB VPS. Lowest friction for a small agency that wants a Notion replacement.
- **Choose AFFiNE instead if** the edgeless whiteboard (visual planning, client workflow maps, brainstorming) is central — but mind the ~10-seat free ceiling and the Enterprise-licensed backend.
- **Choose Anytype instead if** maximum data sovereignty / E2EE and a rigorous knowledge graph outweigh the lack of a web client and the alpha-versioned desktop app.

**2. Do not use any of these as the client-facing portal.** Handle branded client portals with a separate, purpose-built layer. Options to evaluate next:
- A dedicated client-portal / PM product built for white-label external sharing (e.g. SuiteDash, Copilot, Plutio, or similar — needs its own evaluation).
- Notion's own public-share + custom-domain (via a publishing layer like Super/Potion) if a Notion-shaped portal is acceptable.
- A lightweight custom portal (static site or small app) that reads from the internal tool's API and renders branded, per-client deliverable pages — fits an automation agency's skill set and gives full white-label control.

**3. Wire them together.** Keep the internal tool as the source of truth; push or publish a curated, branded subset to the client layer. Revisit the all-in-one question only if AFFiNE ships affordable white-label, or Anytype ships custom domains + multi-page + database-view publishing — neither is true as of June 2026.

---

## Next steps

- [ ] Confirm the internal-ops shortlist priority (AppFlowy vs AFFiNE vs Anytype) against how much the whiteboard / E2EE / web-access factors matter to us.
- [ ] Spin up a self-hosted pilot of the chosen tool on a test VPS and run one real client engagement through it internally.
- [ ] Commission a follow-up evaluation of **dedicated client-portal products** for the external layer.
- [ ] Prototype the "internal tool of record + branded portal layer" handoff for one deliverable type before standardizing.

---

*Compiled from three parallel research passes (one per tool), June 2026. Pricing, license terms, and feature gating change frequently — verify the specific numbers above before committing budget or client-facing deployments.*
