# The Event-Timeline System of Record for an AI-First Firm: What's Working Right Now

🌐 last30days · synced 2026-06-12

**Scope:** Capturing an event-based timeline of business context — an append-only history of "what happened in the company" — that AI agents can query, explore, and write to as the firm's system of record. Is this called a graph? Which approaches are actually working in mid-2026, which are failing, and which stack is easy and simple for a 1-3 person AI-first consultancy to adopt today.

**Research window:** 2026-05-13 to 2026-06-12 (foundational sources older where noted)
**Method:** deep-research engine — 5 parallel search agents (40+ web searches, 25+ full source fetches across vendor docs, GitHub APIs, arXiv, Hacker News) + 2 adversarial verification agents that confirmed/corrected every load-bearing claim at primary sources. Corrections from verification are applied inline.

---

## TL;DR

1. **Yes, it has a name — three names, depending on who's talking.** Engineers call it a **temporal (bi-temporal) knowledge graph**; researchers call it **agent memory**; the analyst/VC layer coalesced in the last six months on **"context graph"** — Foundation Capital's ["AI's trillion-dollar opportunity: Context graphs"](https://foundationcapital.com/ideas/context-graphs-ais-trillion-dollar-opportunity) (Dec 2025) and a primary Gartner note (Feb 13, 2026) predicting **50%+ of AI agent systems will rely on context graphs by 2028**. The architecture everyone converges on underneath: an **append-only event log as the source of truth, with everything else (graphs, summaries, "current state") as a derived projection.**
2. **The practitioner momentum at small scale is files, not databases.** Karpathy's ["LLM Wiki" gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) (April 2026, 5,000+ stars) crystallized the pattern: a git repo of markdown with immutable raw sources, agent-compiled entity pages, and an **append-only `log.md` timeline**. Anthropic endorsed files-as-memory twice (client-side [memory tool](https://claude.com/blog/context-management), Sept 2025; Claude Code **auto memory**, v2.1.59, Feb 2026). Below ~1,000 documents, agentic keyword search beats vector RAG on correctness ([LlamaIndex benchmark](https://www.llamaindex.ai/blog/did-filesystem-tools-kill-vector-search), Jan 2026).
3. **The fancy options work but charge a tax a 1-3 person firm shouldn't pay.** Graphiti/Zep is the real deal for temporal queries (valid_at/invalid_at on every fact) and leads temporal benchmarks — but self-hosting means running a graph DB + embeddings + per-event LLM extraction, and the category is unstable: benchmark scandals, a 43K-star project retracting its claims in 48 hours, Kuzu (the best embedded graph DB) abandoned overnight when Apple acqui-hired the team.
4. **Recommendation: start with a "company journal" git repo — markdown event log + entity pages — exposed to agents via Claude Code / MCP filesystem, with SQLite as the first upgrade and Zep Cloud as the graduation path.** Zero new infrastructure, bitemporal-by-accident (git history *is* "what did we know on date X"), human review via PRs, and every fancy system can be generated *from* it later. Skip: self-hosted graph databases, Kafka, full event-sourcing frameworks, and vector databases on day one.

---

## 1. "Is this called a graph?" — the terminology map

You're circling a real category that three communities named independently. The translation table:

| Term | Who uses it | What it emphasizes |
|---|---|---|
| **Context graph** | VCs, Gartner, enterprise vendors | Decision traces "stitched across entities and time so precedent becomes searchable" — the system-of-record framing |
| **Temporal / bi-temporal knowledge graph** | Engineers (Graphiti, XTDB) | Facts carry validity windows; superseded facts are invalidated, never deleted |
| **Agent memory** | Researchers, benchmarks (LongMemEval, LoCoMo) | What an agent recalls across sessions |
| **Event sourcing / event log** | Backend engineers | The append-only log is canonical; state is a replay/projection |

The window's signal events: [Foundation Capital's essay](https://foundationcapital.com/ideas/context-graphs-ais-trillion-dollar-opportunity) (Jaya Gupta & Ashu Garg, ~Dec 22-23, 2025) put "context graph" on the map; Gartner made it a category in a **primary research note dated Feb 13, 2026** ([reprint](https://promethium.ai/resources/gartner-report-the-new-essential-infrastructure-for-agentic-systems-how-context-graphs-are-solving-ais-institutional-memory-problem/)): *"By 2028, Gartner predicts over 50% of AI agent systems will rely on them."* Zep rebranded from "agent memory" to ["the Context Lake"](https://www.getzep.com/) in Q2 2026. Meanwhile the purest statement of the architecture landed **inside the research window**: Yohei Nakajima's position paper ["The Log is the Agent"](https://arxiv.org/abs/2605.21997) (arXiv, May 21, 2026) — the append-only event log is the source of truth; the agent's working graph is a deterministic projection; replay, forking, and full lineage fall out for free.

**The unifying insight across all four vocabularies:** separate the *record* (append-only events: cheap, durable, boring) from the *view* (graph, summary, "current truth" page: regenerable, disposable). Every working system in this report has that shape. Choose your record format for durability and your view format for whatever your agents read best — and you can change the view layer later without losing anything.

## 2. The three approaches that are actually working

### A. Temporal knowledge graphs — the heavyweight that does exactly what you asked

[Graphiti](https://github.com/getzep/graphiti) (Zep's open-source engine, Apache-2.0, **27,356 stars** as of today, v0.29.2 released June 8) is purpose-built for your question. You feed it "episodes" (messages, notes, JSON events — exactly an event timeline); it extracts entities and relationships via LLM calls and maintains a **bi-temporal graph**: every fact carries `valid_at`/`invalid_at` plus ingestion time, contradicted facts are invalidated rather than deleted, and every fact traces back to its source episode. "What did we know on date X" is a native query. It has [a v1.0 MCP server](https://blog.getzep.com/graphiti-hits-20k-stars-mcp-server-1-0/) so Claude/Cursor can read and write it directly. In the only independent head-to-head in the window ([Particula, June 4, 2026](https://particula.tech/blog/agent-memory-frameworks-tested-mem0-zep-letta-cognee-2026)), Zep/Graphiti scored **63.8% vs Mem0's 49.0%** on LongMemEval (GPT-4o) — the gap attributed precisely to those validity windows.

The honest costs: self-hosting = a graph database (Neo4j 5.26+ or FalkorDB) **plus** an embedding pipeline **plus** multiple LLM calls per ingested episode (extraction, dedup, invalidation — the top community complaints are ingestion cost, [issue #1193](https://github.com/getzep/graphiti/issues/1193), and wanting to skip LLM extraction entirely, [#1299](https://github.com/getzep/graphiti/issues/1299)). The April-June releases attack exactly this (combined extraction, batching, hallucination guards), which is encouraging — and an admission of where it hurts.

### B. Event sourcing — the right idea, at the wrong weight for a tiny firm

The event-sourcing world spent the last year converging on agents from the other direction: [Kurrent](https://www.kurrent.io/) (the rebranded EventStoreDB) bet the company on "event-native AI" and shipped an [MIT-licensed MCP server](https://www.kurrent.io/blog/kurrentdb-mcp-server/) (May 2025) so agents can read/write events and build projections conversationally; Akka and AxonIQ are running the same "event sourcing = agent audit trail" playbook; and two 2026 arXiv papers ([ESAA](https://arxiv.org/abs/2602.23193), Feb; [The Log is the Agent](https://arxiv.org/abs/2605.21997), May) formalize it. ESAA's write-side pattern is worth stealing even if you steal nothing else: **agents emit validated intentions; a deterministic layer appends them** — agents propose, the log disposes.

But the small-team literature is unusually unanimous: full event sourcing (CQRS, projections, eventual consistency, event versioning) is the classic over-engineering trap — the "event-sourced monolith" has been the community's named anti-pattern [since 2016](https://www.infoq.com/news/2016/04/event-sourcing-anti-pattern). KurrentDB is also no longer open source (Kurrent License v1). What a consultancy actually needs from this tradition is one idea: **an append-only journal — never edit, only add** — which fits in a single Postgres/SQLite table or, as it turns out, a markdown file. (If you ever need *real* SQL `AS OF` time travel: [XTDB v2](https://xtdb.com/) is GA, MPL-licensed, Postgres-wire-compatible, bitemporal by default — and a JVM server you must run.)

### C. Markdown + git — the pattern that won the spring

This crossed from hack to named pattern in the window's run-up, and it's where small-scale practitioners are visibly converging:

- **[Karpathy's "LLM Wiki"](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)** (X post April 3, gist April 4, 2026; 5,000+ stars, ~4,300 forks; reported 16M+ views): three layers — `raw/` immutable sources → `wiki/` agent-compiled entity pages → a schema file (CLAUDE.md/AGENTS.md) defining conventions — plus an `index.md` catalog and an **append-only `log.md` chronological timeline**, with three operations: *ingest, query, lint* (lint = an agent pass hunting contradictions, stale claims, orphan pages). This is, structurally, a context graph serialized as files.
- **[WUPHF](https://news.ycombinator.com/item?id=47899844)** (Show HN, ~April 2026, 260 points): markdown+git multi-agent wiki with draft→promotion workflow, append-only fact logs with deterministic IDs, BM25+SQLite search, and a dedicated git identity for agent commits.
- **[A May 14, 2026 practitioner spec](https://extency.com/blog/markdown-versioned-folders-agent-brain-2026)** for versioned markdown as the "business agent brain": per-file frontmatter (type, owner, status, last_reviewed), every page structured as *Current truth / Details / Open questions / Timeline*, and the two-layer retrieval rule worth framing: **"search finds the file; the file contains the answer."**
- **Anthropic's two endorsements:** the API [memory tool](https://claude.com/blog/context-management) (Sept 29, 2025) is deliberately client-side and *file-based* — you own the storage (memory tool + context editing together: 39% improvement on their internal agentic-search eval; context editing alone: 29%, with 84% token reduction on a 100-turn task); and **Claude Code auto memory** shipped in v2.1.59 (Feb 25, 2026) — Claude automatically writes learned facts to `~/.claude/projects/<project>/memory/MEMORY.md`. (A rumored "Auto Dream" consolidation feature in Claude Code is **not real** — our verification found zero changelog/docs trace; the real shipped thing is ["dreaming"](https://claude.com/blog/new-in-claude-managed-agents) in Claude Managed Agents, research preview, May 6, 2026.)
- **[Basic Memory](https://github.com/basicmachines-co/basic-memory)**: an actively maintained MCP server that stores knowledge as plain markdown with wiki-links and Obsidian interop — the off-the-shelf version of all of the above.

Why this wins at your scale: git supplies **temporal queries for free** (`git log` = what changed; checking out a commit = "what did we know on date X" — poor-man's bitemporality with zero schema), supplies the **write-review gate for free** (agents commit on branches; you merge — and [GitHub reports](https://github.blog/ai-and-ml/generative-ai/agent-pull-requests-are-everywhere-heres-how-to-review-them/) agent-authored PRs are now routine), and has **no abandonment risk** — markdown and git will outlive every vendor in this report.

## 3. How agents read and write it

**Read side — the evidence favors agentic search over embeddings at your scale.** Anthropic dropped embeddings-based search from Claude Code in favor of agentic grep (creator Boris Cherny, widely quoted: it "outperformed everything. By a lot." — quote verified only at secondary sources). [LlamaIndex's January 13, 2026 benchmark](https://www.llamaindex.ai/blog/did-filesystem-tools-kill-vector-search) found agentic filesystem search **beat** hybrid RAG on correctness at small corpus sizes (8.4 vs 6.4 on a 5-document corpus), with RAG winning only on latency and very large corpora. A consultancy's timeline won't hit that ceiling for years. Practitioner data agrees: an agent operator who [replaced a vector DB with markdown + SQLite FTS5 + grep](https://dev.to/kuro_agent/why-i-replaced-my-ai-agents-vector-database-with-grep-59mm) (~200 lines of TypeScript) reports >90% retrieval accuracy at ~1,000 documents — and honestly flags the breakdown points: 10K+ docs, multi-user, multilingual.

**Write side — this is where systems actually fail, so adopt the three working patterns:**
1. **Append, don't edit.** Events/log entries are immutable; "current truth" pages are regenerable projections. (Graphiti invalidates rather than deletes; Karpathy's log.md only grows; ESAA's agents can only propose appends.)
2. **Gate promotion with review.** WUPHF's draft→promotion and the memory-repo-PR pattern exist because the HN consensus critique of agent memory is *"everyone is writing, nobody is reading"* — unreviewed writes become bloat, then corruption.
3. **Schedule consolidation.** A periodic lint/dream pass (Karpathy's *lint*, Letta's [sleep-time compute](https://www.letta.com/blog/sleep-time-compute), Anthropic's managed-agents dreaming) that merges duplicates, flags contradictions, and expires stale items. Peer-reviewed support: naive memory accumulation measurably *degrades* agents via error propagation, and curated add/delete recovers ~10% absolute performance ([arXiv 2505.16067](https://arxiv.org/abs/2505.16067)).

**Temporal queries by stack:** markdown+git → `git log` / checkout (free); SQLite/Postgres → two timestamp columns, `occurred_at` + `recorded_at` (+ optional `invalidated_at`), filtered with `WHERE recorded_at <= :x` — that's Graphiti's bitemporal model hand-rolled in 20 lines of DDL; Graphiti/Zep → native `valid_at`/`invalid_at`; XTDB → real SQL:2011 `FOR VALID_TIME AS OF`.

## 4. What is NOT working (read before buying anything)

- **Entity-resolution drift quietly destroys auto-built graphs.** The best postmortem in the window — [Paul Iusztin's "I spent a year building agent memory on knowledge graphs: my 5 mistakes"](https://www.decodingai.com/p/keep-knowledge-graph-clean) (May 30-June 2, 2026) — names it: conflating entity *naming* with *deduplication* causes silent merges of distinct entities and "the graph quietly rots." His fix requires confidence-routed merging (≥0.95 auto, 0.85-0.95 human review) plus nightly re-dedup — i.e., even advocates now assume ongoing human curation. His other mistakes: upfront ontology design (froze the project; start generic, extend on collisions), over-trusting frameworks, and building an immutable log *layer inside the graph stack* prematurely ("crazy expensive" in RAM). Note the log layer is only expensive *there* — as a flat file or table it's free.
- **The ops burden is three systems, not one.** Self-hosted graph memory = graph DB + embedding pipeline + LLM extraction infra. And the substrate is unstable: **Kuzu**, the most-recommended embedded graph DB, was [archived overnight in October 2025](https://www.theregister.com/2025/10/14/kuzudb_abandoned/) when [Apple acqui-hired the team](https://9to5mac.com/2026/02/11/kuzu-database-company-joins-apples-list-of-recent-acquisitions/) (community fork [LadybugDB](https://github.com/ladybugdb/ladybug) is active but eight months old as a governance entity). FalkorDB is SSPL; Memgraph is BSL and RAM-hungry; Neo4j Aura's free tier self-deletes after 30 idle days.
- **Ingestion cost blowups are real.** Microsoft GraphRAG-style indexing produced a documented [~$33K single-dataset bill in early 2024](https://medium.com/graph-praxis/the-graphrag-cost-cliff-how-33-000-became-33-in-eighteen-months-be1b0fbe37e4) (down ~1000x since, but the lesson stands); Graphiti fires multiple LLM + embedding calls per episode, so cost scales with how chatty your company is.
- **The benchmarks selling these products are shaky.** A [LoCoMo audit](https://penfieldlabs.substack.com/p/we-audited-locomo-64-of-the-answer) (~May 2026) found 6.4% of the answer key simply wrong and the LLM judge accepting up to ~63% of intentionally wrong answers; Zep and Mem0 have publicly [accused each other](https://github.com/getzep/zep-papers/issues/5) of benchmark manipulation; **MemPalace** gained 43,458 stars in 8 days, then [retracted its headline claims within 48 hours](https://ossinsight.io/blog/agent-memory-race-2026) (its "lossless compression" regressed 12.4 points). Treat all vendor memory benchmarks as marketing.
- **Memory is now an attack surface.** OWASP launched the [Agent Memory Guard project](https://github.com/OWASP/www-project-agent-memory-guard) against memory-poisoning attacks *within the window* (late May 2026). A system of record agents *write to* is a system attackers want to write to.
- **Mundane failures dominate in practice:** a solo founder running [8 agent "departments" off a shared JSONL graph](https://dev.to/setas/i-run-a-solo-company-with-ai-agent-departments-50nf) hit concurrent-write corruption and agents hallucinating compliance claims — and grossed €6.09. Files + git's serialized commits and PR review make both failure classes visible by construction.

## 5. The recommendation: your stack, in adoption order

For a 1-3 person AI-first consultancy, the answer to "which approach is easy and simple" is unambiguous in the mid-2026 evidence: **the record is a git repo; the view is markdown; the query engine is the agent itself.**

**Phase 1 — start this week (cost: $0, new infrastructure: none)**
One private git repo, e.g. `firm-memory/`, structured Karpathy-style:

```
firm-memory/
├── CLAUDE.md          # schema: conventions, what goes where, how to write events
├── index.md           # catalog of everything, by category
├── log/
│   └── 2026.md        # append-only event timeline: ## [2026-06-12] type | summary
├── entities/
│   ├── clients/       # one page per client: Current truth / Details / Open questions / Timeline
│   ├── projects/
│   └── people/
├── decisions/         # one page per decision, with context and date
└── raw/               # immutable source material (call notes, emails, proposals)
```

Rules that make it a system of record rather than a junk drawer: **the log only grows** (every meaningful business event — call held, proposal sent, decision made, invoice paid — is one dated entry, written by you or appended by an agent); entity pages carry frontmatter (`type, owner, status, last_reviewed`) and a *Current truth* section regenerable from the log; **agents write on branches, you merge**. Claude Code on this repo already gives you read (agentic grep), write (commits/PRs), temporal queries (git log), and auto memory (v2.1.59+) on top — no MCP server even required, though [Basic Memory](https://github.com/basicmachines-co/basic-memory) adds wiki-links and Obsidian if you want them.

**Phase 2 — when structured queries earn it (cost: $0, infra: one file)**
When you want "all open proposals over $10K" rather than prose search, add **one SQLite file in the same repo**: an append-only `events` table (`id, occurred_at, recorded_at, invalidated_at, actor, type, payload JSON`), an `entities` table, an `event_entities` edge table, **FTS5** for keyword search ([sqlite-vec](https://alexgarcia.xyz/sqlite-vec/) later, only if keyword search measurably fails). That edge table + a recursive CTE *is* your graph at this scale; the timestamp pair *is* your bitemporality. Expose via a maintained SQLite MCP server (not Anthropic's archived reference one — it's flagged "do not use in production" with an unpatched SQL-injection disclosure). A weekly **lint agent** (cron or scheduled Claude Code task) dedups entities, flags contradictions between log and entity pages, and expires stale "current truth" — this is the single highest-leverage automation in the whole design.

**Phase 3 — graduation, if ever**
If you reach thousands of episodes, multi-person concurrent agent writes, or clients paying for relationship inference across a large corpus: **Zep Cloud** (free: 1,000 credits/mo; Flex: $104/mo annual — verified on [their pricing page](https://www.getzep.com/pricing/) today) or self-hosted **Graphiti on FalkorDB**. Because your log is append-only from day one, you can replay the entire history into Graphiti as episodes in an afternoon — **the boring start is also the migration plan.**

**Skip list (explicit):**
- ❌ **Self-hosted Neo4j/FalkorDB/Memgraph now** — three systems of ops for a graph a CTE can walk
- ❌ **Kafka / EventStoreDB-Kurrent** — none of the small-team literature recommends them below serious scale; KurrentDB isn't open source anymore
- ❌ **Full event-sourcing frameworks (CQRS, projections, sagas)** — the named anti-pattern; you want the *journal*, not the framework
- ❌ **Mem0 for this use case** — graph memory is paywalled at Pro ($249/mo) and was removed from the OSS SDK entirely; it also scored worst on temporal benchmarks
- ❌ **A vector database on day one** — the evidence says agentic keyword search wins below ~1K docs; add embeddings only when retrieval measurably fails
- ❌ **Anything that launched to 40K stars last month** — MemPalace is the cautionary tale; this category retracts claims faster than you can migrate onto them

**Cost comparison at your scale:**

| Stack | Monthly cost | Ops surface | "As of date X"? | Abandonment risk |
|---|---|---|---|---|
| Markdown + git (+ Claude Code) | $0 + AI subscription | none | git history | none |
| + SQLite events/FTS5 + MCP | $0 | one file | timestamp columns | none |
| Supabase Postgres (if multi-machine) | $25 | low | timestamp columns | low |
| Zep Cloud Flex | $104+ | none | native | medium (category churn) |
| Self-hosted Graphiti + FalkorDB | server + per-event LLM calls | high | native | medium |

## 6. In-window developments worth watching (May 13 - June 12, 2026)

- **Notion Developer Platform** (May 13): External Agents API — Claude Code, Cursor, Codex as tracked workspace collaborators — plus a markdown read/write API "built for the way agents already think" ([TechCrunch](https://techcrunch.com/2026/05/13/notion-just-turned-its-workspace-into-a-hub-for-ai-agents/)). If you'd rather your system of record live in a SaaS, this is the mainstream option becoming agent-native; the trade is vendor dependence for polish.
- **["The Log is the Agent"](https://arxiv.org/abs/2605.21997)** (May 21): the architecture thesis of this report, formalized, with an Apache-2.0 runtime (ActiveGraph).
- **[Falconer's memory teardown](https://falconer.com/notes/how-others-build-agent-memory/)** (May 21): flat-recency memory "silently forgets what matters most" — their fix is tiered buckets, not a graph. Mirror this in your repo: pin identity-level facts in CLAUDE.md, never in the rolling log.
- **[Iusztin's five mistakes](https://www.decodingai.com/p/keep-knowledge-graph-clean)** (May 30): the best available KG-agent postmortem; read before ever graduating to Phase 3.
- **[OWASP Agent Memory Guard](https://github.com/OWASP/www-project-agent-memory-guard)** (launched in window): memory poisoning is now a recognized attack class — another argument for the PR-gated write path.
- **Community temperature check:** a "Universal Memory Protocol" Show HN (June 6, 41 points) was met mostly with *"just a memory dir in your project's git folder? Agents can run grep just fine"* — and of ~20 agent-memory launches on HN in the window, only two cleared 5 points. Launch fatigue is real; the boring pattern is the consensus.

---

## Confidence notes & what we could not verify

Every pricing figure, version number, star count, and date above was either fetched at a primary source on 2026-06-12 or is marked with its source. Items that survive only at secondary sources, flagged for honesty: the Boris Cherny "outperformed everything" quote (widely reported, primary post not located); Karpathy's exact view count (16M+ is a floor; sources range to 21M); Foundation Capital's exact publication day (Dec 22 or 23, 2025); the Amazon Science "94.5% of RAG faithfulness with keyword search" figure (cited in practitioner posts, paper not located); Mem0's graph-memory paywall (confirmed via mem0.ai's own blog/docs, not visible in the pricing page's static HTML). One claim from research was **refuted in verification** and corrected above: Claude Code has no shipped "Auto Dream" feature — the real consolidation feature ("dreaming") lives in Claude Managed Agents (research preview, May 6, 2026). No documented case was found of a 1-3 person *consultancy* (as opposed to solo SaaS founders) running exactly this pattern — you would be early, which is consistent with the positioning of the firm.
