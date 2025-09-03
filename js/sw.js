//============================================================
// File: js/sw.js
// 目的：Service Worker，負責快取核心資源，實現離線可讀。
// (註解: 此次更新未涉及檔案路徑或快取策略變更，故此檔案無需修改)
//============================================================
const CACHE_NAME = 'pour-over-menu-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './assets/tw.css',
  './js/app.js',
  './data/beans.csv'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request)
          .then((response) => {
            if (event.request.method === 'GET' && response.ok) {
              const resClone = response.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, resClone);
              });
            }
            return response;
          })
          .catch(() => {
            // 如果網路請求失敗且快取中沒有，則回傳離線頁面
            return caches.match('./index.html');
          });
      })
  );
});