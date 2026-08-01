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

create policy "Upload photos par utilisateurs connectés"
on storage.objects for insert
to authenticated
with check (bucket_id = 'photos');

create policy "Suppression de ses propres photos"
on storage.objects for delete
to authenticated
using (bucket_id = 'photos' and owner = auth.uid());
