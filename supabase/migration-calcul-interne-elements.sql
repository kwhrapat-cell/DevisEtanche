-- Migration : calcul de main d'œuvre interne sur les éléments de zone.
-- Ces colonnes portent une donnée de marge interne (temps + taux horaire, prix
-- matériaux) qui ne doit jamais apparaître sur un devis exporté ni dans l'espace
-- client public — seul le prix final par ligne y est visible, comme aujourd'hui.
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor).
--
-- Le même calcul est aussi disponible ligne par ligne dans le formulaire "Nouveau
-- devis" (app/devis/nouveau) : temps_estime_heures/taux_horaire_interne y sont
-- stockés directement dans le champ jsonb devis.lignes (pas de colonne dédiée
-- nécessaire), et déjà protégés par les policies "Lecture/Ecriture devis
-- entreprise" existantes. dernier_taux_horaire_interne (ci-dessous) sert de
-- valeur par défaut aux deux formulaires.

alter table elements_zone
  add column if not exists temps_estime_heures numeric,
  add column if not exists taux_horaire_interne numeric,
  -- Prix matériaux et prix final : nécessaires pour proposer un prix suggéré
  -- (temps × taux + matériaux) que l'utilisateur ajuste librement, elements_zone
  -- n'ayant jusqu'ici porté aucun prix.
  add column if not exists prix_materiaux numeric,
  add column if not exists prix_final numeric;

-- Dernier taux horaire interne utilisé par l'entreprise : pré-remplit le champ
-- "Taux horaire interne" à la création d'un élément pour éviter de le ressaisir
-- à chaque fois. Rattaché à entreprises comme les autres paramètres partagés
-- (devise, taux de taxe par défaut...).
alter table entreprises
  add column if not exists dernier_taux_horaire_interne numeric;

-- RLS : elements_zone n'avait jusqu'ici aucune policy définie. On applique le
-- même schéma que "Zones via chantier" / "Photos via chantier" (accès via la
-- chaîne zone -> chantier -> entreprise), pour que temps_estime_heures et
-- taux_horaire_interne (comme le reste de la ligne) restent lisibles
-- uniquement par les comptes de l'entreprise concernée. Le lien client public
-- (fonction espace_client_chantier, security definer) n'interroge que
-- chantiers/zones/photos et ne sélectionne jamais elements_zone : un client
-- via ce lien n'a donc aucun accès à ces colonnes, avec ou sans cette policy.
alter table elements_zone enable row level security;

drop policy if exists "Elements zone via chantier" on elements_zone;
create policy "Elements zone via chantier" on elements_zone for all
  using (
    zone_id in (
      select z.id from zones z
      join chantiers c on c.id = z.chantier_id
      where c.entreprise_id = public.entreprise_id_courante()
        and (public.chantier_assigne_courant() is null or c.id = public.chantier_assigne_courant())
    )
  );
