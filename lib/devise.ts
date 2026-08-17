export type Devise = "XPF" | "EUR";

/** Parité fixe officielle du franc CFP : 1 000 XPF = 8,38 €, soit 1 € = 119,33174 XPF. */
export const PARITE_XPF_PAR_EUR = 119.33174;

/**
 * Convertit un montant de référence en euros (ex : prix catalogue métropole,
 * constantes par défaut du calculateur) vers la devise réellement utilisée par
 * l'entreprise. Sans cette conversion, les mêmes chiffres réutilisés tels quels
 * en XPF donnent un total ~119 fois trop bas.
 */
export function convertirEurVersDevise(montantEur: number, devise: Devise | string = "XPF"): number {
  if (devise === "EUR") return montantEur;
  return Math.round(montantEur * PARITE_XPF_PAR_EUR);
}

/** XPF n'a pas de sous-unité utilisée en pratique : on affiche des montants entiers. */
export function formatMontant(valeur: number, devise: Devise | string = "XPF"): string {
  if (devise === "EUR") {
    return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(valeur)} €`;
  }
  return `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(valeur))} XPF`;
}
