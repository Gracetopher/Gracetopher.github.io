// Bump this when you deploy a change so old caches get replaced.
const CACHE_NAME = "derby-pack-v3";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// App shell: cache-first, so the app opens instantly and still works offline.
// Anything else (like the Open-Meteo forecast call): network-first, since
// weather data goes stale and shouldn't be served from cache.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
  }
  // Cross-origin (api.open-meteo.com) requests are left alone — just fetched normally.
});
