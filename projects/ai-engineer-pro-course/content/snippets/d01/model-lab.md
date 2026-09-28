# Model lab 01: mechanics you can observe

- Date:
- Claude Code version (`claude --version`):
- Codex version (`codex --version`):

Run every experiment in both harnesses. Paste real outputs, not summaries.

## 1. Tokenization

```bash
claude -p "How many times does the letter r appear in 'strawberry raspberry'? Reply with a number only."
codex exec "How many times does the letter r appear in 'strawberry raspberry'? Reply with a number only."
```

Correct answer: 6. Then ask each harness to spell both words letter by letter before counting.

| Harness | First answer | After spelling | Notes |
|---|---|---|---|
| Claude Code | | | |
| Codex | | | |

Frontier models with thinking often recover by spelling internally. If both get it right, try a harder case:
count the letter e in a 40-word sentence, or reverse a 30-character string.

## 2. Sampling variance

```bash
for i in 1 2 3; do claude -p "Name one non-obvious use of a git worktree. One sentence."; done
for i in 1 2 3; do codex exec "Name one non-obvious use of a git worktree. One sentence."; done
```

Same idea three times, or different ideas? What does that say about treating one run as evidence?

## 3. Knowledge cutoff versus harness

```bash
claude -p "What is the latest released version of the npm package vite? State your confidence and your knowledge cutoff."
claude -p "What is the latest released version of the npm package vite? State your confidence and your knowledge cutoff." --disallowedTools WebSearch WebFetch
npm view vite version
```

```bash
codex exec "What is the latest released version of the npm package vite? State your confidence and your knowledge cutoff."
codex --search exec "What is the latest released version of the npm package vite? State your confidence and your knowledge cutoff."
codex -c 'web_search="disabled"' exec "What is the latest released version of the npm package vite? State your confidence and your knowledge cutoff."
```

Codex defaults to cached web search. `--search` switches to live search, and it must come before `exec`.
Which runs searched? How did each answer change once search was removed? What does that say about blaming the model for a stale answer?

## 4. Structured output

Schema: `lab/schema.json`

```bash
claude -p "Explain the KV cache for a senior engineer." --output-format json --json-schema "$(cat lab/schema.json)" | jq .structured_output
codex exec --output-schema lab/schema.json "Explain the KV cache for a senior engineer."
```

Both should return JSON that matches the schema. Is each answer correct, or only valid?

## Takeaways

- One behavior the mechanics predicted:
- One thing that surprised me:
- One prompt rule I will keep:
