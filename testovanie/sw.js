/* MRAZOSOFT /testovanie — samodeštrukčný service worker.
   Na tejto ceste bol od 7/2026 registrovaný SW `ms-testovanie-89` s cache-first
   stratégiou na assety. Zmazanie starých súborov ho z prehliadačov NEODSTRÁNI —
   ostal by zaregistrovaný a ďalej by servíroval starú verziu náhľadu.
   Prehliadač si `sw.js` pri navigácii sám sťahuje znova, takže táto verzia
   sa nainštaluje namiesto neho, zmaže všetky cache a odregistruje sa. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (k) { return Promise.all(k.map(function (n) { return caches.delete(n); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (cl) { cl.forEach(function (c) { c.navigate(c.url); }); })
  );
});
