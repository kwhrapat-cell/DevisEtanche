-- Corrige l'inscription : "insert().select()" sur entreprises échouait car la
-- policy de lecture ("Lecture entreprise membres") exige un profil déjà lié
-- à l'entreprise via auth.uid() — impossible au moment de l'inscription,
-- puisque ce profil n'existe pas encore. La ligne était bien créée en base,
-- mais illisible juste après, d'où l'erreur affichée côté signup ("entreprise"
-- non prise en compte).
--
-- Cette fonction crée l'entreprise ET le profil dans une transaction unique,
-- en tant que propriétaire de la fonction (security definer), donc sans
-- passer par les policies RLS pour ces deux inserts.
--
-- À exécuter dans l'éditeur SQL Supabase, après schema.sql.

create or replace function public.creer_entreprise_et_profil(p_nom_entreprise text, p_nom_utilisateur text)
returns entreprises
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entreprise entreprises;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Un profil existe déjà pour cet utilisateur.';
  end if;

  insert into entreprises (nom) values (p_nom_entreprise)
  returning * into v_entreprise;

  insert into profiles (id, entreprise_id, nom, role)
  values (auth.uid(), v_entreprise.id, p_nom_utilisateur, 'administrateur');

  return v_entreprise;
end;
$$;

grant execute on function public.creer_entreprise_et_profil(text, text) to authenticated;
