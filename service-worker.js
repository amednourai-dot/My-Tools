const CACHE_NAME = "ahmed-tools-v4";
const CACHE_PREFIX = "ahmed-tools-";

const CORE_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
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
  "./games/tic-tac-toe.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      await cache.addAll(CORE_FILES);

      await Promise.allSettled(
        OPTIONAL_FILES.map(async file => {
          try {
            const response = await fetch(file, { cache: "reload" });

            if (response.ok && response.type === "basic") {
              await cache.put(file, response);
            }
          } catch {}
        })
      );

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys
          .filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );

      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);

          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(request, response.clone());
          }

          return response;
        } catch {
          const cachedPage = await caches.match(request, {
            ignoreSearch: true
          });

          if (cachedPage) return cachedPage;

          const pathname = url.pathname;

          if (pathname.endsWith("/games/")) {
            const gamesPage = await caches.match("./games/index.html");
            if (gamesPage) return gamesPage;
          }

          const homePage = await caches.match("./index.html");
          if (homePage) return homePage;

          const offlinePage = await caches.match("./offline.html");
          if (offlinePage) return offlinePage;

          return new Response(
            "لا يمكن فتح الصفحة دون اتصال بالإنترنت.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        }
      })()
    );

    return;
  }

  event.respondWith(
    (async () => {
      const cachedResponse = await caches.match(request, {
        ignoreSearch: true
      });

      if (cachedResponse) {
        event.waitUntil(
          (async () => {
            try {
              const response = await fetch(request);

              if (response.ok && response.type === "basic") {
                const cache = await caches.open(CACHE_NAME);
                await cache.put(request, response);
              }
            } catch {}
          })()
        );

        return cachedResponse;
      }

      try {
        const response = await fetch(request);

        if (response.ok && response.type === "basic") {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, response.clone());
        }

        return response;
      } catch {
        return new Response("", { status: 503 });
      }
    })()
  );
});
