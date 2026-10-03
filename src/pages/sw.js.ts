// src/pages/sw.js.ts
// Generuje /sw.js (service worker PWA) podczas astro build.
// Wersja cache = czas builda, więc każdy deploy unieważnia stare cache.

import type { APIRoute } from 'astro';
import { MEDIA } from '../config/site';

const VERSION = new Date().toISOString().replace(/\D/g, '').slice(0, 14);

// Strony i pliki pobierane przy instalacji — dostępne offline od pierwszej wizyty.
const PRECACHE = [
  '/',
  '/offline/',
  '/menu/',
  '/contact/',
  '/reservations/',
  MEDIA.favicon.manifest,
  MEDIA.favicon.icon192,
  MEDIA.favicon.icon512,
  MEDIA.favicon.svg,
  MEDIA.logo.src,
];

const sw = (version: string, precache: string[]) => `
const VERSION     = '${version}';
const PAGES       = 'riverside-pages-' + VERSION;
const STATIC      = 'riverside-static-' + VERSION;
const IMAGES      = 'riverside-images';
const OFFLINE_URL = '/offline/';
const PRECACHE    = ${JSON.stringify(precache)};
const MAX_PAGES   = 40;
const MAX_IMAGES  = 120;

// Obce domeny, które warto cache'ować (obsługują CORS, więc odpowiedzi nie są „opaque”).
const CACHEABLE_HOSTS = ['res.cloudinary.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

// Pobiera stronę do cache razem z jej arkuszami CSS (/_astro/*.css), żeby offline wyglądała poprawnie.
async function precachePage(url) {
  const res = await fetch(url, { cache: 'reload' });
  if (!res.ok) return;
  const pages = await caches.open(PAGES);
  await pages.put(url, res.clone());
  const html = await res.text();
  const assets = [...html.matchAll(/href="(\\/_astro\\/[^"]+\\.css)"/g)].map((m) => m[1]);
  const statics = await caches.open(STATIC);
  await Promise.all(assets.map((a) => statics.add(a).catch(() => {})));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const statics = await caches.open(STATIC);
    await Promise.all(PRECACHE.map((url) =>
      url.endsWith('/')
        ? precachePage(url).catch(() => {})
        : statics.add(url).catch(() => {})
    ));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keep = [PAGES, STATIC, IMAGES];
    const names = await caches.keys();
    await Promise.all(names
      .filter((n) => n.startsWith('riverside-') && !keep.includes(n))
      .map((n) => caches.delete(n)));
    if (self.registration.navigationPreload) await self.registration.navigationPreload.enable();
    await self.clients.claim();
  })());
});

// HTML: najpierw sieć (zawsze świeże menu i godziny), offline — ostatnia wersja z cache albo /offline/.
async function handleNavigation(event) {
  const { request } = event;
  try {
    const res = (await event.preloadResponse) || await fetch(request);
    if (res.ok && res.type === 'basic') {
      const cache = await caches.open(PAGES);
      const url = new URL(request.url);
      await cache.put(url.origin + url.pathname, res.clone());
      trimCache(PAGES, MAX_PAGES);
    }
    return res;
  } catch {
    const url = new URL(request.url);
    return (await caches.match(url.origin + url.pathname, { ignoreSearch: true }))
      || (await caches.match(OFFLINE_URL))
      || new Response('Brak połączenia z internetem.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
  }
}

// Pliki z hashem w nazwie (/_astro/) nigdy się nie zmieniają — najpierw cache.
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const res = await fetch(request);
  if (res.ok) (await caches.open(cacheName)).put(request, res.clone());
  return res;
}

// Zdjęcia, fonty i pozostałe pliki: od razu z cache, w tle odświeżenie.
async function staleWhileRevalidate(event, cacheName, max, init) {
  const { request } = event;
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const network = fetch(init ? new Request(request.url, init) : request)
    .then((res) => {
      if (res.ok) {
        cache.put(request, res.clone()).then(() => max && trimCache(cacheName, max));
      }
      return res;
    })
    .catch(() => cached);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  if (sameOrigin) {
    // Panel CMS i service worker zawsze z sieci.
    if (url.pathname.startsWith('/admin') || url.pathname === '/sw.js') return;

    if (request.mode === 'navigate') {
      event.respondWith(handleNavigation(event));
      return;
    }
    if (url.pathname.startsWith('/_astro/')) {
      event.respondWith(cacheFirst(request, STATIC));
      return;
    }
    // PDF z menu itp. — bez cache, żeby nie zapychać pamięci.
    if (url.pathname.startsWith('/uploads/')) return;

    event.respondWith(staleWhileRevalidate(event, STATIC));
    return;
  }

  if (CACHEABLE_HOSTS.includes(url.hostname)) {
    const isImage = url.hostname === 'res.cloudinary.com';
    event.respondWith(staleWhileRevalidate(
      event,
      isImage ? IMAGES : STATIC,
      isImage ? MAX_IMAGES : 0,
      { mode: 'cors', credentials: 'omit' },
    ));
  }
  // Pozostałe domeny (GTM, formularze, Turnstile, GTranslate) — bez ingerencji.
});
`.trimStart();

export const GET: APIRoute = () =>
  new Response(sw(VERSION, PRECACHE), {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8' },
  });
