-- Consolidation de la sécurité — étape 1 de l'audit CPO/CTO (19 octobre 2026).
--
-- Remplace deux fichiers jamais exécutés en production (vérifié le 19/10/2026) :
--   - migration-securite-entreprises.sql  (sa liste de colonnes était devenue fausse :
--     elle aurait cassé l'enregistrement des mentions légales dans Paramètres)
--   - migration-securite-stockage-photos.sql
-- et resserre l'accès aux fonctions de la base.
--
-- À exécuter UNE fois dans Supabase → SQL Editor, après la démo French Tech,
-- puis faire les vérifications listées dans la PR (connexion, chantier, photo,
-- Paramètres, espace client, code sous-traitant). Tout est dans une transaction :
-- en cas d'erreur, rien n'est appliqué.

begin;

-- 1. Photos ------------------------------------------------------------------
-- Aujourd'hui, n'importe quel compte peut déposer un fichier dans le dossier de
-- n'importe quel chantier, et n'importe qui peut lister toutes les photos.
-- Après : envoi et liste réservés aux chantiers de sa propre entreprise. Les liens
-- publics des photos (devis, espace client) continuent de fonctionner : le
-- dossier reste public en lecture par lien.

create or replace function public.uuid_ou_null(p_texte text)
returns uuid
language plpgsql
immutable
set search_path = public
as $$
begin
  return p_texte::uuid;
exception when invalid_text_representation then
  return null;
end;
$$;

drop policy if exists "Upload photos par utilisateurs connectés" on storage.objects;
create policy "Upload photos par utilisateurs connectés"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'photos'
  and public.uuid_ou_null((storage.foldername(name))[1]) in (
    select id from public.chantiers
    where entreprise_id = public.entreprise_id_courante()
      and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
  )
);

drop policy if exists "Lecture publique des photos" on storage.objects;
drop policy if exists "Lecture des photos de son entreprise" on storage.objects;
create policy "Lecture des photos de son entreprise"
on storage.objects for select
to authenticated
using (
  bucket_id = 'photos'
  and public.uuid_ou_null((storage.foldername(name))[1]) in (
    select id from public.chantiers where entreprise_id = public.entreprise_id_courante()
  )
);

-- 2. Entreprises -------------------------------------------------------------
-- Aujourd'hui, un membre peut modifier lui-même le forfait et les identifiants
-- de paiement de son entreprise, et créer des entreprises hors inscription.
-- Après : seules les colonnes réellement modifiées par l'appli restent
-- modifiables ; le forfait n'est changé que par le serveur (paiement).

drop policy if exists "Creation entreprise a l'inscription" on public.entreprises;
revoke update on public.entreprises from authenticated;
grant update (
  nom, adresse, telephone, email, numero_identification,
  forme_juridique, conditions_reglement, validite_devis_jours,
  devise, libelle_taxe, taux_taxe_defaut, dernier_taux_horaire_interne
) on public.entreprises to authenticated;

-- 3. Fonctions de la base ----------------------------------------------------
-- Plus d'appel possible sans être connecté, sauf l'espace client (lien public).

revoke execute on function public.creer_entreprise_et_profil(text, text) from public, anon;
revoke execute on function public.rejoindre_chantier_via_code(text, text) from public, anon;
revoke execute on function public.my_entreprise_id() from public, anon;
revoke execute on function public.entreprise_id_courante() from public, anon;
revoke execute on function public.chantier_assigne_courant() from public, anon;

grant execute on function public.creer_entreprise_et_profil(text, text) to authenticated, service_role;
grant execute on function public.rejoindre_chantier_via_code(text, text) to authenticated, service_role;
grant execute on function public.my_entreprise_id() to authenticated, service_role;
grant execute on function public.entreprise_id_courante() to authenticated, service_role;
grant execute on function public.chantier_assigne_courant() to authenticated, service_role;

-- espace_client_chantier(uuid) reste appelable sans connexion : c'est le lien client.
-- chantier_horodater et chantier_toucher_parent sont des déclencheurs : la base
-- refuse de les appeler directement, rien à retirer. On fige seulement le chemin
-- de recherche du premier, comme pour les autres fonctions.
alter function public.chantier_horodater() set search_path = public;

commit;
