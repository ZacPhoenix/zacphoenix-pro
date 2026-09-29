// scripts/sync-control.ts: render control/ into each harness's files through explicit adapters.
//   npm run control:sync              write generated files and control/generated.lock.json
//   npm run control:sync -- --check   exit 1 if any generated file differs from a fresh render (CI)
// Needs one dev dependency for frontmatter: npm i -D yaml. Humans edit control/ only.
import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { parse as parseYaml, stringify as toYaml } from 'yaml'
import { z } from 'zod'
import { policy } from '../control/policy.js'

const CHECK = process.argv.includes('--check')
const LOCK = 'control/generated.lock.json'
// Model aliases move with each release. Check /model in both harnesses before changing these.
const CLAUDE_MODEL = { main: 'opus', fast: 'haiku' } as const
const CODEX_MODEL = { main: 'gpt-6-sol', fast: 'gpt-6-luna' } as const
// The 12 hook events Codex supports (0.157.1). Anything else is a gap, not a silent drop.
const CODEX_EVENTS = new Set(['SessionStart', 'SessionEnd', 'UserPromptSubmit', 'PreToolUse', 'PostToolUse',
  'PermissionRequest', 'PreCompact', 'PostCompact', 'Stop', 'SubagentStart', 'SubagentStop', 'Interrupt'])

const RuleMeta = z.object({ paths: z.array(z.string()).optional() })
const AgentMeta = z.object({
  name: z.string().regex(/^[a-z][a-z0-9-]*$/),
  description: z.string().min(20),
  tools: z.array(z.string()),
  sandbox: z.enum(['read-only', 'workspace-write']),
  tier: z.enum(['main', 'fast']).default('main'),
}).refine((a) => a.sandbox === 'workspace-write' || !a.tools.some((t) => t === 'Edit' || t === 'Write'),
  'a read-only role cannot list Edit or Write')

type Output = { files: Map<string, string>; gaps: string[] }
type Source = Awaited<ReturnType<typeof loadSource>>

function frontmatter(text: string) {
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text)
  return m ? { meta: (parseYaml(m[1]) ?? {}) as Record<string, unknown>, body: m[2].trim() } : { meta: {}, body: text.trim() }
}

async function markdown(dir: string) {
  const names = (await readdir(dir)).filter((f) => f.endsWith('.md')).sort()
  return Promise.all(names.map(async (file) => ({ file, ...frontmatter(await readFile(join(dir, file), 'utf8')) })))
}

async function loadSource() {
  const version = (await readFile('control/VERSION', 'utf8')).trim()
  const rules = (await markdown('control/rules')).map((r) => ({ ...r, meta: RuleMeta.parse(r.meta) }))
  const agents = (await markdown('control/agents')).map((a) => ({ ...a, meta: AgentMeta.parse(a.meta) }))
  const skills = new Map<string, string>()
  for (const rel of (await readdir('control/skills', { recursive: true })).sort()) {
    const path = join('control/skills', rel)
    if ((await stat(path)).isFile()) skills.set(rel, await readFile(path, 'utf8'))
  }
  const hooks = JSON.parse(await readFile('control/hooks/hooks.json', 'utf8')) as Record<string, unknown>
  const mcp = JSON.parse(await readFile('control/mcp.json', 'utf8')) as Record<string, { command: string; args: string[] }>
  const note = (h: string) => readFile(`control/notes/${h}.md`, 'utf8').then((t) => t.trim(), () => '')
  return { version, rules, agents, skills, hooks, mcp, notes: { claude: await note('claude'), codex: await note('codex') } }
}

const banner = (v: string) => `Generated from control/ v${v} by npm run control:sync. Edit control/, not this file.`
const withFrontmatter = (meta: object, body: string, v: string) => `---\n${toYaml(meta).trim()}\n---\n<!-- ${banner(v)} -->\n\n${body}\n`

// Frontmatter must stay on line 1, so SKILL.md provenance goes into metadata, not a banner.
function skillCopies(src: Source, root: string) {
  const out = new Map<string, string>()
  for (const [rel, text] of src.skills) {
    if (!rel.endsWith('SKILL.md')) {
      out.set(join(root, rel), text)
      continue
    }
    const { meta, body } = frontmatter(text)
    const metadata = { ...(meta.metadata as Record<string, string> | undefined), 'generated-from': `control/skills v${src.version}` }
    out.set(join(root, rel), `---\n${toYaml({ ...meta, metadata }).trim()}\n---\n\n${body}\n`)
  }
  return out
}

// AGENTS.md is shared: Codex reads it directly, Claude Code through the @AGENTS.md import.
function shared(src: Source): Output {
  const unscoped = src.rules.filter((r) => !r.meta.paths).map((r) => r.body)
  return { files: new Map([['AGENTS.md', [`<!-- ${banner(src.version)} -->`, '# agent-forge', ...unscoped].join('\n\n') + '\n']]), gaps: [] }
}

function claude(src: Source): Output {
  const files = new Map<string, string>()
  const notes = src.notes.claude ? `\n## Claude Code only\n\n${src.notes.claude}\n` : ''
  files.set('CLAUDE.md', `<!-- ${banner(src.version)} -->\n@AGENTS.md\n${notes}`)
  for (const r of src.rules.filter((r) => r.meta.paths)) files.set(`.claude/rules/${r.file}`, withFrontmatter({ paths: r.meta.paths }, r.body, src.version))
  for (const a of src.agents) {
    const meta = { name: a.meta.name, description: a.meta.description, tools: a.meta.tools.join(', '), model: CLAUDE_MODEL[a.meta.tier] }
    files.set(`.claude/agents/${a.meta.name}.md`, withFrontmatter(meta, a.body, src.version))
  }
  const bash = (c: string) => `Bash(${c} *)` // `Bash(npm test *)` also matches a bare `npm test`
  const settings = {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    permissions: {
      allow: policy.commands.allow.map(bash),
      ask: policy.commands.ask.map(bash),
      deny: [...policy.commands.deny.map(bash), ...policy.files.denyRead.map((f) => `Read(${f})`), ...policy.files.denyEdit.map((f) => `Edit(${f})`)],
    },
    sandbox: { enabled: true, network: { allowedDomains: [...policy.network.allowedDomains] } },
    hooks: src.hooks,
  }
  files.set('.claude/settings.json', `${JSON.stringify(settings, null, 2)}\n`)
  const servers = Object.fromEntries(Object.entries(src.mcp).map(([name, s]) => [name, { type: 'stdio', ...s }]))
  files.set('.mcp.json', `${JSON.stringify({ mcpServers: servers }, null, 2)}\n`)
  for (const [path, text] of skillCopies(src, '.claude/skills')) files.set(path, text)
  return { files, gaps: [] }
}

function codex(src: Source): Output {
  const files = new Map<string, string>()
  const gaps: string[] = []
  const q = JSON.stringify // a JSON string is also a valid TOML basic string and Starlark string
  const pathRules = src.rules.filter((r) => r.meta.paths)
  if (pathRules.length) gaps.push(`codex: ${pathRules.length} path-scoped rule(s) became always-on developer_instructions`)
  const fileRules = policy.files.denyRead.length + policy.files.denyEdit.length
  if (fileRules) gaps.push(`codex: ${fileRules} file deny rule(s) not rendered (see [permissions.NAME].filesystem in the config reference)`)
  const instructions = [src.notes.codex, ...pathRules.map((r) => `When editing ${(r.meta.paths ?? []).join(', ')}:\n${r.body}`)].filter(Boolean).join('\n\n')

  files.set('.codex/config.toml', [
    `# ${banner(src.version)}`,
    '# Codex loads project config, hooks, rules, and AGENTS.md only when this project is trusted.',
    'approval_policy = "on-request"',
    'default_permissions = "forge"',
    ...(instructions ? [`developer_instructions = ${q(instructions)}`] : []),
    '',
    '[permissions.forge]',
    'description = "agent-forge: workspace writes plus an allowlist of domains"',
    'extends = ":workspace"',
    '',
    '[permissions.forge.network]',
    'enabled = true',
    '',
    '[permissions.forge.network.domains] # enforcement relies on the experimental network proxy',
    ...policy.network.allowedDomains.map((d) => `${q(d)} = "allow"`),
    '',
    '[agents]',
    `max_concurrent_threads_per_session = ${policy.limits.maxConcurrentAgents}`,
    ...Object.entries(src.mcp).flatMap(([name, s]) => ['', `[mcp_servers.${name}]`, `command = ${q(s.command)}`, `args = ${q(s.args)}`]),
  ].join('\n') + '\n')

  const rule = (cmd: string, decision: 'allow' | 'prompt' | 'forbidden') => `prefix_rule(pattern = ${q(cmd.split(' '))}, decision = ${q(decision)})`
  files.set('.codex/rules/forge.rules', [
    `# ${banner(src.version)}`,
    '# Test a command: codex execpolicy check --rules .codex/rules/forge.rules git push --force',
    ...policy.commands.allow.map((c) => rule(c, 'allow')),
    ...policy.commands.ask.map((c) => rule(c, 'prompt')),
    ...policy.commands.deny.map((c) => rule(c, 'forbidden')),
  ].join('\n') + '\n')

  // Same JSON wire format and matcher names (Edit, Write, Bash, Agent). Drop only what Codex lacks.
  const hooks = Object.fromEntries(Object.entries(src.hooks).filter(([event]) => CODEX_EVENTS.has(event)))
  for (const event of Object.keys(src.hooks).filter((e) => !CODEX_EVENTS.has(e))) gaps.push(`codex: no ${event} hook event, skipped`)
  files.set('.codex/hooks.json', `${JSON.stringify({ hooks }, null, 2)}\n`)

  for (const a of src.agents) {
    const extra = a.meta.tools.filter((t) => !['Read', 'Grep', 'Glob', 'Bash', 'Edit', 'Write'].includes(t))
    if (extra.length) gaps.push(`codex: role ${a.meta.name} lists ${extra.join(', ')}, which a Codex role cannot grant one by one`)
    files.set(`.codex/agents/${a.meta.name}.toml`, [
      `# ${banner(src.version)}`,
      `name = ${q(a.meta.name)}`,
      `description = ${q(a.meta.description)}`,
      `sandbox_mode = ${q(a.meta.sandbox)}`,
      `model = ${q(CODEX_MODEL[a.meta.tier])} # role files take config keys: validate with codex exec --strict-config`,
      `developer_instructions = ${q(a.body)}`,
    ].join('\n') + '\n')
  }

  for (const [path, text] of skillCopies(src, '.agents/skills')) {
    files.set(path, text)
    if (path.endsWith('SKILL.md') && /disable-model-invocation:\s*true/.test(text)) {
      gaps.push(`codex: ${path} is manual-only in Claude Code but can fire implicitly in Codex. Say so in its description`)
    }
  }
  return { files, gaps }
}

const sha = (s: string) => createHash('sha256').update(s).digest('hex').slice(0, 12)
const onDisk = (f: string) => readFile(f, 'utf8').catch(() => null)

const src = await loadSource()
const parts = [shared(src), claude(src), codex(src)]
const files = new Map(parts.flatMap((p) => [...p.files]))
const gaps = parts.flatMap((p) => p.gaps)
files.set(LOCK, `${JSON.stringify({ version: src.version, files: Object.fromEntries([...files].map(([f, t]) => [f, sha(t)])), gaps }, null, 2)}\n`)

const drift: string[] = []
for (const [f, text] of files) if ((await onDisk(f)) !== text) drift.push(f)

if (CHECK) {
  if (drift.length) {
    console.error(`control:sync --check failed. Move the edit into control/ or run npm run control:sync:\n  ${drift.join('\n  ')}`)
    process.exit(1)
  }
  console.log(`control v${src.version}: all ${files.size} generated files match`)
} else {
  const previous = JSON.parse((await onDisk(LOCK)) ?? '{"files":{}}') as { files: Record<string, string> }
  for (const stale of Object.keys(previous.files).filter((f) => !files.has(f))) await rm(stale, { force: true })
  for (const f of drift) {
    await mkdir(dirname(f), { recursive: true })
    await writeFile(f, files.get(f) ?? '')
  }
  console.log(`control v${src.version}: wrote ${drift.length} of ${files.size} files`)
  for (const g of gaps) console.warn(`gap  ${g}`)
  if (drift.some((f) => f === '.codex/hooks.json')) console.warn('note  hooks changed: review and trust them again in Codex with /hooks')
}
