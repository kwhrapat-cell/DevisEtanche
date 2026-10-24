import type { Devise } from "@/lib/devise";

/**
 * Le paiement en ligne (Stripe) n'est proposé que si ses clés sont renseignées dans
 * Vercel. Stripe n'accepte pas les entreprises calédoniennes : tant qu'aucune solution
 * de paiement n'est branchée, les forfaits payants se demandent par e-mail et se
 * facturent à la main. À lire côté serveur uniquement (les clés ne sont pas publiques).
 */
export function paiementEnLigneConfigure(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ARTISAN && process.env.STRIPE_PRICE_PRO);
}

/** Prix mensuels hors taxes affichés dans Paramètres — les mêmes que sur la page d'accueil. */
export const PRIX_FORFAITS: Record<Devise, { decouverte: string; artisan: string; pro: string }> = {
  XPF: { decouverte: "Gratuit", artisan: "3 500 XPF/mois", pro: "7 000 XPF/mois" },
  EUR: { decouverte: "Gratuit", artisan: "29 €/mois", pro: "59 €/mois" },
};
