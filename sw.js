// ============== Service Worker — สหกรณ์โรงเรียน ==============
const CACHE_VERSION = 'v3';  // เปลี่ยนเลขนี้เพื่อ force ลบ cache เก่า
const CACHE = `coop-${CACHE_VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './logo-no-bg.png'
];

// install: pre-cache core + skip waiting
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(CORE_ASSETS).catch(() => {}))
  );
  self.skipWaiting();  // activate ทันที ไม่รอ tab อื่นปิด
});

// activate: clean old caches + take control
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// fetch strategy:
// - HTML / navigation → network-first (ได้ของใหม่เสมอถ้ามีเน็ต)
// - JS/CSS/images → stale-while-revalidate (เร็ว + อัปเดต background)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // ข้าม Supabase API + external assets (font, supabase-js)
  if (url.origin !== self.location.origin) return;

  const isHTML = e.request.mode === 'navigate' ||
                 e.request.destination === 'document' ||
                 url.pathname.endsWith('.html') ||
                 url.pathname.endsWith('/');

  if (isHTML) {
    // Network-first สำหรับ HTML — เห็นของใหม่ทันทีถ้ามีเน็ต
    e.respondWith(
      fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html')))
    );
    return;
  }

  // Stale-while-revalidate สำหรับไฟล์อื่นๆ
  e.respondWith(
    caches.match(e.request).then(cached => {
      const fetchPromise = fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

// รับข้อความจากแอปเพื่อ force skip waiting
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
