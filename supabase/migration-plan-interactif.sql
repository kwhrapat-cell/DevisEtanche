-- Migration : plan interactif du chantier (étape 4 de la refonte).
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor).
--
-- - chantiers.plan_url : image du plan, stockée dans le bucket "photos" existant
--   (cf supabase/storage.sql), dans le dossier du chantier.
-- - zones.contour : forme de la zone dessinée sur ce plan, liste de points
--   [[x, y], ...] en fraction de la largeur/hauteur de l'image
--   (0 = bord gauche/haut, 1 = bord droit/bas). Nul = zone pas encore placée.
--
-- Colonnes nullables : rien ne change pour les chantiers et zones existants.
-- Aucune policy RLS modifiée : "Ecriture entreprise" (chantiers) et "Zones via
-- chantier" filtrent par ligne et couvrent donc ces nouvelles colonnes.
-- Sans rapport avec zones.plan_url (plan propre à une zone, PR #11).

alter table chantiers add column if not exists plan_url text;

alter table zones add column if not exists contour jsonb;

alter table zones drop constraint if exists zones_contour_check;
alter table zones add constraint zones_contour_check
  check (contour is null or jsonb_typeof(contour) = 'array');
