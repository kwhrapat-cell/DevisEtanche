-- Rattachement Donneur d'ordre <-> Entreprises sous-traitantes.
--
-- Permet à un maître d'ouvrage (compte "donneur_ordre") de suivre plusieurs
-- chantiers en portefeuille et de générer lui-même un code rattachant une
-- entreprise exécutante existante à un chantier précis, en complément du
-- système de code existant (compte Entreprise -> sous-traitant individuel).
--
-- À exécuter dans l'éditeur SQL de Supabase, après schema.sql. La fonction
-- donneur_ordre_elements_zone() (section 6) dépend en plus de la table
-- elements_zone créée par migration-calcul-interne-elements.sql : exécuter
-- cette dernière avant si ce n'est pas déjà fait.

-- 1) Rôle de compte --------------------------------------------------------
alter table profiles drop constraint if exists profiles_role_check;
alter table profiles add constraint profiles_role_check
  check (role in ('ouvrier','chef_de_chantier','conducteur_de_travaux','administrateur','client','donneur_ordre'));

-- 2) Chantiers : rattachement optionnel à un donneur d'ordre ---------------
-- entreprise_id reste la colonne "propriétaire" (entreprise exécutante),
-- inchangée pour tous les chantiers existants. Elle est désormais NULL tant
-- qu'aucune entreprise n'a rejoint un chantier créé par un donneur d'ordre —
-- voir rejoindre_chantier_via_code() section 8.
alter table chantiers
  add column if not exists donneur_ordre_id uuid references profiles(id);

-- Un donneur d'ordre crée son propre chantier (entreprise_id encore NULL) :
-- la policy "Ecriture entreprise" existante l'interdit (elle exige
-- entreprise_id = entreprise_id_courante(), jamais NULL). Policy additive,
-- INSERT uniquement.
drop policy if exists "Creation chantier donneur d'ordre" on chantiers;
create policy "Creation chantier donneur d'ordre" on chantiers for insert
  with check (
    donneur_ordre_id = auth.uid()
    and entreprise_id is null
    and exists (select 1 from profiles where id = auth.uid() and role = 'donneur_ordre')
  );

-- Lecture du portefeuille : un donneur d'ordre voit uniquement les chantiers
-- qu'il a créés/suit, en lecture seule (aucune policy UPDATE/DELETE ajoutée
-- pour ce rôle — il ne modifie jamais un chantier directement).
drop policy if exists "Lecture chantiers donneur d'ordre" on chantiers;
create policy "Lecture chantiers donneur d'ordre" on chantiers for select
  using (donneur_ordre_id = auth.uid());

-- Isolation inter-entreprises : deux entreprises rattachées à des chantiers
-- différents du même donneur d'ordre ne se voient jamais entre elles — la
-- policy "Lecture entreprise" existante reste scopée sur entreprise_id =
-- entreprise_id_courante() (donc sur chantier_id via l'entreprise réellement
-- exécutante), jamais sur donneur_ordre_id : aucune modification nécessaire
-- ici, cette isolation est déjà garantie par construction.

-- 3) Zones / photos : lecture seule pour le donneur d'ordre ---------------
-- Policies additives (uniquement "for select" : les policies "for all"
-- existantes, elles, restent seules à autoriser l'écriture, réservée à
-- l'entreprise exécutante). Jamais de policy équivalente sur devis/factures :
-- le donneur d'ordre n'a et n'aura jamais accès aux prix/marges.
drop policy if exists "Lecture zones donneur d'ordre" on zones;
create policy "Lecture zones donneur d'ordre" on zones for select
  using (chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid()));

drop policy if exists "Lecture photos donneur d'ordre" on photos;
create policy "Lecture photos donneur d'ordre" on photos for select
  using (chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid()));

-- elements_zone porte des colonnes de marge interne (temps_estime_heures,
-- taux_horaire_interne, prix_materiaux, prix_final) — voir
-- migration-calcul-interne-elements.sql. RLS ne filtrant que des lignes,
-- jamais des colonnes, on n'accorde donc PAS de policy générale au donneur
-- d'ordre sur cette table (elle resterait entièrement lisible, prix compris).
-- Voir donneur_ordre_elements_zone() section 6 pour l'équivalent sans prix.

-- 4) Invitations : type d'émetteur -----------------------------------------
alter table invitations_soustraitance
  add column if not exists type_emetteur text
    check (type_emetteur in ('entreprise', 'donneur_ordre'))
    default 'entreprise';

-- role_autorise ne s'applique qu'au cas "entreprise -> sous-traitant" (accès
-- restreint à un rôle précis) : un code émis par un donneur d'ordre rattache
-- l'entreprise entière avec un accès complet au chantier, donc n'a pas de
-- rôle associé.
alter table invitations_soustraitance alter column role_autorise drop not null;
alter table invitations_soustraitance drop constraint if exists invitations_soustraitance_role_autorise_check;
alter table invitations_soustraitance add constraint invitations_soustraitance_role_autorise_check
  check (role_autorise is null or role_autorise in ('ouvrier','chef_de_chantier','conducteur_de_travaux'));

-- Génération : un donneur d'ordre peut émettre un code pour un chantier de
-- son propre portefeuille (jamais pour le chantier d'un autre donneur
-- d'ordre). entreprise_id porte alors l'entreprise du donneur d'ordre
-- lui-même (qui émet le code), pas celle qui l'utilisera — cohérent avec la
-- policy de lecture ci-dessous.
drop policy if exists "Creation invitation donneur d'ordre" on invitations_soustraitance;
create policy "Creation invitation donneur d'ordre" on invitations_soustraitance for insert
  with check (
    type_emetteur = 'donneur_ordre'
    and role_autorise is null
    and entreprise_id = public.entreprise_id_courante()
    and chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid())
    and exists (select 1 from profiles where id = auth.uid() and role = 'donneur_ordre')
  );

-- Lecture/révocation existantes : élargies au rôle donneur_ordre (même
-- logique que pour un administrateur, chacun sur ses propres codes émis).
drop policy if exists "Lecture invitations entreprise" on invitations_soustraitance;
create policy "Lecture invitations entreprise" on invitations_soustraitance for select
  using (
    entreprise_id = public.entreprise_id_courante()
    and exists (select 1 from profiles where id = auth.uid() and role in ('administrateur', 'donneur_ordre'))
  );

drop policy if exists "Revocation invitation administrateur" on invitations_soustraitance;
create policy "Revocation invitation administrateur" on invitations_soustraitance for update
  using (
    entreprise_id = public.entreprise_id_courante()
    and exists (select 1 from profiles where id = auth.uid() and role in ('administrateur', 'donneur_ordre'))
  )
  with check (entreprise_id = public.entreprise_id_courante());

-- 5) Signup : compte donneur d'ordre ---------------------------------------
-- Généralise creer_entreprise_et_profil() avec un rôle au choix. On
-- supprime d'abord l'ancienne signature à 2 arguments : "create or replace"
-- avec un paramètre en plus créerait une fonction surchargée distincte
-- plutôt que de la remplacer, ce qui rendrait tout appel à 2 arguments
-- ambigu entre les deux signatures.
drop function if exists public.creer_entreprise_et_profil(text, text);

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

-- 6) Élément de zone en lecture seule, sans les colonnes de prix ----------
-- Même principe que espace_client_chantier() : une fonction security definer
-- qui ne sélectionne explicitement que les colonnes non sensibles, plutôt
-- qu'une policy RLS (qui ne peut filtrer que des lignes, jamais des
-- colonnes). Dépend de elements_zone (migration-calcul-interne-elements.sql),
-- absente de schema.sql — voir l'en-tête de ce fichier.
create or replace function public.donneur_ordre_elements_zone(p_chantier_id uuid)
returns json
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(json_agg(json_build_object(
    'id', e.id, 'zone_id', e.zone_id, 'type', e.type,
    'description', e.description, 'quantite', e.quantite, 'unite', e.unite
  )), '[]'::json)
  from elements_zone e
  join zones z on z.id = e.zone_id
  where z.chantier_id = p_chantier_id
    and p_chantier_id in (select id from chantiers where donneur_ordre_id = auth.uid());
$$;

grant execute on function public.donneur_ordre_elements_zone(uuid) to authenticated;

-- 7) Rattachement d'une entreprise exécutante existante via code ----------
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
