// 我的工作台 Service Worker —— 单文件离线缓存
const CACHE = 'wb-pwa-v2';
const CORE = ['index.html', 'manifest.json'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var u = new URL(e.request.url);
  if (u.origin !== location.origin) return;
  // 页面导航（从主屏幕打开）直接给缓存的 index.html，实现离线打开
  if (e.request.mode === 'navigate') {
    e.respondWith(caches.match('index.html').then(function (hit) { return hit || fetch(e.request); }));
  } else {
    // 其它资源优先走网络，失败也回退到 index.html（应用自包含）
    e.respondWith(fetch(e.request).catch(function () { return caches.match('index.html'); }));
  }
});
