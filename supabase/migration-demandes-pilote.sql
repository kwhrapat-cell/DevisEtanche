-- Demandes « entreprise pilote » envoyées depuis la page d'accueil publique
-- (formulaire en bas de https://devis-etanche.vercel.app).
--
-- À exécuter une fois dans Supabase → SQL Editor.
--
-- Seul le serveur de l'appli écrit dans cette table (route /api/demande-pilote, clé
-- secrète). RLS est activé SANS aucune policy : aucun utilisateur de l'appli, connecté
-- ou non, ne peut la lire ni la modifier. Pour consulter les demandes :
-- Supabase → Table Editor → demandes_pilote.
--
-- « source » indique d'où vient le prospect quand le lien le précise
-- (?source=linkedin, ?source=devis, ?source=espace-client…).

create table if not exists public.demandes_pilote (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  nom text not null check (char_length(nom) between 2 and 120),
  entreprise text not null check (char_length(entreprise) between 2 and 160),
  contact text not null check (char_length(contact) between 5 and 160),
  message text check (message is null or char_length(message) <= 2000),
  source text check (source is null or char_length(source) <= 80),
  -- À cocher à la main une fois le prospect rappelé.
  traitee boolean not null default false
);

alter table public.demandes_pilote enable row level security;
revoke all on public.demandes_pilote from anon, authenticated;
