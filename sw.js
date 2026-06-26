/* VC Ledger service worker — app shell cache (offline) + installability */
const CACHE='vc-ledger-v1';
self.addEventListener('install', e=>{ self.skipWaiting(); });
self.addEventListener('activate', e=>{ e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;                 // don't touch POST (auth/save)
  if(e.request.url.includes('supabase.co')){           // data API always live, never cached
    e.respondWith(fetch(e.request));
    return;
  }
  // network-first (always latest when online), fall back to cache when offline
  e.respondWith(
    fetch(e.request).then(resp=>{
      const copy=resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
      return resp;
    }).catch(()=> caches.match(e.request).then(r=> r || caches.match('./index.html')))
  );
});
