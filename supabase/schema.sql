-- DevisEtanche / ÉtanchéiCopilot — schéma MVP
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor)

create extension if not exists "uuid-ossp";

create table entreprises (
  id uuid primary key default uuid_generate_v4(),
  nom text not null,
  forfait text check (forfait in ('decouverte','artisan','pro','entreprise')) default 'decouverte',
  -- Marché de l'entreprise : conditionne la devise et le libellé de taxe affichés
  -- sur les devis (XPF/TGC en Nouvelle-Calédonie, EUR/TVA en France).
  devise text not null check (devise in ('XPF', 'EUR')) default 'XPF',
  libelle_taxe text not null default 'TGC',
  taux_taxe_defaut numeric not null default 11,
  -- Coordonnées affichées sur les devis et factures exportés (au lieu du nom
  -- de l'application) : adresse postale, contact, identifiant professionnel
  -- (SIRET en France, RIDET en Nouvelle-Calédonie...).
  adresse text,
  telephone text,
  email text,
  numero_identification text,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz default now()
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  entreprise_id uuid references entreprises(id) on delete cascade,
  nom text not null,
  role text not null check (role in ('ouvrier','chef_de_chantier','conducteur_de_travaux','administrateur','client','donneur_ordre')),
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
  -- Rattachement optionnel à un maître d'ouvrage (compte "donneur_ordre") qui
  -- suit ce chantier en lecture seule. entreprise_id (ci-dessus) reste la
  -- colonne "propriétaire" (entreprise exécutante) : elle est NULL tant
  -- qu'aucune entreprise n'a rejoint un chantier créé par un donneur d'ordre
  -- (voir rejoindre_chantier_via_code plus bas).
  donneur_ordre_id uuid references profiles(id),
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

create table factures (
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

create table photos (
  id uuid primary key default uuid_generate_v4(),
  chantier_id uuid references chantiers(id) on delete cascade,
  zone_id uuid references zones(id),
  url text not null,
  legende text,
  created_at timestamptz default now()
);

-- Sous-traitance : un profil dont chantier_assigne_id est renseigné (voir table
-- invitations_soustraitance plus bas) a rejoint l'entreprise via un code
-- d'invitation. Son accès est alors restreint à ce seul chantier — pas de
-- visibilité sur les autres chantiers, les autres clients, ni sur les devis/
-- factures (qui portent les marges) — voir les policies ci-dessous. "on delete
-- cascade" (et non "set null") est volontaire : si le chantier est supprimé,
-- le profil restreint doit disparaître avec lui plutôt que de se retrouver
-- avec chantier_assigne_id nul, ce qui lèverait silencieusement sa restriction
-- et lui donnerait accès à toute l'entreprise.
alter table profiles add column chantier_assigne_id uuid references chantiers(id) on delete cascade;

-- Row Level Security : chaque entreprise ne voit que ses propres données
alter table clients enable row level security;
alter table chantiers enable row level security;
alter table zones enable row level security;
alter table devis enable row level security;
alter table factures enable row level security;
alter table photos enable row level security;
alter table profiles enable row level security;

-- entreprise_id_courante() / chantier_assigne_courant() : fonctions security
-- definer utilisées par les policies ci-dessous. Une policy qui interroge
-- directement "profiles" dans sa propre sous-requête (comme l'ancienne version
-- de "Lecture equipe entreprise") déclenche une récursion infinie ("infinite
-- recursion detected in policy for relation profiles") car Postgres doit
-- réappliquer la RLS de la table à sa propre sous-requête. En passant par une
-- fonction security definer (qui s'exécute avec les droits du propriétaire,
-- donc sans RLS), on casse la boucle.
create or replace function public.entreprise_id_courante()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select entreprise_id from profiles where id = auth.uid();
$$;

grant execute on function public.entreprise_id_courante() to authenticated;

create or replace function public.chantier_assigne_courant()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select chantier_assigne_id from profiles where id = auth.uid();
$$;

grant execute on function public.chantier_assigne_courant() to authenticated;

-- chantiers / zones / photos : un profil non restreint (chantier_assigne_courant()
-- nul) voit tous les chantiers de son entreprise ; un sous-traitant restreint ne
-- voit que le chantier désigné par son invitation.
create policy "Lecture entreprise" on chantiers for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
  );
create policy "Ecriture entreprise" on chantiers for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

-- Donneur d'ordre (maître d'ouvrage) : crée un chantier minimal (entreprise_id
-- encore NULL — la policy "Ecriture entreprise" ci-dessus l'interdirait) et le
-- suit ensuite en lecture seule, jamais en écriture. Isolation inter-
-- entreprises garantie par construction : ces policies ne portent que sur
-- donneur_ordre_id, jamais sur entreprise_id, donc n'accordent jamais l'accès
-- à l'entreprise exécutante elle-même ni à une autre entreprise du même
-- donneur d'ordre (voir "Lecture entreprise"/"Ecriture entreprise" ci-dessus,
-- inchangées).
create policy "Creation chantier donneur d'ordre" on chantiers for insert
  with check (
    donneur_ordre_id = auth.uid()
    and entreprise_id is null
    and exists (select 1 from profiles where id = auth.uid() and role = 'donneur_ordre')
  );
create policy "Lecture chantiers donneur d'ordre" on chantiers for select
  using (donneur_ordre_id = auth.uid());

-- clients : un sous-traitant restreint ne voit que le client du chantier qui lui
-- est assigné (utile pour l'adresse/le contact chantier), jamais les autres.
create policy "Lecture clients entreprise" on clients for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and (
      public.chantier_assigne_courant() is null
      or id = (select client_id from chantiers where id = public.chantier_assigne_courant())
    )
  );
create policy "Ecriture clients entreprise" on clients for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

-- devis / factures : portent les marges (prix, totaux) — un sous-traitant
-- restreint n'y a jamais accès, même pour son propre chantier.
create policy "Lecture devis entreprise" on devis for select
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);
create policy "Ecriture devis entreprise" on devis for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

create policy "Lecture factures entreprise" on factures for select
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);
create policy "Ecriture factures entreprise" on factures for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

create policy "Zones via chantier" on zones for all
  using (
    chantier_id in (
      select id from chantiers
      where entreprise_id = public.entreprise_id_courante()
        and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
    )
  );

create policy "Photos via chantier" on photos for all
  using (
    chantier_id in (
      select id from chantiers
      where entreprise_id = public.entreprise_id_courante()
        and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
    )
  );

-- Donneur d'ordre : lecture seule des zones/photos de son propre portefeuille.
-- Policies "for select" additives (OR'd avec les policies "for all"
-- ci-dessus, seules à autoriser l'écriture) — jamais de policy équivalente
-- sur devis/factures, qui restent hors de portée du donneur d'ordre.
create policy "Lecture zones donneur d'ordre" on zones for select
  using (chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid()));

create policy "Lecture photos donneur d'ordre" on photos for select
  using (chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid()));

create policy "Profil propre" on profiles for select using (id = auth.uid());
create policy "Lecture equipe entreprise" on profiles for select
  using (entreprise_id = public.entreprise_id_courante());
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

-- Création de compte : entreprise + profil dans une même transaction, en tant
-- que propriétaire de la fonction (security definer). Nécessaire car juste
-- après l'insertion de l'entreprise, aucun profil ne la relie encore à
-- auth.uid() : la relire via la policy "Lecture entreprise membres" échouerait.
-- p_role accepte 'administrateur' (entreprise exécutante, cas par défaut) ou
-- 'donneur_ordre' (maître d'ouvrage — portefeuille en lecture + codes,
-- jamais de devis) : les deux réutilisent la même entreprise "conteneur" et
-- la même transaction, seul le rôle stocké sur le profil diffère.
create or replace function public.creer_entreprise_et_profil(
  p_nom_entreprise text,
  p_nom_utilisateur text,
  p_role text default 'administrateur'
)
returns entreprises
language plpgsql
security definer
set search_path = public
as $$
declare
  v_entreprise entreprises;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié.';
  end if;

  if p_role not in ('administrateur', 'donneur_ordre') then
    raise exception 'Rôle invalide.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Un profil existe déjà pour cet utilisateur.';
  end if;

  insert into entreprises (nom) values (p_nom_entreprise)
  returning * into v_entreprise;

  insert into profiles (id, entreprise_id, nom, role)
  values (auth.uid(), v_entreprise.id, p_nom_utilisateur, p_role);

  return v_entreprise;
end;
$$;

grant execute on function public.creer_entreprise_et_profil(text, text, text) to authenticated;

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

-- Invitations sous-traitance : un compte Entreprise/Administrateur génère un
-- code court à durée de vie limitée pour inviter un sous-traitant sur UN
-- chantier précis. À la validation, le sous-traitant rejoint l'entreprise
-- avec un profil dont chantier_assigne_id restreint son accès (voir policies
-- plus haut sur chantiers/clients/devis/factures/zones/photos).
create table invitations_soustraitance (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  chantier_id uuid not null references chantiers(id) on delete cascade,
  entreprise_id uuid not null references entreprises(id) on delete cascade,
  -- Uniquement pour type_emetteur = 'entreprise' (accès restreint à un rôle) :
  -- un code émis par un donneur d'ordre rattache l'entreprise entière avec un
  -- accès complet, donc n'a pas de rôle associé (null).
  role_autorise text check (role_autorise is null or role_autorise in ('ouvrier','chef_de_chantier','conducteur_de_travaux')) default 'ouvrier',
  -- 'entreprise' (cas existant, compte Administrateur -> sous-traitant) ou
  -- 'donneur_ordre' (maître d'ouvrage -> entreprise exécutante existante).
  type_emetteur text not null check (type_emetteur in ('entreprise', 'donneur_ordre')) default 'entreprise',
  date_expiration timestamptz not null,
  utilise boolean not null default false,
  -- Annulation manuelle par l'entreprise (bouton "Annuler l'invitation"), distincte
  -- de "utilise" pour pouvoir afficher un message différent au sous-traitant.
  revoquee boolean not null default false,
  created_at timestamptz default now()
);

alter table invitations_soustraitance enable row level security;

-- Création : réservée à un compte Administrateur, pour un chantier de sa
-- propre entreprise.
create policy "Creation invitation administrateur" on invitations_soustraitance for insert
  with check (
    entreprise_id = public.entreprise_id_courante()
    and chantier_id in (select id from chantiers where entreprise_id = public.entreprise_id_courante())
    and exists (select 1 from profiles where id = auth.uid() and role = 'administrateur')
  );

-- Création : un donneur d'ordre peut émettre un code pour un chantier de son
-- propre portefeuille (jamais pour celui d'un autre donneur d'ordre).
-- entreprise_id porte alors l'entreprise du donneur d'ordre lui-même (qui
-- émet le code), pas celle qui l'utilisera ensuite.
create policy "Creation invitation donneur d'ordre" on invitations_soustraitance for insert
  with check (
    type_emetteur = 'donneur_ordre'
    and role_autorise is null
    and entreprise_id = public.entreprise_id_courante()
    and chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid())
    and exists (select 1 from profiles where id = auth.uid() and role = 'donneur_ordre')
  );

-- Lecture/révocation de la liste des codes : réservée aux administrateurs et
-- donneurs d'ordre, chacun sur les codes de sa propre entreprise/portefeuille
-- (pas de listing possible pour un sous-traitant, qui ne peut valider un code
-- que via la fonction invitation_par_code ci-dessous).
create policy "Lecture invitations entreprise" on invitations_soustraitance for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and exists (select 1 from profiles where id = auth.uid() and role in ('administrateur', 'donneur_ordre'))
  );

create policy "Revocation invitation administrateur" on invitations_soustraitance for update
  using (
    entreprise_id = public.entreprise_id_courante()
    and exists (select 1 from profiles where id = auth.uid() and role in ('administrateur', 'donneur_ordre'))
  )
  with check (entreprise_id = public.entreprise_id_courante());

-- Validation d'un code par un sous-traitant : une policy RLS classique sur la
-- table ne peut pas distinguer "je connais le code" de "je liste toutes les
-- lignes valides" (RLS filtre des lignes, pas la forme de la requête) — un
-- utilisateur pourrait donc énumérer tous les codes valides de toutes les
-- entreprises. On expose donc la lecture par code via une fonction security
-- definer (même principe que espace_client_chantier ci-dessus) : seul celui
-- qui connaît déjà le code exact obtient un résultat.
create or replace function public.invitation_par_code(p_code text)
returns json
language sql
security definer
stable
set search_path = public
as $$
  select json_build_object(
    'chantier_id', i.chantier_id,
    'chantier_nom', c.nom,
    'entreprise_nom', e.nom,
    'role_autorise', i.role_autorise
  )
  from invitations_soustraitance i
  join chantiers c on c.id = i.chantier_id
  join entreprises e on e.id = i.entreprise_id
  where i.code = upper(trim(p_code))
    and not i.utilise
    and not i.revoquee
    and i.date_expiration > now()
    and c.statut <> 'termine';
$$;

grant execute on function public.invitation_par_code(text) to authenticated;

-- Validation + rattachement effectif : transaction atomique (verrou de ligne
-- via "for update") pour éviter qu'un même code soit consommé deux fois en cas
-- de double soumission. Un chantier passé au statut "termine" invalide le code
-- même s'il n'est pas expiré : la vérification se fait ici au moment de l'usage
-- plutôt que via un déclencheur, pour toujours refléter le statut réel du chantier.
-- Généralise rejoindre_chantier_via_code() : un code émis par un donneur
-- d'ordre est validé par un compte administrateur DÉJÀ EXISTANT (à
-- l'inverse du cas sous-traitant, où le compte est justement créé à la
-- volée par cette même fonction) et transfère la propriété du chantier
-- (entreprise_id) à son entreprise, sans jamais toucher à donneur_ordre_id
-- ni à l'historique du chantier (zones, photos, statut, token_public).
create or replace function public.rejoindre_chantier_via_code(p_code text, p_nom text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation invitations_soustraitance;
  v_chantier chantiers;
  v_profil_existant profiles;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié.';
  end if;

  select * into v_invitation from invitations_soustraitance
    where code = upper(trim(p_code)) for update;

  if not found then
    raise exception 'Code invalide.';
  end if;

  if v_invitation.revoquee then
    raise exception 'Ce code a été annulé par l''entreprise.';
  end if;

  if v_invitation.utilise then
    raise exception 'Ce code a déjà été utilisé.';
  end if;

  if v_invitation.date_expiration <= now() then
    raise exception 'Ce code a expiré.';
  end if;

  select * into v_chantier from chantiers where id = v_invitation.chantier_id;

  if v_chantier.statut = 'termine' then
    raise exception 'Ce chantier est terminé, le code n''est plus valide.';
  end if;

  select * into v_profil_existant from profiles where id = auth.uid();

  if v_invitation.type_emetteur = 'donneur_ordre' then
    if v_profil_existant is null then
      raise exception 'Connectez-vous avec le compte administrateur de votre entreprise avant de saisir ce code.';
    end if;
    if v_profil_existant.role <> 'administrateur' then
      raise exception 'Seul un compte administrateur peut rattacher son entreprise à ce chantier.';
    end if;
    if v_chantier.entreprise_id is not null then
      raise exception 'Ce chantier a déjà une entreprise exécutante rattachée.';
    end if;

    update chantiers set entreprise_id = v_profil_existant.entreprise_id where id = v_chantier.id;
    update invitations_soustraitance set utilise = true where id = v_invitation.id;

    return json_build_object('chantier_id', v_chantier.id, 'chantier_nom', v_chantier.nom);
  end if;

  -- Cas existant : sous-traitance, compte créé à la volée avec accès
  -- restreint à ce seul chantier.
  if v_profil_existant is not null then
    raise exception 'Un profil existe déjà pour ce compte.';
  end if;

  insert into profiles (id, entreprise_id, nom, role, chantier_assigne_id)
  values (auth.uid(), v_invitation.entreprise_id, p_nom, v_invitation.role_autorise, v_invitation.chantier_id);

  update invitations_soustraitance set utilise = true where id = v_invitation.id;

  return json_build_object('chantier_id', v_invitation.chantier_id, 'chantier_nom', v_chantier.nom);
end;
$$;

grant execute on function public.rejoindre_chantier_via_code(text, text) to authenticated;
