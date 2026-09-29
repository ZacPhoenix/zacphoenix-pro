---
name: explain-diff
description: Explains a git diff for a reviewer, file by file, with risks and the tests worth adding. Use when the user asks to explain, summarize, or review changes, a branch, a commit, or a pull request. Read-only.
allowed-tools: Bash(git diff *) Bash(git log *) Bash(gh pr diff *)
metadata:
  short-description: Explain a diff for review
---
# Explain a diff

Read-only. Never edit, stage, or commit files while running this skill.

## 1. Get the diff
Use the first case that applies:
- A PR number was given: `gh pr diff <number>`
- A base branch was given: `git diff <base>...HEAD`
- Otherwise: `git diff HEAD` (staged and unstaged changes)

If the diff is empty, say so and stop. If it is over 1,500 lines, list the files by
lines changed and ask which ones to explain.

## 2. Explain it
Write these four parts, in this order:
1. **Intent**: one or two sentences on what the change is for. Quote the commit
   message or PR title when there is one.
2. **Walkthrough**: one bullet per file, grouped by behavior, not alphabetically.
   Say what changed and why it matters.
3. **Risks**: anything that could break callers, data, security, or the rules in
   AGENTS.md, each with `file:line`. Write "None found" rather than inventing one.
4. **Tests to add**: the smallest tests that would catch the risks above.

## 3. Check your output before you reply
- Every file in the diff appears in the walkthrough.
- Every risk points at a line that exists in the diff.
- Nothing is described that the diff does not contain.
