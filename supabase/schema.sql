-- DevisEtanche / ÉtanchéiCopilot — schéma MVP
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor)

create extension if not exists "uuid-ossp";

create table entreprises (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  forfait text check (forfait in ('decouverte','artisan','pro','entreprise')) default 'decouverte',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  entreprise_id uuid references entreprises(id) on delete cascade,
  nom text not null,
  role text not null check (role in ('ouvrier','chef_de_chantier','conducteur_de_travaux','administrateur','client')),
  created_at timestamptz default now()
);

create table clients (
  id uuid primary key default uuid_generate_v4(),
  entreprise_id uuid references entreprises(id) on delete cascade,
  nom text not null,
  type text check (type in ('syndic','particulier','entreprise')) default 'particulier',
  ville text,
  email text,
  telephone text,
  created_at timestamptz default now()
);

create table chantiers (
  id uuid primary key default uuid_generate_v4(),
  entreprise_id uuid references entreprises(id) on delete cascade,
  client_id uuid references clients(id),
  nom text not null,
  ville text,
  statut text check (statut in ('en_preparation','en_cours','termine','en_attente')) default 'en_preparation',
  surface_totale_m2 numeric default 0,
  avancement_pct numeric default 0,
  systeme text check (systeme in ('bicouche','pvc','resine')),
  date_debut date,
  date_fin_prevue date,
  token_public uuid unique default uuid_generate_v4(),
  created_at timestamptz default now()
);

create table zones (
  id uuid primary key default uuid_generate_v4(),
  chantier_id uuid references chantiers(id) on delete cascade,
  nom text not null,
  surface_m2 numeric default 0,
  statut text check (statut in ('termine','en_cours','en_attente','probleme')) default 'en_attente',
  avancement_pct numeric default 0,
  created_at timestamptz default now()
);

create table devis (
  id uuid primary key default uuid_generate_v4(),
  entreprise_id uuid references entreprises(id) on delete cascade,
  chantier_id uuid references chantiers(id),
  client_id uuid references clients(id),
  numero text not null,
  statut text check (statut in ('brouillon','envoye','accepte','refuse')) default 'brouillon',
  lignes jsonb default '[]',
  total_ht numeric default 0,
  tva_pct numeric default 11,
  total_ttc numeric default 0,
  created_at timestamptz default now()
);

create table photos (
  id uuid primary key default uuid_generate_v4(),
  chantier_id uuid references chantiers(id) on delete cascade,
  zone_id uuid references zones(id),
  url text not null,
  legende text,
  created_at timestamptz default now()
);

-- Row Level Security : chaque entreprise ne voit que ses propres données
alter table clients enable row level security;
alter table chantiers enable row level security;
alter table zones enable row level security;
alter table devis enable row level security;
alter table photos enable row level security;
alter table profiles enable row level security;

create policy "Lecture entreprise" on chantiers for select
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));
create policy "Ecriture entreprise" on chantiers for all
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));

create policy "Lecture clients entreprise" on clients for select
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));
create policy "Ecriture clients entreprise" on clients for all
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));

create policy "Lecture devis entreprise" on devis for select
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));
create policy "Ecriture devis entreprise" on devis for all
  using (entreprise_id in (select entreprise_id from profiles where id = auth.uid()));

create policy "Zones via chantier" on zones for all
  using (chantier_id in (select id from chantiers where entreprise_id in (select entreprise_id from profiles where id = auth.uid())));

create policy "Photos via chantier" on photos for all
  using (chantier_id in (select id from chantiers where entreprise_id in (select entreprise_id from profiles where id = auth.uid())));

create policy "Profil propre" on profiles for select using (id = auth.uid());
create policy "Lecture equipe entreprise" on profiles for select
  using (entreprise_id in (select entreprise_id from profiles p2 where p2.id = auth.uid()));
create policy "Creation profil propre" on profiles for insert with check (id = auth.uid());

-- entreprises : lecture/écriture réservées aux membres de l'entreprise.
-- L'INSERT reste ouvert (nécessaire à la création de compte /signup, avant
-- qu'un profil n'existe encore) — à restreindre davantage en production.
alter table entreprises enable row level security;
create policy "Lecture entreprise membres" on entreprises for select
  using (id in (select entreprise_id from profiles where id = auth.uid()));
create policy "Modification entreprise membres" on entreprises for update
  using (id in (select entreprise_id from profiles where id = auth.uid()));
create policy "Creation entreprise a l'inscription" on entreprises for insert with check (true);

-- Espace client public : fonction sécurisée exposant uniquement les champs
-- nécessaires, appelée via un lien contenant le token (aucune authentification
-- requise côté client). Le token étant un UUID non devinable, seul celui qui
-- possède le lien peut consulter l'avancement.
create or replace function public.espace_client_chantier(p_token uuid)
returns json
language sql
security definer
set search_path = public
as $$
  select json_build_object(
    'chantier', (
      select json_build_object(
        'nom', nom, 'ville', ville, 'statut', statut,
        'avancement_pct', avancement_pct, 'surface_totale_m2', surface_totale_m2,
        'systeme', systeme
      ) from chantiers where token_public = p_token
    ),
    'zones', (
      select coalesce(json_agg(json_build_object('nom', nom, 'avancement_pct', avancement_pct, 'statut', statut)), '[]'::json)
      from zones where chantier_id = (select id from chantiers where token_public = p_token)
    ),
    'photos', (
      select coalesce(json_agg(json_build_object('url', url) order by created_at desc), '[]'::json)
      from (select url, created_at from photos where chantier_id = (select id from chantiers where token_public = p_token) order by created_at desc limit 12) p
    )
  );
$$;

grant execute on function public.espace_client_chantier(uuid) to anon, authenticated;
