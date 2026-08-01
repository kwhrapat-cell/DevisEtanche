import Stripe from "stripe";

/**
 * Nécessite STRIPE_SECRET_KEY dans .env.local (clé "sk_..." depuis
 * le Dashboard Stripe > Developers > API keys).
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Prix récurrents à créer une fois dans le Dashboard Stripe (Products),
// puis à coller ici (id commençant par "price_...").
export const PRIX_STRIPE: Record<string, string> = {
  artisan: process.env.STRIPE_PRICE_ARTISAN || "price_xxx_artisan",
  pro: process.env.STRIPE_PRICE_PRO || "price_xxx_pro",
};
