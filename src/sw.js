// This is not the best approach in dev mode
// But in production (since this is a static app)
// we want to change the hash on every new build
// const swFingerPrint = Date.now();
const swFingerPrint = 'v3';
const APP_CACHE_NAME = `currency-converter-cache-${swFingerPrint}`;
const routesToCache = [
    '/',
    '/main.js',
    '/main.css',
];

// Handle the install event
self.addEventListener('install', (event) => {
    // Cache App Assets
    event.waitUntil(
        caches.open(APP_CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(routesToCache);
        })
    );
});

// Handle the activate event
// Delete old caches
self.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                .filter((cacheName) => cacheName !== APP_CACHE_NAME)
                .map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

// Handle Fetch events
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle request made by the app's origin
    // We only want to cache requests for assets from our origin
    if (url.origin === location.origin) {
        event.respondWith(
            caches.match(event.request).then((response) => {
                // If the response is in Cache, return it
                if (response) {
                    return response;
                }

                // Clone the request stream and continue with the request
                const requestClone = event.request.clone();
                return fetch(requestClone).then((response) => {
                    // Check if we received a valid response
                    if (!response || response.status !== 200) {
                        return response;
                    }

                    // Clone the response stream for caching
                    var responseClone = response.clone();

                    // Cache the response
                    caches.open(APP_CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseClone);
                        });

                    return response;
                });
            })
        );
    }
});
