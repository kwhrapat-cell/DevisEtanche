-- Corrige l'absence de protection anti brute-force sur la validation des
-- codes d'invitation sous-traitant, trouvée lors d'un audit de sécurité :
--
-- - rejoindre_chantier_via_code(p_code, p_nom) ne consomme un compte que si le
--   code est valide : un compte authentifié sans profil (gratuit à créer, en
--   libre-service) pouvait donc rappeler cette fonction en boucle, sans
--   aucune limite, pour essayer des milliers de codes. On ajoute une limite
--   de 5 tentatives par compte sur une fenêtre glissante de 15 minutes,
--   indépendamment du code essayé.
--
-- - invitation_par_code(p_code) était une fonction "stable" (sans effet de
--   bord, ne consommait jamais le code) accessible à tout compte authentifié
--   et renvoyant chantier_nom/entreprise_nom en cas de succès : un oracle de
--   brute-force gratuit et illimité, jamais appelé nulle part dans
--   l'application (code mort). Supprimée plutôt que rate-limitée à son tour.
--
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor), après
-- migration-invitations-soustraitance.sql.

drop function if exists public.invitation_par_code(text);

-- Une ligne par tentative, jamais accessible directement (RLS activée sans
-- aucune policy) — seule la fonction security definer ci-dessous y écrit et
-- y lit, avec les droits du propriétaire.
create table if not exists tentatives_code_invitation (
  id bigint generated always as identity primary key,
  utilisateur_id uuid not null references auth.users(id) on delete cascade,
  tentee_at timestamptz not null default now()
);

create index if not exists idx_tentatives_code_invitation_utilisateur
  on tentatives_code_invitation (utilisateur_id, tentee_at);

alter table tentatives_code_invitation enable row level security;

create or replace function public.rejoindre_chantier_via_code(p_code text, p_nom text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invitation invitations_soustraitance;
  v_chantier chantiers;
  v_tentatives_recentes int;
begin
  if auth.uid() is null then
    raise exception 'Utilisateur non authentifié.';
  end if;

  if exists (select 1 from profiles where id = auth.uid()) then
    raise exception 'Un profil existe déjà pour ce compte.';
  end if;

  select count(*) into v_tentatives_recentes
    from tentatives_code_invitation
    where utilisateur_id = auth.uid() and tentee_at > now() - interval '15 minutes';

  if v_tentatives_recentes >= 5 then
    raise exception 'Trop de tentatives — réessayez dans quelques minutes.';
  end if;

  insert into tentatives_code_invitation (utilisateur_id) values (auth.uid());

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
