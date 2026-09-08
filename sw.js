const CACHE_NAME = 'shoot-booking-v1';
const SHELL_FILES = [
  './booking.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

// شبكة أولًا، ونرجع للنسخة المخزنة محليًا فقط لو الاتصال فشل
// (بيانات الحجوزات نفسها تدار عبر Firestore ولها آلية عمل بدون إنترنت خاصة بها)
self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(()=>{});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
