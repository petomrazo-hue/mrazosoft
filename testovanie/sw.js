/* MRAZOSOFT root — service worker
   Stratégia: network-first pre HTML (žiadny zatuchnutý obsah, version guard
   ostáva zdrojom pravdy), cache-first pre statické assety (všetky nesú ?v=
   verzie — nová verzia = nová URL, takže cache nikdy nedrží starý kód),
   offline fallback stránka pre navigácie bez siete. */
var VERSION = 'ms-testovanie-86';
var OFFLINE_URL = 'offline.html';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (c) { return c.addAll([OFFLINE_URL]); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (keys) {
        return Promise.all(keys.filter(function (k) { return k !== VERSION; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;

  /* HTML: network-first, offline → fallback stránka */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(function () {
        return caches.match(OFFLINE_URL, { ignoreSearch: true });
      })
    );
    return;
  }

  /* statické assety: cache-first + doplnenie cache z úspešného fetchu */
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    })
  );
});
