import { NextResponse } from "next/server";
import { getUtilisateurCourant } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { lienEspaceAbonnement } from "@/lib/lemonsqueezy";

/**
 * « Gérer mon abonnement » (Paramètres) : renvoie vers l'espace Lemon Squeezy de
 * l'abonnement de l'entreprise, pour changer de forfait, de carte, ou résilier.
 */
export async function GET(request: Request) {
  const retour = new URL("/parametres", request.url);

  const session = await getUtilisateurCourant();
  if (!session?.profile?.entreprise_id) {
    return NextResponse.redirect(new URL("/login", request.url), 303);
  }
  // Un sous-traitant rattaché à un seul chantier n'a pas accès aux Paramètres ni au forfait.
  if (session.profile.chantier_assigne_id) {
    return NextResponse.redirect(new URL("/accueil", request.url), 303);
  }

  const supabase = await createClient();
  const { data: entreprise } = await supabase
    .from("entreprises")
    .select("paiement_abonnement_id")
    .eq("id", session.profile.entreprise_id)
    .single();

  if (!entreprise?.paiement_abonnement_id) {
    retour.searchParams.set("abonnement", "aucun");
    return NextResponse.redirect(retour, 303);
  }

  try {
    const url = await lienEspaceAbonnement(entreprise.paiement_abonnement_id);
    return NextResponse.redirect(url, 303);
  } catch (erreur) {
    console.error("Espace abonnement Lemon Squeezy :", erreur);
    retour.searchParams.set("abonnement", "indisponible");
    return NextResponse.redirect(retour, 303);
  }
}
