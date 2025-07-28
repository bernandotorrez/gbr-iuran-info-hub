const CACHE_NAME = 'portal-gbr-v2'; // Update version untuk force refresh
const urlsToCache = [
  '/manifest.json',
  // Hapus '/' dari cache - biarkan selalu fetch fresh
];

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Caching resources');
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('SW: Cache addAll failed:', error);
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// Fetch event - Fixed version
self.addEventListener('fetch', (event) => {
  // Skip caching untuk document/navigation requests
  if (event.request.destination === 'document' || 
      event.request.mode === 'navigate' ||
      event.request.url === self.location.origin + '/') {
    
    console.log('SW: Bypassing cache for:', event.request.url);
    // Selalu fetch fresh untuk halaman utama
    event.respondWith(
      fetch(event.request).catch(() => {
        // Hanya jika benar-benar offline, return fallback
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head><title>Offline</title></head>
          <body>
            <h1>Sedang Offline</h1>
            <p>Mohon periksa koneksi internet Anda.</p>
            <button onclick="location.reload()">Coba Lagi</button>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        });
      })
    );
    return;
  }

  // Untuk resource lain (CSS, JS, images, dll)
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            console.log('SW: Serving from cache:', event.request.url);
            return response;
          }
          
          console.log('SW: Fetching:', event.request.url);
          return fetch(event.request).then((response) => {
            // Cache response jika berhasil
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          });
        })
        .catch((error) => {
          console.log('SW: Fetch failed:', error);
          return new Response('Network error occurred', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        })
    );
  }
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Activated');
      return self.clients.claim(); // Take control immediately
    })
  );
});
