// scripts/screens.ts: capture the Inbox states that matter, as files an agent can read.
// Run: npm run screens   (package.json: "screens": "tsx scripts/screens.ts")
// Needs the UI running at INBOX_URL (default http://localhost:5173) and: npx playwright install chromium
// Relies on UI conventions from the Day 13 prompt: a <main> element, rows that link to ?id=<proposalId>,
// and the keys e and r opening edit and reject.
import { chromium, type Page } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const base = process.env.INBOX_URL ?? 'http://localhost:5173'
const outDir = process.env.SCREENS_DIR ?? 'reports/screens'

type Shot = { name: string, path: (id: string) => string, width?: number, act?: (page: Page) => Promise<void> }

const shots: Shot[] = [
  { name: 'list', path: () => '/' },
  { name: 'detail', path: (id) => `/?id=${id}` },
  { name: 'edit', path: (id) => `/?id=${id}`, act: (p) => p.keyboard.press('e') },
  {
    name: 'reject-needs-reason',
    path: (id) => `/?id=${id}`,
    act: async (p) => {
      await p.keyboard.press('r')
      await p.keyboard.press('Enter') // submit with no reason: AC-5 says this must be refused
    },
  },
  { name: 'approved-filter', path: () => '/?status=approved' },
  { name: 'narrow', path: () => '/', width: 1024 },
]

await mkdir(outDir, { recursive: true })
const browser = await chromium.launch()
const errors: string[] = []
const saved: string[] = []

try {
  const probe = await browser.newPage()
  await probe.goto(base)
  const href = await probe.locator('a[href*="?id="]').first().getAttribute('href', { timeout: 5_000 }).catch(() => null)
  const firstId = href ? (new URL(href, base).searchParams.get('id') ?? '') : ''
  await probe.close()
  if (!firstId) errors.push('list: no proposal links found (expected <a href="?id=...">)')

  for (const shot of shots) {
    const page = await browser.newPage({ viewport: { width: shot.width ?? 1440, height: 900 } })
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`${shot.name}: ${m.text()}`)
    })
    page.on('pageerror', (e) => errors.push(`${shot.name}: ${e.message}`))
    try {
      await page.goto(new URL(shot.path(firstId), base).href)
      await page.locator('main').waitFor({ timeout: 10_000 })
      if (shot.act) await shot.act(page)
      const file = `${outDir}/${shot.name}.png`
      await page.screenshot({ path: file, fullPage: true })
      saved.push(file)
    } catch (err) {
      errors.push(`${shot.name}: ${(err as Error).message.split('\n')[0]}`)
    } finally {
      await page.close()
    }
  }
} finally {
  await browser.close()
}

// A few summary lines for the agent, the detail in a file.
await writeFile(`${outDir}/summary.json`, JSON.stringify({ base, saved, errors }, null, 2))
console.log(`screens: ${saved.length} of ${shots.length} captured, ${errors.length} errors -> ${outDir}/`)
for (const e of errors.slice(0, 5)) console.log(`  ${e}`)
process.exitCode = errors.length ? 1 : 0
