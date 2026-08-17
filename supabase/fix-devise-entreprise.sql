-- Ajoute la devise et le libellé de taxe à l'entreprise, pour permettre à
-- l'app de gérer plusieurs marchés (XPF/TGC en Nouvelle-Calédonie,
-- EUR/TVA en France) au lieu d'un € et d'une "TVA" fixés en dur partout.
--
-- Les entreprises existantes basculent par défaut sur XPF/TGC (marché NC) ;
-- à changer depuis Paramètres pour une entreprise basée en France.
--
-- À exécuter dans l'éditeur SQL Supabase.

alter table entreprises
  add column if not exists devise text not null default 'XPF' check (devise in ('XPF', 'EUR'));

alter table entreprises
  add column if not exists libelle_taxe text not null default 'TGC';

alter table entreprises
  add column if not exists taux_taxe_defaut numeric not null default 11;
