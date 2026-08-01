-- Données de démonstration — à exécuter APRÈS schema.sql et après avoir créé
-- votre premier compte via /signup (pour connaître votre entreprise_id et
-- profile_id, visibles dans Supabase > Table Editor > entreprises / profiles).
--
-- Remplacer <ENTREPRISE_ID> ci-dessous par l'id réel de votre entreprise.

insert into clients (entreprise_id, nom, type, ville) values
  ('<ENTREPRISE_ID>', 'Syndicat Les Pins', 'syndic', 'Nouméa'),
  ('<ENTREPRISE_ID>', 'M. Dupont', 'particulier', 'Dumbéa');

insert into chantiers (entreprise_id, client_id, nom, ville, statut, surface_totale_m2, avancement_pct, systeme, date_debut)
select
  '<ENTREPRISE_ID>',
  (select id from clients where nom = 'Syndicat Les Pins' and entreprise_id = '<ENTREPRISE_ID>'),
  'Résidence Les Pins', 'Nouméa', 'en_cours', 1250, 68, 'bicouche', current_date - interval '20 days'
union all
select
  '<ENTREPRISE_ID>',
  (select id from clients where nom = 'M. Dupont' and entreprise_id = '<ENTREPRISE_ID>'),
  'Garage particulier', 'Dumbéa', 'en_preparation', 180, 10, 'pvc', current_date - interval '3 days';

insert into zones (chantier_id, nom, surface_m2, statut, avancement_pct)
select id, 'Zone A', 320, 'termine', 100 from chantiers where nom = 'Résidence Les Pins'
union all
select id, 'Zone B', 280, 'en_cours', 75 from chantiers where nom = 'Résidence Les Pins';
