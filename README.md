# DevisEtanche — Application (Next.js + Supabase)

Portail applicatif du MVP : Tableau de bord, Chantiers, Devis, Clients,
Calculateur, Paramètres — avec authentification et données réelles.

Ce projet est pensé pour être développé **seul, sans équipe externe**, avec
l'aide d'un assistant IA (Claude). Chaque étape ci-dessous peut être copiée-
collée telle quelle.

## Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** — tokens de marque déjà configurés
- **Supabase** — base de données, authentification, stockage (RLS activé :
  chaque entreprise ne voit que ses propres données)

## 1. Installer (sur votre ordinateur, avec Internet)

```bash
npm install
cp .env.example .env.local
```

## 2. Créer le projet Supabase (gratuit)

1. Aller sur [supabase.com](https://supabase.com) → New project.
2. Dans **SQL Editor**, coller et exécuter `supabase/schema.sql`.
3. Dans **Project Settings → API**, copier `Project URL` et `anon public key`
   dans `.env.local`.
4. Dans **Authentication → Providers**, vérifier que "Email" est activé
   (activé par défaut).

## 3. Lancer en local

```bash
npm run dev
```

Ouvrir http://localhost:3000 → vous êtes redirigé vers `/login`.
Cliquer sur **Créer un compte** : cela crée votre utilisateur, votre
entreprise et votre profil administrateur en une seule fois.

## 4. Charger des données de test (optionnel)

Dans Supabase → **Table Editor → entreprises**, copier l'`id` de votre
entreprise. Le coller à la place de `<ENTREPRISE_ID>` dans
`supabase/seed.sql`, puis exécuter ce fichier dans **SQL Editor**. La page
Chantiers affichera alors ces données réelles.

## 5. Déployer (gratuit pour démarrer)

1. Créer un dépôt GitHub et y pousser ce dossier.
2. Aller sur [vercel.com](https://vercel.com) → **Import Project** → choisir
   le dépôt.
3. Dans les réglages du projet Vercel, ajouter les deux variables
   `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. Déployer. Chaque `git push` redéploie automatiquement — aucune
   intervention manuelle nécessaire ensuite.

## 6. Activer les paiements (Stripe) — pour une mise en service avec profits

1. Créer un compte sur [stripe.com](https://stripe.com) (mode test au départ).
2. Dans **Products**, créer deux produits récurrents : "Artisan" (29 €/mois)
   et "Pro" (59 €/mois). Copier leurs `price_id` dans `.env.local`
   (`STRIPE_PRICE_ARTISAN`, `STRIPE_PRICE_PRO`).
3. Copier la clé secrète (`STRIPE_SECRET_KEY`) depuis **Developers → API keys**.
4. Dans **Developers → Webhooks**, ajouter un endpoint pointant vers
   `https://votre-domaine/api/webhooks/stripe`, événements
   `checkout.session.completed` et `customer.subscription.deleted`. Copier
   le "Signing secret" dans `STRIPE_WEBHOOK_SECRET`.
5. Dans Supabase → **Project Settings → API**, copier la clé
   `service_role` (⚠️ secrète, jamais publique) dans
   `SUPABASE_SERVICE_ROLE_KEY` — elle permet au webhook de mettre à jour
   le forfait sans dépendre d'une session utilisateur.

Depuis `/parametres`, choisir un forfait payant ouvre une session Stripe
Checkout ; une fois le paiement confirmé, le webhook met automatiquement à
jour `entreprises.forfait` — aucune action manuelle nécessaire.

En production, remplacer les clés `sk_test_...` par les clés live une fois
prêt à encaisser réellement.

## 7. Photos de chantier (Supabase Storage)

Exécuter `supabase/storage.sql` dans le SQL Editor (après avoir créé un
bucket **public** nommé `photos` depuis Storage → New bucket). Les photos
s'ajoutent alors directement depuis la fiche d'un chantier.

## 8. Export PDF des devis

Chaque devis a une page dédiée (`/devis/[id]`) mise en page pour
l'impression. Le bouton "Exporter en PDF" déclenche l'impression du
navigateur (Ctrl/Cmd+P → "Enregistrer en PDF") — aucune dépendance
supplémentaire, fonctionne immédiatement.

## 9. Mode hors ligne

- Un service worker (`public/sw.js`) met en cache les pages principales
  pour une consultation hors connexion.
- Une bannière signale la perte de connexion.
- Les écritures simples (ex. ajout de zone) faites hors connexion sont
  stockées localement (`lib/offline/queue.ts`) et synchronisées
  automatiquement au retour du réseau.
- Limite actuelle : l'ajout de photos nécessite une connexion active (l'upload
  binaire n'est pas mis en file d'attente dans cette version).

## 10. Du calcul au devis en un clic

Sur `/calculateur`, le bouton "Générer un devis à partir de ce calcul"
transmet les quantités calculées vers `/devis/nouveau`, où elles arrivent
déjà réparties en lignes (désignation, quantité, prix unitaire par défaut,
modifiable avant enregistrement).

## 11. Espace client (lien public, sans compte)

Chaque chantier a un `token_public` généré automatiquement. Depuis la fiche
chantier, le bouton "Copier le lien de suivi client" génère une URL du type
`https://votre-site/espace-client/<token>` à envoyer au client : il y voit
l'avancement, les zones et les dernières photos, sans jamais se connecter.
La sécurité repose sur le fait que le token est un UUID non devinable — les
données exposées sont volontairement limitées (pas de montants, pas
d'informations sur les autres chantiers) via la fonction Postgres
`espace_client_chantier` (voir fin de `supabase/schema.sql`).

## Continuer seul, sans équipe

- **Claude Code** (outil en ligne de commande d'Anthropic) permet de
  continuer à faire évoluer ce dépôt avec l'aide de l'IA directement depuis
  un terminal, une fois que vous aurez un ordinateur.
- Chaque module (Devis, Clients, Photos…) peut être développé et testé
  indépendamment — c'est la logique "livraison par module" déjà retenue
  pour ce projet.
- Le calculateur (`lib/calc/etancheite.ts`) est le seul endroit à modifier
  pour ajuster des ratios : toutes les pages qui l'utilisent se mettent à
  jour automatiquement.

## État actuel des pages

| Page | État |
|---|---|
| Tableau de bord | ✅ Connectée à Supabase (stats + chantiers récents réels) |
| Chantiers (liste + création) | ✅ Connectée, formulaire "Nouveau chantier" fonctionnel |
| Détail chantier | ✅ Connectée, zones réelles + formulaire "Ajouter une zone" |
| Devis (liste + création) | ✅ Connectée, formulaire avec lignes dynamiques et calcul auto HT/TTC |
| Clients (liste + création) | ✅ Connectée, formulaire "Nouveau client" fonctionnel |
| Calculateur | ✅ Formules DTU réelles, aucune donnée externe requise |
| Paramètres | ✅ Connectée : entreprise, équipe, forfait + paiement Stripe |
| Connexion / Inscription | ✅ Fonctionnel (Supabase Auth) |
| Photos de chantier | ✅ Upload réel (Supabase Storage) |
| Export PDF devis | ✅ Page imprimable dédiée par devis |
| Mode hors ligne | ✅ Cache + file de synchronisation basique |
| Paiement / forfaits | ✅ Stripe Checkout + webhook de mise à jour automatique |
| Calculateur → Devis | ✅ Génération de devis pré-rempli en un clic |
| Espace client | ✅ Page publique de suivi via lien sécurisé (sans compte) |

Toutes les pages listées "✅ Connectée" lisent et écrivent réellement dans
Supabase — plus aucune donnée en dur dans `app/`.

## Prochaines étapes suggérées

1. Notifications par e-mail (nouveau message, devis accepté, chantier terminé).
2. Étendre la file hors ligne aux photos (upload différé).
3. Rôles fins (ouvrier ne voit que ses tâches du jour, pas toute l'entreprise).
4. Historique / journal d'activité par chantier.
