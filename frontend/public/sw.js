// Mzaya service worker.
//
// Zimbabwe has patchy mobile coverage — a rider routinely loses signal mid-
// delivery, and a customer's connection drops between suburbs. The previous
// worker cached only '/' and '/index.html', which meant a dropped signal gave
// you a blank screen. That's not acceptable for a delivery app here.
//
// Three strategies:
//   1. App shell + static assets  → cache-first (instant load, works offline)
//   2. GET API responses          → stale-while-revalidate (show last known data
//                                    immediately, refresh in the background)
//   3. Mutating requests offline  → queued and replayed when signal returns
//                                    (so "Mark as delivered" isn't lost)

const VERSION       = 'v2'
const SHELL_CACHE   = `mzaya-shell-${VERSION}`
const API_CACHE     = `mzaya-api-${VERSION}`
const IMAGE_CACHE   = `mzaya-img-${VERSION}`

const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

// ─── Install: pre-cache the shell ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .catch(() => {/* a missing asset shouldn't block install */})
  )
  self.skipWaiting()
})

// ─── Activate: drop caches from older versions ────────────────────────────────
self.addEventListener('activate', (event) => {
  const keep = [SHELL_CACHE, API_CACHE, IMAGE_CACHE]
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => !keep.includes(n)).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  )
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Never touch cross-origin requests we don't own, Vite's dev/HMR endpoints, or
  // websockets. A cache-first worker in front of a dev server serves stale
  // modules and makes you debug code that isn't on disk.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/@vite') ||
    url.pathname.startsWith('/@react-refresh') ||
    url.pathname.startsWith('/node_modules') ||
    url.pathname.startsWith('/src/') ||
    url.searchParams.has('v') ||           // Vite's pre-bundle cache-buster
    request.headers.get('upgrade') === 'websocket'
  ) {
    return
  }

  // Never cache non-GET — but if we're offline, queue it so it isn't lost.
  if (request.method !== 'GET') {
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

  // Images (incl. Cloudinary) → cache-first. They're immutable and expensive.
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // API GETs → stale-while-revalidate: instant last-known data, silent refresh.
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE))
    return
  }

  // Navigation → try network, fall back to the cached shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    )
    return
  }

  // Everything else (JS/CSS bundles) → cache-first.
  event.respondWith(cacheFirst(request, SHELL_CACHE))
})

// ─── Strategies ───────────────────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const res = await fetch(request)
    if (res.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, res.clone())
    }
    return res
  } catch {
    return cached || Response.error()
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(request)

  const network = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone())
      return res
    })
    .catch(() => null)

  // Serve cached immediately if we have it; otherwise wait for the network.
  return cached || (await network) || new Response(
    JSON.stringify({ error: 'offline' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } },
  )
}

// ─── Offline write queue ──────────────────────────────────────────────────────
// A rider marking an order delivered with no signal must not lose that action.
// We stash the request and replay it when connectivity returns.
const QUEUE_CACHE = 'mzaya-queue'

async function queueRequest(request) {
  try {
    const body = await request.text()
    const entry = {
      url:     request.url,
      method:  request.method,
      headers: [...request.headers.entries()],
      body,
      at:      Date.now(),
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
  const keys  = await cache.keys()
  for (const key of keys) {
    try {
      const res   = await cache.match(key)
      const entry = await res.json()
      const ok = await fetch(entry.url, {
        method:  entry.method,
        headers: new Headers(entry.headers),
        body:    entry.body || undefined,
      }).then((r) => r.ok).catch(() => false)
      if (ok) await cache.delete(key)
    } catch {
      // leave it queued for the next attempt
    }
  }
}

// Replay when the browser tells us we're back, and on demand from the app.
self.addEventListener('sync', (event) => {
  if (event.tag === 'mzaya-replay') event.waitUntil(replayQueue())
})

self.addEventListener('message', (event) => {
  if (event.data === 'replay-queue') event.waitUntil(replayQueue())
  if (event.data === 'skip-waiting') self.skipWaiting()
})
