# DevisEtanche — consignes pour Claude Code

Application de chiffrage et de suivi de chantiers pour les professionnels de l'étanchéité.
Marché pilote : Nouvelle-Calédonie ; marché cible : France métropolitaine.
Les utilisateurs travaillent **sur le terrain, au téléphone**, parfois en plein soleil ou avec des gants.

Patrice (propriétaire du projet) est étancheur, pas développeur de métier : explique en français simple,
sans jargon, et laisse-lui les décisions produit. Il teste sur son téléphone via les previews Vercel.

## Stack

- Next.js 14 (App Router, TypeScript), Tailwind CSS 3
- Supabase : Postgres, Auth, Storage, sécurité par RLS (`supabase/schema.sql`)
- Déploiement Vercel (projet `devis-etanche`, équipe PKDev) — une preview par branche

Commandes : `npm run dev`, `npm run build`, `npx tsc --noEmit` (vérification des types).
Variables d'environnement : voir `.env.example` ; jamais de clé dans le code ni dans Git.

## Structure

- `app/` — pages (une route = un dossier)
- `components/ui/` — composants de base : `Button`/`ButtonLink`, `Card`/`CardHeader`, `StatusBadge`,
  `ProgressBar`/`ProgressRing`, `StatCard`, `EmptyState`
- `components/icons.tsx` — icônes (tracés officiels Lucide, mêmes noms que `lucide-react`)
- `components/` — shell : `AppShell`, `Sidebar`, `BottomNav`, `TopBar`, `Logo`, `navigation.ts`
- `lib/statuts.ts` — **source unique** des libellés et couleurs de statut (chantier, zone, devis, facture)
- `lib/calc/etancheite.ts` — moteur de calcul (DTU 43.x)
- `lib/offline/queue.ts` — file d'attente hors connexion
- `supabase/*.sql` — schéma et migrations, exécutés à la main dans l'éditeur SQL de Supabase
- `app/design/page.tsx` — page de référence du design system (accessible sans connexion : `/design`)

## Règles du design system

1. **Couleurs** : uniquement les tokens Tailwind (`fond`, `surface`, `sable`, `ligne`, `encre`, `marine`,
   `primaire`, `accent`, `vert`, `ambre`, `rouge`). Jamais de code hexadécimal dans un `className`.
   Pour changer une couleur, on la change dans `app/globals.css`.
2. **Statuts** : toujours via `lib/statuts.ts` (`StatusBadge`, `TONS`, `infoStatut`). Ne jamais redéfinir
   un libellé ou une couleur de statut dans une page.
3. **Composants** : réutiliser `components/ui` avant d'écrire du nouveau balisage. Une nouvelle brique
   réutilisable va dans `components/ui` **et** est ajoutée à la page `/design`.
4. **Icônes** : depuis `@/components/icons`. Pour en ajouter une, recopier le tracé SVG officiel
   (lucide.dev) sous le même nom en PascalCase. Jamais d'emoji ni de caractère Unicode comme icône.
5. **Mobile d'abord** : concevoir chaque écran à 380 px de large, puis élargir. Zones tactiles ≥ 44 px ;
   actions de terrain en `Button taille="lg"` (48 px). Sur téléphone, la `BottomNav` remplace la sidebar.
6. **Lisibilité au soleil** : texte secondaire au minimum en `text-encre/60` ; pas de texte jaune ou
   vert clair sur fond blanc (utiliser `text-amber-700`, `text-emerald-700`).

## Conventions de code

- Noms (variables, fonctions, composants) et commentaires **en français**, comme le reste du code.
- Server Components par défaut ; `"use client"` seulement s'il y a des hooks ou des événements.
  Ne pas passer de fonction d'un Server Component à un Client Component.
- La sécurité est assurée par les policies RLS de Supabase ; l'interface ne fait que masquer.
  Les sous-traitants restreints (`profiles.chantier_assigne_id` non nul) n'ont pas accès aux devis,
  factures, clients ni paramètres.
- Une écriture en base doit passer par `lib/offline/queue.ts` quand `navigator.onLine` est faux
  (exemple : `app/chantiers/[id]/AjouterZoneForm.tsx`).
- Montants : `formatMontant` de `lib/devise.ts` (XPF ou EUR selon l'entreprise ; TGC en NC, TVA en France).
- Modification du schéma : nouveau fichier `supabase/migration-<sujet>.sql`, et le signaler clairement
  dans la PR (Patrice doit l'exécuter à la main dans Supabase).

## Façon de travailler

- Une fonctionnalité = une branche = une PR vers `main`. Petites PR, testables seules.
- Messages de commit et descriptions de PR en français, compréhensibles par un non-développeur.
- Avant de pousser : `npx tsc --noEmit` doit passer. Le build Vercel de la preview fait foi.
- Dans la PR, lister ce que Patrice doit vérifier sur son téléphone.

## À ne pas toucher

Les dossiers et fichiers `.npm/`, `.termux/`, `.ssh/`, `.config/`, `.gitconfig`, `.npmrc` et `server.log`
viennent du téléphone de Patrice (Termux). Ne pas les modifier ni les supprimer via Git : un `git pull`
pourrait les effacer de son téléphone. Leur nettoyage se fera à part, avec lui.

## Feuille de route de la refonte

1. ✅ Design system, shell et tableau de bord
2. Accueil « Mode Chantier » (« Que souhaitez-vous faire aujourd'hui ? », gros boutons)
3. Fiche chantier à onglets (Vue d'ensemble, Plan, Photos, Docs, Activité)
4. Plan interactif : image du plan + zones en SVG (coordonnées 0–1 en `jsonb`), panneau de zone
5. Espace client avec la frise d'étapes (Préparation → Isolation → Étanchéité → Contrôle → Réception)

Hors périmètre pour l'instant : réseau pro, appels d'offres, recrutement, formations, commande vocale.
