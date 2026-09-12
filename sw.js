// Use code with caution.
const CACHE_NAME = 'fleet-check-pro-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json'
];

// 1. Install Event: Cache the application shell immediately for offline access
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Fleet-Check Pro SW] Caching core app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event: Clean up legacy caches to prevent data corruption
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Fleet-Check Pro SW] Purging old cache storage:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event: Intercept network traffic to serve cached assets instantly when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached asset if found, otherwise perform a live network fallback
      return cachedResponse || fetch(event.request).catch(() => {
        // Optional: Custom offline page or error handling can go here
        console.log('[Fleet-Check Pro SW] Fetch failed; user is fully offline.');
      });
    })
  );
});

// 4. Background Sync Event: Fires instantly when the device reconnects to a network signal
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-fleet-data') {
    console.log('[Fleet-Check Pro SW] Network signal restored! Triggering operational background sync pipeline...');
    event.waitUntil(
      // This routes the action back to our main IndexedDB processing loop inside app.js
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ action: 'processOfflineQueue' });
        });
      })
    );
  }
});
