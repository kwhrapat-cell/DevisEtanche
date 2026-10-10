-- Migration : date de dernière modification des chantiers.
-- Sert à l'accueil « Mode Chantier » (/accueil) pour proposer le « chantier du
-- jour » : le dernier chantier modifié qui n'est pas terminé.
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor).
--
-- Un chantier est considéré comme modifié quand on change sa fiche, une de ses
-- zones, ou qu'on y ajoute une photo.

-- Chantiers existants : on part de leur date de création.
alter table chantiers add column if not exists updated_at timestamptz;
update chantiers set updated_at = coalesce(created_at, now()) where updated_at is null;
alter table chantiers alter column updated_at set default now();

-- Modification directe de la fiche chantier.
create or replace function public.chantier_horodater()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists chantiers_horodater on chantiers;
create trigger chantiers_horodater before update on chantiers
  for each row execute function public.chantier_horodater();

-- Zone ou photo ajoutée/modifiée : on « touche » le chantier parent.
-- security definer : un ouvrier peut modifier une zone sans avoir le droit de
-- modifier la fiche chantier (policy "Ecriture entreprise") ; seule la date change.
create or replace function public.chantier_toucher_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update chantiers set updated_at = now() where id = new.chantier_id;
  return new;
end;
$$;

drop trigger if exists zones_toucher_chantier on zones;
create trigger zones_toucher_chantier after insert or update on zones
  for each row execute function public.chantier_toucher_parent();

drop trigger if exists photos_toucher_chantier on photos;
create trigger photos_toucher_chantier after insert on photos
  for each row execute function public.chantier_toucher_parent();

create index if not exists chantiers_entreprise_updated_at_idx on chantiers (entreprise_id, updated_at desc);
