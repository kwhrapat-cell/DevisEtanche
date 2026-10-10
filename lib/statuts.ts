/**
 * Source unique de vérité pour tous les statuts de l'application.
 *
 * Badges, légendes, zones du plan, barres d'avancement : tout lit ce fichier.
 * Pour renommer un statut ou changer sa couleur, on le fait ici, une seule fois.
 * Les valeurs (clés) correspondent exactement à celles stockées dans Supabase.
 */

export type Ton = "neutre" | "info" | "succes" | "alerte" | "danger" | "violet";

export interface DefinitionStatut {
  label: string;
  ton: Ton;
}

export const STATUTS = {
  chantier: {
    en_preparation: { label: "En préparation", ton: "violet" },
    en_attente: { label: "En attente", ton: "neutre" },
    en_cours: { label: "En cours", ton: "alerte" },
    termine: { label: "Terminé", ton: "succes" },
  },
  zone: {
    en_attente: { label: "En attente", ton: "neutre" },
    en_cours: { label: "En cours", ton: "alerte" },
    termine: { label: "Terminée", ton: "succes" },
    probleme: { label: "Problème", ton: "danger" },
  },
  devis: {
    brouillon: { label: "Brouillon", ton: "neutre" },
    envoye: { label: "Envoyé", ton: "info" },
    accepte: { label: "Accepté", ton: "succes" },
    refuse: { label: "Refusé", ton: "danger" },
  },
  facture: {
    a_payer: { label: "À payer", ton: "info" },
    payee: { label: "Payée", ton: "succes" },
    annulee: { label: "Annulée", ton: "danger" },
  },
} as const satisfies Record<string, Record<string, DefinitionStatut>>;

export type Domaine = keyof typeof STATUTS;
export type StatutZone = keyof (typeof STATUTS)["zone"];

/** Ordre d'affichage des statuts de zone (menus, légendes). */
export const ORDRE_STATUTS_ZONE: StatutZone[] = ["en_attente", "en_cours", "termine", "probleme"];

/**
 * Classes Tailwind par ton. Les classes sont écrites en entier (jamais construites
 * dynamiquement) pour que Tailwind les détecte.
 *  - badge      : pastille de statut (fond teinté + texte foncé, lisible au soleil)
 *  - point      : petit rond de couleur (légendes, badges)
 *  - icone      : carré d'icône des cartes de stats
 *  - teinte     : fond + bordure d'une zone (cartes de zone, plan)
 *  - barre      : remplissage d'une barre d'avancement
 *  - hex        : couleur brute, pour le SVG du plan interactif
 */
export const TONS: Record<Ton, { badge: string; point: string; icone: string; teinte: string; barre: string; hex: string }> = {
  neutre: {
    badge: "bg-slate-100 text-slate-700",
    point: "bg-slate-400",
    icone: "bg-slate-100 text-slate-600",
    teinte: "bg-slate-50 border-slate-200",
    barre: "bg-slate-400",
    hex: "#94A3B8",
  },
  info: {
    badge: "bg-blue-50 text-blue-700",
    point: "bg-primaire",
    icone: "bg-blue-50 text-primaire",
    teinte: "bg-blue-50 border-blue-200",
    barre: "bg-primaire",
    hex: "#1F5FE0",
  },
  succes: {
    badge: "bg-emerald-50 text-emerald-700",
    point: "bg-vert",
    icone: "bg-emerald-50 text-emerald-600",
    teinte: "bg-emerald-50 border-emerald-200",
    barre: "bg-vert",
    hex: "#22C55E",
  },
  alerte: {
    badge: "bg-amber-50 text-amber-700",
    point: "bg-ambre",
    icone: "bg-amber-50 text-amber-600",
    teinte: "bg-amber-50 border-amber-200",
    barre: "bg-ambre",
    hex: "#F59E0B",
  },
  danger: {
    badge: "bg-red-50 text-red-700",
    point: "bg-rouge",
    icone: "bg-red-50 text-red-600",
    teinte: "bg-red-50 border-red-200",
    barre: "bg-rouge",
    hex: "#EF4444",
  },
  violet: {
    badge: "bg-violet-50 text-violet-700",
    point: "bg-violet-500",
    icone: "bg-violet-50 text-violet-600",
    teinte: "bg-violet-50 border-violet-200",
    barre: "bg-violet-500",
    hex: "#8B5CF6",
  },
};

/** Définition d'un statut, avec repli lisible si une valeur inconnue arrive de la base. */
export function infoStatut(domaine: Domaine, valeur: string | null | undefined): DefinitionStatut {
  const table = STATUTS[domaine] as Record<string, DefinitionStatut>;
  if (valeur && table[valeur]) return table[valeur];
  const texte = (valeur ?? "inconnu").replace(/_/g, " ");
  return { label: texte.charAt(0).toUpperCase() + texte.slice(1), ton: "neutre" };
}
