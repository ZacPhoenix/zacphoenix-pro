// Mermaid diagrams, loaded lazily from the vendored bundle and themed from CSS tokens.
// Re-renders when the theme changes so diagrams always match light or dark mode.

import { url } from './core.js'

let loading = null
let counter = 0

function loadMermaid() {
  if (window.mermaid) return Promise.resolve(window.mermaid)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = url('assets/vendor/mermaid.min.js')
      s.onload = () => resolve(window.mermaid)
      s.onerror = () => reject(new Error('Could not load Mermaid'))
      document.head.append(s)
    })
  }
  return loading
}

function themeVariables() {
  const cs = getComputedStyle(document.body)
  const v = (name) => cs.getPropertyValue(name).trim()
  const surface = v('--surface')
  const surface2 = v('--surface-2')
  const surface3 = v('--surface-3')
  const ink = v('--ink')
  const ink2 = v('--ink-2')
  const accent = v('--accent')
  const line = v('--line-2')
  return {
    fontFamily: v('--font-sans'),
    fontSize: '14px',
    background: surface2,
    primaryColor: surface,
    primaryTextColor: ink,
    primaryBorderColor: accent,
    secondaryColor: surface3,
    secondaryTextColor: ink,
    secondaryBorderColor: line,
    tertiaryColor: surface2,
    tertiaryTextColor: ink,
    tertiaryBorderColor: line,
    lineColor: ink2,
    textColor: ink,
    mainBkg: surface,
    nodeBorder: accent,
    nodeTextColor: ink,
    clusterBkg: surface3,
    clusterBorder: line,
    titleColor: ink,
    edgeLabelBackground: surface2,
    actorBkg: surface,
    actorBorder: accent,
    actorTextColor: ink,
    actorLineColor: line,
    signalColor: ink2,
    signalTextColor: ink,
    labelBoxBkgColor: surface,
    labelBoxBorderColor: line,
    labelTextColor: ink,
    loopTextColor: ink,
    noteBkgColor: surface3,
    noteTextColor: ink,
    noteBorderColor: line,
    activationBkgColor: surface3,
    activationBorderColor: accent,
    stateBkg: surface,
    stateLabelColor: ink,
    compositeBackground: surface2,
    transitionColor: ink2,
    transitionLabelColor: ink,
  }
}

export async function renderDiagrams(root = document) {
  const nodes = Array.from(root.querySelectorAll('[data-mermaid]'))
  if (!nodes.length) return
  let mermaid
  try {
    mermaid = await loadMermaid()
  } catch {
    return // fallback text stays visible
  }
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    securityLevel: 'strict',
    themeVariables: themeVariables(),
    flowchart: { curve: 'basis', padding: 12, htmlLabels: true, useMaxWidth: true },
    sequence: { mirrorActors: false, useMaxWidth: true },
    state: { useMaxWidth: true },
  })
  for (const node of nodes) {
    const id = `mmd-${++counter}`
    try {
      const { svg } = await mermaid.render(id, node.dataset.mermaid)
      node.innerHTML = svg
      node.dataset.rendered = 'true'
      keepLegible(node)
    } catch (err) {
      document.getElementById(`d${id}`)?.remove()
      document.getElementById(id)?.remove()
      node.dataset.rendered = 'error'
      node.innerHTML = ''
      const pre = document.createElement('div')
      pre.className = 'diagram-fallback'
      pre.textContent = node.dataset.mermaid
      node.append(pre)
      console.warn('Diagram failed to render', err?.message || err)
    }
  }
}

// Wide diagrams keep a readable scale and scroll inside their card instead of shrinking the text.
function keepLegible(node) {
  const svg = node.querySelector('svg')
  const vb = svg?.viewBox?.baseVal
  if (!svg || !vb || !vb.width) return
  const room = node.clientWidth - 32
  if (vb.width * 0.8 > room) {
    svg.style.maxWidth = 'none'
    svg.setAttribute('width', String(Math.round(vb.width * 0.8)))
    svg.removeAttribute('height')
    node.classList.add('is-wide')
  }
}

// Re-theme diagrams when the theme attribute or the OS preference changes.
let pending = null
const rerender = () => {
  clearTimeout(pending)
  pending = setTimeout(() => renderDiagrams(document), 60)
}
new MutationObserver(rerender).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rerender)
