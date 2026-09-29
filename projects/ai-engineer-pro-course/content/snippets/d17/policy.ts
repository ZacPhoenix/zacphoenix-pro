// control/policy.ts: the environment policy every generated harness config comes from.
// Edit here, run `npm run control:sync`, review the generated diff. Names and patterns only, never secret values.
// The runtime imports it too (src/run/scheduled.ts reads limits and levels), so docs, configs, and code agree.

export type Level = 'L0' | 'L1' | 'L2' | 'L3' | 'L4'

// Day 16 supervision levels as data: one table for the guard, the docs, and the reviewers.
export const levels = {
  list_feedback: 'L3',
  get_feedback: 'L3',
  search_issues: 'L3',
  save_triage: 'L2',
  draft_issue: 'L2',
  escalate: 'L2',
  label_issue: 'L1',
  comment_issue: 'L1',
  create_issue: 'L1',
} as const satisfies Record<string, Level>

export const policy = {
  // Safe default: anything not listed asks in interactive sessions and is denied in unattended ones.
  commands: {
    allow: ['npm run typecheck', 'npm run lint', 'npm test', 'npm run eval', 'npm run traces', 'git status', 'git diff', 'git log'],
    ask: ['git push', 'gh pr create', 'gh pr merge', 'npm install'],
    // Prefix patterns leak (git push origin +main, sh -c "..."), so branch protection is the real guard for pushes.
    deny: ['git push --force', 'git push -f', 'git reset --hard', 'rm -rf', 'curl', 'wget'],
  },
  files: {
    denyRead: ['./.env', './.env.*', './secrets/**'],
    // Human-owned truth: the agent that runs under this policy must not rewrite it or its own grader (Day 20).
    denyEdit: ['./control/policy.ts', './evals/golden.jsonl', './data/decisions.jsonl'],
  },
  network: {
    // Claude Code sandbox allowlist and the Codex permission profile. Everything else is blocked.
    allowedDomains: ['registry.npmjs.org', 'api.github.com', 'github.com'],
  },
  secrets: {
    // Environment variable names only. Each process reads the one it needs, and CI grants per step.
    anthropic: 'ANTHROPIC_API_KEY',
    codex: 'CODEX_API_KEY', // codex exec prefers it over a stored login
    github: 'GH_TOKEN',
  },
  limits: {
    maxTurns: 30, // Agent SDK runs. Codex has no turn cap, so its runs get a wall-clock timeout
    maxConcurrentAgents: 4, // Codex [agents] max_concurrent_threads_per_session
    runBudgetUsd: 2,
    dailyCapUsd: 5,
    perItemUsd: 0.25,
    codexTimeoutSec: 600,
  },
  levels,
} as const
