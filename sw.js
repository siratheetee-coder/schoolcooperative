// ============== Service Worker — สหกรณ์โรงเรียน ==============
const CACHE_VERSION = 'v22';  // เปลี่ยนเลขนี้เพื่อ force ลบ cache เก่า
const CACHE = `coop-${CACHE_VERSION}`;
const IMG_CACHE = `coop-images-${CACHE_VERSION}`;
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './logo-no-bg.png',
  './apple-touch-icon.png',
  './web-app-manifest-192x192.png',
  './web-app-manifest-512x512.png',
  './web-app-manifest-192x192-maskable.png',
  './web-app-manifest-512x512-maskable.png',
  './favicon-96x96.png'
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
      Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// fetch strategy:
// - HTML / navigation → network-first (ได้ของใหม่เสมอถ้ามีเน็ต)
// - JS/CSS/images → stale-while-revalidate (เร็ว + อัปเดต background)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // === Cross-origin images (Supabase Storage / external CDN) ===
  // Cache-first สำหรับรูป → offline ใช้ได้
  if (url.origin !== self.location.origin) {
    const isImage = e.request.destination === 'image' ||
                    /\.(jpg|jpeg|png|webp|gif|svg|avif)(\?|$)/i.test(url.pathname) ||
                    url.pathname.includes('/storage/v1/object/');
    if (isImage) {
      e.respondWith(
        caches.match(e.request).then(cached => {
          if (cached) return cached;
          return fetch(e.request).then(resp => {
            if (resp && resp.status === 200) {
              const clone = resp.clone();
              caches.open(IMG_CACHE).then(c => c.put(e.request, clone)).catch(() => {});
            }
            return resp;
          }).catch(() => cached);
        })
      );
      return;
    }
    // ไม่ใช่รูป (เช่น Supabase API, font) → ไม่ intercept
    return;
  }

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

// === Push Notifications ===
self.addEventListener('push', e => {
  let data = { title: 'สหกรณ์โรงเรียน', body: 'มีการแจ้งเตือนใหม่', url: '/', tag: 'coop', icon: './logo-no-bg.png' };
  try {
    if (e.data) data = { ...data, ...e.data.json() };
  } catch (err) { /* fallback */ }

  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || './logo-no-bg.png',
      badge: './logo-no-bg.png',
      tag: data.tag,
      renotify: true,
      requireInteraction: true,   // ค้างอยู่จนกดเอง (สำคัญตอนหน้าจอดับ)
      silent: false,               // มีเสียง
      data: { url: data.url },
      vibrate: [200, 100, 200, 100, 200],   // สั่นยาวขึ้น เห็นชัดขึ้น
      timestamp: Date.now()
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data?.url || '/';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      // โฟกัสแท็บที่เปิดอยู่
      for (const c of list) {
        if ('focus' in c) {
          c.postMessage({ type: 'NAVIGATE', url });
          return c.focus();
        }
      }
      // ไม่มีแท็บเปิด → เปิดใหม่
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});
