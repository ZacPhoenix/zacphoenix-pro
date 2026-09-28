#!/usr/bin/env node
// AI Engineer Pro: zero-dependency local server.
// Serves the course as static files and persists progress to data/progress.json.
// Usage: node server.mjs [--port 4747] [--no-open]

import { createServer } from 'node:http'
import { readFile, writeFile, rename, mkdir, readdir, stat, unlink, copyFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join, normalize, extname, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn } from 'node:child_process'

const ROOT = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(ROOT, 'data')
const PROGRESS = join(DATA_DIR, 'progress.json')
const BACKUPS = join(DATA_DIR, 'backups')
const KEEP_BACKUPS = 21
const HOST = '127.0.0.1'
const MAX_BODY = 5 * 1024 * 1024

const args = process.argv.slice(2)
const argPort = args.includes('--port') ? Number(args[args.indexOf('--port') + 1]) : NaN
const startPort = Number.isFinite(argPort) ? argPort : Number(process.env.PORT || 4747)
const shouldOpen = !args.includes('--no-open') && !process.env.NO_OPEN && !process.env.CI

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.md': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.ts': 'text/plain; charset=utf-8',
  '.tsx': 'text/plain; charset=utf-8',
  '.toml': 'text/plain; charset=utf-8',
  '.yaml': 'text/plain; charset=utf-8',
  '.yml': 'text/plain; charset=utf-8',
  '.sh': 'text/plain; charset=utf-8',
  '.feature': 'text/plain; charset=utf-8',
}

function send(res, status, body, type = 'text/plain; charset=utf-8') {
  res.writeHead(status, {
    'Content-Type': type,
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  })
  res.end(body)
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_BODY) throw Object.assign(new Error('Body too large'), { status: 413 })
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function backupOncePerDay() {
  if (!existsSync(PROGRESS)) return
  await mkdir(BACKUPS, { recursive: true })
  const target = join(BACKUPS, `progress-${today()}.json`)
  if (existsSync(target)) return
  await copyFile(PROGRESS, target)
  const files = (await readdir(BACKUPS)).filter((f) => f.startsWith('progress-')).sort()
  for (const old of files.slice(0, Math.max(0, files.length - KEEP_BACKUPS))) {
    await unlink(join(BACKUPS, old)).catch(() => {})
  }
}

async function handleProgress(req, res) {
  if (req.method === 'GET') {
    if (!existsSync(PROGRESS)) return send(res, 200, '{}', MIME['.json'])
    return send(res, 200, await readFile(PROGRESS, 'utf8'), MIME['.json'])
  }
  if (req.method === 'PUT' || req.method === 'POST') {
    const raw = await readBody(req)
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch {
      return send(res, 400, 'Invalid JSON')
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || typeof parsed.days !== 'object') {
      return send(res, 422, 'Progress must be an object with a "days" map')
    }
    await mkdir(DATA_DIR, { recursive: true })
    await backupOncePerDay()
    const tmp = `${PROGRESS}.${process.pid}.tmp`
    await writeFile(tmp, JSON.stringify(parsed, null, 2))
    await rename(tmp, PROGRESS)
    return send(res, 200, JSON.stringify({ ok: true, savedAt: new Date().toISOString() }), MIME['.json'])
  }
  return send(res, 405, 'Method not allowed')
}

async function handleStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname)
  if (rel.endsWith('/')) rel += 'index.html'
  const abs = normalize(join(ROOT, rel))
  const inside = abs === ROOT || abs.startsWith(ROOT + sep)
  const segments = rel.split('/').filter(Boolean)
  const hidden = segments.some((s) => s.startsWith('.'))
  const blocked = segments[0] === 'data' || segments[0] === 'node_modules'
  if (!inside || hidden || blocked) return send(res, 404, 'Not found')
  try {
    const info = await stat(abs)
    if (info.isDirectory()) {
      res.writeHead(302, { Location: pathname.replace(/\/?$/, '/') + 'index.html' })
      return res.end()
    }
    const type = MIME[extname(abs).toLowerCase()] || 'application/octet-stream'
    return send(res, 200, await readFile(abs), type)
  } catch {
    return send(res, 404, 'Not found')
  }
}

const server = createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, `http://${req.headers.host || HOST}`)
    if (pathname === '/api/progress') return await handleProgress(req, res)
    if (pathname === '/api/health') {
      return send(res, 200, JSON.stringify({ ok: true, storage: 'file', path: 'data/progress.json' }), MIME['.json'])
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed')
    return await handleStatic(req, res, pathname)
  } catch (err) {
    send(res, err.status || 500, err.message || 'Server error')
  }
})

function openBrowser(url) {
  const cmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open'
  const cmdArgs = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
  try {
    spawn(cmd, cmdArgs, { stdio: 'ignore', detached: true }).on('error', () => {}).unref()
  } catch {
    // Opening a browser is a convenience. The URL is printed either way.
  }
}

function listen(port, attemptsLeft = 10) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE' && attemptsLeft > 0) return listen(port + 1, attemptsLeft - 1)
    console.error(err.message)
    process.exit(1)
  })
  server.listen(port, HOST, () => {
    const url = `http://localhost:${port}/`
    console.log('\n  AI Engineer Pro is running')
    console.log(`  ${url}`)
    console.log('  Progress file: data/progress.json (daily backups in data/backups/)')
    console.log('  Stop with Ctrl+C\n')
    if (port !== startPort) {
      console.log(`  Note: port ${startPort} was busy. Progress lives on disk, so nothing is lost.\n`)
    }
    if (shouldOpen) openBrowser(url)
  })
}

listen(startPort)
