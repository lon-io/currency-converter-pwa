// This is not the best approach in dev mode
// But in production (since this is a static app)
// we want to change the hash on every new build
const swFingerPrint = Date.now();
const APP_CACHE_NAME = `currency-converter-cache-${swFingerPrint}`;

// Gh-Pages parameters
const ghPagesPagesHostname = 'lon-io.github.io';
const ghPagesPagesBasePathname = '/currency-converter-pwa';

// Base Assets and Homepage Routes
const routesToCache = [
    '/',
    '/js/main.js',
    '/css/main.css',
];

// Handle the install event
self.addEventListener('install', (event) => {
    // Cache App Assets
    event.waitUntil(
        caches.open(APP_CACHE_NAME)
        .then((cache) => {
            console.log(`{{sw.js}}: Cache ${APP_CACHE_NAME} Opened`);

            return cache.addAll(
                // Todo: Find a better implementation than tight-coupling to GH-Pages
                location.hostname === ghPagesPagesHostname
                    ? routesToCache.map(route => `${ghPagesPagesBasePathname}${route}`)
                    : routesToCache
            );
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
