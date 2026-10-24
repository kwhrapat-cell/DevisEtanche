-- Compte de démonstration DevisEtanche : trois chantiers fictifs, prêts à montrer.
--
--   1. Résidence Les Cocotiers, bâtiment B : bicouche 820 m², EN COURS, plan de toiture
--      avec 5 zones de couleur (terminée, en cours, problème, en attente), devis accepté,
--      lien d'espace client à montrer.
--   2. Villa Païta : résine 85 m², TERMINÉ, devis accepté et facture payée.
--   3. Entrepôt Dumbéa : PVC 1 200 m², EN PRÉPARATION, devis envoyé.
--
-- MODE D'EMPLOI
--   a. Dans l'appli, « Créer un compte » avec une adresse réservée à la démo, et un nom
--      d'entreprise qui contient « Démo » (ex. « Étanchéité Démo NC »).
--   b. Ci-dessous, remplacer ADRESSE-DU-COMPTE-DEMO par cette adresse, et si tu veux,
--      les prix (XPF hors taxes) par tes prix réels.
--   c. Supabase → projet devisetanche → SQL Editor → coller tout le fichier → Run.
--   d. Se connecter avec le compte démo, et ajouter 3 ou 4 vraies photos de chantier
--      sur les zones de la Résidence Les Cocotiers (avant / pendant / après).
--
-- SÉCURITÉ : le script refuse de tourner si le nom de l'entreprise ne contient pas
-- « Démo » ou « Demo ». Il efface puis recrée les clients, chantiers, devis et factures
-- de CETTE entreprise seulement : on peut le relancer pour remettre la démo à neuf
-- (les photos ajoutées entre-temps disparaissent alors de l'appli).
-- Données de démonstration : à ne pas compter dans ETAT-MIGRATIONS.md.

do $$
declare
  -- a. Adresse e-mail du compte démo
  v_email text := 'ADRESSE-DU-COMPTE-DEMO';

  -- b. Prix unitaires en XPF hors taxes. Par défaut : les prix de repli de l'appli
  --    (ordre de grandeur métropole converti) ; remplace-les par tes prix calédoniens.
  v_prix_premiere_couche_m2 numeric := 1850;
  v_prix_finition_m2 numeric := 1850;
  v_prix_resine_m2 numeric := 1850;
  v_prix_pvc_m2 numeric := 1850;
  v_prix_primaire_l numeric := 1014;
  v_prix_evacuation_u numeric := 7757;
  v_prix_fixation_u numeric := 95;
  -- Main d'œuvre au m² : laisse « null » pour ne pas ajouter de ligne de pose.
  v_prix_pose_m2 numeric := null;

  v_entreprise uuid;
  v_nom_entreprise text;
  v_client_syndic uuid;
  v_client_particulier uuid;
  v_client_sci uuid;
  v_chantier_a uuid;
  v_chantier_b uuid;
  v_chantier_c uuid;
  v_zone uuid;
  v_devis_b uuid;
  v_lignes jsonb;
  v_ht numeric;
begin
  if v_email = 'ADRESSE-DU-COMPTE-DEMO' then
    raise exception 'Remplace ADRESSE-DU-COMPTE-DEMO (en haut du script) par l''adresse e-mail du compte démo.';
  end if;

  select p.entreprise_id into v_entreprise
  from public.profiles p
  join auth.users u on u.id = p.id
  where lower(u.email) = lower(trim(v_email));

  if v_entreprise is null then
    raise exception 'Aucun compte trouvé avec l''adresse %. Crée d''abord le compte démo dans l''appli (« Créer un compte »).', v_email;
  end if;

  select nom into v_nom_entreprise from public.entreprises where id = v_entreprise;
  if v_nom_entreprise !~* 'd[ée]mo' then
    raise exception 'Par sécurité, le nom de l''entreprise (« % ») doit contenir « Démo » : ce script efface ses données avant de les recréer.', v_nom_entreprise;
  end if;

  -- Remise à zéro des données de l'entreprise démo (dans cet ordre à cause des liens)
  delete from public.factures where entreprise_id = v_entreprise;
  delete from public.devis where entreprise_id = v_entreprise;
  delete from public.chantiers where entreprise_id = v_entreprise; -- zones, éléments, photos suivent
  delete from public.clients where entreprise_id = v_entreprise;

  -- Coordonnées affichées sur les devis : Nouvelle-Calédonie, XPF, TGC 11 %
  update public.entreprises set
    adresse = 'Nouméa, Nouvelle-Calédonie',
    forme_juridique = 'SARL (entreprise de démonstration)',
    conditions_reglement = '30 % à la commande, solde à la réception des travaux',
    validite_devis_jours = 30,
    devise = 'XPF',
    libelle_taxe = 'TGC',
    taux_taxe_defaut = 11
  where id = v_entreprise;

  -- Clients fictifs
  insert into public.clients (entreprise_id, nom, type, ville, created_at)
  values (v_entreprise, 'Syndic de la Résidence Les Cocotiers', 'syndic', 'Nouméa', now() - interval '40 days')
  returning id into v_client_syndic;
  insert into public.clients (entreprise_id, nom, type, ville, created_at)
  values (v_entreprise, 'M. et Mme Démo', 'particulier', 'Païta', now() - interval '90 days')
  returning id into v_client_particulier;
  insert into public.clients (entreprise_id, nom, type, ville, created_at)
  values (v_entreprise, 'SCI Bord de Mer', 'entreprise', 'Dumbéa', now() - interval '6 days')
  returning id into v_client_sci;

  ---------------------------------------------------------------------------
  -- 1. Résidence Les Cocotiers : bicouche 820 m², en cours, plan avec zones
  ---------------------------------------------------------------------------
  insert into public.chantiers (entreprise_id, client_id, nom, ville, statut, etape, systeme, surface_totale_m2,
                                avancement_pct, date_debut, date_fin_prevue, plan_url, created_at)
  values (v_entreprise, v_client_syndic, 'Résidence Les Cocotiers — terrasse bât. B', 'Nouméa', 'en_cours', 'etancheite',
          'bicouche', 820, 66, current_date - 18, current_date + 12, '/demo/plan-toiture-demo.svg', now() - interval '32 days')
  returning id into v_chantier_a;

  -- Zones placées sur public/demo/plan-toiture-demo.svg (fractions de la largeur et de la hauteur)
  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, contour, created_at)
  values (v_chantier_a, 'Terrasse Nord', 253, 'termine', 100,
          '[[0.08,0.1143],[0.54,0.1143],[0.54,0.4286],[0.08,0.4286]]', now() - interval '20 days')
  returning id into v_zone;
  insert into public.elements_zone (zone_id, type, description, quantite, unite) values
    (v_zone, 'releve', 'Relevés sur acrotère', 68, 'ml'),
    (v_zone, 'plot', 'Plots de climatiseurs', 6, 'unite');

  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, contour, created_at)
  values (v_chantier_a, 'Terrasse Sud', 420, 'en_cours', 60,
          '[[0.08,0.4714],[0.92,0.4714],[0.92,0.7571],[0.08,0.7571]]', now() - interval '20 days')
  returning id into v_zone;
  insert into public.elements_zone (zone_id, type, description, quantite, unite) values
    (v_zone, 'releve', 'Relevés sur acrotère', 104, 'ml'),
    (v_zone, 'plot', 'Plots de panneaux solaires', 4, 'unite');

  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, contour, created_at)
  values (v_chantier_a, 'Local technique', 82.5, 'probleme', 40,
          '[[0.70,0.1143],[0.92,0.1143],[0.92,0.3286],[0.70,0.3286]]', now() - interval '19 days')
  returning id into v_zone;
  insert into public.elements_zone (zone_id, type, description, quantite, unite) values
    (v_zone, 'skydome', 'Skydome à traiter avant reprise du support', 1, 'unite'),
    (v_zone, 'releve', 'Relevés sur acrotère', 37, 'ml');

  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, contour, created_at)
  values (v_chantier_a, 'Ascenseur', 22.5, 'en_attente', 0,
          '[[0.57,0.1286],[0.67,0.1286],[0.67,0.2571],[0.57,0.2571]]', now() - interval '19 days')
  returning id into v_zone;
  insert into public.elements_zone (zone_id, type, description, quantite, unite) values
    (v_zone, 'releve', 'Relevés du toit de la cage d''ascenseur', 19, 'ml');

  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, contour, created_at)
  values (v_chantier_a, 'Jardinières', 42, 'en_attente', 0,
          '[[0.08,0.7857],[0.92,0.7857],[0.92,0.8143],[0.08,0.8143]]', now() - interval '19 days')
  returning id into v_zone;
  insert into public.elements_zone (zone_id, type, description, quantite, unite) values
    (v_zone, 'jardiniere', 'Jardinières en rive sud', 42, 'ml');

  -- Devis : quantités du calculateur (820 m², 228 ml de relevés, bicouche, pertes 8 %)
  v_lignes := jsonb_build_array(
    jsonb_build_object('designation', 'Soprema — Sopralène Base (SOPRALENE-BASE) — première couche', 'quantite', 885.6, 'unite', 'm²',
      'prix_unitaire', v_prix_premiere_couche_m2, 'produit_id', (select id from public.produits_etancheite where reference = 'SOPRALENE-BASE')),
    jsonb_build_object('designation', 'Soprema — Sopralène Flam 180 AR (SOPRALENE-FLAM-180-AR) — finition', 'quantite', 885.6, 'unite', 'm²',
      'prix_unitaire', v_prix_finition_m2, 'produit_id', (select id from public.produits_etancheite where reference = 'SOPRALENE-FLAM-180-AR')),
    jsonb_build_object('designation', 'Relevés d''étanchéité (2 couches)', 'quantite', 68.4, 'unite', 'm²', 'prix_unitaire', v_prix_finition_m2),
    jsonb_build_object('designation', 'Soprema — Élastocol 600 (ELASTOCOL-600) — primaire', 'quantite', 275.9, 'unite', 'L',
      'prix_unitaire', v_prix_primaire_l, 'produit_id', (select id from public.produits_etancheite where reference = 'ELASTOCOL-600')),
    jsonb_build_object('designation', 'Évacuations eaux pluviales', 'quantite', 3, 'unite', 'u.', 'prix_unitaire', v_prix_evacuation_u)
  );
  if v_prix_pose_m2 is not null then
    v_lignes := v_lignes || jsonb_build_array(jsonb_build_object(
      'designation', 'Main d''œuvre — pose du complexe bicouche', 'quantite', 820, 'unite', 'm²', 'prix_unitaire', v_prix_pose_m2));
  end if;
  select round(sum((l->>'quantite')::numeric * (l->>'prix_unitaire')::numeric)) into v_ht from jsonb_array_elements(v_lignes) l;
  insert into public.devis (entreprise_id, chantier_id, client_id, numero, statut, lignes, total_ht, tva_pct, total_ttc, created_at)
  values (v_entreprise, v_chantier_a, v_client_syndic, 'DEV-2026-1041', 'accepte', v_lignes, v_ht, 11, round(v_ht * 1.11),
          now() - interval '35 days');

  ---------------------------------------------------------------------------
  -- 2. Villa Païta : résine 85 m², terminé, devis accepté et facture payée
  ---------------------------------------------------------------------------
  insert into public.chantiers (entreprise_id, client_id, nom, ville, statut, etape, systeme, surface_totale_m2,
                                avancement_pct, date_debut, date_fin_prevue, created_at)
  values (v_entreprise, v_client_particulier, 'Villa Païta — toit-terrasse', 'Païta', 'termine', 'reception',
          'resine', 85, 100, current_date - 62, current_date - 50, now() - interval '82 days')
  returning id into v_chantier_b;

  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, created_at)
  values (v_chantier_b, 'Toit-terrasse', 85, 'termine', 100, now() - interval '60 days')
  returning id into v_zone;
  insert into public.elements_zone (zone_id, type, description, quantite, unite) values
    (v_zone, 'releve', 'Relevés en résine sur acrotère', 37, 'ml');

  -- Quantités du calculateur (85 m², 37 ml, résine, pertes 5 %)
  v_lignes := jsonb_build_array(
    jsonb_build_object('designation', 'Sika — Sikalastic M 640 (SIKALASTIC-M640) — résine d''étanchéité', 'quantite', 89.25, 'unite', 'm²',
      'prix_unitaire', v_prix_resine_m2, 'produit_id', (select id from public.produits_etancheite where reference = 'SIKALASTIC-M640')),
    jsonb_build_object('designation', 'Relevés d''étanchéité en résine', 'quantite', 5.55, 'unite', 'm²', 'prix_unitaire', v_prix_resine_m2),
    jsonb_build_object('designation', 'Primaire d''accrochage', 'quantite', 23.7, 'unite', 'L', 'prix_unitaire', v_prix_primaire_l),
    jsonb_build_object('designation', 'Évacuations eaux pluviales', 'quantite', 2, 'unite', 'u.', 'prix_unitaire', v_prix_evacuation_u)
  );
  if v_prix_pose_m2 is not null then
    v_lignes := v_lignes || jsonb_build_array(jsonb_build_object(
      'designation', 'Main d''œuvre — application de la résine', 'quantite', 85, 'unite', 'm²', 'prix_unitaire', v_prix_pose_m2));
  end if;
  select round(sum((l->>'quantite')::numeric * (l->>'prix_unitaire')::numeric)) into v_ht from jsonb_array_elements(v_lignes) l;
  insert into public.devis (entreprise_id, chantier_id, client_id, numero, statut, lignes, total_ht, tva_pct, total_ttc, created_at)
  values (v_entreprise, v_chantier_b, v_client_particulier, 'DEV-2026-0987', 'accepte', v_lignes, v_ht, 11, round(v_ht * 1.11),
          now() - interval '80 days')
  returning id into v_devis_b;
  insert into public.factures (entreprise_id, devis_id, chantier_id, client_id, numero, statut, lignes, total_ht, tva_pct, total_ttc,
                               date_echeance, created_at)
  values (v_entreprise, v_devis_b, v_chantier_b, v_client_particulier, 'FAC-2026-0993', 'payee', v_lignes, v_ht, 11, round(v_ht * 1.11),
          current_date - 18, now() - interval '48 days');

  ---------------------------------------------------------------------------
  -- 3. Entrepôt Dumbéa : PVC 1 200 m², en préparation, devis envoyé
  ---------------------------------------------------------------------------
  insert into public.chantiers (entreprise_id, client_id, nom, ville, statut, etape, systeme, surface_totale_m2,
                                avancement_pct, date_debut, date_fin_prevue, created_at)
  values (v_entreprise, v_client_sci, 'Entrepôt Dumbéa — toiture bac acier', 'Dumbéa', 'en_preparation', 'preparation',
          'pvc', 1200, 0, current_date + 20, current_date + 50, now() - interval '5 days')
  returning id into v_chantier_c;

  insert into public.zones (chantier_id, nom, surface_m2, statut, avancement_pct, created_at) values
    (v_chantier_c, 'Versant Est', 600, 'en_attente', 0, now() - interval '4 days'),
    (v_chantier_c, 'Versant Ouest', 600, 'en_attente', 0, now() - interval '4 days');

  -- Quantités du calculateur (1 200 m², 140 ml, PVC fixé mécaniquement, pertes 6 %), sans primaire
  v_lignes := jsonb_build_array(
    jsonb_build_object('designation', 'Sika — Sarnafil G410 (SARNAFIL-G410) — membrane PVC', 'quantite', 1272, 'unite', 'm²',
      'prix_unitaire', v_prix_pvc_m2, 'produit_id', (select id from public.produits_etancheite where reference = 'SARNAFIL-G410')),
    jsonb_build_object('designation', 'Relevés d''étanchéité', 'quantite', 21, 'unite', 'm²', 'prix_unitaire', v_prix_pvc_m2),
    jsonb_build_object('designation', 'Fixations mécaniques', 'quantite', 4200, 'unite', 'u.', 'prix_unitaire', v_prix_fixation_u),
    jsonb_build_object('designation', 'Évacuations eaux pluviales', 'quantite', 4, 'unite', 'u.', 'prix_unitaire', v_prix_evacuation_u)
  );
  if v_prix_pose_m2 is not null then
    v_lignes := v_lignes || jsonb_build_array(jsonb_build_object(
      'designation', 'Main d''œuvre — pose de la membrane PVC', 'quantite', 1200, 'unite', 'm²', 'prix_unitaire', v_prix_pose_m2));
  end if;
  select round(sum((l->>'quantite')::numeric * (l->>'prix_unitaire')::numeric)) into v_ht from jsonb_array_elements(v_lignes) l;
  insert into public.devis (entreprise_id, chantier_id, client_id, numero, statut, lignes, total_ht, tva_pct, total_ttc, created_at)
  values (v_entreprise, v_chantier_c, v_client_sci, 'DEV-2026-1102', 'envoye', v_lignes, v_ht, 11, round(v_ht * 1.11),
          now() - interval '3 days');

  raise notice 'Démo prête pour « % » : 3 clients, 3 chantiers, 8 zones, 3 devis, 1 facture.', v_nom_entreprise;
end $$;
