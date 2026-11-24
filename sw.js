// Guarda o jogo para funcionar sem internet. Subir a VERSAO a cada publicação.
const VERSAO = "v1", CACHE = `baloes-sons-${VERSAO}`;
const FICHEIROS = ["./", "index.html", "manifest.json", "css/style.css", "js/app.js", "js/dados.js", "js/rondas.js", "js/audio.js",
  "fonts/imprensa.woff2", "fonts/manuscrito.woff2", "fonts/titulo.woff2", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png", "icons/icon-180.png",
  "audio/a.mp3", "audio/an.mp3", "audio/ao.mp3", "audio/b.mp3", "audio/d.mp3", "audio/e_aberto.mp3", "audio/en.mp3", "audio/f.mp3", "audio/g.mp3", "audio/i.mp3", "audio/in.mp3", "audio/j.mp3", "audio/k.mp3", "audio/lh.mp3", "audio/l.mp3", "audio/m.mp3", "audio/nh.mp3", "audio/n.mp3", "audio/o_aberto.mp3", "audio/on.mp3", "audio/p.mp3", "audio/r_forte.mp3", "audio/r_fraco.mp3", "audio/s.mp3", "audio/t.mp3", "audio/u.mp3", "audio/un.mp3", "audio/v.mp3", "audio/x.mp3", "audio/z.mp3"];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting())));
// Só apaga caches deste jogo: oakshift.github.io tem outras apps.
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(ns => Promise.all(ns.filter(n => n.startsWith("baloes-sons-") && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request)).then(r => r || fetch(e.request)));
});
