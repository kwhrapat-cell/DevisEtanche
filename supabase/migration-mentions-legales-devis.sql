-- Migration : mentions obligatoires sur les devis/factures exportés
-- (forme juridique, conditions de règlement, durée de validité du devis),
-- modifiables par chaque entreprise dans Paramètres > Coordonnées.
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor),
-- APRÈS migration-securite-entreprises.sql.

alter table entreprises
  add column if not exists forme_juridique text,
  add column if not exists conditions_reglement text,
  add column if not exists validite_devis_jours integer not null default 30;

-- migration-securite-entreprises.sql n'autorise l'écriture que colonne par
-- colonne : on ajoute ces trois nouvelles colonnes à la liste, sinon le
-- formulaire Paramètres > Coordonnées serait refusé.
grant update (forme_juridique, conditions_reglement, validite_devis_jours) on entreprises to authenticated;
