import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Encaissement des abonnements Artisan et Pro par Lemon Squeezy.
 *
 * Pourquoi Lemon Squeezy et pas Stripe : Stripe refuse les entreprises basées en
 * Nouvelle-Calédonie. Lemon Squeezy est le vendeur officiel vis-à-vis du client
 * (« merchant of record ») : il encaisse la carte ou PayPal, applique les taxes,
 * émet la facture, puis reverse l'argent à Tramea Solutions par PayPal.
 *
 * Fichier sans import « @/… » : il est testé directement par tests/lemonsqueezy.test.mts.
 * Les clés se renseignent dans Vercel, jamais dans le code (voir .env.example).
 */

export type ForfaitPayant = "artisan" | "pro";
export type Forfait = "decouverte" | ForfaitPayant | "entreprise";

const API = "https://api.lemonsqueezy.com/v1";

/**
 * Statuts Lemon Squeezy qui donnent encore droit au forfait payé :
 * - on_trial : période d'essai ;
 * - active : payé ;
 * - past_due : un prélèvement a échoué, Lemon Squeezy réessaie 4 fois en ~2 semaines ;
 * - cancelled : résilié, mais déjà payé jusqu'à la fin du mois en cours.
 * Les autres (paused, unpaid, expired) font revenir l'entreprise au forfait Découverte.
 */
const STATUTS_AVEC_ACCES = new Set(["on_trial", "active", "past_due", "cancelled"]);

export function statutDonneAcces(statut: string | null | undefined): boolean {
  return STATUTS_AVEC_ACCES.has(String(statut));
}

export function estForfaitPayant(valeur: unknown): valeur is ForfaitPayant {
  return valeur === "artisan" || valeur === "pro";
}

/** Réglages lus dans Vercel. null tant qu'il en manque un : le paiement en ligne reste alors masqué. */
export function configurationLemonSqueezy() {
  const cle = process.env.LEMONSQUEEZY_API_KEY;
  const boutique = process.env.LEMONSQUEEZY_STORE_ID;
  const artisan = process.env.LEMONSQUEEZY_VARIANT_ARTISAN;
  const pro = process.env.LEMONSQUEEZY_VARIANT_PRO;
  if (!cle || !boutique || !artisan || !pro) return null;
  const variantes: Record<ForfaitPayant, string> = { artisan, pro };
  return { cle, boutique, variantes };
}

/**
 * Vérifie qu'un webhook vient bien de Lemon Squeezy : il signe le contenu reçu
 * (HMAC SHA-256, en hexadécimal, en-tête X-Signature) avec le secret choisi à la
 * création du webhook. Sans ce contrôle, n'importe qui pourrait s'offrir le forfait Pro.
 */
export function signatureValide(corps: string, signature: string | null, secret: string | undefined): boolean {
  if (!signature || !secret) return false;
  const attendue = Buffer.from(createHmac("sha256", secret).update(corps).digest("hex"), "utf8");
  const recue = Buffer.from(signature, "utf8");
  return attendue.length === recue.length && timingSafeEqual(attendue, recue);
}

type AbonnementRecu = {
  id: string;
  status?: string | null;
  variant_id?: number | string | null;
  customer_id?: number | string | null;
};

export type MiseAJourEntreprise = {
  forfait: Forfait;
  paiement_abonnement_id: string;
  paiement_client_id: string | null;
  paiement_statut: string | null;
};

/**
 * Décide ce qu'un événement d'abonnement change sur l'entreprise. Renvoie null s'il ne faut rien toucher :
 * - abonnement à un autre produit de la boutique (variante inconnue) ;
 * - abonnement qui n'est pas celui enregistré pour l'entreprise, sauf s'il vient d'être acheté
 *   (subscription_created) ou si aucun n'est encore enregistré. Ainsi, la fin d'un ancien
 *   abonnement ne fait pas perdre le forfait de l'abonnement en cours.
 */
export function miseAJourForfait(
  abonnement: AbonnementRecu,
  evenement: string,
  abonnementEnregistre: string | null | undefined,
  variantes: Record<ForfaitPayant, string>,
): MiseAJourEntreprise | null {
  const variante = String(abonnement.variant_id);
  const forfaitPaye: ForfaitPayant | null = variante === variantes.artisan ? "artisan" : variante === variantes.pro ? "pro" : null;
  if (!forfaitPaye) return null;

  const estAbonnementEnregistre = abonnementEnregistre === abonnement.id;
  if (!estAbonnementEnregistre && abonnementEnregistre && evenement !== "subscription_created") return null;

  return {
    forfait: statutDonneAcces(abonnement.status) ? forfaitPaye : "decouverte",
    paiement_abonnement_id: abonnement.id,
    paiement_client_id: abonnement.customer_id != null ? String(abonnement.customer_id) : null,
    paiement_statut: abonnement.status ?? null,
  };
}

function enTetes(cle: string) {
  return {
    Accept: "application/vnd.api+json",
    "Content-Type": "application/vnd.api+json",
    Authorization: `Bearer ${cle}`,
  };
}

/**
 * Crée une page de paiement Lemon Squeezy pour ce forfait et renvoie son adresse.
 * L'identifiant de l'entreprise voyage avec le paiement (custom data) et revient dans
 * le webhook : c'est ainsi qu'on sait quelle entreprise passer au forfait payé.
 */
export async function creerLienPaiement(params: {
  forfait: ForfaitPayant;
  entrepriseId: string;
  email: string | undefined;
  urlRetour: string;
}): Promise<string> {
  const config = configurationLemonSqueezy();
  if (!config) throw new Error("Lemon Squeezy n'est pas configuré");

  const reponse = await fetch(`${API}/checkouts`, {
    method: "POST",
    headers: enTetes(config.cle),
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          product_options: { redirect_url: params.urlRetour },
          checkout_data: {
            ...(params.email ? { email: params.email } : {}),
            custom: { entreprise_id: params.entrepriseId, forfait: params.forfait },
          },
        },
        relationships: {
          store: { data: { type: "stores", id: config.boutique } },
          variant: { data: { type: "variants", id: config.variantes[params.forfait] } },
        },
      },
    }),
  });
  if (!reponse.ok) throw new Error(`Lemon Squeezy a refusé la création du paiement (${reponse.status})`);

  const json = await reponse.json();
  const url = json?.data?.attributes?.url;
  if (typeof url !== "string") throw new Error("Lemon Squeezy n'a pas renvoyé de lien de paiement");
  return url;
}

/**
 * Lien vers l'espace client Lemon Squeezy de cet abonnement (changer de forfait,
 * changer de carte, résilier, télécharger les factures). Lemon Squeezy le fournit
 * signé et valable 24 h : on le redemande à chaque clic.
 */
export async function lienEspaceAbonnement(abonnementId: string): Promise<string> {
  const config = configurationLemonSqueezy();
  if (!config) throw new Error("Lemon Squeezy n'est pas configuré");

  const reponse = await fetch(`${API}/subscriptions/${encodeURIComponent(abonnementId)}`, { headers: enTetes(config.cle) });
  if (!reponse.ok) throw new Error(`Lemon Squeezy n'a pas trouvé l'abonnement (${reponse.status})`);

  const json = await reponse.json();
  const url = json?.data?.attributes?.urls?.customer_portal;
  if (typeof url !== "string") throw new Error("Lemon Squeezy n'a pas renvoyé de lien vers l'espace client");
  return url;
}
