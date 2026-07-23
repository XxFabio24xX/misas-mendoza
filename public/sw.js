// Service worker manual — sin Workbox/next-pwa (incompatibles con Turbopack,
// que Next.js 16 usa por defecto en `next build`; ver AGENTS.md).
// Cobertura deliberadamente básica: cachea assets estáticos propios y sirve
// páginas ya visitadas cuando no hay conexión. Nunca cachea Supabase (las
// respuestas dependen de ubicación/parámetros — cachearlas serviría datos
// obsoletos o directamente incorrectos).

const CACHE_NAME = "misas-mendoza-v1";
const CORE_ASSETS = ["/", "/fondocapilla.webp", "/icon.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
      ),
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    /\.(png|jpg|jpeg|webp|svg|woff2?|ttf)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isStaticAsset(url)) {
    // Cache-first: los assets con hash en el nombre no cambian de contenido.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return res;
          }),
      ),
    );
    return;
  }

  if (request.mode === "navigate") {
    // Network-first: siempre la versión más nueva posible; si falla (sin
    // conexión), cae a la última copia cacheada de esa página o al inicio.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? caches.match("/"))),
    );
  }
});
