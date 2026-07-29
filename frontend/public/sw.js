// Mzaya service worker.
//
// ─────────────────────────────────────────────────────────────────────────────
// WHAT THIS DELIBERATELY DOES NOT DO — and why
//
// The previous version of this file did two dangerous things:
//
//   1. It queued EVERY offline non-GET request — including payment initiation,
//      login, and admin mutations — into Cache Storage, WITH the Authorization
//      header. That put bearer tokens in a store any origin script can read, and
//      a replayed payment could charge a customer twice. It also returned 202, so
//      the UI believed a payment had succeeded when nothing had happened.
//
//   2. It cached authenticated /api GET responses keyed by URL only. On a shared
//      phone — completely normal in Zimbabwe — the next person to sign in could
//      be served the previous user's orders, addresses and profile.
//
// Both are gone. The rules now:
//
//   • NEVER cache an authenticated API response. Private data lives in memory
//     (React Query), never on disk.
//   • ONLY cache a small allowlist of genuinely public, impersonal data.
//   • NEVER queue writes generically. Only explicitly allowlisted idempotent
//     commands, and NEVER with the Authorization header. Payments, auth and
//     uploads can never queue — they must fail visibly.
//   • Purge every cache on logout.
//
// The offline goal is still real (patchy Zimbabwean coverage), but resilience
// must not be bought with someone's token or someone else's order history.
// ─────────────────────────────────────────────────────────────────────────────

const VERSION      = 'v4'
const SHELL_CACHE  = `mzaya-shell-${VERSION}`
const IMAGE_CACHE  = `mzaya-img-${VERSION}`
const PUBLIC_CACHE = `mzaya-public-${VERSION}`
const QUEUE_CACHE  = `mzaya-queue-${VERSION}`

const SHELL_ASSETS = ['/', '/index.html', '/manifest.json']

// The ONLY API paths that may be written to disk. Public, impersonal, identical
// for everyone. Adding to this list is a security decision: a path qualifies only
// if a stranger seeing the response would be harmless.
const PUBLIC_API_ALLOWLIST = [
  '/api/cities',
]

// The ONLY commands that may be queued offline. Each must be idempotent on the
// server (safe to apply twice).
//
// Deliberately EMPTY until the backend enforces idempotency keys. An empty
// allowlist means nothing queues — offline writes simply fail, which is safe and
// honest. Populate it only once the server can guarantee "same key ⇒ one
// mutation". Payments, auth, uploads and admin actions must NEVER be added.
const QUEUEABLE = [
  // e.g. { method: 'PATCH', pattern: /^\/api\/riders\/location$/ },
]

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL_ASSETS)).catch(() => {})
  )
  self.skipWaiting()
})

// ─── Activate: drop every cache from an older version ─────────────────────────
self.addEventListener('activate', (event) => {
  const keep = [SHELL_CACHE, IMAGE_CACHE, PUBLIC_CACHE, QUEUE_CACHE]
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.filter((n) => !keep.includes(n)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

// ─── Helpers ──────────────────────────────────────────────────────────────────
const isPublicApi = (url) =>
  PUBLIC_API_ALLOWLIST.some((p) => url.pathname === p || url.pathname.startsWith(p + '/'))

const isQueueable = (request, url) =>
  QUEUEABLE.some((q) => q.method === request.method && q.pattern.test(url.pathname))

// A credentialed request must never be persisted.
const isAuthenticated = (request) =>
  request.headers.has('Authorization') || request.credentials === 'include'

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Leave Vite's dev server alone — a cache-first worker in front of it serves
  // stale modules and makes you debug code that isn't on disk.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/node_modules') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v') ||
    request.headers.get('upgrade') === 'websocket'
  ) return

  // ── Writes ────────────────────────────────────────────────────────────────
  if (request.method !== 'GET') {
    // Only an allowlisted idempotent command may be deferred. Everything else —
    // payments, auth, uploads, admin — hits the network and fails honestly.
    if (!isQueueable(request, url)) return

    event.respondWith(
      fetch(request.clone()).catch(async () => {
        await queueRequest(request.clone())
        return new Response(
          JSON.stringify({ queued: true, offline: true }),
          { status: 202, headers: { 'Content-Type': 'application/json' } },
        )
      })
    )
    return
  }

  // ── API GETs ──────────────────────────────────────────────────────────────
  if (url.pathname.startsWith('/api/')) {
    // Authenticated or not allowlisted → never cached. Straight to the network.
    // If it's down, the request fails and React Query shows its error state —
    // which is correct. Far better a visible "you're offline" than silently
    // handing someone another user's orders.
    if (isAuthenticated(request) || !isPublicApi(url)) return

    event.respondWith(staleWhileRevalidate(request, PUBLIC_CACHE))
    return
  }

  // ── Images ────────────────────────────────────────────────────────────────
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  // SPA routes (/home, /orders, …) aren't real files — the server rewrites them
  // to index.html. This handler must ALWAYS resolve to a real Response; returning
  // undefined from respondWith surfaces as "network error response" and breaks
  // every navigation. The previous version did exactly that when the shell cache
  // was empty (precache can fail silently) — so we guard every branch.
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      // 1. Network first — the fresh app shell.
      try {
        const net = await fetch(request)
        if (net && net.ok) return net
      } catch { /* offline — fall through to cache */ }

      // 2. Cached shell, tried under both keys we precache.
      const cachedIndex = await caches.match('/index.html')
      if (cachedIndex) return cachedIndex
      const cachedRoot = await caches.match('/')
      if (cachedRoot) return cachedRoot

      // 3. Last resort: fetch index.html directly. Only if THAT fails do we hand
      //    back a real error Response — still a valid Response, never undefined.
      try {
        return await fetch('/index.html')
      } catch {
        return new Response(
          '<!doctype html><meta charset=utf-8><title>Offline</title>' +
          '<p style="font-family:sans-serif;padding:2rem">You appear to be offline. ' +
          'Reconnect and reload.</p>',
          { status: 503, headers: { 'Content-Type': 'text/html' } },
        )
      }
    })())
    return
  }

  // ── App shell (JS/CSS) ────────────────────────────────────────────────────
  event.respondWith(cacheFirst(request, SHELL_CACHE))
})

// ─── Strategies ───────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) (await caches.open(cacheName)).put(request, res.clone())
    return res
  } catch {
    return cached || Response.error()
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(request)
  const network = fetch(request)
    .then((res) => { if (res.ok) cache.put(request, res.clone()); return res })
    .catch(() => null)
  return cached || (await network) || new Response(
    JSON.stringify({ error: 'offline' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  )
}

// ─── Offline queue (allowlisted commands only) ────────────────────────────────
async function queueRequest(request) {
  try {
    const body = await request.text()

    // Strip credentials. A bearer token must never be written to disk — the
    // replay asks the live app for a fresh one instead.
    const headers = [...request.headers.entries()]
      .filter(([k]) => !['authorization', 'cookie'].includes(k.toLowerCase()))

    const entry = {
      url: request.url,
      method: request.method,
      headers,
      body,
      at: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000, // expire rather than replay stale
    }
    const cache = await caches.open(QUEUE_CACHE)
    await cache.put(
      new Request(`/__queued__/${entry.at}-${Math.random()}`),
      new Response(JSON.stringify(entry)),
    )
  } catch {/* best effort */}
}

async function replayQueue() {
  const cache = await caches.open(QUEUE_CACHE)
  for (const key of await cache.keys()) {
    try {
      const entry = await (await cache.match(key)).json()
      if (Date.now() > entry.expiresAt) { await cache.delete(key); continue }

      // Ask an open page for a fresh token — we never stored one.
      const token = await currentToken()
      if (!token) continue

      const headers = new Headers(entry.headers)
      headers.set('Authorization', `Bearer ${token}`)

      const ok = await fetch(entry.url, {
        method: entry.method, headers, body: entry.body || undefined,
      }).then((r) => r.ok).catch(() => false)

      if (ok) await cache.delete(key)
    } catch {/* leave queued for the next attempt */}
  }
}

// Ask the app for the current token rather than persisting one.
async function currentToken() {
  const clients = await self.clients.matchAll()
  if (!clients.length) return null
  return new Promise((resolve) => {
    const chan = new MessageChannel()
    chan.port1.onmessage = (e) => resolve(e.data?.token || null)
    clients[0].postMessage({ type: 'get-token' }, [chan.port2])
    setTimeout(() => resolve(null), 1000)
  })
}

// ─── Messages ─────────────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'mzaya-replay') event.waitUntil(replayQueue())
})

self.addEventListener('message', (event) => {
  const data = event.data
  if (data === 'replay-queue') event.waitUntil(replayQueue())
  if (data === 'skip-waiting')  self.skipWaiting()

  // On logout, destroy everything. Cache Storage outlives a session otherwise,
  // and the next person to use this phone must inherit nothing.
  if (data === 'purge-caches') {
    event.waitUntil(
      caches.keys().then((names) => Promise.all(names.map((n) => caches.delete(n))))
    )
  }
})
