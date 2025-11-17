const CACHE_NAME = "syra-cache-v1";
const ASSETS = [
  "/", 
  "/index.html",
  "/logo1.png",
  "/manifest.webmanifest"
];

// Install SW
self.addEventListener("install", (event) => {
  console.log("SW installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate SW
self.addEventListener("activate", (event) => {
  console.log("SW activated.");
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          event.request.destination === "document"
            ? caches.match("/index.html")
            : undefined
        )
      );
    })
  );
});
