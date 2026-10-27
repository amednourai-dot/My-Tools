const CACHE_NAME = "ahmed-tools-v5";
const CACHE_PREFIX = "ahmed-tools-";

const CORE_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./novels.js",
  "./manifest.json",
  "./offline.html"
];

const OPTIONAL_FILES = [
  "./icon-192.png",
  "./icon-512.png",
  "./games/index.html",
  "./games/games.js",
  "./games/color-challenge.html",
  "./games/extra-games.html",
  "./games/guess-number.html",
  "./games/logic-puzzle.html",
  "./games/minesweeper.html",
  "./games/reaction-test.html",
  "./games/rock-paper-scissors.html",
  "./games/tic-tac-toe.html",
  "./novels/novels.json",
  "./novels/city-of-stars.json",
  "./novels/house-of-whispers.json",
  "./novels/desert-compass.json",
  "./novels/the-last-inventor.json",
  "./novels/letters-of-rain.json"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(CORE_FILES);
    await Promise.allSettled(OPTIONAL_FILES.map(async file => {
      try {
        const response = await fetch(file, {cache:"reload"});
        if (response.ok && response.type === "basic") await cache.put(file, response);
      } catch {}
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }
        return response;
      } catch {
        const cached = await caches.match(request, {ignoreSearch:true});
        if (cached) return cached;
        if (url.pathname.endsWith("/games/")) {
          const games = await caches.match("./games/index.html");
          if (games) return games;
        }
        const home = await caches.match("./index.html");
        if (home) return home;
        const offline = await caches.match("./offline.html");
        if (offline) return offline;
        return new Response("لا يمكن فتح الصفحة دون اتصال بالإنترنت.", {status:503,headers:{"Content-Type":"text/plain; charset=utf-8"}});
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request, {ignoreSearch:true});
    if (cached) {
      event.waitUntil((async () => {
        try {
          const response = await fetch(request);
          if (response.ok && response.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response);
          }
        } catch {}
      })());
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch {
      return new Response("", {status:503});
    }
  })());
});