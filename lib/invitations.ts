import type { RoleSousTraitance } from "@/lib/types";

// Exclut les caractères ambigus (0/O, 1/I) pour rester lisible quand le code est recopié à la main.
const ALPHABET_CODE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function genererCodeInvitation(longueur = 8): string {
  const valeurs = new Uint32Array(longueur);
  crypto.getRandomValues(valeurs);
  let code = "";
  for (let i = 0; i < longueur; i++) code += ALPHABET_CODE[valeurs[i] % ALPHABET_CODE.length];
  return code;
}

export const labelRoleSousTraitance: Record<RoleSousTraitance, string> = {
  ouvrier: "Ouvrier",
  chef_de_chantier: "Chef de chantier",
  conducteur_de_travaux: "Conducteur de travaux",
};

export const dureesValidite = [
  { heures: 24, label: "24 heures" },
  { heures: 48, label: "48 heures" },
  { heures: 72, label: "72 heures" },
  { heures: 24 * 7, label: "7 jours" },
] as const;
