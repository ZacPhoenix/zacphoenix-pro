// src/run/guard.ts: run budget, daily cap, kill switch, and cancellation for unattended runs.
// A budget written in AGENTS.md is advice. This module is the enforcement.
import { existsSync } from 'node:fs'
import type { Checkpoint } from './checkpoint.js'

export type StopReason = 'kill_switch' | 'run_budget' | 'daily_cap' | 'signal'
export type Verdict = { ok: true; maxBudgetUsd: number } | { ok: false; reason: StopReason }

export interface GuardOptions {
  runBudgetUsd: number // this invocation, for example 2
  dailyCapUsd: number // every invocation today combined, for example 5
  perItemUsd: number // handed to each query() as maxBudgetUsd, for example 0.25
  stopFile?: string // create this file to stop a local run between items
}

// FORGE_KILL=1 blocks a run from starting. The stop file halts one that is already running.
export function killSwitchOn(stopFile = 'state/STOP'): boolean {
  return process.env.FORGE_KILL === '1' || existsSync(stopFile)
}

export function createGuard(cp: Checkpoint, opts: GuardOptions) {
  const controller = new AbortController() // pass as the Agent SDK `abortController` option
  const spentAtStart = cp.spend.usd
  let stopped: StopReason | undefined

  const halt = (reason: StopReason): Verdict => {
    const first = stopped ?? reason
    stopped = first
    controller.abort(first)
    return { ok: false, reason: first }
  }

  // Ctrl+C locally, a cancelled GitHub Actions run, and a container stop all arrive as signals.
  const onSignal = () => {
    halt('signal')
  }
  process.once('SIGINT', onSignal)
  process.once('SIGTERM', onSignal)

  // Call before every item and before every side effect, never only at start.
  function check(): Verdict {
    if (stopped) return { ok: false, reason: stopped }
    if (killSwitchOn(opts.stopFile)) return halt('kill_switch')
    const runLeft = opts.runBudgetUsd - (cp.spend.usd - spentAtStart)
    const dayLeft = opts.dailyCapUsd - cp.spend.usd
    if (dayLeft <= 0) return halt('daily_cap')
    if (runLeft <= 0) return halt('run_budget')
    // The SDK cap covers one query() only, so hand it whatever is left, never the full budget.
    return { ok: true, maxBudgetUsd: Math.min(opts.perItemUsd, runLeft, dayLeft) }
  }

  function dispose() {
    process.off('SIGINT', onSignal)
    process.off('SIGTERM', onSignal)
  }

  return { check, dispose, abortController: controller, stoppedBy: () => stopped }
}

// Usage inside the scheduled loop (src/run/scheduled.ts):
//   const verdict = guard.check()
//   if (!verdict.ok) return pause(verdict.reason)
//   const result = await triageOne(item, {
//     maxBudgetUsd: verdict.maxBudgetUsd,
//     abortController: guard.abortController,
//     permissionMode: 'dontAsk', // anything not pre-approved is denied, never waits on a prompt
//   })
//   await completeItem(cp, item.id, result.total_cost_usd)
// Codex has no dollar cap: bound `codex exec` with `timeout` and the token counts in `turn.completed`.
