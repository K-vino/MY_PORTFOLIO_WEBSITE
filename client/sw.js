// ===== SERVICE WORKER =====

const CACHE_NAME = 'vino-k-portfolio-v1.0.0';
const STATIC_CACHE = 'static-v1.0.0';
const DYNAMIC_CACHE = 'dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/responsive.css',
  '/js/main.js',
  '/js/theme.js',
  '/js/animations.js',
  '/js/performance.js',
  '/assets/images/vino.png',
  '/assets/resume/VINO_k.pdf',
  '/manifest.json',
  '/offline.html'
];

// External resources to cache
const EXTERNAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.css',
  'https://unpkg.com/aos@2.3.1/dist/aos.js'
];

// ===== INSTALL EVENT =====
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      
      // Cache external assets
      caches.open(DYNAMIC_CACHE).then(cache => {
        console.log('Service Worker: Caching external assets');
        return cache.addAll(EXTERNAL_ASSETS);
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    }).catch(error => {
      console.error('Service Worker: Installation failed', error);
    })
  );
});

// ===== ACTIVATE EVENT =====
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// ===== FETCH EVENT =====
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http requests
  if (!request.url.startsWith('http')) {
    return;
  }
  
  // Handle different types of requests
  if (url.origin === location.origin) {
    // Same origin requests
    event.respondWith(handleSameOriginRequest(request));
  } else {
    // Cross-origin requests (fonts, CDN, etc.)
    event.respondWith(handleCrossOriginRequest(request));
  }
});

// ===== REQUEST HANDLERS =====

async function handleSameOriginRequest(request) {
  const url = new URL(request.url);
  
  // API requests - network first, then cache
  if (url.pathname.startsWith('/api/')) {
    return networkFirst(request);
  }
  
  // HTML pages - cache first, then network
  if (request.headers.get('accept').includes('text/html')) {
    return cacheFirst(request);
  }
  
  // Static assets - cache first
  if (isStaticAsset(url.pathname)) {
    return cacheFirst(request);
  }
  
  // Default to network first
  return networkFirst(request);
}

async function handleCrossOriginRequest(request) {
  // External resources - cache first, then network
  return cacheFirst(request);
}

// ===== CACHING STRATEGIES =====

async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Network first strategy failed:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for HTML requests
    if (request.headers.get('accept').includes('text/html')) {
      return caches.match('/offline.html');
    }
    
    throw error;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// ===== UTILITY FUNCTIONS =====

function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.pdf'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

function shouldCache(request) {
  const url = new URL(request.url);
  
  // Don't cache API requests with query parameters
  if (url.pathname.startsWith('/api/') && url.search) {
    return false;
  }
  
  // Don't cache analytics or tracking requests
  const trackingDomains = ['google-analytics.com', 'googletagmanager.com', 'facebook.com'];
  if (trackingDomains.some(domain => url.hostname.includes(domain))) {
    return false;
  }
  
  return true;
}

// ===== BACKGROUND SYNC =====
self.addEventListener('sync', event => {
  if (event.tag === 'contact-form') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  try {
    // Get pending contact form submissions from IndexedDB
    const pendingSubmissions = await getPendingSubmissions();
    
    for (const submission of pendingSubmissions) {
      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submission.data)
        });
        
        if (response.ok) {
          // Remove from pending submissions
          await removePendingSubmission(submission.id);
        }
      } catch (error) {
        console.error('Failed to sync contact form submission:', error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// ===== PUSH NOTIFICATIONS =====
self.addEventListener('push', event => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/assets/images/vino.png',
    badge: '/assets/images/vino.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/assets/icons/view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/assets/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ===== NOTIFICATION CLICK =====
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});

// ===== MESSAGE HANDLING =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// ===== INDEXEDDB HELPERS =====
async function getPendingSubmissions() {
  // Implementation would depend on IndexedDB setup
  return [];
}

async function removePendingSubmission(id) {
  // Implementation would depend on IndexedDB setup
  return true;
}

// ===== ERROR HANDLING =====
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

console.log('Service Worker: Script loaded');
