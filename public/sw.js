const CACHE_NAME = "goldcalc-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

// Install: cache app shell
self.addEventListener("install", (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch(()=>{ /* ignore missing assets */ });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evt) => {
  evt.waitUntil(self.clients.claim());
});

// Fetch: network-first, fallback to cache
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    fetch(evt.request)
      .then((res) => {
        // Update cache in background
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(evt.request, copy));
        return res;
      })
      .catch(() => caches.match(evt.request).then((r) => r || caches.match("/index.html")))
  );
});