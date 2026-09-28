// Multiple-choice question component. Options are shuffled with a stable seed per question,
// so the order is random relative to authoring but identical across reloads.

import { h, inline } from './core.js'

function hash(str) {
  let x = 2166136261
  for (let i = 0; i < str.length; i++) {
    x ^= str.charCodeAt(i)
    x = Math.imul(x, 16777619)
  }
  return x >>> 0
}

function rng(seed) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function order(seed, count) {
  const idx = Array.from({ length: count }, (_, i) => i)
  const rand = rng(hash(seed))
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[idx[i], idx[j]] = [idx[j], idx[i]]
  }
  return idx
}

const KEYS = ['A', 'B', 'C', 'D', 'E', 'F']

// question: { id, q, options, answer, why }
// prior: { picked, correct } from storage, if already answered
// onAnswer(pickedIndex, correct) is called once, on the first attempt
export function mcq({ question, seed, prior, onAnswer, label, reviewHint = true }) {
  const box = h('div', { class: 'mcq', id: `q-${question.id}`, tabindex: '-1' })
  const opts = h('div', { class: 'mcq-opts', role: 'group', 'aria-label': 'Answer options' })
  const why = h('div', { class: 'mcq-why', hidden: true, 'aria-live': 'polite' })
  const perm = order(seed, question.options.length)
  const buttons = perm.map((orig, pos) => {
    const b = h(
      'button',
      { class: 'opt', type: 'button', 'data-orig': orig },
      h('span', { class: 'opt-key', text: KEYS[pos] }),
      h('span', { html: inline(question.options[orig]) }),
      h('span', { class: 'opt-mark' }),
    )
    b.addEventListener('click', () => choose(orig, true))
    return b
  })
  opts.append(...buttons)

  if (label) box.append(h('div', { class: 'mcq-meta' }, h('span', { class: 'pill', text: label })))
  box.append(h('p', { class: 'mcq-q', html: inline(question.q) }), opts, why)

  function reveal(picked) {
    const correct = picked === question.answer
    for (const b of buttons) {
      const orig = Number(b.dataset.orig)
      b.disabled = true
      const mark = b.querySelector('.opt-mark')
      if (orig === question.answer) {
        b.classList.add('is-correct')
        mark.textContent = orig === picked ? 'Correct' : 'Answer'
      } else if (orig === picked) {
        b.classList.add('is-wrong')
        mark.textContent = 'Your pick'
      } else {
        b.classList.add('is-dim')
      }
    }
    why.hidden = false
    why.innerHTML = `<span class="verdict ${correct ? 'good' : 'bad'}">${correct ? 'Right.' : 'Not quite.'}</span>${inline(question.why)}${
      !correct && reviewHint ? ' <span class="muted small">Added to your review deck.</span>' : ''
    }`
    box.dataset.answered = correct ? 'correct' : 'wrong'
  }

  function choose(orig, fresh) {
    if (box.dataset.answered) return
    reveal(orig)
    if (fresh && onAnswer) onAnswer(orig, orig === question.answer)
  }

  box.addEventListener('keydown', (e) => {
    const k = e.key.toUpperCase()
    const pos = /^[1-6]$/.test(k) ? Number(k) - 1 : KEYS.indexOf(k)
    if (pos >= 0 && pos < buttons.length && !box.dataset.answered) {
      e.preventDefault()
      buttons[pos].click()
    }
  })

  if (prior && Number.isInteger(prior.picked)) choose(prior.picked, false)
  return box
}
