-- Migration : étapes du chantier (étape 5 de la refonte — espace client).
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor).
--
-- chantiers.etape : étape en cours, affichée en frise dans l'espace client
-- (Préparation → Isolation → Étanchéité → Contrôle → Réception). Les libellés
-- sont dans lib/statuts.ts (ETAPES_CHANTIER).

alter table chantiers add column if not exists etape text default 'preparation';

-- Chantiers existants : terminés → réception, les autres → préparation.
update chantiers set etape = case when statut = 'termine' then 'reception' else 'preparation' end
where etape is null;

alter table chantiers drop constraint if exists chantiers_etape_check;
alter table chantiers add constraint chantiers_etape_check
  check (etape in ('preparation', 'isolation', 'etancheite', 'controle', 'reception'));

-- Espace client public : on ajoute l'étape et les dates prévues aux champs exposés.
-- Toujours aucune donnée de prix, de client ni d'entreprise.
create or replace function public.espace_client_chantier(p_token uuid)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'chantier', (
      select json_build_object(
        'nom', nom, 'ville', ville, 'statut', statut, 'etape', etape,
        'avancement_pct', avancement_pct, 'surface_totale_m2', surface_totale_m2,
        'systeme', systeme, 'date_debut', date_debut, 'date_fin_prevue', date_fin_prevue
      ) from chantiers where token_public = p_token
    ),
    'zones', (
      select coalesce(json_agg(json_build_object('nom', nom, 'avancement_pct', avancement_pct, 'statut', statut)), '[]'::json)
      from zones where chantier_id = (select id from chantiers where token_public = p_token)
    ),
    'photos', (
      select coalesce(json_agg(json_build_object('url', url) order by created_at desc), '[]'::json)
      from (select url, created_at from photos where chantier_id = (select id from chantiers where token_public = p_token) order by created_at desc limit 12) p
    )
  );
$$;

grant execute on function public.espace_client_chantier(uuid) to anon, authenticated;
