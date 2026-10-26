import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { configurationLemonSqueezy, miseAJourForfait, signatureValide } from "@/lib/lemonsqueezy";

/**
 * Lemon Squeezy prévient ici à chaque changement d'abonnement (achat, changement de
 * forfait, échec de paiement, résiliation, fin d'abonnement) et l'appli met à jour
 * le forfait de l'entreprise toute seule.
 *
 * À créer dans Lemon Squeezy > Settings > Webhooks :
 * - URL : https://devis-etanche.vercel.app/api/webhooks/lemonsqueezy
 * - Secret de signature : une phrase au hasard, recopiée dans LEMONSQUEEZY_WEBHOOK_SECRET
 * - Événements : tous ceux qui commencent par « subscription_ ».
 *
 * Utilise la clé service_role (jamais exposée au navigateur) : le forfait et les
 * colonnes paiement_* ne sont modifiables que par le serveur, pas depuis une session.
 */
export async function POST(request: Request) {
  const corps = await request.text();
  if (!signatureValide(corps, request.headers.get("x-signature"), process.env.LEMONSQUEEZY_WEBHOOK_SECRET)) {
    return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
  }

  const config = configurationLemonSqueezy();
  if (!config) {
    // Lemon Squeezy renverra l'événement plus tard : rien n'est perdu.
    return NextResponse.json({ error: "Paiement non configuré" }, { status: 503 });
  }

  let evenement: any;
  try {
    evenement = JSON.parse(corps);
  } catch {
    return NextResponse.json({ error: "Contenu illisible" }, { status: 400 });
  }

  // Seuls les événements portant un abonnement changent le forfait. Les autres
  // (commandes, factures mensuelles…) sont acquittés sans rien faire.
  const nomEvenement: string = evenement?.meta?.event_name ?? "";
  if (evenement?.data?.type !== "subscriptions" || !evenement?.data?.id) {
    return NextResponse.json({ received: true });
  }
  const abonnement = { ...(evenement.data.attributes ?? {}), id: String(evenement.data.id) };

  // L'entreprise : celle passée au moment du paiement, sinon celle qui a déjà cet abonnement.
  const supabaseAdmin = createAdminClient();
  const entrepriseIdPaiement: unknown = evenement?.meta?.custom_data?.entreprise_id;
  const recherche = supabaseAdmin.from("entreprises").select("id, paiement_abonnement_id");
  const { data: entreprise, error: erreurLecture } =
    typeof entrepriseIdPaiement === "string" && entrepriseIdPaiement
      ? await recherche.eq("id", entrepriseIdPaiement).maybeSingle()
      : await recherche.eq("paiement_abonnement_id", abonnement.id).maybeSingle();

  if (erreurLecture) {
    console.error("Webhook Lemon Squeezy, lecture :", erreurLecture.message);
    return NextResponse.json({ error: "Base indisponible" }, { status: 500 });
  }
  if (!entreprise) {
    return NextResponse.json({ received: true, ignore: "entreprise introuvable" });
  }

  const miseAJour = miseAJourForfait(abonnement, nomEvenement, entreprise.paiement_abonnement_id, config.variantes);
  if (!miseAJour) {
    return NextResponse.json({ received: true, ignore: "abonnement non concerné" });
  }

  const { error: erreurEcriture } = await supabaseAdmin.from("entreprises").update(miseAJour).eq("id", entreprise.id);
  if (erreurEcriture) {
    // Réponse en erreur : Lemon Squeezy réessaiera l'envoi.
    console.error("Webhook Lemon Squeezy, écriture :", erreurEcriture.message);
    return NextResponse.json({ error: "Écriture impossible" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
