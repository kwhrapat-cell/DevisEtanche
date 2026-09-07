-- Migration : plan de zone (image) + positionnement/dimensions des éléments sur ce plan.
-- Toutes les colonnes ajoutées sont nullable pour ne rien casser sur les zones et
-- éléments déjà existants en base (rétrocompatibilité). Aucune policy RLS n'est
-- modifiée : "Zones via chantier" et "Elements zone via chantier" filtrent par ligne
-- (via la chaîne zone -> chantier -> entreprise), pas par colonne, elles restent donc
-- valables telles quelles pour ces nouvelles colonnes.

-- zones.plan_url : référence vers une image de plan stockée dans le bucket Storage
-- "photos" existant (cf supabase/storage.sql), au même titre que les photos de zone.
alter table zones
  add column if not exists plan_url text;

alter table elements_zone
  -- Position relative de l'élément sur le plan (plan_url ci-dessus), en fraction
  -- de la largeur/hauteur de l'image (0 = bord gauche/haut, 1 = bord droit/bas).
  add column if not exists pos_x numeric,
  add column if not exists pos_y numeric,
  -- Type de recouvrement, pertinent uniquement pour les éléments de type "plot".
  add column if not exists recouvrement text,
  -- Dimensions en cm.
  add column if not exists longueur numeric,
  add column if not exists largeur numeric;

alter table elements_zone
  add constraint elements_zone_pos_x_check check (pos_x is null or (pos_x >= 0 and pos_x <= 1)),
  add constraint elements_zone_pos_y_check check (pos_y is null or (pos_y >= 0 and pos_y <= 1)),
  add constraint elements_zone_recouvrement_check check (recouvrement is null or recouvrement in ('resine', 'alu'));
