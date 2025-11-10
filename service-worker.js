const CACHE_NAME = "wec-cgpa-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/script.js",
  "/manifest.json",
  "/images/icon-192.png",
  "/images/icon-512.png"
];


// Install
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
