// Derived progress: pure functions over day content and stored state.

import { course } from './core.js'
import { get, peekDay } from './store.js'

export function dayProgress(content, n) {
  const ds = peekDay(n)
  if (!content) return { fraction: ds?.completedAt ? 1 : 0, status: ds?.completedAt ? 'done' : 'todo', parts: null }
  const sections = content.sections.map((s) => s.id)
  const quiz = content.quiz.map((q) => q.id)
  const core = content.tasks.filter((t) => t.level !== 'stretch').map((t) => t.id)
  const secDone = sections.filter((id) => ds?.sections?.[id]).length
  const quizDone = quiz.filter((id) => ds?.quiz?.[id]).length
  const quizRight = quiz.filter((id) => ds?.quiz?.[id]?.correct).length
  const taskDone = core.filter((id) => ds?.tasks?.[id]).length
  const noted = ds?.notes?.trim() ? 1 : 0
  const total = sections.length + quiz.length + core.length + 1
  const raw = (secDone + quizDone + taskDone + noted) / total
  const fraction = ds?.completedAt ? 1 : raw
  const status = ds?.completedAt ? 'done' : raw > 0 || ds?.startedAt ? 'progress' : 'todo'
  return {
    fraction,
    status,
    parts: {
      sections: [secDone, sections.length],
      quiz: [quizDone, quiz.length],
      quizRight,
      tasks: [taskDone, core.length],
      notes: noted,
      build: content.tasks.some((t) => t.level === 'build' && ds?.tasks?.[t.id]),
    },
  }
}

export function courseStats(days) {
  let fracSum = 0
  let done = 0
  let answered = 0
  let right = 0
  let builds = 0
  for (const d of course.days) {
    const p = dayProgress(days.get(d.n), d.n)
    fracSum += p.fraction
    if (p.status === 'done') done++
    if (p.parts) {
      answered += p.parts.quiz[0]
      right += p.parts.quizRight
      if (p.parts.build) builds++
    }
  }
  return {
    overall: fracSum / course.days.length,
    daysDone: done,
    accuracy: answered ? right / answered : null,
    answered,
    builds,
  }
}

export function weekProgress(days, weekN) {
  const list = course.days.filter((d) => d.week === weekN)
  const sum = list.reduce((acc, d) => acc + dayProgress(days.get(d.n), d.n).fraction, 0)
  return sum / list.length
}

export function nextDay(days) {
  for (const d of course.days) {
    if (dayProgress(days.get(d.n), d.n).status !== 'done') return d.n
  }
  return course.days.length
}

export function outcomeCoverage(days, outcome) {
  const sum = outcome.days.reduce((acc, n) => acc + dayProgress(days.get(n), n).fraction, 0)
  return sum / outcome.days.length
}

export function settings() {
  return get().settings
}
