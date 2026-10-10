# Mise en conformité DevisEtanche — Brief pour Claude Code

Comment l'utiliser : colle ce fichier dans le dépôt (ex. `CONFORMITE.md`), ouvre une session
Claude Code dessus, et demande de traiter les sections dans l'ordre de priorité indiqué en bas.
Tu peux aussi copier-coller une section à la fois comme prompt si tu préfères avancer pas à pas.

## Contexte
- Éditeur : Tramea Solutions, immatriculation RIDET en cours (guichet-entreprises.nc), statut
  Entreprise individuelle / patenté.
- Produit : DevisEtanche, Next.js 14 (App Router) + Supabase, marché cible principal = métropole,
  Nouvelle-Calédonie = marché pilote.

## ⚠️ Point réglementaire clé (à lire avant de coder)
La Nouvelle-Calédonie applique la TGC et non la TVA : c'est une COM à statut fiscal autonome,
**hors du champ de la réforme française de facturation électronique** (comme la Polynésie ou
Wallis-et-Futuna).

- Tramea Solutions (RIDET, TGC) n'a **aucune obligation Factur-X** pour sa propre facturation
  (ni réception ni émission), y compris pour facturer des abonnements SaaS à des clients de
  métropole — ces flux sont traités comme des opérations d'exportation hors TVA.
- Ce sont les **utilisateurs finaux métropolitains** de DevisEtanche (entreprises d'étanchéité en
  France) qui sont concernés : réception obligatoire depuis le 1er septembre 2026 (en vigueur),
  émission obligatoire au 1er septembre 2027 pour les TPE/PME.
- DevisEtanche génère aujourd'hui des **devis**, pas des **factures** — la réforme porte sur les
  factures. Tant que l'app reste un outil de devis, l'urgence technique est faible. Ça redevient
  urgent le jour où le module facturation (roadmap "gestion complète") est construit.
- Donc : préparer le terrain (modèle de données) maintenant, pas besoin d'intégrer une Plateforme
  Agréée dans l'immédiat.

---

## 1. RGPD / protection des données (priorité haute — rien ne bloque, à faire maintenant)

1. Créer `app/confidentialite/page.tsx` — politique de confidentialité couvrant : responsable de
   traitement (Tramea Solutions, RIDET en cours d'attribution), données collectées (comptes,
   chantiers, clients, photos), finalités, base légale (exécution du contrat), durée de
   conservation, liste des sous-traitants (Supabase, Vercel, Resend, Stripe/Lyra selon zone),
   droits RGPD (accès/rectification/effacement/portabilité) et contact pour les exercer.
2. Vérifier la région du projet Supabase (Dashboard > Project Settings). Si hébergement hors UE,
   ajouter une clause de transfert de données dans la politique de confidentialité.
3. Ajouter dans Paramètres une action "supprimer mon compte et mes données" — ou a minima
   documenter une procédure manuelle de suppression sur demande (adresse de contact visible).
4. Vérifier que Supabase, Vercel, Resend et Stripe/Lyra proposent un DPA (Data Processing
   Agreement) et l'accepter dans leurs dashboards respectifs si ce n'est pas déjà fait.
5. Repasser sur les policies RLS existantes pour confirmer qu'un utilisateur/sous-traitant ne peut
   accéder qu'aux données de ses propres chantiers (déjà largement en place — vérification plutôt
   que reconstruction).
6. Vérifier si un outil d'analytics/mesure d'audience est utilisé. Si oui, ajouter un bandeau de
   consentement cookies avant chargement du script.
7. Ajouter une case à cocher "J'accepte la politique de confidentialité et les CGV" sur
   `app/signup`.

## 2. Mentions légales & CGV (priorité haute — le placeholder RIDET n'empêche pas de commencer)

1. Créer `lib/company-info.ts` : constante centralisée avec les infos d'entreprise (nom, statut,
   adresse, RIDET). Mettre `RIDET: "en cours d'attribution"` avec un commentaire
   `// TODO: remplacer par le numéro définitif une fois l'immatriculation finalisée`. Toutes les
   pages légales, le PDF de devis et les emails Resend doivent lire cette constante — un seul
   endroit à modifier plus tard.
2. Créer `app/mentions-legales/page.tsx` : éditeur, statut (Entreprise individuelle / patenté),
   adresse, contact, hébergeur (Vercel Inc., + Supabase), directeur de publication.
3. Créer `app/cgv/page.tsx` : objet du service, tarifs/abonnement, modalités de paiement
   (Stripe/Lyra selon zone du client), durée et résiliation, responsabilité, propriété des
   données saisies par le client, disponibilité, droit applicable.
4. Lier ces deux pages dans un composant `Footer.tsx` (si pas déjà présent) et sur la page
   d'inscription.
5. Vérifier les mentions obligatoires sur le PDF de devis généré : nom/forme juridique du
   prestataire, RIDET (via `company-info.ts`), adresse, conditions de règlement, durée de
   validité du devis, numéro de devis, date, mention TGC/TVA adaptée selon la localisation du
   client (NC vs métropole).

## 3. Facturation électronique — préparation seulement (priorité basse pour l'instant)

1. Dans le schéma Supabase, prévoir un champ `type` sur la table devis (`devis` / `facture`) pour
   pouvoir distinguer les deux plus tard sans tout migrer.
2. Si un module facture voit le jour : prévoir une numérotation strictement continue et
   chronologique (`numero_facture` séquentiel), différente de la numérotation libre des devis.
3. Documenter dans le repo (ce fichier ou un `README` dédié) le repère réglementaire : réception
   obligatoire depuis le 01/09/2026 pour les clients métropole, émission obligatoire au
   01/09/2027 pour les TPE/PME, formats acceptés (Factur-X, UBL, CII), passage par une
   Plateforme Agréée nécessaire côté client final — pas côté Tramea Solutions.
4. Pas d'intégration technique à une PA tant que l'app ne génère que des devis. Réévaluer à la
   construction du module facturation.

---

## Priorisation suggérée pour Claude Code
1. Section 1 (RGPD) — aucun blocage, à traiter en premier.
2. Section 2 (mentions légales & CGV) — commencer avec le placeholder RIDET, prévoir la mise à
   jour d'une ligne une fois le numéro reçu.
3. Section 3 (facturation électronique) — documentation et préparation du schéma uniquement, pas
   de développement urgent.

---

## État d'avancement (mis à jour par Claude Code)

### Section 1 — RGPD
- ✅ 1.1 `app/confidentialite/page.tsx` créé (responsable de traitement, données collectées,
  finalités, base légale, durée de conservation, sous-traitants, droits RGPD, contact).
- ⚠️ 1.2 À vérifier manuellement dans le Dashboard Supabase (Project Settings > General > Region) —
  ce n'est pas accessible depuis le dépôt. La politique de confidentialité contient déjà une
  clause de transfert générique (avec un `TODO` dans le code pour préciser le pays une fois la
  région confirmée).
- ✅ 1.3 Section "Confidentialité et données" ajoutée dans `/parametres` avec une procédure
  documentée (lien mailto pré-rempli vers l'adresse de contact) — suppression manuelle sous 30
  jours, pas d'automatisation destructive ajoutée pour l'instant.
- ⚠️ 1.4 Action externe (dashboards Supabase/Vercel/Stripe) — à faire manuellement, hors du champ
  d'un changement de code. Resend et Lyra ne sont pas encore intégrés dans le code actuel (aucune
  dépendance ni appel API trouvés) : rien à accepter côté DPA pour ces deux-là tant qu'ils ne sont
  pas branchés.
- ✅ 1.5 Vérifié : les policies RLS (`supabase/schema.sql`) restreignent déjà chaque lecture/
  écriture à `entreprise_id_courante()`, avec une restriction supplémentaire pour les
  sous-traitants (`chantier_assigne_courant()`) qui les cantonne à leur seul chantier assigné, et
  aux devis/factures (marges) jamais visibles pour eux. Aucun changement nécessaire.
- ✅ 1.6 Aucun outil d'analytics/mesure d'audience trouvé dans le code (`app/`, `components/`,
  `package.json`) — pas de bandeau cookies nécessaire pour l'instant. À réévaluer si un outil est
  ajouté plus tard.
- ✅ 1.7 Case à cocher obligatoire ajoutée sur `app/signup/page.tsx` (bloque la soumission tant
  qu'elle n'est pas cochée), avec liens vers `/confidentialite` et `/cgv`.

### Section 2 — Mentions légales & CGV
- ✅ 2.1 `lib/company-info.ts` créé avec le placeholder RIDET et le TODO demandé. Utilisé par les
  trois pages légales.
  - Note : ce fichier centralise l'identité de **Tramea Solutions** (l'éditeur du logiciel), pas
    celle des entreprises clientes qui utilisent DevisEtanche. Le PDF de devis/facture affiche
    l'identité de l'entreprise cliente (table `entreprises`, déjà en place), pas celle de Tramea
    Solutions — les deux ne doivent pas être confondues.
- ✅ 2.2 `app/mentions-legales/page.tsx` créé.
- ✅ 2.3 `app/cgv/page.tsx` créé.
- ✅ 2.4 `components/Footer.tsx` créé et ajouté sur `/login` et `/signup`. Liens également ajoutés
  en pied de la barre latérale (`components/Sidebar.tsx`) pour rester accessibles une fois
  connecté.
- ✅ 2.5 Mentions vérifiées et complétées sur les PDF devis/facture (`app/devis/[id]/page.tsx`,
  `app/factures/[id]/page.tsx`) : nom + forme juridique du prestataire, adresse, identifiant
  professionnel, numéro et date d'émission, conditions de règlement, durée de validité (devis
  uniquement), mention TGC/TVA (déjà dynamique via `entreprises.libelle_taxe`). La forme
  juridique et les conditions de règlement sont désormais des champs éditables par entreprise
  cliente depuis `/parametres` (migration `supabase/migration-mentions-legales-devis.sql`).

### Section 3 — Facturation électronique (préparation)
- ℹ️ 3.1 Le schéma ne distingue pas devis/facture par un champ `type` : il va plus loin, avec
  **deux tables séparées** (`devis` et `factures`) déjà en place depuis
  `supabase/migration-facturation.sql`. C'est déjà la séparation demandée, sans migration
  supplémentaire nécessaire.
- ⚠️ 3.2 Gap identifié, non corrigé (hors périmètre "documentation uniquement") : la numérotation
  des factures (`FAC-{année}-{4 derniers chiffres de Date.now()}`, voir
  `app/devis/[id]/StatutDevisForm.tsx`) n'est **pas strictement séquentielle et chronologique** —
  elle dépend d'un horodatage, pas d'un compteur. Ce n'est pas bloquant pour du devis, mais devra
  être corrigé (ex. séquence Postgres par entreprise) avant de considérer le module facturation
  comme conforme, y compris indépendamment de la réforme Factur-X (numérotation continue déjà
  exigée par le droit comptable français actuel).
- ✅ 3.3 Repère réglementaire documenté ci-dessus (section "Point réglementaire clé") : réception
  obligatoire depuis le 01/09/2026 pour les clients métropole, émission obligatoire au 01/09/2027
  pour les TPE/PME, formats acceptés (Factur-X, UBL, CII), passage par une Plateforme Agréée
  nécessaire côté client final — pas côté Tramea Solutions.
- ✅ 3.4 Aucune intégration technique à une Plateforme Agréée effectuée — confirmé hors périmètre
  tant que l'app ne génère que des devis (et des factures internes de suivi, pas encore au format
  réglementaire électronique).
