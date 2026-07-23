const CACHE_NAME = 'cloze-maker-standalone-v4-button-fix'
const PRECACHE_PATHS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.webmanifest',
  './pdf.worker.min.js',
  './ocr/worker.min.js',
  './ocr/tesseract-core-lstm.wasm.js',
  './tessdata/jpn.traineddata.gz',
  './tessdata/eng.traineddata.gz',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_PATHS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
    )),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) return

  const cachePromise = caches.open(CACHE_NAME)
  const update = cachePromise.then((cache) => fetch(event.request).then((response) => {
      if (response.ok) void cache.put(event.request, response.clone())
      return response
    }))
  event.waitUntil(update.then(() => undefined).catch(() => undefined))
  event.respondWith((async () => {
    const cache = await cachePromise
    const cached = await cache.match(event.request, { ignoreSearch: true })
    if (cached) {
      return cached
    }
    try {
      return await update
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const fallback = await cache.match(new URL('./index.html', self.registration.scope))
        if (fallback) return fallback
      }
      throw error
    }
  })())
})
