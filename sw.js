/* Tournée : service worker. Tout est mis en mémoire à la première ouverture, l'appli démarre ensuite sans réseau.
   Une nouvelle version est reprise à l'ouverture suivante. Version : f4eae0e10e */
const CACHE = 'tournee-f4eae0e10e';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES.map((f) => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith('tournee-') && k !== CACHE).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith(caches.match(r, { ignoreSearch: true }).then((hit) => {
    if (hit) return hit;
    return fetch(r).catch(() => (r.mode === 'navigate' ? caches.match('./index.html') : Response.error()));
  }));
});
