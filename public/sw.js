const CACHE_NAME = 'portal-gbr-v1';

// Only cache essential resources to avoid Safari issues
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event - more Safari-friendly
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('Cache addAll failed:', error);
          // Don't fail completely if some resources can't be cached
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting(); // Activate immediately
});

// Fetch event - Safari-friendly with fallback
self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached version or fetch from network
          return response || fetch(event.request).catch(() => {
            // Fallback for offline scenarios
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
        })
    );
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});