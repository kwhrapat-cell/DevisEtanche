-- Stockage des photos de chantier — à exécuter APRÈS schema.sql.
--
-- 1) Créer le bucket depuis Supabase Dashboard > Storage > New bucket
--    Nom : photos — Public bucket : activé (lecture publique, écriture protégée
--    par les policies ci-dessous). Un bucket privé + URLs signées est
--    préférable en production ; le bucket public simplifie le MVP.
--
-- 2) Exécuter ces policies dans SQL Editor (elles s'appliquent à storage.objects) :

create policy "Lecture publique des photos"
on storage.objects for select
using (bucket_id = 'photos');

-- Convertit en uuid si possible, renvoie null sinon (plutôt que de faire
-- échouer toute la requête) — utilisé ci-dessous pour valider le premier
-- segment du chemin ("<chantier_id>/...", voir PhotosSection.tsx) sans
-- planter la policy sur un chemin malformé.
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

-- Upload : le bucket étant public en lecture, une policy "to authenticated"
-- seule ne suffit pas — n'importe quel compte (n'importe quelle entreprise,
-- l'inscription étant libre-service) pourrait sinon écrire sous le dossier
-- de N'IMPORTE QUEL chantier, y compris ceux d'autres entreprises. On exige
-- donc que le premier segment du chemin ("<chantier_id>/fichier") corresponde
-- à un chantier réellement accessible à l'utilisateur — même logique que la
-- policy "Zones via chantier" de schema.sql.
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

create policy "Suppression de ses propres photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'photos' and owner = auth.uid());
