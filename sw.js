// sw.js — Service Worker tối giản cho MechaProject PWA
// Mục đích chính: giúp trình duyệt nhận diện đây là PWA hợp lệ (yêu cầu bắt buộc
// để hiện nút "Cài đặt" / "Thêm vào màn hình chính"). Không cache nặng vì app
// luôn cần dữ liệu mới nhất từ Google Drive.

const CACHE_NAME = 'mechaproject-shell-v4';
const SHELL_FILES = [
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first cho mọi request: luôn ưu tiên dữ liệu mới, chỉ fallback cache khi offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
