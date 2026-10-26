import type { Devise } from "@/lib/devise";
import { configurationLemonSqueezy } from "@/lib/lemonsqueezy";

/**
 * Le paiement en ligne (Lemon Squeezy) n'est proposé que si ses réglages sont renseignés
 * dans Vercel. Tant qu'il en manque un, les forfaits payants se demandent par e-mail et
 * se facturent à la main. À lire côté serveur uniquement (les clés ne sont pas publiques).
 */
export function paiementEnLigneConfigure(): boolean {
  return configurationLemonSqueezy() !== null;
}

/** Prix mensuels hors taxes affichés dans Paramètres — les mêmes que sur la page d'accueil. */
export const PRIX_FORFAITS: Record<Devise, { decouverte: string; artisan: string; pro: string }> = {
  XPF: { decouverte: "Gratuit", artisan: "3 500 XPF/mois", pro: "7 000 XPF/mois" },
  EUR: { decouverte: "Gratuit", artisan: "29 €/mois", pro: "59 €/mois" },
};
