// Minimal service worker for SLIET Football Tournament.
//
// The original single-file source only ever contained the registration
// call (`navigator.serviceWorker.register('sw.js')` in js/pwa/install.js)
// — it never included an actual service worker file, and it never
// specified a caching strategy (which URLs to precache, a cache name,
// versioning, an offline fallback page, etc.). None of that exists
// anywhere to recover.
//
// This file exists only to satisfy that registration so it no longer
// 404s, and to meet the baseline "has a service worker with a fetch
// handler" installability criterion some browsers use for the
// beforeinstallprompt/"Add to Home Screen" flow already implemented in
// js/pwa/install.js. It intentionally does no caching and changes no
// network behavior — every request is just passed straight through to
// the network exactly as it would be with no service worker at all.
// If real offline support is wanted later, this is the file to extend.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
