import type { ProduitEtancheite } from "@/lib/types";

export type TypeElementZone =
  | "terrasse_courante"
  | "jardiniere"
  | "releve_equerre"
  | "point_singulier" // plots climatiseurs, panneaux solaires, émergences, skydomes
  | "toit_ascenseur";

const CHUTE_PAR_DEFAUT = 0.1; // 10 % de chute, ajustable par chantier

const REFERENCES_PAR_ELEMENT: Record<TypeElementZone, string[]> = {
  terrasse_courante: ["SOPRALENE-BASE", "SOPRALENE-FLAM-180", "AXTER-TOPFIX-FMP-GRESE", "AXTER-TOPAZ-25", "SARNAFIL-G410"],
  jardiniere: ["SOPRALENE-FLAM-JARDIN", "AXTER-FORCE-3000-TRAFIC"],
  releve_equerre: ["EQUERRE-RENFORT-SOPRALENE", "ELASTOCOL-600"],
  point_singulier: ["ALSAN-FLASHING", "ALSAN-VOILE-FLASHING", "SIKALASTIC-M640", "AXTER-HYPERFLEX"],
  toit_ascenseur: ["SOPRALENE-BASE", "SOPRALENE-FLAM-180-AR", "AXTER-PAXALUMIN"],
};

/** Nombre de rouleaux nécessaires pour une membrane vendue par surface fixe (ex : 6x1m). */
export function calculerRouleaux(surfaceM2: number, produit: ProduitEtancheite, chute: number = CHUTE_PAR_DEFAUT): number {
  if (!produit.surface_couverte_m2) {
    throw new Error(`Surface couverte non renseignée pour ${produit.nom} — à ajouter au catalogue`);
  }
  const surfaceAvecChute = surfaceM2 * (1 + chute);
  return Math.ceil(surfaceAvecChute / produit.surface_couverte_m2);
}

/** Quantité de primaire/résine liquide nécessaire (L ou kg selon le produit). */
export function calculerConsommationLiquide(surfaceM2: number, produit: ProduitEtancheite, tauxChoisi?: number): number {
  if (produit.consommation_min == null && produit.consommation_max == null) {
    throw new Error(`Consommation non renseignée pour ${produit.nom}`);
  }
  const min = produit.consommation_min ?? produit.consommation_max!;
  const max = produit.consommation_max ?? produit.consommation_min!;
  const taux = tauxChoisi ?? (min + max) / 2;
  return Math.round(surfaceM2 * taux * 100) / 100;
}

/**
 * Suggère des produits du catalogue adaptés à un type d'élément de zone (relevé, jardinière,
 * point singulier...). Passer `fabricant` pour restreindre à une seule marque (ex : quand le
 * stock ne propose qu'une marque).
 */
export function suggererProduits(
  produits: ProduitEtancheite[],
  typeElement: TypeElementZone,
  fabricant?: string
): ProduitEtancheite[] {
  const refs = REFERENCES_PAR_ELEMENT[typeElement] ?? [];
  return produits.filter((p) => refs.includes(p.reference) && (!fabricant || p.fabricant === fabricant));
}

export interface VerificationCompatibilite {
  compatible: boolean;
  marques: string[];
  message?: string;
}

/**
 * Détecte un système mixte (produits de marques différentes utilisés ensemble sur un même
 * devis/zone). Ne bloque rien — c'est une pratique courante sur le terrain faute de dispo —
 * mais permet à l'app d'afficher une alerte plutôt que de laisser passer le mélange en silence.
 */
export function verifierCompatibiliteMarque(fabricants: string[]): VerificationCompatibilite {
  const marques = Array.from(new Set(fabricants));
  if (marques.length <= 1) {
    return { compatible: true, marques };
  }
  return {
    compatible: false,
    marques,
    message: `Système mixte détecté (${marques.join(" + ")}) : le mélange de marques sur un même système n'est pas recommandé par les fabricants — à valider avant la pose.`,
  };
}
