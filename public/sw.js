const CACHE_NAME = 'portal-gbr-v4';
const urlsToCache = [
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('SW: Installing v4...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.log('SW: Cache addAll failed:', error);
          return Promise.resolve();
        });
      })
  );
  self.skipWaiting();
});

// Fetch event - ULTIMATE SAFE VERSION
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // LANGKAH 1: FILTER DI AWAL - HANYA GET REQUESTS
  if (request.method !== 'GET') {
    // Langsung forward semua non-GET tanpa processing apapun
    return; // Biarkan browser handle secara normal
  }
  
  // LANGKAH 2: SKIP DOCUMENT/NAVIGATION REQUESTS
  if (request.destination === 'document' || 
      request.mode === 'navigate' ||
      request.url.endsWith('/') ||
      request.url.includes('index.html')) {
    
    // Bypass cache untuk halaman utama
    event.respondWith(fetch(request));
    return;
  }
  
  // LANGKAH 3: HANYA CACHE STATIC ASSETS YANG AMAN
  const url = new URL(request.url);
  
  // Hanya tangani same-origin requests
  if (url.origin !== self.location.origin) {
    return; // Biarkan browser handle
  }
  
  // Hanya static files yang benar-benar aman
  const safeExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  const isSafeFile = safeExtensions.some(ext => url.pathname.endsWith(ext)) || 
                     url.pathname === '/manifest.json';
  
  if (!isSafeFile) {
    return; // Biarkan browser handle
  }
  
  // LANGKAH 4: CACHE STRATEGY YANG AMAN
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Jika ada di cache, return
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Fetch dari network
        return fetch(request)
          .then((response) => {
            // Hanya cache jika response valid
            if (response && response.status === 200 && response.type === 'basic') {
              // Clone response untuk cache
              const responseToCache = response.clone();
              
              // Cache secara async tanpa blocking
              caches.open(CACHE_NAME)
                .then((cache) => {
                  return cache.put(request, responseToCache);
                })
                .catch((error) => {
                  // Silent fail - jangan throw error
                  console.log('SW: Cache put silent fail:', error);
                });
            }
            
            return response;
          })
          .catch(() => {
            // Network failed, coba cari di cache lagi
            return caches.match(request);
          });
      })
      .catch(() => {
        // Cache match failed, fetch dari network
        return fetch(request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('SW: Activating v4...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// Global error handlers untuk mencegah unhandled errors
self.addEventListener('error', (event) => {
  console.log('SW: Global error caught:', event.error);
  event.preventDefault(); // Prevent error from bubbling
});

self.addEventListener('unhandledrejection', (event) => {
  console.log('SW: Unhandled rejection caught:', event.reason);
  event.preventDefault(); // Prevent error from bubbling
});
