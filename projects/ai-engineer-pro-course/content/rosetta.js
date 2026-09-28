// Claude Code and Codex concept map. Generated from the R2 and R6 research briefs (Sep 28, 2026).
// Edit freely. Run `npm run validate` after changes.

export default {
  "updated": "Sep 28, 2026",
  "intro": [
    "Claude Code and Codex solve the same problem with different vocabulary. This page maps one to the other so you can move a practice between them, and flags where the analogy breaks.",
    "",
    "Verified against **Claude Code v2.1.283** (Sep 25, 2026) and **Codex CLI 0.157.1** (Sep 26, 2026). Both ship weekly, so check `claude --version` and `codex --version` when something differs."
  ],
  "rows": [
    {
      "concept": "Instructions file",
      "claude": "`CLAUDE.md` at user, project, and local levels plus `.claude/rules/`, with `@imports`. Since v2.1.277 it reads `AGENTS.md` when no CLAUDE.md exists.",
      "codex": "`AGENTS.md` from `~/.codex/`, then every folder from repo root to the working directory. `AGENTS.override.md` wins. 32 KiB cap.",
      "gap": "Codex never expands `@imports` and skips project AGENTS.md in untrusted repos. A `CLAUDE.local.md` stops Claude reading AGENTS.md."
    },
    {
      "concept": "Skills",
      "claude": "`.claude/skills/NAME/SKILL.md` or `~/.claude/skills`. Invoked with `/name` or chosen automatically.",
      "codex": "`.agents/skills` from root to the working directory, or `~/.agents/skills`. Invoked with `$name`, `/skills`, or automatically.",
      "gap": "Claude does not read `.agents/skills`, so symlink it. Codex parses only `name` and `description` and ignores `disable-model-invocation`."
    },
    {
      "concept": "Custom commands",
      "claude": "`.claude/commands/*.md` still work and merge into skills.",
      "codex": "Custom prompts were removed in March 2026. Built-in commands only.",
      "gap": "Port commands to skills. Codex `/import` converts Claude commands into skills."
    },
    {
      "concept": "Subagents",
      "claude": "`.claude/agents/*.md`, delegation through the Agent tool, agent teams, background agents.",
      "codex": "`.codex/agents/*.toml`, `spawn_agent`, `/subagents`, and `/agents`.",
      "gap": "Markdown versus TOML. Codex delegates only when asked, or on its own at `ultra` effort."
    },
    {
      "concept": "Hooks",
      "claude": "`hooks` in settings.json, with many events including `Notification`.",
      "codex": "Twelve events in `hooks.json` or `[hooks]`, plus the legacy `notify` setting.",
      "gap": "Same JSON wire format and matcher names (`Edit`, `Write`, `Agent`, `Bash`), but `tool_input` shapes differ. Codex hooks need trust approval in `/hooks`."
    },
    {
      "concept": "Settings and precedence",
      "claude": "JSON. Managed settings, then CLI flags, then `.claude/settings.local.json`, `.claude/settings.json`, and `~/.claude/settings.json`.",
      "codex": "TOML. Session flags, then project `.codex/config.toml` (trusted repos only), then a profile file, then `~/.codex/config.toml`, plus managed layers.",
      "gap": "Codex has no gitignored local project file, so use a profile file. Project config is ignored until the repo is trusted."
    },
    {
      "concept": "Permissions",
      "claude": "Modes: Manual (`default`), `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, plus allow, ask, and deny rules.",
      "codex": "Two axes: `approval_policy` (`on-request` or `never`) and `sandbox_mode`, plus Starlark `rules/*.rules`.",
      "gap": "Nearest pairs: `auto` and `--approve-for-me`, `bypassPermissions` and `--yolo`, `plan` and `/plan` with read-only."
    },
    {
      "concept": "Network access",
      "claude": "Unrestricted for Bash unless the sandbox is on with an allowed-domains list.",
      "codex": "Off by default in `workspace-write`. Enable it with `network_access = true` or a profile.",
      "gap": "`npm install` fails in Codex out of the box. Pre-install dependencies or enable network for trusted repos."
    },
    {
      "concept": "MCP client",
      "claude": "`claude mcp add` with local, project, or user scope, plus `.mcp.json`.",
      "codex": "`codex mcp add`, stored as `[mcp_servers.NAME]` in config.toml.",
      "gap": "Different file formats. OAuth logins are per tool. Codex tool calls time out after 300 seconds by default."
    },
    {
      "concept": "Running as an MCP server",
      "claude": "`claude mcp serve` exposes Claude Code's tools to another client.",
      "codex": "Removed in 0.154.0.",
      "gap": "Guides that run `codex mcp-server` break. Use the `openai/codex-plugin-cc` plugin, an SDK bridge, or `codex exec`."
    },
    {
      "concept": "Headless runs",
      "claude": "`claude -p` with `--output-format json`, `--json-schema` (result in `structured_output`), `--max-turns`, and `--max-budget-usd`.",
      "codex": "`codex exec` with `--json` events, `--output-schema FILE`, `-o FILE`, `--ephemeral`, and `codex exec resume`.",
      "gap": "Codex reads the schema from a file, always runs exec with approval `never`, and needs a git repo unless you pass `--skip-git-repo-check`."
    },
    {
      "concept": "TypeScript SDK",
      "claude": "`@anthropic-ai/claude-agent-sdk` with `query()`.",
      "codex": "`@openai/codex-sdk` with `Codex`, `startThread`, `resumeThread`, `run`, and `runStreamed`.",
      "gap": "Both drive their CLI binary. Anthropic disallows claude.ai login in third-party products. The Codex SDK reuses `codex login`."
    },
    {
      "concept": "GitHub Action",
      "claude": "`anthropics/claude-code-action@v1` for `@claude` mentions and prompt automation.",
      "codex": "`openai/codex-action@v1` with `prompt`, `permission-profile`, `output-schema`, and the `final-message` output.",
      "gap": "The Codex action never posts comments. Add a github-script step to post its output."
    },
    {
      "concept": "Cloud tasks",
      "claude": "Claude Code on the web and cloud environments, `--cloud`, and `--teleport`.",
      "codex": "Codex cloud with `codex cloud exec --attempts 1-4`, then `codex apply`.",
      "gap": "Codex has built-in best-of-N, capped at four attempts."
    },
    {
      "concept": "Code review",
      "claude": "`/code-review` (also `/review`) with `--comment` and `--fix`, `/security-review`, managed Code Review, and `REVIEW.md`.",
      "codex": "`/review`, `codex review --base main`, and `codex exec review --uncommitted --json`.",
      "gap": "Cross-review is easy: the `openai/codex-plugin-cc` plugin runs Codex reviews from inside Claude Code."
    },
    {
      "concept": "Memory",
      "claude": "Auto memory is on by default, with a `MEMORY.md` index and `/memory`.",
      "codex": "Memories are off by default (`features.memories`) and managed with `/memories`.",
      "gap": "Codex memories live in a state database, not in a Markdown file you edit."
    },
    {
      "concept": "Compaction",
      "claude": "`/compact` with optional instructions, plus automatic compaction.",
      "codex": "`/compact`, `model_auto_compact_token_limit`, `compact_prompt`, and `/recap`.",
      "gap": "Equivalent. Codex adds post-turn compaction thresholds."
    },
    {
      "concept": "Resume and fork",
      "claude": "`-c`, `-r ID`, `--fork-session`, `/resume`, `/fork`, and `/rewind`.",
      "codex": "`codex resume`, `codex fork`, `/resume`, `/fork`, and `codex exec resume`.",
      "gap": "Codex has no file checkpoints since `/undo` was removed. Commit often or work in worktrees."
    },
    {
      "concept": "Worktrees",
      "claude": "`claude -w NAME` creates `.claude/worktrees/NAME` on its own branch. Subagents can run isolated.",
      "codex": "`--worktree` or `/worktree`, stored under `~/.codex/worktrees`, with a `codex agents` dashboard.",
      "gap": "Different roots. Gitignore `.claude/worktrees/`, install dependencies in each worktree, and copy `.env` files yourself."
    },
    {
      "concept": "Scheduling",
      "claude": "Routines via `/schedule`, desktop scheduled tasks, and `/loop`.",
      "codex": "Desktop Automations. There is no CLI scheduler.",
      "gap": "For headless Codex, schedule `codex exec` with cron or a scheduled GitHub Actions workflow."
    },
    {
      "concept": "Model and effort",
      "claude": "`/model` and `/effort` (`low` through `max`, plus `auto`), or `--model` and `--effort`.",
      "codex": "`/model`, `-m`, and `model_reasoning_effort` from `low` to `ultra`.",
      "gap": "Effort names do not map one to one. Codex `ultra` also delegates to subagents on its own."
    },
    {
      "concept": "Cost and usage",
      "claude": "`/usage` (also `/cost`) and `total_cost_usd` in JSON output.",
      "codex": "`/status` for session tokens, `/usage` for account windows, and `usage` in exec events.",
      "gap": "Codex reports tokens, not dollars. Plan usage is counted in windows."
    },
    {
      "concept": "Undo",
      "claude": "`/rewind` restores code and conversation checkpoints.",
      "codex": "None since April 2026.",
      "gap": "Backtracking in Codex rewinds the chat only, never your files."
    },
    {
      "concept": "Import and migration",
      "claude": "`claude import` or `/import codex`.",
      "codex": "`/import` from Claude Code or Cursor: config, skills, AGENTS.md, MCP, subagents, hooks, and memory.",
      "gap": "Imports are snapshots, not syncs. Codex `/import` refuses symlinked destinations, so import first and symlink after."
    }
  ],
  "patterns": [
    {
      "title": "One instruction file, AGENTS.md canonical",
      "why": "Both harnesses read the same rules. Claude-only notes live in a thin CLAUDE.md that imports the shared file.",
      "body": [
        "1. Write tool-neutral rules in `AGENTS.md`: stack, commands, conventions, deploy steps.",
        "2. If Claude needs extra notes, add a `CLAUDE.md` that starts with `@AGENTS.md`. Otherwise skip it and let Claude read AGENTS.md directly.",
        "3. Trust the repo in Codex once, at the first-run prompt.",
        "```markdown CLAUDE.md",
        "@AGENTS.md",
        "",
        "## Claude Code only",
        "Use plan mode for changes under src/billing/.",
        "```",
        "Gotchas: keep AGENTS.md under 32 KiB. A `CLAUDE.local.md` turns off Claude's automatic AGENTS.md read. Codex ignores project AGENTS.md in untrusted repos."
      ]
    },
    {
      "title": "Shared skills folder via symlinks",
      "why": "Write a skill once in the open Agent Skills format and expose it to both harnesses.",
      "body": [
        "```bash",
        "mkdir -p .agents/skills/deploy-check .claude/skills",
        "$EDITOR .agents/skills/deploy-check/SKILL.md",
        "ln -s ../../.agents/skills/deploy-check .claude/skills/deploy-check",
        "```",
        "Gotchas: stick to standard fields (`name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`). Codex ignores `disable-model-invocation`, so write 'only run when explicitly asked' into the description of manual skills. `.agents/` is read-only inside the Codex sandbox, so edit skills yourself."
      ]
    },
    {
      "title": "Claude writes, Codex reviews",
      "why": "A second model family catches different mistakes. OpenAI ships an official Claude Code plugin for this.",
      "body": [
        "```text",
        "/plugin marketplace add openai/codex-plugin-cc",
        "/plugin install codex@openai-codex",
        "/codex:setup",
        "/codex:review --base main --background",
        "/codex:result",
        "```",
        "Also available: `/codex:adversarial-review`, `/codex:rescue` to delegate a fix, and `/codex:transfer` to continue the session in Codex. An optional review gate (a Stop hook) blocks until Codex's review passes, and it can loop and burn usage.",
        "Gotchas: it uses your local Codex install, login, and limits. Pass current model names such as `gpt-6-luna`, since the plugin README still mentions older ones."
      ]
    },
    {
      "title": "Codex writes, Claude reviews",
      "why": "The reverse direction, from a terminal or CI, with structured findings you can gate on.",
      "body": [
        "```bash",
        "git diff origin/main...HEAD | claude -p \"Review this diff for bugs, security issues and missing tests.\" \\",
        "  --output-format json \\",
        "  --json-schema '{\"type\":\"object\",\"properties\":{\"findings\":{\"type\":\"array\",\"items\":{\"type\":\"string\"}}},\"required\":[\"findings\"]}' \\",
        "  | jq '.structured_output'",
        "```",
        "Gotchas: calling `claude` from inside a Codex session fails in the default sandbox, since it needs network and writes to `~/.claude`. Run it from your own terminal. The same applies to `codex` inside Claude's sandbox."
      ]
    },
    {
      "title": "Codex inside Claude Code through an SDK bridge",
      "why": "When you want Codex as a callable tool without the plugin, wrap the Codex SDK in a small MCP server.",
      "body": [
        "```js codex-bridge.mjs",
        "// npm i @openai/codex-sdk @modelcontextprotocol/sdk zod",
        "import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'",
        "import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'",
        "import { Codex } from '@openai/codex-sdk'",
        "import { z } from 'zod'",
        "",
        "const codex = new Codex()",
        "const server = new McpServer({ name: 'codex-bridge', version: '0.1.0' })",
        "",
        "server.registerTool(",
        "  'codex_consult',",
        "  {",
        "    description: 'Ask Codex (read-only sandbox) to review or investigate the repo at cwd.',",
        "    inputSchema: { prompt: z.string(), cwd: z.string() },",
        "  },",
        "  async ({ prompt, cwd }) => {",
        "    const thread = codex.startThread({ workingDirectory: cwd, sandboxMode: 'read-only', approvalPolicy: 'never' })",
        "    const turn = await thread.run(prompt)",
        "    return { content: [{ type: 'text', text: `${turn.finalResponse}\\n\\n(codex thread ${thread.id})` }] }",
        "  },",
        ")",
        "",
        "await server.connect(new StdioServerTransport())",
        "```",
        "Register it with `claude mcp add codex-bridge -- node /abs/path/codex-bridge.mjs`.",
        "Gotchas: this uses the v1 MCP SDK (`registerTool`, verified in 1.30.1), which speaks the 2025 protocol. Day 8 covers the 2026 SDK. Keep Codex read-only here so two agents never edit the same checkout."
      ]
    },
    {
      "title": "Cross-model review in CI",
      "why": "Every pull request gets one review from each model family. Findings from both land as PR comments.",
      "body": [
        "```yaml .github/workflows/dual-review.yml",
        "name: dual-review",
        "on:",
        "  pull_request:",
        "    types: [opened, synchronize]",
        "jobs:",
        "  codex:",
        "    runs-on: ubuntu-latest",
        "    permissions: { contents: read }",
        "    outputs:",
        "      review: ${{ steps.codex.outputs.final-message }}",
        "    steps:",
        "      - uses: actions/checkout@v5",
        "        with:",
        "          ref: refs/pull/${{ github.event.pull_request.number }}/merge",
        "          persist-credentials: false",
        "      - name: Fetch base",
        "        env:",
        "          BASE_REF: ${{ github.event.pull_request.base.ref }}",
        "        run: git fetch --no-tags origin \"$BASE_REF\"",
        "      - id: codex",
        "        uses: openai/codex-action@v1",
        "        with:",
        "          openai-api-key: ${{ secrets.OPENAI_API_KEY }}",
        "          permission-profile: \":read-only\"",
        "          effort: high",
        "          prompt: |",
        "            Review only the changes between origin/${{ github.event.pull_request.base.ref }} and HEAD.",
        "            List bugs, security issues and missing tests as file:line bullets.",
        "  codex-comment:",
        "    needs: codex",
        "    if: needs.codex.outputs.review != ''",
        "    runs-on: ubuntu-latest",
        "    permissions: { issues: write, pull-requests: write }",
        "    steps:",
        "      - uses: actions/github-script@v7",
        "        env:",
        "          BODY: ${{ needs.codex.outputs.review }}",
        "        with:",
        "          script: |",
        "            await github.rest.issues.createComment({",
        "              owner: context.repo.owner, repo: context.repo.repo,",
        "              issue_number: context.payload.pull_request.number,",
        "              body: 'Codex review\\n\\n' + process.env.BODY })",
        "  claude:",
        "    runs-on: ubuntu-latest",
        "    permissions: { contents: read, pull-requests: read, issues: read, id-token: write }",
        "    steps:",
        "      - uses: actions/checkout@v6",
        "        with: { fetch-depth: 1 }",
        "      - uses: anthropics/claude-code-action@v1",
        "        with:",
        "          anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}",
        "          plugin_marketplaces: \"https://github.com/anthropics/claude-code.git\"",
        "          plugins: \"code-review@claude-code-plugins\"",
        "          prompt: \"/code-review:code-review --comment ${{ github.repository }}/pull/${{ github.event.pull_request.number }}\"",
        "          claude_args: '--allowedTools \"mcp__github_inline_comment__create_inline_comment\"'",
        "```",
        "Gotchas: pull requests from forks get no secrets. Pass GitHub expressions through `env` in shell steps, never inline. Two reviewers double the spend, so consider running Codex only on labeled PRs."
      ]
    },
    {
      "title": "Shared hook scripts",
      "why": "Codex hooks accept Claude's JSON format and matcher names, so one script can guard both harnesses.",
      "body": [
        "Write `scripts/hooks/format.sh` to read the hook JSON from stdin. Reference it from `.claude/settings.json` under `hooks` and from `.codex/hooks.json` with the identical inner object. The matcher `Edit|Write` works in both, since Codex maps it to `apply_patch`.",
        "Gotchas: Claude sends `tool_input.file_path`, while Codex sends the patch text in `command`. Make scripts path-agnostic, for example by formatting the files in `git diff --name-only`. Codex hooks need a trusted project and a fresh trust approval in `/hooks` after every change."
      ]
    },
    {
      "title": "Shared MCP servers",
      "why": "Give both agents the same external tools, such as current documentation for each harness.",
      "body": [
        "```json .mcp.json (Claude Code, project scope)",
        "{ \"mcpServers\": {",
        "    \"context7\": { \"type\": \"stdio\", \"command\": \"npx\", \"args\": [\"-y\", \"@upstash/context7-mcp\"] },",
        "    \"openai-docs\": { \"type\": \"http\", \"url\": \"https://developers.openai.com/mcp\" } } }",
        "```",
        "```toml .codex/config.toml (trusted project)",
        "[mcp_servers.context7]",
        "command = \"npx\"",
        "args = [\"-y\", \"@upstash/context7-mcp\"]",
        "",
        "[mcp_servers.openai-docs]",
        "url = \"https://developers.openai.com/mcp\"",
        "```",
        "Gotchas: run `/import` once to migrate, then keep both files in sync (Day 17 generates them from one source). Keep tokens in environment variables. OAuth logins are per tool."
      ]
    },
    {
      "title": "Parallel worktrees, one agent per branch",
      "why": "Two agents on one checkout collide. Separate worktrees give each its own branch and files.",
      "body": [
        "```bash",
        "claude -w feat-auth                                         # .claude/worktrees/feat-auth",
        "codex --worktree \"Build the pricing page on its own branch\"  # ~/.codex/worktrees/...",
        "```",
        "Gotchas: install dependencies and copy `.env` files in each worktree. Give each dev server its own `PORT`. Merge through pull requests so each agent's work gets the other's review."
      ]
    },
    {
      "title": "Session handoff and one-time migration",
      "why": "Move work, or a whole setup, between harnesses without retyping context.",
      "body": [
        "- Claude to Codex: `/codex:transfer` from the plugin imports the current transcript and prints `codex resume ID`. Codex `/import` can also bring config, MCP servers, subagents, hooks, commands, and memory.",
        "- Codex to Claude: `claude import codex` or `/import codex` brings instruction files, MCP servers, commands, subagents, and skills.",
        "Gotchas: review imported hooks before trusting them. Effort and permission names get translated on the way (for example `acceptEdits` becomes `workspace-write`)."
      ]
    }
  ],
  "notes": [
    "- **Stale advice is everywhere.** Many 2025 posts teach `--full-auto`, `codex mcp-server`, `[profiles.x]` tables, `/approvals`, `/undo`, custom prompts, and `-a untrusted`. All are gone or changed in Codex 0.157.1. Profiles now live in `~/.codex/NAME.config.toml`.",
    "- **Trust gates everything in Codex.** Project config, project AGENTS.md, and hooks load only after you trust the repo.",
    "- **Opening a repo is an attack surface.** Four Codex CVEs disclosed on Sep 1, 2026 fired from a malicious repo's git config and hooks before the model did anything. Treat unknown repos as untrusted in both harnesses.",
    "- **Not verified here:** Codex plan limits per tier, Codex cloud environment settings, `@codex` review in GitHub, and the Slack and Linear integrations."
  ]
}
