-- Migration : invitations sous-traitance (code court pour inviter un
-- sous-traitant sur un chantier précis, avec accès restreint à ce seul
-- chantier). À exécuter dans l'éditeur SQL de Supabase, après schema.sql.

-- "on delete cascade" est volontaire : si le chantier est supprimé, le profil
-- restreint doit disparaître avec lui plutôt que de se retrouver avec
-- chantier_assigne_id nul, ce qui lèverait silencieusement sa restriction et
-- lui donnerait accès à toute l'entreprise.
alter table profiles add column if not exists chantier_assigne_id uuid references chantiers(id) on delete cascade;

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

-- Remplace les policies existantes pour tenir compte du chantier assigné :
-- un profil non restreint (chantier_assigne_courant() nul) garde l'accès
-- entreprise complet ; un sous-traitant restreint ne voit que son chantier,
-- son client, et jamais les devis/factures (marges).
drop policy if exists "Lecture entreprise" on chantiers;
create policy "Lecture entreprise" on chantiers for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
  );

drop policy if exists "Ecriture entreprise" on chantiers;
create policy "Ecriture entreprise" on chantiers for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

drop policy if exists "Lecture clients entreprise" on clients;
create policy "Lecture clients entreprise" on clients for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and (
      public.chantier_assigne_courant() is null
      or id = (select client_id from chantiers where id = public.chantier_assigne_courant())
    )
  );

drop policy if exists "Ecriture clients entreprise" on clients;
create policy "Ecriture clients entreprise" on clients for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

drop policy if exists "Lecture devis entreprise" on devis;
create policy "Lecture devis entreprise" on devis for select
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

drop policy if exists "Ecriture devis entreprise" on devis;
create policy "Ecriture devis entreprise" on devis for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

drop policy if exists "Lecture factures entreprise" on factures;
create policy "Lecture factures entreprise" on factures for select
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

drop policy if exists "Ecriture factures entreprise" on factures;
create policy "Ecriture factures entreprise" on factures for all
  using (entreprise_id = public.entreprise_id_courante() and public.chantier_assigne_courant() is null);

drop policy if exists "Zones via chantier" on zones;
create policy "Zones via chantier" on zones for all
  using (
    chantier_id in (
      select id from chantiers
      where entreprise_id = public.entreprise_id_courante()
        and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
    )
  );

drop policy if exists "Photos via chantier" on photos;
create policy "Photos via chantier" on photos for all
  using (
    chantier_id in (
      select id from chantiers
      where entreprise_id = public.entreprise_id_courante()
        and (public.chantier_assigne_courant() is null or id = public.chantier_assigne_courant())
    )
  );

create table if not exists invitations_soustraitance (
  id uuid primary key default uuid_generate_v4(),
  code text not null unique,
  chantier_id uuid not null references chantiers(id) on delete cascade,
  entreprise_id uuid not null references entreprises(id) on delete cascade,
  role_autorise text not null check (role_autorise in ('ouvrier','chef_de_chantier','conducteur_de_travaux')) default 'ouvrier',
  date_expiration timestamptz not null,
  utilise boolean not null default false,
  revoquee boolean not null default false,
  created_at timestamptz default now()
);

alter table invitations_soustraitance enable row level security;

drop policy if exists "Creation invitation administrateur" on invitations_soustraitance;
create policy "Creation invitation administrateur" on invitations_soustraitance for insert
  with check (
    entreprise_id = public.entreprise_id_courante()
    and chantier_id in (select id from chantiers where entreprise_id = public.entreprise_id_courante())
    and exists (select 1 from profiles where id = auth.uid() and role = 'administrateur')
  );

drop policy if exists "Lecture invitations entreprise" on invitations_soustraitance;
create policy "Lecture invitations entreprise" on invitations_soustraitance for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and exists (select 1 from profiles where id = auth.uid() and role = 'administrateur')
  );

drop policy if exists "Revocation invitation administrateur" on invitations_soustraitance;
create policy "Revocation invitation administrateur" on invitations_soustraitance for update
  using (
    entreprise_id = public.entreprise_id_courante()
    and exists (select 1 from profiles where id = auth.uid() and role = 'administrateur')
  )
  with check (entreprise_id = public.entreprise_id_courante());

-- Lecture par code : voir le commentaire dans schema.sql — une policy RLS
-- classique permettrait d'énumérer tous les codes valides de toutes les
-- entreprises, donc la validation passe par une fonction security definer.
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

create or replace function public.rejoindre_chantier_via_code(p_code text, p_nom text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation invitations_soustraitance;
  v_chantier chantiers;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Un profil existe déjà pour ce compte.';
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

  insert into profiles (id, entreprise_id, nom, role, chantier_assigne_id)
  values (auth.uid(), v_invitation.entreprise_id, p_nom, v_invitation.role_autorise, v_invitation.chantier_id);

  update invitations_soustraitance set utilise = true where id = v_invitation.id;

  return json_build_object('chantier_id', v_invitation.chantier_id, 'chantier_nom', v_chantier.nom);
end;
$$;

grant execute on function public.rejoindre_chantier_via_code(text, text) to authenticated;
