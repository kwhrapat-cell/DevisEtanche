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
}

export interface CalculResult {
  surfaceMembrane: number; // m²
  surfaceReleves: number; // m²
  metresReleves: number; // ml
  primaireAccrochage: number; // L
  fixationsMecaniques: number; // unités (0 si système collé/soudé plein)
  evacuationsEP: number; // unités
  isolantSurface: number; // m²
  isolantVolume: number; // m³
  protectionGravillon: number; // kg (si protection lourde)
  detailsSysteme: { nom: string; reference: string; pertes: number };
}

const SYSTEMES: Record<Systeme, { nom: string; reference: string; pertes: number; primaireLm2: number; fixationsU_m2: number }> = {
  bicouche: {
    nom: "Bicouche bitumineuse soudée",
    reference: "DTU 43.1 / 43.4",
    pertes: 0.08, // recouvrements 2 lés x ~10cm
    primaireLm2: 0.3,
    fixationsU_m2: 0, // soudée, pas de fixation mécanique
  },
  pvc: {
    nom: "Membrane PVC monocouche",
    reference: "DTU 43.3 (bac acier) / Avis Technique",
    pertes: 0.06,
    primaireLm2: 0.15,
    fixationsU_m2: 3.5, // fixation mécanique moyenne courant/rive confondus
  },
  resine: {
    nom: "Résine liquide (SEL)",
    reference: "NF DTU 43.6 / Avis Technique",
    pertes: 0.05,
    primaireLm2: 0.25,
    fixationsU_m2: 0,
  },
};

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

  const surfaceMembrane = Math.round(surface * (1 + sys.pertes) * 100) / 100;
  const surfaceReleves = Math.round(perimetre * hauteurReleves * 100) / 100;
  const primaireAccrochage = Math.round((surfaceMembrane + surfaceReleves) * sys.primaireLm2 * 10) / 10;
  const fixationsMecaniques = Math.round(surface * sys.fixationsU_m2);

  // 1 évacuation EP mini pour ~300 m², 2 mini par zone (règle de chantier courante,
  // à confirmer selon pluviométrie locale et note de calcul EP).
  const evacuationsEP = Math.max(2, Math.ceil(surface / 300));

  const epaisseur = (input.epaisseurIsolant ?? 100) / 1000; // m
  const isolantSurface = input.isolation ? Math.round(surface * 1.03 * 100) / 100 : 0;
  const isolantVolume = input.isolation ? Math.round(isolantSurface * epaisseur * 1000) / 1000 : 0;

  // Protection gravillon : ~50 kg/m² pour 5 cm d'épaisseur (usage courant toiture-terrasse accessible technique)
  const protectionGravillon = input.protectionLourde ? Math.round(surface * 50) : 0;

  return {
    surfaceMembrane,
    surfaceReleves,
    metresReleves: perimetre,
    primaireAccrochage,
    fixationsMecaniques,
    evacuationsEP,
    isolantSurface,
    isolantVolume,
    protectionGravillon,
    detailsSysteme: { nom: sys.nom, reference: sys.reference, pertes: sys.pertes },
  };
}
