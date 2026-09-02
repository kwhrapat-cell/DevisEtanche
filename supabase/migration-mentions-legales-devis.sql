-- Migration : mentions obligatoires sur les devis/factures exportés
-- (forme juridique, conditions de règlement, durée de validité du devis).
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor).

alter table entreprises
  add column if not exists forme_juridique text,
  add column if not exists conditions_reglement text,
  add column if not exists validite_devis_jours integer not null default 30;
