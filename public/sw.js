const CACHE = "devisetanche-v1";
const A_PRECACHER = ["/dashboard", "/chantiers", "/calculateur", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(A_PRECACHER)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cles) => Promise.all(cles.filter((c) => c !== CACHE).map((c) => caches.delete(c))))
  );
  self.clients.claim();
});

// Hors connexion : la dernière version connue de la page. Si l'on ouvre une page
// jamais visitée (dont « / », la page d'ouverture de l'appli installée), on retombe
// sur la dernière page d'accueil connue. Une réponse issue d'une redirection
// (ex. vers /login) ne peut pas servir une navigation : on la saute.
async function depuisLeCache(requete) {
  const candidats = requete.mode === "navigate" ? [requete, "/accueil", "/dashboard"] : [requete];
  for (const candidat of candidats) {
    const reponse = await caches.match(candidat);
    if (reponse && !reponse.redirected) return reponse;
  }
  return Response.error();
}

// Stratégie "réseau puis cache" : privilégie les données fraîches, retombe
// sur la dernière version connue si hors connexion.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((reponse) => {
        const copie = reponse.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copie));
        return reponse;
      })
      .catch(() => depuisLeCache(event.request))
  );
});
