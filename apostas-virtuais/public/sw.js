/* ============================================================
   Evlurn — Service Worker
   Estratégia:
   - Assets estáticos (CSS, JS, ícones): Cache First
     → entregamos do cache na primeira tentativa; atualizamos em background.
   - Páginas HTML: Network First
     → sempre tentamos a rede para ter conteúdo fresco; fallback offline
       mostra a página de fallback caso não haja rede nem cache.
   - Chamadas de API (/api/...): Network Only
     → nunca cacheamos dados dinâmicos; erros de rede chegam ao app.
   ============================================================ */

const CACHE_VERSION = 'chipclub-v1';
const ASSETS_CACHE = `${CACHE_VERSION}-assets`;
const PAGES_CACHE  = `${CACHE_VERSION}-pages`;

const STATIC_ASSETS = [
  '/css/style.css',
  '/js/common.js',
  '/js/login.js',
  '/js/register.js',
  '/js/app.js',
  '/js/admin.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
];

const HTML_PAGES = [
  '/login.html',
  '/register.html',
  '/app.html',
  '/admin.html',
];

// ─── Install: pré-cache dos assets estáticos ───────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(ASSETS_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(PAGES_CACHE).then((cache) => cache.addAll(HTML_PAGES)),
    ]).then(() => self.skipWaiting())
  );
});

// ─── Activate: remove caches de versões antigas ────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('chipclub-') && k !== ASSETS_CACHE && k !== PAGES_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: roteamento de cache ─────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API: sempre vai à rede, nunca ao cache
  if (url.pathname.startsWith('/api/')) return;

  // Assets estáticos (CSS, JS, imagens): Cache First
  const isAsset = STATIC_ASSETS.some((a) => url.pathname === a) ||
                  url.pathname.startsWith('/icons/');
  if (isAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((res) => {
          if (res.ok) {
            caches.open(ASSETS_CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        });
        return cached || networkFetch;
      })
    );
    return;
  }

  // Páginas HTML: Network First com fallback para cache
  if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res.ok) {
            caches.open(PAGES_CACHE).then((c) => c.put(request, res.clone()));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match('/login.html')
          )
        )
    );
    return;
  }
});
