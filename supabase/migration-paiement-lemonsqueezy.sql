-- Paiement des forfaits par Lemon Squeezy (remplace Stripe, qui refuse les
-- entreprises calédoniennes).
--
-- Ajoute à chaque entreprise trois informations remplies UNIQUEMENT par le
-- serveur (webhook app/api/webhooks/lemonsqueezy) :
--   - paiement_abonnement_id : numéro de l'abonnement chez Lemon Squeezy ;
--   - paiement_client_id     : numéro du client chez Lemon Squeezy ;
--   - paiement_statut        : état de l'abonnement (active, cancelled, expired…).
--
-- Sécurité : aucune ligne « grant update » pour ces colonnes. Depuis
-- migration-securite-consolidation.sql, une session utilisateur ne peut
-- modifier que les colonnes listées une à une ; ces trois-là, comme le forfait,
-- ne sont donc modifiables que par le serveur.
--
-- Les anciennes colonnes stripe_customer_id et stripe_subscription_id restent
-- en place (vides) : rien n'est supprimé.
--
-- À exécuter UNE fois dans Supabase → SQL Editor, AVANT de renseigner les
-- réglages Lemon Squeezy dans Vercel. Tout est dans une transaction : en cas
-- d'erreur, rien n'est appliqué.

begin;

alter table public.entreprises
  add column if not exists paiement_abonnement_id text,
  add column if not exists paiement_client_id text,
  add column if not exists paiement_statut text;

create index if not exists entreprises_paiement_abonnement_idx
  on public.entreprises (paiement_abonnement_id);

commit;

-- Vérification (doit afficher les 3 colonnes) :
-- select column_name from information_schema.columns
-- where table_schema = 'public' and table_name = 'entreprises' and column_name like 'paiement_%';
