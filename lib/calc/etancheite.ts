/**
 * Moteur de calcul DevisEtanche — étanchéité de toiture-terrasse.
 *
 * Les coefficients ci-dessous sont des valeurs de chantier usuelles,
 * cohérentes avec les principes des DTU 43.1 (support maçonnerie),
 * 43.3 (bac acier), 43.4 (support bois) et NF DTU 43.6 (résines liquides).
 * Ce ne sont PAS des valeurs réglementaires figées : chaque projet doit
 * être validé par un bureau d'études / le DTU applicable au support réel.
 * Le but de ce module est d'obtenir une estimation fiable en quelques
 * secondes, pas de remplacer une étude d'exécution.
 */

export type Systeme = "bicouche" | "pvc" | "resine";

export interface CalculInput {
  /** Surface de toiture en plan, en m² */
  surface: number;
  /** Périmètre en mètres linéaires. Si absent, estimé depuis la surface. */
  perimetre?: number;
  /** Hauteur moyenne des relevés d'étanchéité (acrotères, murs), en m */
  hauteurReleves?: number;
  /** Système d'étanchéité posé */
  systeme: Systeme;
  /** Pose d'un isolant thermique sous étanchéité */
  isolation: boolean;
  /** Épaisseur de l'isolant en mm, si isolation = true */
  epaisseurIsolant?: number;
  /** Protection lourde (gravillon / dalles) au lieu d'autoprotection */
  protectionLourde?: boolean;
  /** Épaisseur de la couche de gravillons en cm, si protection lourde (5 cm par défaut) */
  epaisseurGravillonsCm?: number;
  /**
   * Pertes de recouvrement propres à l'entreprise, en fraction (0,08 = 8 %). Absentes ou
   * hors limites (0 à 50 %) : la valeur usuelle du système s'applique.
   */
  pertes?: number;
}

export interface CalculResult {
  /** Nombre de couches de membrane : 2 en bicouche, 1 sinon. */
  nombreCouches: number;
  surfaceMembrane: number; // m², pour UNE couche de partie courante
  surfaceReleves: number; // m², pour UNE couche de relevé
  metresReleves: number; // ml
  primaireAccrochage: number; // L
  fixationsMecaniques: number; // unités (0 si système collé/soudé plein)
  evacuationsEP: number; // unités
  isolantSurface: number; // m²
  isolantVolume: number; // m³
  protectionGravillon: number; // kg (si protection lourde)
  detailsSysteme: { nom: string; reference: string; pertes: number };
}

const SYSTEMES: Record<Systeme, { nom: string; reference: string; couches: number; pertes: number; primaireLm2: number; fixationsU_m2: number }> = {
  bicouche: {
    nom: "Bicouche bitumineuse soudée",
    reference: "DTU 43.1 / 43.4",
    couches: 2, // première couche + couche de finition, en partie courante comme en relevé
    pertes: 0.08, // recouvrements 2 lés x ~10cm
    primaireLm2: 0.3,
    fixationsU_m2: 0, // soudée, pas de fixation mécanique
  },
  pvc: {
    nom: "Membrane PVC monocouche",
    reference: "DTU 43.3 (bac acier) / Avis Technique",
    couches: 1,
    pertes: 0.06,
    primaireLm2: 0, // membrane PVC fixée mécaniquement : pas de primaire (confirmé par Patrice, 25/10/2026)
    fixationsU_m2: 3.5, // fixation mécanique moyenne courant/rive confondus
  },
  resine: {
    nom: "Résine liquide (SEL)",
    reference: "NF DTU 43.6 / Avis Technique",
    couches: 1,
    pertes: 0.05,
    primaireLm2: 0.25,
    fixationsU_m2: 0,
  },
};

/** Masse volumique apparente de gravillons roulés, en kg/m³ (ordre de grandeur : 1 500 à 1 700). */
export const MASSE_VOLUMIQUE_GRAVILLONS_KG_M3 = 1600;

/**
 * Réglages de pertes d'une entreprise, en pourcentage (Paramètres > Pertes et chutes).
 * Chaque entreprise chiffre avec ses propres habitudes de pose.
 */
export interface ReglagesPertes {
  /** Recouvrements des lés en bicouche, en % de la surface */
  recouvrementBicouchePct: number;
  /** Recouvrements des lés en PVC, en % de la surface */
  recouvrementPvcPct: number;
  /** Pertes de résine liquide, en % de la surface */
  pertesResinePct: number;
  /** Chute à la coupe, ajoutée au calcul du nombre de rouleaux, en % */
  chuteRouleauxPct: number;
}

/** Limite haute acceptée pour un pourcentage de pertes (même limite que dans la base). */
export const PERTES_MAX_PCT = 50;

/** Valeurs usuelles, appliquées tant que l'entreprise n'a rien réglé. */
export const REGLAGES_PERTES_PAR_DEFAUT: ReglagesPertes = {
  recouvrementBicouchePct: Math.round(SYSTEMES.bicouche.pertes * 1000) / 10,
  recouvrementPvcPct: Math.round(SYSTEMES.pvc.pertes * 1000) / 10,
  pertesResinePct: Math.round(SYSTEMES.resine.pertes * 1000) / 10,
  chuteRouleauxPct: 10,
};

/** Pourcentage valide (nombre entre 0 et PERTES_MAX_PCT), sinon la valeur de repli. */
function pourcentageOuDefaut(valeur: unknown, defaut: number): number {
  if (valeur === null || valeur === undefined || valeur === "") return defaut;
  const n = Number(valeur);
  return Number.isFinite(n) && n >= 0 && n <= PERTES_MAX_PCT ? n : defaut;
}

/**
 * Lit les réglages de pertes dans une ligne de la table entreprises. Une colonne absente
 * (migration pas encore exécutée), vide ou hors limites reprend la valeur usuelle.
 */
export function reglagesPertesEntreprise(entreprise: Record<string, unknown> | null | undefined): ReglagesPertes {
  const d = REGLAGES_PERTES_PAR_DEFAUT;
  return {
    recouvrementBicouchePct: pourcentageOuDefaut(entreprise?.recouvrement_bicouche_pct, d.recouvrementBicouchePct),
    recouvrementPvcPct: pourcentageOuDefaut(entreprise?.recouvrement_pvc_pct, d.recouvrementPvcPct),
    pertesResinePct: pourcentageOuDefaut(entreprise?.pertes_resine_pct, d.pertesResinePct),
    chuteRouleauxPct: pourcentageOuDefaut(entreprise?.chute_rouleaux_pct, d.chuteRouleauxPct),
  };
}

/** Pertes de recouvrement à appliquer pour un système, en fraction (0,08 = 8 %). */
export function pertesDuSysteme(systeme: Systeme, reglages: ReglagesPertes): number {
  const pct =
    systeme === "bicouche" ? reglages.recouvrementBicouchePct : systeme === "pvc" ? reglages.recouvrementPvcPct : reglages.pertesResinePct;
  return pct / 100;
}

/** Estime un périmètre plausible à partir de la surface si aucun n'est fourni,
 *  en supposant une forme proche du carré avec un facteur d'irrégularité de chantier. */
function estimerPerimetre(surface: number): number {
  const cote = Math.sqrt(surface);
  const facteurIrregularite = 1.15;
  return Math.round(cote * 4 * facteurIrregularite);
}

export function calculerEtancheite(input: CalculInput): CalculResult {
  const surface = Math.max(0, input.surface || 0);
  const perimetre = input.perimetre && input.perimetre > 0 ? input.perimetre : estimerPerimetre(surface);
  const hauteurReleves = input.hauteurReleves ?? 0.15; // 15 cm mini au-dessus du niveau fini
  const sys = SYSTEMES[input.systeme];
  const pertes =
    input.pertes !== undefined && Number.isFinite(input.pertes) && input.pertes >= 0 && input.pertes <= PERTES_MAX_PCT / 100
      ? input.pertes
      : sys.pertes;

  const surfaceMembrane = Math.round(surface * (1 + pertes) * 100) / 100;
  const surfaceReleves = Math.round(perimetre * hauteurReleves * 100) / 100;
  const primaireAccrochage = Math.round((surfaceMembrane + surfaceReleves) * sys.primaireLm2 * 10) / 10;
  const fixationsMecaniques = Math.round(surface * sys.fixationsU_m2);

  // 1 évacuation EP mini pour ~300 m², 2 mini par zone (règle de chantier courante,
  // à confirmer selon pluviométrie locale et note de calcul EP).
  const evacuationsEP = Math.max(2, Math.ceil(surface / 300));

  const epaisseur = (input.epaisseurIsolant ?? 100) / 1000; // m
  const isolantSurface = input.isolation ? Math.round(surface * 1.03 * 100) / 100 : 0;
  const isolantVolume = input.isolation ? Math.round(isolantSurface * epaisseur * 1000) / 1000 : 0;

  // Protection gravillon : surface × épaisseur × masse volumique. 5 cm à 1 600 kg/m³ = 80 kg/m².
  // (L'ancienne valeur de 50 kg/m² correspondait à environ 3 cm, pas aux 5 cm annoncés.)
  const epaisseurGravillons = Math.max(0, input.epaisseurGravillonsCm ?? 5) / 100; // m
  const protectionGravillon = input.protectionLourde ? Math.round(surface * epaisseurGravillons * MASSE_VOLUMIQUE_GRAVILLONS_KG_M3) : 0;

  return {
    nombreCouches: sys.couches,
    surfaceMembrane,
    surfaceReleves,
    metresReleves: perimetre,
    primaireAccrochage,
    fixationsMecaniques,
    evacuationsEP,
    isolantSurface,
    isolantVolume,
    protectionGravillon,
    detailsSysteme: { nom: sys.nom, reference: sys.reference, pertes },
  };
}
