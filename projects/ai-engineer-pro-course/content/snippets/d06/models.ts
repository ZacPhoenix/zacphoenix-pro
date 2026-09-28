// src/models.ts: model IDs from env vars, list prices, and dollars from a usage object.
// Prices are USD per million tokens from Anthropic's pricing page (Sep 2026). Recheck them at each release:
// https://platform.claude.com/docs/en/about-claude/pricing
import type Anthropic from '@anthropic-ai/sdk'

export const MODEL_MAIN = process.env.FORGE_MODEL_MAIN ?? 'claude-opus-5'
export const MODEL_FAST = process.env.FORGE_MODEL_FAST ?? 'claude-haiku-4-5'

type Price = { input: number, output: number, cacheRead: number }

const PRICES: Record<string, Price> = {
  'claude-fable-5-1': { input: 10, output: 50, cacheRead: 0.25 },
  'claude-opus-5-5': { input: 4, output: 20, cacheRead: 0.2 },
  'claude-opus-5': { input: 5, output: 25, cacheRead: 0.5 },
  'claude-sonnet-5': { input: 2, output: 10, cacheRead: 0.2 },
  'claude-haiku-4-5': { input: 1, output: 5, cacheRead: 0.1 },
}

export type Usage = Pick<
  Anthropic.Usage,
  'input_tokens' | 'output_tokens' | 'cache_creation_input_tokens' | 'cache_read_input_tokens'
>

// input_tokens is only the uncached tail. Cache writes (5-minute TTL) bill at 1.25x input, reads at cacheRead.
export function costUsd(model: string, u: Usage): number {
  const p = PRICES[model]
  if (!p) throw new Error(`No price for ${model}. Add it to PRICES in src/models.ts before running.`)
  const written = (u.cache_creation_input_tokens ?? 0) * p.input * 1.25
  const read = (u.cache_read_input_tokens ?? 0) * p.cacheRead
  return (u.input_tokens * p.input + u.output_tokens * p.output + written + read) / 1_000_000
}
