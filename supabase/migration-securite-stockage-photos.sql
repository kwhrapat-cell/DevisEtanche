-- Corrige l'absence de cloisonnement par entreprise sur l'upload de photos,
-- trouvée lors d'un audit de sécurité :
--
-- La policy "Upload photos par utilisateurs connectés" n'exigeait que
-- "to authenticated with check (bucket_id = 'photos')" — sans restriction de
-- chemin. Le bucket "photos" étant public en lecture, n'importe quel compte
-- authentifié (de n'importe quelle entreprise, l'inscription étant libre-
-- service) pouvait donc écrire sous le dossier de N'IMPORTE QUEL chantier
-- ("<chantier_id>/fichier", voir app/chantiers/[id]/PhotosSection.tsx),
-- y compris ceux d'une autre entreprise — abus possible du bucket comme
-- hébergement de fichiers arbitraires, ou pollution du dossier d'un chantier
-- qui n'est pas le sien.
--
-- Le correctif exige désormais que le premier segment du chemin corresponde
-- à un chantier réellement accessible à l'utilisateur (même logique que la
-- policy "Zones via chantier" de schema.sql).
--
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor), après
-- storage.sql.

create or replace function public.uuid_ou_null(p_texte text)
returns uuid
language plpgsql
immutable
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
    select id from chantiers
    where entreprise_id = public.entreprise_id_courante()
      and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
  )
);
