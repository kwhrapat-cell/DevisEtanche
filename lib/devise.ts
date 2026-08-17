export type Devise = "XPF" | "EUR";

/** XPF n'a pas de sous-unité utilisée en pratique : on affiche des montants entiers. */
export function formatMontant(valeur: number, devise: Devise | string = "XPF"): string {
  if (devise === "EUR") {
    return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valeur)} €`;
  }
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(valeur))} XPF`;
}
