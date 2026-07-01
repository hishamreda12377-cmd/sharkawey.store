const CACHE_NAME = 'sharkawey-v1';
const STATIC_ASSETS = [
    './',
    './index.html',
    './dark.css',
    './js.js',
    './manifest.json',
    './styles.css'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // CDN + Google Fonts requests → Network First
    if (url.hostname.includes('cdn.jsdelivr.net') || url.hostname.includes('supabase.co') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
        event.respondWith(networkFirst(request));
        return;
    }

    // All images → Cache First (local + external)
    if (url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico)$/i)) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // Local CSS/JS/JSON → Cache First
    if (url.pathname.match(/\.(css|js|json)$/) && url.origin === self.location.origin) {
        event.respondWith(cacheFirst(request));
        return;
    }

    // HTML + everything else → Network First
    event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return cached || new Response('', { status: 408 });
    }
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
            const fallback = await caches.match('./index.html');
            if (fallback) return fallback;
        }
        return new Response('Offline', { status: 503 });
    }
}
