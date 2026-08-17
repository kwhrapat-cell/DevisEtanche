-- Migration : coordonnées entreprise (pour l'en-tête des devis/factures exportés)
-- + table factures (conversion d'un devis accepté en facture).
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor).

alter table entreprises
  add column if not exists adresse text,
  add column if not exists telephone text,
  add column if not exists email text,
  add column if not exists numero_identification text;

create table if not exists factures (
  id uuid primary key default uuid_generate_v4(),
  entreprise_id uuid references entreprises(id) on delete cascade,
  devis_id uuid references devis(id) unique,
  chantier_id uuid references chantiers(id),
  client_id uuid references clients(id),
  numero text not null,
  statut text check (statut in ('a_payer','payee','annulee')) default 'a_payer',
  lignes jsonb default '[]',
  total_ht numeric default 0,
  tva_pct numeric default 11,
  total_ttc numeric default 0,
  date_echeance date,
  created_at timestamptz default now()
);

alter table factures enable row level security;

drop policy if exists "Lecture factures entreprise" on factures;
create policy "Lecture factures entreprise" on factures for select
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));

drop policy if exists "Ecriture factures entreprise" on factures;
create policy "Ecriture factures entreprise" on factures for all
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));
