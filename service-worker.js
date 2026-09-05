const CACHE_NAME="ahmed-tools-v2";

const FILES=[
"./",
"./index.html",
"./style.css",
"./script.js",
"./manifest.json",
"./offline.html",
"./icon-192.png",
"./icon-512.png"
];

self.addEventListener("install",event=>{

event.waitUntil(

caches.open(CACHE_NAME)
.then(cache=>cache.addAll(FILES))

);

self.skipWaiting();

});


self.addEventListener("activate",event=>{

event.waitUntil(

caches.keys()
.then(keys=>{

return Promise.all(

keys
.filter(key=>key!==CACHE_NAME)
.map(key=>caches.delete(key))

);

})

);

self.clients.claim();

});


self.addEventListener("fetch",event=>{

if(event.request.method!=="GET")return;

event.respondWith(

caches.match(event.request)

.then(response=>{

if(response)return response;

return fetch(event.request)

.then(networkResponse=>{

const copy=networkResponse.clone();

caches.open(CACHE_NAME)
.then(cache=>cache.put(event.request,copy));

return networkResponse;

})

.catch(()=>{

if(event.request.mode==="navigate"){
return caches.match("./offline.html");
}

});

})

);

});
