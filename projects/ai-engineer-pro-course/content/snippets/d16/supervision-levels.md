# Supervision levels for Triage

Autonomy is granted per action, not per agent. Promote an action one level at a time, with evidence.
Demote it automatically on any incident. Every level below is enforced in code or config, never by instructions alone.

## The ladder

| Level | Human role | The agent may | Claude Code | Codex |
|---|---|---|---|---|
| L0 Suggest | Operator: you act on its advice | Read and propose, change nothing | `plan` mode | `/plan` with the `:read-only` profile |
| L1 Approve each | Approver of every effect | Act only after an explicit yes | Manual (`default`) mode, or the Inbox approval gate | `:read-only` plus `-a on-request`, so every write asks |
| L2 Bounded | Approver of irreversible effects only | Act within budget, draft anything irreversible | Agent SDK `permissionMode: 'dontAsk'` plus `allowedTools` and a gated `canUseTool` | `codex exec` (approval is always `never`) inside `read-only` or `workspace-write` |
| L3 Sampled | Monitor: you review a sample afterwards | Act, including some reversible external effects | `auto` mode plus the OS sandbox | `--approve-for-me` (auto-review, `on-request`, `workspace-write`) |
| L4 Audited | Auditor: you read the log | Act freely inside a disposable environment | `bypassPermissions`, only in a container with scoped tokens | `--dangerously-bypass-approvals-and-sandbox` (`--yolo`), same conditions |

## Triage actions today

| Action | Level | Reversible | Blast radius | Promote when | Demote when |
|---|---|---|---|---|---|
| `list_feedback`, `get_feedback` | L3 | Read only | None | n/a | Never |
| `search_issues` | L3 | Read only | Queries leave the machine | n/a | An injected instruction appears in results |
| `save_triage` | L2 | Yes (file in git) | Local data | 10 clean scheduled runs and 20 sampled results you agree with | A schema failure reaches the Inbox |
| `draft_issue` | L2 | Yes (local draft) | Inbox queue | 50 drafts with a human edit rate under 20% | Edit rate over 40% in a week |
| Escalation issue | L2 | Yes (close it) | Your repo only | n/a | More than one escalation issue open at once |
| Labels on existing issues | L1 | Yes, but visible | Public, notifies watchers | Day 19: 30 labels with under 10% corrections | A wrong label on a critical issue |
| Comments on issues | L1 | Visible edit history | Public, notifies the author | Day 19 digest proves tone and accuracy | Any complaint about a bot comment |
| `create_issue` | L1 | Hard (close, never delete) | Public, notifies watchers | Not in this course | n/a |

## Rules

1. The scheduled run (`npm run triage -- --scheduled`) may use L2 and L3 actions only. `create_issue` is denied in that mode, and `draft_issue` is the fallback.
2. A level change is a pull request that edits this file and the code that enforces it, in the same commit.
3. Promotion needs evidence you can link: run ids, sampled results, eval scores. Demotion needs only the incident.
4. Irreversible or public effects never skip a level.
5. Record every change here with the date and the evidence.

## Change log

| Date | Action | From | To | Evidence |
|---|---|---|---|---|
| 2026-11-16 | all | n/a | as above | Initial levels |
