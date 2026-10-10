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

/** Durée écoulée lisible (« il y a 5 min », « hier », « il y a 3 j »). */
export function tempsEcoule(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "hier";
  return `il y a ${j} j`;
}
