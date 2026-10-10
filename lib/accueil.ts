/**
 * Page d'accueil selon le rôle : les équipes de terrain (ouvrier, chef de chantier)
 * arrivent sur l'accueil « Mode Chantier » ; l'encadrement (conducteur de travaux,
 * administrateur) sur le tableau de bord. Les deux pages restent dans le menu.
 */
const ROLES_TERRAIN = ["ouvrier", "chef_de_chantier"];

export function pageAccueil(role: string | null | undefined): "/accueil" | "/dashboard" {
  return role && ROLES_TERRAIN.includes(role) ? "/accueil" : "/dashboard";
}
