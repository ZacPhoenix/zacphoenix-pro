# Developer-Friendly Docs + Diagram + Client-Portal Tooling for Edge Waypoint

Follow-up to `notion-alternatives.md`. New requirements, ranked by priority:

1. **Good for developers** (Markdown, code, version control).
2. **Mermaid charts or other nodal-graph visualization.**
3. **Easy for Claude / Codex to connect to and read/write** (MCP server, REST API, or plain files in git).
4. **Easy to share with clients.**

Open to tools beyond the original three (AppFlowy / AFFiNE / Anytype). Self-host or cloud both fine.

*Research date: June 2026, from four parallel research passes (docs-as-code generators, self-host wikis, hosted AI-native platforms, diagram tools). Pricing and MCP/API specifics move fast — verify before committing. Sources cited inline in the deep-dive sections.*

---

## TL;DR

- **The decisive insight: text content in git (Markdown) + Mermaid is the sweet spot.** It is what Claude/Codex author best (no API needed — just edit files and commit), it renders nodal graphs natively, and it publishes as a branded site. Every top recommendation below leans on this.
- **Two viable lanes**, pick by how much you want to own infra vs offload it:
  - **Lane A — Docs-as-code (git-native):** AI agents edit Markdown/MDX in a repo; CI publishes a branded site. Best agent ergonomics, lowest cost, but client *auth* is a bolt-on. Top picks: **Mintlify** (paid, agent-native + branded), **Docusaurus** or **Astro Starlight** (free, public), **Obsidian + Quartz** (free, includes a client-facing interactive graph).
  - **Lane B — Hosted/app with MCP + sharing:** A doc app with an official MCP/API and built-in client sharing. Top picks: **GitBook** (docs-as-code feel + branded gated sites), **Notion** (best official MCP + Super.so for branded portals), or self-hosted **Outline** (official MCP + native Mermaid + public links).
- **Diagrams: standardize on Mermaid** as the AI-authored default (free, MIT, renders everywhere, every LLM knows the syntax), add **D2** when architecture diagrams need to look premium, and **Excalidraw-via-MCP** when you want an interactive/whiteboard deliverable.
- **My single recommendation for Edge Waypoint:** **Outline (self-hosted) or GitBook (cloud) for the doc layer + Mermaid for diagrams + an MCP wired into Claude/Codex.** Reasoning in the [Recommendation](#recommendation) section.

---

## How the candidates score on your four criteria

Higher is better. "AI R/W" = how easily Claude/Codex can read and write content (MCP / API / plain files).

| Tool | Dev-friendly | Mermaid / graph | AI R/W | Client sharing | Host | Cost model |
|---|---|---|---|---|---|---|
| **Mintlify** | High | Mermaid (native) | **Excellent** (hosted write-MCP + PR agent, MDX in git) | Branded; **auth = Enterprise** | Cloud | Free Starter / Enterprise |
| **Obsidian + Quartz** | High | Mermaid + **interactive D3 graph** | **Excellent** (plain `.md` in git + Obsidian MCP) | Branded public; auth bolt-on (Cloudflare Access) | Self / static | ~$0 |
| **Docusaurus** | High | Mermaid (official plugin) | Good (plain MD/MDX; mind JSX build breaks) | Branded public; no native auth | Self / static | Free (MIT) |
| **Astro Starlight** | High | Mermaid (3rd-party) | Good (plain files; **SSR auth path** in code) | Branded; in-code per-client auth possible | Self / static+SSR | Free (MIT) |
| **Material for MkDocs** | High | Mermaid + Kroki (D2/PlantUML) | **Excellent** (plain `.md`, no JSX risk) | Branded public; no native auth | Self / static | Free (MIT) — *maintenance mode* |
| **GitBook** | High | Mermaid (native) | Good (read MCP + **git-sync write loop**) | **Branded + gated** sites | Cloud | Free / $65 / $249 **per site** |
| **Notion** | Medium | Mermaid (native) | **Excellent** (official hosted MCP, OAuth) | Branded via Super.so/Potion | Cloud | ~$18/user + ~$12–22 Super |
| **Outline** | High | Mermaid (native) | **Excellent** (official MCP + clean REST, free on self-host) | Public links + custom domain; no password links | Self / cloud | Free self-host (BSL) |
| **Docmost** | High | **Mermaid + Excalidraw + draw.io** | Good (REST/MCP = Business tier) | Per-client spaces; white-label = Enterprise | Self / cloud | Free (AGPL); API $3.50/seat |
| **SiYuan** | High | **Richest** (Mermaid/PlantUML/Graphviz/graph) | **Excellent** (kernel REST + MCP) | Per-client BasicAuth, read-only | Self | Free (AGPL) |
| **Confluence** | Medium | Mermaid (paid app) | **Excellent** (official Atlassian MCP) | Weak (internal-wiki DNA) | Cloud / DC | ~$0–10.44/user |
| **Slite** | High | **Mermaid (native)** | **Excellent** (official MCP + MD API) | Branded public; API = Premium | Cloud | Free / $12.50 user |
| **Coda** | Medium | Mermaid (paid Pack) | Fair (community MCP only) | **Excellent** (custom domain, free viewers) | Cloud | Per-maker; free viewers |

Notable non-fits: **ClickUp Docs** (no native Mermaid), **Slab** (no Mermaid, no MCP, Delta-format API), **Logseq/Trilium** (great AI file backends, but weak at client web sharing), **Wiki.js** (good but 3.x rewrite stalled), **BookStack** (stable + great API but no native Mermaid).

---

## The diagram layer (criterion 2, in depth)

The agent that researched this was unambiguous: **text-defined diagram-as-code is what an AI authors best.** Recommended stack, in order of how often you'll reach for each:

1. **Mermaid — the default.** Plain-text syntax every LLM already knows, renders inline on GitHub/GitLab/Notion/Markdown and in every doc tool above, exports SVG/PNG, MIT-licensed and free. Mature MCP servers exist (`@peng-shawn/mermaid-mcp-server`, `hustcc/mcp-mermaid`, Mermaid Chart's own) if you want a render-on-demand tool wired into Claude/Codex. Use it for ~90% of client diagrams.
2. **D2 (Terrastruct) — the quality upgrade.** Better layout engines and themes make architecture/node graphs look noticeably more polished than Mermaid. Open source (MPL-2.0) CLI; needs a compile step in your render pipeline (no native GitHub rendering). Reach for it on premium deliverables.
3. **Excalidraw + MCP — the interactive/whiteboard path.** `mermaid-to-excalidraw` converts Mermaid into editable elements, and MCP servers (e.g. `yctimlin/mcp_excalidraw`) let an agent do element-level CRUD on a live canvas. MIT, free. Use when a flat image won't do.
4. **React Flow / Reagraph — only if you build a custom portal** with explorable/force-directed node graphs (agent emits JSON, the component renders). MIT core.

Avoid as *generation* targets: **draw.io** (GUI/XML, not AI-authorable), **Whimsical** (closed, watermarked exports), **tldraw** for production embeds (~$6k/yr commercial license). **Markmap** is a nice free bolt-on for Markdown-driven mind maps.

If you want a client-facing **interactive nodal graph** (not just static diagrams), the cleanest off-the-shelf option is **Obsidian + Quartz**, which publishes an interactive D3 graph + backlinks on the branded site. Otherwise that's a custom-build with React Flow/Reagraph.

---

## Lane A — Docs-as-code (git-native): deep notes

The structural truth: **AI agents love plain Markdown in git.** Lowest-friction, lowest-breakage targets are **plain `.md`** tools (MkDocs, Quartz/Obsidian) — no JSX to break a build. **MDX tools** (Docusaurus, Nextra, Starlight, Mintlify) need the agent to run a build-verify loop before committing (Nextra is the most fragile). The shared weakness: **static generators have no native per-client auth** — gating leans on **Cloudflare Access (free ≤50 users)** or client-side encryption.

- **Mintlify** — best *commercial* agent-native option. MDX in your git repo + a hosted **write-MCP** (`mcp.mintlify.com`, changes land on a branch → PR), a read-only MCP per site, auto `llms.txt`/`skill.md`, and an autonomous agent that drafts doc PRs. Custom domain + white-label on the free tier; **private auth (password/SSO) is Enterprise-only.** Not self-hostable. Pricing restructured recently (Starter free + Enterprise) — verify.
- **Obsidian + Quartz** — best *free* agent-native option, and the only pick with a **client-facing interactive graph**. Author in Obsidian, vault = Quartz `/content` = git repo, push triggers CI build (Cloudflare/GitHub Pages). Plain `.md` + wikilinks = trivial for agents (filesystem or Obsidian MCP). Branded + custom domain; gating is bolt-on (Cloudflare Access / Quartz `EncryptedPages`). ~$0.
- **Docusaurus** — safest mature default for public, **versioned** docs; official Mermaid plugin; MIT, free on Cloudflare Pages. Watch the MDX-JSX build-break trap for unattended agents.
- **Astro Starlight** — modern stack; its differentiator is **Astro SSR + middleware**, so you can build real per-request/per-client auth in code (best in-code private-content path of the generators). Pre-1.0; Mermaid is third-party; no built-in versioning.
- **Material for MkDocs** — easiest/safest agent authoring (plain `.md`, no JSX), Mermaid + Kroki (D2/PlantUML). **Caveat: entered maintenance mode (Nov 2025)**; maintainer pivoting to successor "Zensical" — evaluate before betting long-term.

---

## Lane B — Hosted/app with MCP + sharing: deep notes

- **GitBook** — the cleanest fit for "agents write Markdown via Git, clients get a branded gated docs site." Bi-directional git-sync (branching, change-requests), native Mermaid from synced Markdown, auto API reference from OpenAPI. Official MCP is **read-only**; the write loop is **agent commits Markdown to the synced repo** (works with the GitHub MCP tools an agent already has). Branded sites + custom domain + visitor auth, but the best gating is **Ultimate ($249/site/mo)** and pricing is **per-site** — one gated portal per client scales expensively.
- **Notion** — **best official agent integration** (hosted MCP at `mcp.notion.com`, one-click OAuth, full page/db CRUD; explicitly supports Claude Code/Cursor). Native Mermaid. Branded client portals are cheap via **Super.so** (~$12–22/mo: custom domain, CSS, password-protected pages) or Potion. Weak on docs-as-code (lossy Markdown, no native git-sync, ~3 req/s API limit). Cloud-only; realistic floor ~$18/user/mo + Super.
- **Outline (self-hosted)** — best all-rounder among self-host wikis. Mature, native Mermaid, **official MCP server + clean documented REST API usable free on self-host** (your key criterion), plus genuine public web sharing with custom domains. Compromises: **BSL 1.1** (source-available, not true OSS) and sharing lacks password-protected links / external guests / a graph view.
- **Docmost** — true **AGPL** alternative with the richest diagrams (Mermaid + Excalidraw + draw.io), real-time collab, and clean per-client space isolation — but **REST API + MCP are Business-tier ($3.50/seat/mo)**, not in the free Community edition.
- **SiYuan** — strongest on criteria 1–3 (Docker server, kernel REST API + best MCP coverage, every diagram type + block graph); v3.6 added per-client BasicAuth publishing — but client sharing is **read-only, browser-only when self-hosted, and Chinese-first**.
- **Confluence** — only candidate with an official vendor MCP *and* a self-host option (Data Center), but **client-facing sharing is weak** (internal-wiki DNA, all-or-nothing anonymous access). Diagrams are paid marketplace apps.
- **Slite** — sleeper pick: native Mermaid + official MCP + Markdown API + `llms.txt` + branded docs, lower cost; smaller ecosystem, API behind Premium ($12.50/user).
- **Coda** — best client-sharing economics (custom-domain publishing on all paid tiers, unlimited free viewers), but no official MCP (community only) and Mermaid needs a paid Pack.

---

## Recommendation

Your four criteria are best satisfied by a **content-in-Markdown + Mermaid + an MCP/API** combination. The choice between lanes comes down to infra preference and how much client *auth* you need.

**Primary recommendation — pick one doc layer:**

- **If you want to own your infra (your stated preference): Outline, self-hosted.** It's the single best all-rounder for "AI writes / client views": mature, native Mermaid, **official MCP + clean REST free on self-host**, and real public share links with custom domains. Accept the BSL license and that you'll add Cloudflare Access in front when a client needs private/gated content. If you specifically want richest diagrams + per-client spaces and don't mind paying $3.50/seat for the API, **Docmost** is the true-OSS alternative.
- **If you'd rather offload hosting and sell branded client portals: GitBook.** Agents commit Markdown via git-sync, Mermaid renders for free, clients get a branded custom-domain gated site. Budget the per-site pricing and make it billable to the client.
- **If frictionless AI-agent maintenance matters most and client portals are secondary: Notion** (official MCP is the lowest-maintenance write path) **+ Super.so** for cheap branded portals.

**Always-on diagram layer (independent of the above):** standardize on **Mermaid**, wire a Mermaid MCP into Claude/Codex, add **D2** for premium architecture diagrams, and **Excalidraw-via-MCP** for interactive deliverables.

**If you value a client-facing interactive node graph specifically:** **Obsidian + Quartz** is the only off-the-shelf option that publishes one — and it's free and maximally agent-native (plain `.md` in git). Worth piloting alongside Outline/GitBook.

**My concrete pick for Edge Waypoint:** start with **Outline self-hosted** (owns infra, official MCP, native Mermaid, free) as the internal + client-shareable doc layer, **Mermaid** as the AI-authored diagram standard, and keep **GitBook** in your back pocket for clients who need a polished, auth-gated, fully branded portal you can bill for. This satisfies all four criteria today with near-zero software cost and a clean Claude/Codex write path.

---

## Suggested next steps

- [ ] Decide self-host (Outline/Docmost) vs cloud (GitBook/Notion) for the doc layer — this is the main fork.
- [ ] Stand up a pilot: self-host Outline on a test VPS, connect its MCP to Claude/Codex, and have an agent author a real client doc with an embedded Mermaid diagram.
- [ ] Wire a Mermaid MCP server into the agent toolchain and confirm the render/embed path into the chosen doc tool.
- [ ] If a client needs a branded gated portal, trial GitBook (one site) or Notion + Super.so and compare the client-facing polish.
- [ ] Revisit whether an interactive graph (Obsidian+Quartz, or custom React Flow) is worth adding for visual client deliverables.

---

*Compiled June 2026 from four parallel research passes. Verify pricing, license terms, MCP/API availability, and tier-gating before committing — these change frequently across all tools listed.*
