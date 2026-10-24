-- Migration : pertes et chutes réglables par entreprise (Paramètres > Pertes et chutes).
--
-- Chaque entreprise chiffre avec ses propres habitudes de pose : recouvrements des lés
-- (bicouche, PVC), pertes de résine, et chute à la coupe des rouleaux. Les valeurs par
-- défaut sont celles que le calculateur utilisait jusqu'ici : rien ne change tant que
-- l'entreprise ne les modifie pas.
--
-- À exécuter UNE fois dans Supabase → SQL Editor (projet devisetanche), de préférence
-- AVANT de fusionner la PR : l'appli sait fonctionner sans ces colonnes (elle reprend
-- alors les valeurs par défaut), mais le formulaire de Paramètres en a besoin pour
-- enregistrer. Tout est dans une transaction : en cas d'erreur, rien n'est appliqué.

begin;

alter table public.entreprises
  add column if not exists recouvrement_bicouche_pct numeric(4,1) not null default 8
    check (recouvrement_bicouche_pct between 0 and 50),
  add column if not exists recouvrement_pvc_pct numeric(4,1) not null default 6
    check (recouvrement_pvc_pct between 0 and 50),
  add column if not exists pertes_resine_pct numeric(4,1) not null default 5
    check (pertes_resine_pct between 0 and 50),
  add column if not exists chute_rouleaux_pct numeric(4,1) not null default 10
    check (chute_rouleaux_pct between 0 and 50);

-- migration-securite-consolidation.sql n'autorise l'écriture que colonne par colonne :
-- on ajoute ces quatre colonnes à la liste, sinon le formulaire serait refusé.
grant update (recouvrement_bicouche_pct, recouvrement_pvc_pct, pertes_resine_pct, chute_rouleaux_pct)
  on public.entreprises to authenticated;

commit;
