import type { ProduitEtancheite } from "@/lib/types";

export const GAMME_LABELS: Record<ProduitEtancheite["gamme"], string> = {
  bitumineux: "Bitumineux",
  synthetique: "Synthétique",
  liquide: "Résine liquide",
  accessoire: "Accessoire",
};

export const USAGE_LABELS: Record<ProduitEtancheite["usage_type"], string> = {
  premiere_couche: "Première couche",
  finition: "Finition",
  anti_racine: "Anti-racine",
  renfort: "Renfort",
  primaire: "Primaire",
  resine_liquide: "Résine liquide",
};

export const POSE_LABELS: Record<ProduitEtancheite["pose"], string> = {
  soudure_chalumeau: "Soudure au chalumeau",
  soudure_air_chaud: "Soudure à l'air chaud",
  auto_adhesif: "Auto-adhésif",
  froid_sans_flamme: "Pose à froid, sans flamme",
  collage_froid: "Collage à froid",
  fixation_mecanique: "Fixation mécanique",
};

/** Prix indicatif moyen (milieu de fourchette) quand il est renseigné, sinon null. */
export function prixMoyen(p: ProduitEtancheite): number | null {
  if (p.prix_indicatif_min_eur == null && p.prix_indicatif_max_eur == null) return null;
  if (p.prix_indicatif_min_eur == null) return p.prix_indicatif_max_eur;
  if (p.prix_indicatif_max_eur == null) return p.prix_indicatif_min_eur;
  return Math.round(((p.prix_indicatif_min_eur + p.prix_indicatif_max_eur) / 2) * 100) / 100;
}

/** Gamme catalogue correspondant à un système d'étanchéité du calculateur/chantier. */
export const GAMME_PAR_SYSTEME: Record<"bicouche" | "pvc" | "resine", ProduitEtancheite["gamme"]> = {
  bicouche: "bitumineux",
  pvc: "synthetique",
  resine: "liquide",
};
