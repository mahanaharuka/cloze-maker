const APP_CACHE_NAME = 'cloze-maker-standalone-v8-pinch-full-pdf-quick-qa-safe'
const RESOURCE_CACHE_NAME = 'cloze-maker-standalone-v1-offline-resources'

const APP_SHELL_PATHS = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
]

const IMMUTABLE_RESOURCE_PATHS = [
  './pdf.worker.min.js',
  './ocr/worker.min.js',
  './ocr/tesseract-core-lstm.wasm.js',
  './tessdata/jpn.traineddata.gz',
  './tessdata/eng.traineddata.gz',
]

function absoluteUrl(path) {
  return new URL(path, self.registration.scope).href
}

async function cacheAppShell() {
  const cache = await caches.open(APP_CACHE_NAME)
  await cache.addAll(APP_SHELL_PATHS.map((path) => new Request(absoluteUrl(path), { cache: 'reload' })))
}

async function cacheOfflineResources() {
  const cache = await caches.open(RESOURCE_CACHE_NAME)
  await Promise.all(IMMUTABLE_RESOURCE_PATHS.map(async (path) => {
    const request = new Request(absoluteUrl(path))
    if (await cache.match(request)) return

    // 旧版キャッシュにある大容量OCR資産は再ダウンロードせず、新しい固定キャッシュへ移す。
    const reusable = await caches.match(request, { ignoreSearch: true })
    if (reusable?.ok) {
      await cache.put(request, reusable.clone())
      return
    }

    const response = await fetch(request)
    if (!response.ok) throw new Error(`オフライン資産を取得できませんでした: ${path}`)
    await cache.put(request, response)
  }))
}

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([cacheAppShell(), cacheOfflineResources()]))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys()
    await Promise.all(names
      .filter((name) => name !== APP_CACHE_NAME && name !== RESOURCE_CACHE_NAME)
      .map((name) => caches.delete(name)))
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const requestUrl = new URL(event.request.url)
  if (requestUrl.origin !== self.location.origin) return

  const immutableUrls = new Set(IMMUTABLE_RESOURCE_PATHS.map(absoluteUrl))
  if (immutableUrls.has(requestUrl.href)) {
    event.respondWith((async () => {
      const cache = await caches.open(RESOURCE_CACHE_NAME)
      const cached = await cache.match(event.request, { ignoreSearch: true })
      if (cached) return cached
      const response = await fetch(event.request)
      if (response.ok) await cache.put(event.request, response.clone())
      return response
    })())
    return
  }

  const cachePromise = caches.open(APP_CACHE_NAME)
  const update = cachePromise.then((cache) => fetch(event.request).then((response) => {
    if (response.ok) void cache.put(event.request, response.clone())
    return response
  }))
  event.waitUntil(update.then(() => undefined).catch(() => undefined))
  event.respondWith((async () => {
    const cache = await cachePromise
    const cached = await cache.match(event.request, { ignoreSearch: true })
    if (cached) return cached
    try {
      return await update
    } catch (error) {
      if (event.request.mode === 'navigate') {
        const fallback = await cache.match(absoluteUrl('./index.html'))
        if (fallback) return fallback
      }
      throw error
    }
  })())
})
