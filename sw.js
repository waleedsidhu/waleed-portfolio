// Portfolio Service Worker
const CACHE_NAME = "portfolio-cache-v3";

const ASSETS = [
  "/", "/index.html", "/about.html", "/experience.html", "/skills.html",
  "/achievements.html", "/contact.html", "/404.html",

  // CSS & JS
  "/assets/css/main.css",
  "/assets/js/app.js",

  // Favicons & App Icons
  "/favicon.svg",
  "/favicon-16.png",
  "/favicon-32.png",
  "/apple-touch-icon.png",
  "/waleed-192.png",
  "/waleed-512.png",

  // Manifest
  "/manifest.webmanifest"
];

// Install
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null))
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const isHTML =
    req.mode === "navigate" ||
    (req.method === "GET" && req.headers.get("accept")?.includes("text/html"));

  if (isHTML) {
    // Network-first for HTML
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(req).then(
        (res) =>
          res ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            return res;
          })
      )
    );
  }
});
