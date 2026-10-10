/** Assemble des classes CSS en ignorant les valeurs vides (false, null, undefined, ""). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Initiales d'un nom ("Patrice Kouwahara" → "PK"). */
export function initiales(nom: string | null | undefined): string {
  if (!nom) return "";
  return nom
    .trim()
    .split(/\s+/)
    .map((mot) => mot[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
