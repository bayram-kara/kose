/* Köşe servis çalışanı: uygulama kabuğu önden, geri kalanı ilk kullanımda önbelleğe */
const V = "kose-v5.2";
const SHELL = ["./", "./index.html", "./app.js", "./data.js", "./world3d.js", "./stats.js", "./cam.js", "./manifest.webmanifest",
  "./vendor/three/three.module.js", "./vendor/three/addons/loaders/GLTFLoader.js", "./vendor/three/addons/utils/BufferGeometryUtils.js",
  "./vendor/three/addons/utils/SkeletonUtils.js", "./vendor/three/addons/controls/OrbitControls.js", "./models/boxer.glb",
  "./icons/icon-192.png", "./icons/icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET") return;
  const u = new URL(r.url);
  // uygulama dosyaları: önce ağ (güncellemeler hemen gelsin), yoksa önbellek
  const appFile = u.origin === location.origin && /\.(html|js|webmanifest)$|\/$/.test(u.pathname) && !u.pathname.includes("/vendor/");
  if (appFile) { e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r, { ignoreSearch: true }))); return; }
  // büyük ve değişmeyen dosyalar (kütüphaneler, model, yazı tipleri): önce önbellek
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok || res.type === "opaque") { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } return res; })));
});
