// lab/tokens.ts: the same text, three Claude models, real token counts and input cost.
// Run: npm i @anthropic-ai/sdk && npx tsx lab/tokens.ts README.md
// Token counting is its own endpoint. It does not run the model.
import Anthropic from '@anthropic-ai/sdk'
import { readFile } from 'node:fs/promises'

const client = new Anthropic() // reads ANTHROPIC_API_KEY from the environment
const file = process.argv[2] ?? 'README.md'
const text = await readFile(file, 'utf8')

// Input list price in dollars per million tokens (Anthropic docs, Sep 2026). Recheck before relying on it.
const models = [
  { id: 'claude-haiku-4-5', inputPrice: 1 },
  { id: 'claude-sonnet-5', inputPrice: 2 },
  { id: 'claude-opus-5', inputPrice: 5 },
]

const words = text.split(/\s+/).filter(Boolean).length
console.log(`${file}: ${text.length} characters, ${words} words\n`)

for (const m of models) {
  const { input_tokens } = await client.messages.countTokens({
    model: m.id,
    messages: [{ role: 'user', content: text }],
  })
  const cost = (input_tokens / 1_000_000) * m.inputPrice
  const perWord = (input_tokens / words).toFixed(2)
  console.log(`${m.id.padEnd(18)} ${String(input_tokens).padStart(8)} tokens  ${perWord} tokens/word  $${cost.toFixed(5)} per call`)
}
