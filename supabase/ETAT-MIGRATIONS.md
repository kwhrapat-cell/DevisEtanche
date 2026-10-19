# État des fichiers SQL en production

Supabase ne garde aucune trace des fichiers exécutés à la main dans le SQL Editor.
Ce tableau la tient à jour, en attendant le passage aux migrations suivies
(étape 2 de l'audit CPO/CTO). **Après chaque exécution, mettre la ligne à jour.**

Vérifié directement dans la base le 19 octobre 2026.

| Fichier | En production | Remarque |
| --- | --- | --- |
| schema.sql | Oui | Schéma de base |
| storage.sql | En partie | Dossier « photos » créé ; règle d'envoi ancienne version |
| seed.sql | — | Données de test, à ne pas exécuter en production |
| fix-creation-entreprise.sql | Oui | |
| fix-recursion-profils.sql | Oui | |
| fix-devise-entreprise.sql | Oui | Exécuté le 19/10/2026 |
| produits-etancheite.sql | Oui | Exécuté le 19/10/2026 (16 produits) |
| migration-calcul-interne-elements.sql | Oui | |
| migration-chantiers-updated-at.sql | Oui | |
| migration-etapes-chantier.sql | Oui | |
| migration-facturation.sql | Oui | |
| migration-invitations-soustraitance.sql | Oui | |
| migration-mentions-legales-devis.sql | Oui | |
| migration-plan-interactif.sql | Oui | |
| migration-securite-invitations.sql | Oui | |
| migration-demandes-pilote.sql | Oui | Exécuté le 19/10/2026 |
| migration-securite-entreprises.sql | Non | Remplacé : ne plus exécuter |
| migration-securite-stockage-photos.sql | Non | Remplacé : ne plus exécuter |
| migration-securite-consolidation.sql | **Non** | À exécuter après la French Tech |
