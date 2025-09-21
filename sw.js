const CACHE = 'wa-portfolio-v1';
const PRECACHE = [
  './',
  './index.html','./about.html','./experience.html','./skills.html','./achievements.html','./contact.html',
  './assets/css/main.css','./assets/js/app.js','./favicon.svg','./manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const { request } = e;
  // Runtime cache images; otherwise cache-first for precached, then network
  if (request.destination === 'image') {
    e.respondWith(
      caches.match(request).then(res => res || fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(request, copy));
        return r;
      }))
    );
  } else {
    e.respondWith(
      caches.match(request).then(res => res || fetch(request))
    );
  }
});
