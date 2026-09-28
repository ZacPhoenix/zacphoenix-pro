# Authoring guide

This is the contract for every day file in `content/days/`. The validator (`npm run validate`) enforces the hard rules. The soft rules decide whether a lesson is good.

## The learner

- A Solutions Architect and technical PM who already ships websites, React apps, and GitHub deploys with Claude Code, and runs **Claude Code and Codex as a dual setup**.
- Wants comprehensible input plus one: each day starts from what they already do and stretches one notch further.
- Wants ADHD-friendly delivery: brevity, visual scanability, one idea per bite, progress always visible.
- Treat them as an expert. Never explain what an LLM, a prompt, Git, or npm is. Explain mechanisms, tradeoffs, and non-obvious implications.

## Voice (hard rules, enforced)

1. **No em dashes** anywhere. Restructure the sentence.
2. **No semicolons in prose.** Code is exempt (inside backticks or code blocks).
3. No clichés or AI tics: delve, tapestry, game-changer, unlock the power, seamless, supercharge, dive in, "it's not just X, it's Y", and similar. The validator lists them.
4. No paraprosdokians, no jokes, no clever turns of phrase, no rhetorical questions used as filler.
5. No "In this lesson we will". Start with the substance.

## Voice (soft rules)

- Plain, direct English. Advanced vocabulary is welcome when it is the precise word.
- Every bite is **mechanism plus implication**: what is true, then why it matters when you are at the keyboard. A dictionary definition alone is a failed bite.
- Prefer concrete nouns: file names, flags, numbers, commands, failure modes.
- Cite a number only when a source supports it. Put volatile facts in the form "as of Sep 2026".
- Whenever a Claude Code feature appears, name the Codex equivalent or say plainly that Codex lacks one (and the reverse). Check `content/rosetta.js` and the research briefs before claiming parity.

## File shape

```js
// content/days/day-07.js
export default {
  day: 7,
  hook: 'One sentence on why today matters in practice.',          // 30 words or fewer
  anchor: 'What you already do that today builds on.',               // one sentence
  plusOne: 'The single stretch today adds.',                          // one sentence
  tldr: ['...', '...', '...'],                                        // exactly 3, 22 words or fewer each
  outcomes: ['Pick a model per step by cost and capability', '...', '...'], // exactly 3, start with a verb
  minutes: { learn: 20, practice: 45 },
  map: { title: '...', mermaid: ['flowchart LR', '  A["..."] --> B["..."]'], caption: '...' }, // optional hero diagram
  sections: [ /* one per agenda block, same titles, same order as content/course.js */ ],
  quiz: [ /* 7 to 10 questions */ ],
  tasks: [ /* exactly: quick, build, stretch */ ],
  glossary: [['Term', 'Definition in 25 words or fewer.'], /* 5 to 10 */],
  resources: [{ title: '...', url: 'https://...', note: 'Why it is worth the click.' }], // 4 to 8, primary sources
  reflect: ['Question?', 'Question?'],                                 // 2 or 3
}
```

Use single-quoted or double-quoted JS strings. Inside single quotes, escape apostrophes (`\'`) or switch that string to double quotes. Backticks inside normal strings are fine and render as inline code. Never use template literals for content.

Markdown fields (`body`, `callouts[].body`, `deeper.body`, `visual.md`) accept a string or an array of lines. Supported: paragraphs, `-` lists, `1.` lists, `|` tables, `> ` quotes, `### ` headings, fenced code with a language, **bold**, *italic*, `code`, and `[links](https://...)`.

## Sections

```js
{
  id: 'tool-design',                 // kebab-case, unique in the day
  title: 'Tool Design',              // exactly the agenda title from course.js
  lead: 'One line on why this block matters.',   // 20 words or fewer
  bites: [
    ['Tools versus APIs', 'An API mirrors your backend. A tool mirrors a task the model is trying to finish. Wrap three endpoints into one `find_duplicate_issue` tool and the model stops guessing call order.'],
    ['Descriptions · schemas', 'The description is the only documentation the model reads. ...'],
  ],
  visual: { mermaid: ['sequenceDiagram', '...'], caption: '...' },   // optional: mermaid | table | md
  callouts: [{ type: 'example', title: 'A tool result that helps', body: ['```json', '{ "ok": false, "error": "..." }', '```'] }], // optional, 2 max
  deeper: { title: 'Why error text is a prompt', body: ['...'] },   // optional +1 content, collapsed by default
}
```

- **Coverage is enforced.** Every agenda topic in `course.js` must appear as a bite term. Use the topic text as the term (capitalization is free, a parenthetical note is allowed: `Tokenization (BPE)`). Combine related topics in one bite with ` · `: `Steps · branches · graphs`.
- Bite body: 45 words or fewer (hard max 60). One idea. Lead with the claim.
- Keep sections to 8 bites or fewer by grouping.
- `callouts.type`: `example` (concrete command, config, or transcript), `pitfall` (a real failure mode), `pro` (a move experts make), `note`.
- `deeper` is the +1: mechanism detail, a worked example, a contrarian view, or a research finding. 80 to 200 words. It is optional reading, so the core path must stand without it.
- Aim for at least 2 visuals per day (the `map` counts). Diagrams beat paragraphs for loops, flows, and layers. Tables beat paragraphs for comparisons.

## Quiz

```js
{ id: 'q3', section: 'tool-design', q: 'Your agent calls `search_issues` five times with near-identical queries. What is the most likely fix?',
  options: ['Raise max_turns', 'Return fewer, ranked results with a note on what was searched', 'Switch to a larger model', 'Add a retry decorator'],
  answer: 1,
  why: 'Repeated calls usually mean the result did not tell the model it was done. Ranked results plus a note on coverage end the loop. A larger model often loops the same way.' }
```

- 7 to 10 questions per day. At most one quick check per section (`section: 'id'`). At least 3 questions with no `section` for the final round.
- Mix: about half scenario questions ("You see X. What is the most likely cause or best next step?"), the rest conceptual or best practice.
- 4 options. One correct. Distractors are real misconceptions, never jokes. No "all of the above" or "none of the above".
- **Make the correct option no longer than the others.** The validator warns when the answer is usually the longest option.
- `answer` is the index in your authored order. Options are shuffled at runtime with a stable seed, so authoring position does not matter.
- `why`: 55 words or fewer. Say why the answer is right and why the most tempting distractor is wrong.

## Tasks

Exactly three, in this order:

| level | minutes | purpose |
|---|---|---|
| `quick` | 5 to 15 | A standalone micro-drill in Claude Code or Codex. No capstone dependency. Always doable. |
| `build` | 30 to 90 | The capstone milestone for this day, matching `course.capstone.milestones` in `course.js`. Requires `minimum`. |
| `stretch` | 30 to 120 | Optional depth: a harder variant, a comparison, or an experiment. |

```js
{
  id: 'build', level: 'build', minutes: 45,
  title: 'Rebuild Triage on the Claude Agent SDK',
  goal: 'One sentence on the outcome and why it matters.',
  steps: ['Imperative step with `commands` in backticks.', '...'],   // 3 to 7 steps
  prompts: [
    { label: 'Claude Code', text: ['Line one of a prompt to paste.', 'Line two.'] },
    { label: 'Codex', text: ['...'] },          // or one { label: 'Claude Code or Codex', text } when identical
  ],
  code: [{ title: 'src/agent.ts', lang: 'ts', file: 'd07/agent.ts' }],   // long code lives in content/snippets/
  minimum: 'The smallest version that still counts.',
  done: 'Observable evidence: a command that passes, a file that exists, a PR link.',
}
```

- Prompts are real prompts: they state goal, context, constraints, and the verification the agent must run. They name files. They ask the agent to stop and ask when a decision is ambiguous.
- The capstone repo is `agent-forge` (TypeScript, ESM, Node 22, tsx, Zod, Vitest, Playwright later). Build tasks must follow on from earlier days: reuse file names and structures that earlier days created. Read the neighbouring day files before writing.
- Snippets over about 12 lines go in `content/snippets/dNN/` as real files (`.ts`, `.md`, `.json`, `.toml`, `.yml`, `.sh`, `.feature`). Code in TypeScript without semicolons (the house style for this course) and with modern ESM imports. Code must be correct for the SDK versions named in the research briefs. When unsure of an exact API, say so in a comment and point to the doc rather than guessing.
- `done` is evidence, not a feeling: "`npm test` passes and `lab/01-model-lab.md` lists four experiments."

## Mermaid rules

- Use `flowchart LR` or `flowchart TD`, `sequenceDiagram`, or `stateDiagram-v2`.
- Quote every node label: `A["Label with (parens) or: colons"]`. Labels may use `<br/>` for a line break and nothing else in HTML.
- 10 nodes or fewer. No `classDef`, `style`, or colors. The course theme handles color in light and dark mode.
- Edge labels in quotes: `A -->|"approve"| B`.
- No em dashes or semicolons in labels. Put statements one per line (Mermaid accepts newlines, so no semicolons are needed).

## Accuracy

- Research briefs live in the scratchpad path given in your instructions. Use them as the primary source. When a brief marks something `[unverified]`, do not state it as fact.
- Prefer concepts that stay true over flags that drift. When you name a flag or config key, it must appear in a brief or official doc.
- Resources are primary sources: official docs, specs, papers, and engineering posts from the teams that built the thing.

## Before you hand off

1. `node tools/validate.mjs --day N` shows zero errors. Fix warnings unless you have a reason.
2. Read the day top to bottom as the learner. Cut any sentence that does not change what they know or do.
3. Check each quiz answer is unambiguous and each `why` teaches something.
4. Check the build task continues yesterday's repo state and sets up tomorrow's.
