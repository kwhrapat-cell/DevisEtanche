-- Catalogue de référence multi-fabricants (Soprema, Sika, Axter)
-- À exécuter dans l'éditeur SQL de Supabase, après schema.sql.
--
-- Si une ancienne table produits_soprema existe déjà dans votre projet Supabase,
-- supprimez-la avant de relancer ce script : drop table if exists produits_soprema;

create extension if not exists pgcrypto;

create table if not exists produits_etancheite (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  fabricant text not null,           -- 'Soprema' | 'Sika' | 'Axter'
  gamme text not null,               -- 'bitumineux' | 'synthetique' | 'liquide' | 'accessoire'
  nom text not null,
  usage_type text not null,          -- 'premiere_couche' | 'finition' | 'anti_racine' | 'renfort' | 'primaire' | 'resine_liquide'
  pose text not null,                -- 'soudure_chalumeau' | 'soudure_air_chaud' | 'auto_adhesif' | 'froid_sans_flamme' | 'collage_froid' | 'fixation_mecanique'
  conditionnement text,
  surface_couverte_m2 numeric,       -- surface utile par rouleau, quand fixe (ex : 6x1m = 6)
  poids_kg numeric,
  consommation_min numeric,          -- pour primaires/résines liquides
  consommation_max numeric,
  unite_consommation text,           -- 'L/m2' | 'kg/m2'
  prix_indicatif_min_eur numeric,    -- ordre de grandeur HT constaté en métropole, hors transport NC
  prix_indicatif_max_eur numeric,
  prix_indicatif_conditionnement text,
  usage_recommande text,
  created_at timestamptz not null default now()
);

alter table produits_etancheite enable row level security;

create policy "Lecture catalogue produits pour utilisateurs connectés"
  on produits_etancheite for select
  to authenticated
  using (true);

insert into produits_etancheite
  (reference, fabricant, gamme, nom, usage_type, pose, conditionnement, surface_couverte_m2, poids_kg, consommation_min, consommation_max, unite_consommation, prix_indicatif_min_eur, prix_indicatif_max_eur, prix_indicatif_conditionnement, usage_recommande)
values
  -- SOPREMA
  ('SOPRALENE-BASE', 'Soprema', 'bitumineux', 'Sopralène Base', 'premiere_couche', 'soudure_chalumeau',
   'rouleau', null, null, null, null, null, null, null, null,
   'Première couche de relevé et partie courante d''un complexe bicouche (existe en version anti-racine)'),

  ('SOPRALENE-FLAM-180', 'Soprema', 'bitumineux', 'Sopralène Flam 180', 'finition', 'soudure_chalumeau',
   '6 x 1 m', 6, 25, null, null, null, null, null, null,
   'Couche de finition d''un complexe bicouche, armature polyester 180 g/m²'),

  ('SOPRALENE-FLAM-180-AR', 'Soprema', 'bitumineux', 'Sopralène Flam 180 AR', 'finition', 'soudure_chalumeau',
   'rouleau', null, null, null, null, null, null, null, null,
   'Finition autoprotégée (ardoise) ; version Cool Roof blanche disponible (SRI 59)'),

  ('SOPRALENE-FLAM-JARDIN', 'Soprema', 'bitumineux', 'Sopralène Flam Jardin', 'anti_racine', 'soudure_chalumeau',
   '5 x 1 m', 5, null, null, null, null, null, null, null,
   'Anti-racine pour jardinières, terrasses végétalisées, relevés associés et murs enterrés'),

  ('EQUERRE-RENFORT-SOPRALENE', 'Soprema', 'accessoire', 'Équerre de renfort Sopralène', 'renfort', 'soudure_chalumeau',
   'rouleau', null, null, null, null, null, null, null, null,
   'Renfort dédié aux relevés en équerre (angle bas de relevé)'),

  ('ELASTOCOL-600', 'Soprema', 'accessoire', 'Élastocol 600', 'primaire', 'collage_froid',
   'bidon 1 / 5 / 30 L', null, null, 0.25, 0.80, 'L/m2', null, null, null,
   'Enduit d''imprégnation à froid (EIF), avant pose de membranes autocollantes'),

  ('ALSAN-FLASHING', 'Soprema', 'liquide', 'Alsan Flashing', 'resine_liquide', 'froid_sans_flamme',
   'bidon 2,5 / 5 / 15 kg', null, null, 0.5, 1.6, 'kg/m2', 95, 185, 'bidon 5 kg (métropole, hors transport NC)',
   'Résine liquide monocomposante pour relevés, points singuliers, jonctions, plots (climatiseurs, panneaux solaires)'),

  ('ALSAN-VOILE-FLASHING', 'Soprema', 'accessoire', 'Alsan Voile Flashing', 'renfort', 'froid_sans_flamme',
   'rouleau 10 x 0,10 m / 50 x 0,10 m', null, null, null, null, null, null, null, null,
   'Voile de renfort textile associé à Alsan Flashing sur jonctions et angles'),

  ('FLAG', 'Soprema', 'synthetique', 'Flag', 'finition', 'soudure_air_chaud',
   'rouleau', null, null, null, null, null, null, null, null,
   'Membrane synthétique TPO/PVC soudable à l''air chaud, peu inflammable'),

  -- SIKA
  ('SARNAFIL-G410', 'Sika', 'synthetique', 'Sarnafil G410', 'finition', 'soudure_air_chaud',
   'rouleau', null, null, null, null, null, null, null, null,
   'Membrane PVC monocouche 1,5 mm, armature voile de verre, haute stabilité dimensionnelle'),

  ('SIKALASTIC-M640', 'Sika', 'liquide', 'Sikalastic M 640', 'resine_liquide', 'froid_sans_flamme',
   'bidon', null, null, 1.5, 2.0, 'kg/m2', null, null, null,
   'Résine polyuréthane monocomposante à froid pour toitures, structures à nombreux détails, sous carrelage de balcons/terrasses'),

  -- AXTER
  ('AXTER-TOPFIX-FMP-GRESE', 'Axter', 'bitumineux', 'Topfix FMP Grésé', 'premiere_couche', 'fixation_mecanique',
   '7 x 1 m', 7, null, null, null, null, null, null, null,
   'Première couche fixée mécaniquement, liant SBS armature polyester ; base des systèmes bicouches Topfix/Topflam'),

  ('AXTER-TOPAZ-25', 'Axter', 'bitumineux', 'Topaz 25', 'finition', 'soudure_chalumeau',
   'rouleau', null, null, null, null, null, null, null, null,
   'Seconde couche soudée en plein sur Topfix — finition du système bicouche'),

  ('AXTER-PAXALUMIN', 'Axter', 'bitumineux', 'Paxalumin', 'finition', 'soudure_chalumeau',
   '8 x 1 m', 8, null, null, null, null, null, null, null,
   'Chape bitume autoprotégée par feuille d''aluminium 8/100e'),

  ('AXTER-FORCE-3000-TRAFIC', 'Axter', 'bitumineux', 'Force 3000 Trafic', 'anti_racine', 'soudure_chalumeau',
   'rouleau', null, null, null, null, null, null, null, null,
   'Seconde couche anti-racines pour toitures végétalisées (système Cityflor) et murs enterrés'),

  ('AXTER-HYPERFLEX', 'Axter', 'liquide', 'Hyperflex', 'resine_liquide', 'froid_sans_flamme',
   'bidon 2,5 L', null, null, null, null, null, null, null, null,
   'Résine liquide PVC pour points singuliers et relevés, disponible en gris et gris anthracite')
on conflict (reference) do nothing;
