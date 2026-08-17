-- Corrige une récursion infinie sur les policies RLS de "profiles".
--
-- La policy "Lecture equipe entreprise" interrogeait directement "profiles"
-- dans sa propre sous-requête (select entreprise_id from profiles where
-- id = auth.uid()). Or Postgres doit réappliquer la RLS de "profiles" à
-- cette sous-requête elle-même, ce qui réévalue la même policy, qui relance
-- la même sous-requête, etc. : "infinite recursion detected in policy for
-- relation profiles". Résultat concret : TOUTE lecture de "profiles" par un
-- utilisateur connecté échoue silencieusement (l'app reçoit une erreur et
-- l'interprète comme "profil introuvable"), même quand la ligne existe bel
-- et bien en base.
--
-- Le correctif : passer par une fonction security definer, qui s'exécute
-- avec les droits du propriétaire (donc sans RLS), pour casser la boucle.
--
-- À exécuter dans l'éditeur SQL Supabase.

create or replace function public.entreprise_id_courante()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select entreprise_id from profiles where id = auth.uid();
$$;

grant execute on function public.entreprise_id_courante() to authenticated;

drop policy if exists "Lecture equipe entreprise" on profiles;
create policy "Lecture equipe entreprise" on profiles for select
  using (entreprise_id = public.entreprise_id_courante());
