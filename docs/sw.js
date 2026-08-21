const CACHE_NAME = "sec29-tools-v5.1.0";
const APP_SHELL = [
    "./",
    "./index.html",
    "./assets/css/styles.css",
    "./assets/css/styles-v5a.css",
    "./assets/css/styles-v5b.css",
    "./assets/js/processors.js",
    "./assets/js/cargador-eje-part1.js",
    "./assets/js/cargador-eje-part2.js",
    "./assets/js/cargador-eje-part3.js",
    "./assets/js/cargador-eje-source.js",
    "./assets/js/app.js",
    "./assets/js/cargador-eje.js",
    "./assets/js/navigation.js",
    "./favicon.svg",
    "./manifest.webmanifest",
    "./assets/icons/icon-192.png",
    "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    const requestUrl = new URL(event.request.url);
    const isSheetJs =
        requestUrl.hostname === "cdn.sheetjs.com" ||
        requestUrl.hostname === "cdn.jsdelivr.net" ||
        requestUrl.hostname === "cdnjs.cloudflare.com";

    if (isSheetJs) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                if (cached) return cached;

                return fetch(event.request).then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                });
            })
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                if (response.ok && requestUrl.origin === self.location.origin) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
