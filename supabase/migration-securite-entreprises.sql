-- Corrige deux policies RLS trop permissives sur "entreprises", trouvées lors
-- d'un audit de sécurité :
--
-- 1) "Creation entreprise a l'inscription" (INSERT) n'avait ni "to authenticated"
--    ni restriction de valeurs ("with check (true)") : elle s'appliquait donc
--    aussi au rôle anon, permettant à n'importe qui — même sans compte — de
--    créer des lignes arbitraires dans "entreprises" via un appel direct à
--    l'API REST (avec la clé anon publique). La création d'entreprise passe en
--    réalité toujours par la fonction security definer
--    creer_entreprise_et_profil() (qui contourne RLS), donc cette policy n'a
--    jamais été nécessaire pour l'inscription elle-même : on la supprime.
--
-- 2) "Modification entreprise membres" (UPDATE) n'avait aucune restriction de
--    colonnes : n'importe quel membre de l'entreprise pouvait modifier
--    "forfait", "stripe_customer_id" ou "stripe_subscription_id" directement
--    depuis le client (ex. console navigateur), en s'auto-attribuant un
--    forfait payant sans jamais passer par Stripe (app/api/checkout +
--    app/api/webhooks/stripe, seul flux prévu pour ces colonnes). RLS étant
--    limitée à la ligne (pas à la colonne), le correctif passe par un
--    GRANT/REVOKE ciblé : "authenticated" ne peut plus écrire que les
--    réglages "métier" (coordonnées, marché, dernier taux horaire interne) ;
--    forfait et les identifiants Stripe restent réservés au webhook, qui
--    utilise la clé service_role (contourne RLS et les GRANT de authenticated).
--
-- À exécuter dans l'éditeur SQL de Supabase (Project > SQL Editor), après
-- schema.sql, fix-devise-entreprise.sql et migration-calcul-interne-elements.sql
-- (la colonne dernier_taux_horaire_interne, incluse dans le GRANT ci-dessous,
-- est créée par ce dernier fichier).

drop policy if exists "Creation entreprise a l'inscription" on entreprises;

revoke update on entreprises from authenticated;
grant update (
  nom, adresse, telephone, email, numero_identification,
  devise, libelle_taxe, taux_taxe_defaut, dernier_taux_horaire_interne
) on entreprises to authenticated;
