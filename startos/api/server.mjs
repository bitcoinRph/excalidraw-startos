// Excalidraw scenes API — a dependency-free Node HTTP server that stores
// .excalidraw scene files on the service's data volume. StartOS exposes it as
// a dedicated API interface; nginx also proxies it at /api on the web port.
//
// Environment:
//   EXCALIDRAW_API_TOKEN  bearer token required on every request except
//                         /api/health. Empty/unset fails closed (503).
//   EXCALIDRAW_API_DATA   scene storage directory (default /data/scenes)
//   EXCALIDRAW_API_PORT   listen port (default 3040)
//
// Routes (all JSON):
//   GET    /api/health          -> { status, authConfigured }   (no auth)
//   GET    /api/scenes          -> [{ name, size, modified }]
//   GET    /api/scenes/<name>   -> the stored .excalidraw document
//   PUT    /api/scenes/<name>   -> save/overwrite; body must be a JSON object
//   DELETE /api/scenes/<name>   -> remove the scene

import { createServer } from 'node:http'
import { createHash, timingSafeEqual } from 'node:crypto'
import {
  mkdir,
  readdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises'
import { join } from 'node:path'

const PORT = Number(process.env.EXCALIDRAW_API_PORT || 3040)
const DATA_DIR = process.env.EXCALIDRAW_API_DATA || '/data/scenes'
const TOKEN = process.env.EXCALIDRAW_API_TOKEN || ''
const MAX_BODY = 64 * 1024 * 1024
const EXT = '.excalidraw'
// no path separators, no leading dot — a scene name is a plain filename stem
const NAME_RE = /^[A-Za-z0-9][A-Za-z0-9 ._()-]{0,127}$/

const send = (res, status, body, headers = {}) => {
  const data = typeof body === 'string' ? body : JSON.stringify(body)
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    ...headers,
  })
  res.end(data)
}
const fail = (res, status, error) => send(res, status, { error })

const authorized = (req) => {
  if (!TOKEN) return false
  const header = req.headers.authorization || ''
  const provided = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!provided) return false
  // hash both sides so timingSafeEqual gets equal-length buffers
  const a = createHash('sha256').update(provided).digest()
  const b = createHash('sha256').update(TOKEN).digest()
  return timingSafeEqual(a, b)
}

const sceneName = (rawSegment) => {
  let name
  try {
    name = decodeURIComponent(rawSegment)
  } catch {
    return null
  }
  if (name.toLowerCase().endsWith(EXT)) name = name.slice(0, -EXT.length)
  if (!NAME_RE.test(name) || name.includes('..')) return null
  return name
}

const readBody = (req) =>
  new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('body too large'), { status: 413 }))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })

const handlers = {
  async health(req, res) {
    send(res, 200, { status: 'ok', authConfigured: TOKEN.length > 0 })
  },

  async list(req, res) {
    const entries = await readdir(DATA_DIR).catch(() => [])
    const scenes = []
    for (const entry of entries) {
      if (!entry.endsWith(EXT)) continue
      const info = await stat(join(DATA_DIR, entry)).catch(() => null)
      if (!info?.isFile()) continue
      scenes.push({
        name: entry.slice(0, -EXT.length),
        size: info.size,
        modified: info.mtime.toISOString(),
      })
    }
    scenes.sort((a, b) => a.name.localeCompare(b.name))
    send(res, 200, scenes)
  },

  async get(req, res, name) {
    const data = await readFile(join(DATA_DIR, name + EXT)).catch(() => null)
    if (data === null) return fail(res, 404, `no scene named "${name}"`)
    send(res, 200, data.toString('utf8'), {
      'content-disposition': `attachment; filename="${name}${EXT}"`,
    })
  },

  async put(req, res, name) {
    let body
    try {
      body = await readBody(req)
    } catch (err) {
      return fail(res, err.status || 500, err.message)
    }
    let parsed
    try {
      parsed = JSON.parse(body.toString('utf8'))
    } catch {
      return fail(res, 400, 'body is not valid JSON')
    }
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed))
      return fail(res, 400, 'body must be a JSON object')
    if ('type' in parsed && parsed.type !== 'excalidraw')
      return fail(res, 400, `"type" must be "excalidraw", got "${parsed.type}"`)

    const path = join(DATA_DIR, name + EXT)
    const existed = await stat(path)
      .then((s) => s.isFile())
      .catch(() => false)
    const tmp = join(DATA_DIR, `.${name}${EXT}.tmp-${process.pid}`)
    await writeFile(tmp, body)
    await rename(tmp, path)
    send(res, existed ? 200 : 201, { name, size: body.length, created: !existed })
  },

  async remove(req, res, name) {
    try {
      await unlink(join(DATA_DIR, name + EXT))
    } catch (err) {
      if (err.code === 'ENOENT') return fail(res, 404, `no scene named "${name}"`)
      throw err
    }
    send(res, 204, '')
  },
}

const route = async (req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const parts = url.pathname.split('/').filter(Boolean) // ['api', 'scenes', <name>?]

  if (parts[0] !== 'api') return fail(res, 404, 'not found')

  if (parts[1] === 'health' && parts.length === 2 && req.method === 'GET')
    return handlers.health(req, res)

  if (!TOKEN) return fail(res, 503, 'API token not configured')
  if (!authorized(req)) return fail(res, 401, 'missing or invalid bearer token')

  if (parts[1] === 'scenes' && parts.length === 2) {
    if (req.method === 'GET') return handlers.list(req, res)
    return fail(res, 405, 'method not allowed')
  }

  if (parts[1] === 'scenes' && parts.length === 3) {
    const name = sceneName(parts[2])
    if (name === null) return fail(res, 400, 'invalid scene name')
    if (req.method === 'GET') return handlers.get(req, res, name)
    if (req.method === 'PUT') return handlers.put(req, res, name)
    if (req.method === 'DELETE') return handlers.remove(req, res, name)
    return fail(res, 405, 'method not allowed')
  }

  return fail(res, 404, 'not found')
}

await mkdir(DATA_DIR, { recursive: true })

const server = createServer((req, res) => {
  route(req, res)
    .catch((err) => {
      console.error(`${req.method} ${req.url} failed:`, err)
      if (!res.headersSent) fail(res, 500, 'internal error')
    })
    .finally(() => {
      console.info(`${req.method} ${req.url} -> ${res.statusCode}`)
    })
})

server.listen(PORT, '0.0.0.0', () => {
  console.info(
    `excalidraw scenes API listening on 0.0.0.0:${PORT}, data in ${DATA_DIR}, auth ${TOKEN ? 'configured' : 'NOT CONFIGURED (all requests will 503)'}`,
  )
})

for (const signal of ['SIGTERM', 'SIGINT']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(0), 3000).unref()
  })
}
