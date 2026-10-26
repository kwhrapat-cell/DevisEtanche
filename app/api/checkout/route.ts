import { NextResponse } from "next/server";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { creerLienPaiement, estForfaitPayant, statutDonneAcces } from "@/lib/lemonsqueezy";
import { paiementEnLigneConfigure } from "@/lib/paiement";

/** Démarre le paiement d'un forfait : renvoie l'adresse de la page de paiement Lemon Squeezy. */
export async function POST(request: Request) {
  // Sans réglages Lemon Squeezy dans Vercel, on répond proprement au lieu de planter.
  if (!paiementEnLigneConfigure()) {
    return NextResponse.json({ error: "Paiement en ligne indisponible" }, { status: 503 });
  }

  const { forfait } = await request.json();
  if (!estForfaitPayant(forfait)) {
    return NextResponse.json({ error: "Forfait inconnu" }, { status: 400 });
  }

  const session = await getUtilisateurCourant();
  if (!session?.profile?.entreprise_id) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  // Un sous-traitant rattaché à un seul chantier n'a pas accès aux Paramètres ni au forfait.
  if (session.profile.chantier_assigne_id) {
    return NextResponse.json({ error: "Accès réservé à l'entreprise" }, { status: 403 });
  }

  // Un seul abonnement par entreprise : pour passer d'Artisan à Pro, on modifie
  // l'abonnement existant depuis l'espace Lemon Squeezy (sinon il serait payé deux fois).
  const supabase = await createClient();
  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("paiement_abonnement_id, paiement_statut")
    .eq("id", session.profile.entreprise_id)
    .single();
  if (entreprise?.paiement_abonnement_id && statutDonneAcces(entreprise.paiement_statut)) {
    return NextResponse.json(
      {
        error: "Abonnement déjà actif",
        message: "Vous avez déjà un abonnement. Pour changer de forfait, utilisez « Gérer mon abonnement » ci-dessous.",
      },
      { status: 409 },
    );
  }

  const origine = request.headers.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const url = await creerLienPaiement({
      forfait,
      entrepriseId: session.profile.entreprise_id,
      email: session.user.email,
      urlRetour: `${origine}/parametres?paiement=succes`,
    });
    return NextResponse.json({ url });
  } catch (erreur) {
    console.error("Paiement Lemon Squeezy :", erreur);
    return NextResponse.json({ error: "Le paiement n'a pas pu démarrer" }, { status: 502 });
  }
}
