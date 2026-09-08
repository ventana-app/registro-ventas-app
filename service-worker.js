const CACHE_NAME = 'registro-ventas-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './terminos.html'
  ];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
    );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
                       )
    );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // La app necesita internet para funcionar (login e inventario vienen de Firebase),
                      // asi que priorizamos siempre la red. El cache solo se usa como respaldo
                      // si en algun momento no hay conexion, para no dejar la pantalla en blanco.
                      if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
                        return;
                      }

                      event.respondWith(
                        fetch(event.request)
                        .then((response) => {
                          if (response.ok) {
                            const clone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                          }
                          return response;
                        })
                        .catch(() => caches.match(event.request))
                        );
});
